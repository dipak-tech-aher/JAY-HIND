import { statusCodeConstants, constantCode } from '@utils'
const generatePassword = require('generate-password');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { Client } = require("@microsoft/microsoft-graph-client");
const { TokenCredentialAuthenticationProvider } = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
const { ClientSecretCredential } = require("@azure/identity");
import em from '@emitters'

let instance;

class MsTeamsService {
    constructor(conn) {
        if (!instance) {
            instance = this
        }
        instance.conn = conn;
        instance.client = "";
        instance.msuserId = "";
        return instance
    }

    async initialize() {
        const appConfig = await this.conn.BcaeAppConfig.findOne({ where: { status: constantCode.status.ACTIVE }, attribute: ['appointChannelSetupPayload'] });

        console.log(appConfig?.appointChannelSetupPayload);

        const clientId = appConfig?.appointChannelSetupPayload?.teamsPortalSetting?.clientId;
        const clientSecret = appConfig?.appointChannelSetupPayload?.teamsPortalSetting?.clientSecret;
        const scopes = appConfig?.appointChannelSetupPayload?.teamsPortalSetting?.scope;
        const tenantId = appConfig?.appointChannelSetupPayload?.teamsPortalSetting?.tenantId;

        this.msuserId = appConfig?.appointChannelSetupPayload?.teamsPortalSetting?.appUserID;

        const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
        const authProvider = new TokenCredentialAuthenticationProvider(credential, { scopes: [scopes] });

        this.client = Client.initWithMiddleware({ debugLogging: true, authProvider });
    }

    async createMeeting(details) {
        await this.initialize();

        // Get-CsOnlineUser | Grant-CsApplicationAccessPolicy -PolicyName "DTWorks-policy"
        // https://learn.microsoft.com/en-us/powershell/module/skype/grant-csapplicationaccesspolicy?view=skype-ps#assign-an-application-access-policy-to-all-users-in-the-tenant

        let { agenda, hostEmail, duration, customerEmail, topic, appointDateTime, 
            tranEntity, eventType, tranCategory, tranType, serviceCategory, serviceType,
            hostUserGroup, customerUserGroup, hostMobilePrefix, hostMobileNo,
            customerMobilePrefix, customerMobileNo, txnNo
        } = details;

        const onlineMeeting = {
            startDateTime: appointDateTime, // '2019-07-12T14:30:34.2444915-07:00',
            endDateTime: moment(appointDateTime).add(duration, 'minutes').utc().format(), // '2019-07-12T15:00:34.2464912-07:00',
            subject: topic,
            // allowedPresenter: "roleIsPresenter",
            participants: {
                attendees: [
                    {
                        upn: hostEmail,
                        // role: 'presenter'
                    },
                    {
                        upn: customerEmail,
                        // role: 'attendee'
                    }
                ]
            },
            // lobbyBypassSettings: {
            //     scope: "everyone",
            //     isDialInBypassEnabled: true
            // },
            joinMeetingIdSettings: {
                isPasscodeRequired: true
            }
        };

        console.log(onlineMeeting);

        const meetingCreated = await this.client.api(`/users/${this.msuserId}/onlineMeetings`).post(onlineMeeting);

        if (meetingCreated?.id) {
            let notifyData = {
                tranEntity, eventType, tranCategory, tranType, serviceCategory, serviceType, txnNo,
                join_url: meetingCreated.joinUrl,
                meet_id: meetingCreated.joinMeetingIdSettings.joinMeetingId,
                password: meetingCreated.joinMeetingIdSettings.passcode,
                notify_mediums: [
                    { email: hostEmail, userGroup: hostUserGroup, extn: hostMobilePrefix, mobile: hostMobileNo },
                    { email: customerEmail, userGroup: customerUserGroup, extn: customerMobilePrefix, mobile: customerMobileNo }
                ]
            }
            console.log("meeting created with ", notifyData);
            em.emit('NOTIFY_MEET_USER_VIA_EMAIL', notifyData)
        }

        return {
            status: meetingCreated?.id ? statusCodeConstants.SUCCESS : statusCodeConstants.ERROR,
            message: meetingCreated?.id ? 'Appointment scheduled' : 'Error in scheduling appointment',
            data: {
                medium: "TEAMS",
                mediumData: meetingCreated,
                meetingUrl: meetingCreated?.joinUrl
            }
        }
    }
}

module.exports = MsTeamsService