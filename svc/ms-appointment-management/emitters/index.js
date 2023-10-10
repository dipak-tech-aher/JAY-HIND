import { config } from '@config/env.config'
import { EmailHelper, SMSHelper, statusCodeConstants, defaultStatus } from '@utils'
import { Op, QueryTypes } from 'sequelize'
const { getConnection } = require('@services/connection-service')

// get the reference of EventEmitter class of events module
const events = require('events')
const ST = require('stjs')

// create an object of EventEmitter class by using above reference
const em = new events.EventEmitter()
const { domainURL } = config

const ACTIVE = "TPL_ACTIVE";

// Subscribe for NOTIFY_MEET_USER_VIA_EMAIL
em.on('NOTIFY_MEET_USER_VIA_EMAIL', async (notifyData) => {
    try {
        console.log("email notify called... 1");
        const emailHelper = new EmailHelper()
        const smsHelper = new SMSHelper()
        const conn = await getConnection()
        console.log("email notify called... 2");
        const hostEmailTemplate = "Appointment Notify Host";
        const attendeesEmailTemplate = "Appointment Notify Attendees";
        console.log("email notify called... 3");

        const templateHdrs = await conn.TemplateHdr.findAll({
            where: {
                templateCategory: ["TC_EMAIL", "TC_SMS"],
                entity: notifyData.tranEntity,
                eventType: notifyData.eventType,
                status: defaultStatus.TPLACTIVE
            },
            raw: true
        })
        const mappedTemplates = await conn.TemplateMapping.findAll({
            where: {
                templateId: templateHdrs.map(x => x.templateId),
                status: defaultStatus.TPLACTIVE
            },
            raw: true
        });

        const emailTemplates = templateHdrs.filter(x => {
            let condition = x.templateCategory == "TC_EMAIL";
            // condition = condition && mappedTemplates.filter(y =>
            //     y.templateId == x.templateId &&
            //     y.mapCategory == "TMC_APPOINT" &&
            //     y.tranCategory == notifyData.tranCategory &&
            //     y.tranType == notifyData.tranType &&
            //     y.tranEntity == notifyData.tranEntity &&
            //     // y.serviceCategory == notifyData.serviceCategory &&
            //     y.serviceType == notifyData.serviceType
            // ).length > 0;
            return condition;
        });

        const smsTemplates = templateHdrs.filter(x => {
            let condition = x.templateCategory == "TC_SMS";
            // condition = condition && mappedTemplates.filter(y =>
            //     y.templateId == x.templateId &&
            //     y.mapCategory == "TMC_APPOINT" &&
            //     y.tranCategory == notifyData.tranCategory &&
            //     y.tranType == notifyData.tranType &&
            //     y.tranEntity == notifyData.tranEntity &&
            //     // y.serviceCategory == notifyData.serviceCategory &&
            //     y.serviceType == notifyData.serviceType
            // ).length > 0;
            return condition;
        });

        // template header entity - event type
        const notificationTemplates = await conn.NotificationTemplate.findAll({
            where: {
                templateHdrId: [...emailTemplates.map(x => x.templateId), ...smsTemplates.map(x => x.templateId)]
            },
            raw: true
        })

        console.log("email notify called... 4");
        if (!notificationTemplates.length) {
            return {
                status: statusCodeConstants.VALIDATION_ERROR,
                message: 'Email template not found, Please create template'
            }
        }
        console.log("email notify called... 5");

        let columnNames = {
            TMC_INTERACTION: {
                name: "intxnNo"
            },
            TMC_ORDER: {
                name: "orderNo"
            }
        }

        for (let index = 0; index < notifyData.notify_mediums.length; index++) {
            const record = notifyData.notify_mediums[index];
            // const data = {
            //     join_url: notifyData.join_url,
            //     meet_id: notifyData.meet_id,
            //     password: notifyData.password,
            // }
            const templates = templateHdrs.filter(x => x.userGroup == record.userGroup);
            for (let index1 = 0; index1 < templates.length; index1++) {
                const template = templates[index1];
                const notificationTemplate = notificationTemplates.find(x => x.templateHdrId == template.templateId);
                const sql = `SELECT * FROM ${notificationTemplate.dataSource} WHERE "${columnNames[notifyData.tranEntity]['name']}" = '${notifyData.txnNo}';`;
                const data = await conn.sequelize.query(sql, { type: QueryTypes.SELECT });
                const htmlContent = ST.select(data[0]).transformWith(notificationTemplate?.body).root();
                const subjectContent = ST.select(data[0]).transformWith(notificationTemplate?.subject).root();
                if (template?.templateCategory == 'TC_EMAIL') {
                    await emailHelper.sendMail({
                        to: [record.email],
                        subject: subjectContent,
                        message: htmlContent
                    })
                    console.log("email sent");
                } else if (template?.templateCategory == 'TC_SMS') {
                    await smsHelper.sendSMS({
                        to: record?.mobile,
                        extn: record?.extn,
                        message: htmlContent
                    })
                    console.log("sms sent");
                }
            }
        }
    } catch (error) {
        console.log("email send error ===> ", error);
    }
})

module.exports = em