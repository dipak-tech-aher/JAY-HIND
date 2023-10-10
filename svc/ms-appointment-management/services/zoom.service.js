const KJUR = require('jsrsasign');
const generatePassword = require('generate-password');
const axios = require('axios');

import em from '@emitters'
import {
    statusCodeConstants, constantCode
} from '@utils'

let instance;
class ZoomService {
    constructor(conn) {
        if (!instance) {
            instance = this
        }
        instance.conn = conn;
        instance.ZOOM_API_ENDPOINT = "https://api.zoom.us/v2";
        instance.ZOOM_OAUTH_ENDPOINT = "https://zoom.us/oauth/token";
        return instance
    }

    async getCredentials() {
        const appConfig = await this.conn.BcaeAppConfig.findOne({ where: { status: constantCode.status.ACTIVE }, attribute: ['appointChannelSetupPayload'] });

        const ZOOM_MEETING_SDK_KEY = appConfig?.appointChannelSetupPayload?.zoomPortalSetting?.clientId;
        const ZOOM_MEETING_SDK_SECRET = appConfig?.appointChannelSetupPayload?.zoomPortalSetting?.clientSecretKey;
        const ZOOM_ACCOUNT_ID = appConfig?.appointChannelSetupPayload?.zoomPortalSetting?.accountId;

        return {
            ZOOM_MEETING_SDK_KEY, ZOOM_MEETING_SDK_SECRET, ZOOM_ACCOUNT_ID
        }
    }

    async getSignature(details) {
        try {
            const { appointTxnId, loggedEmail } = details;

            const appointment = await this.conn.AppointmentTxn.findOne({ where: { appointTxnId } });

            if (appointment && appointment?.medium === "ZOOM") {
                const { ZOOM_MEETING_SDK_KEY, ZOOM_MEETING_SDK_SECRET } = await this.getCredentials();

                const meetingNumber = appointment?.mediumData?.id;
                // role	Required, 0 to specify participant, 1 to specify host
                const hostEmail = appointment?.mediumData?.host_email;
                const role = hostEmail === loggedEmail ? 1 : 0;
                const passWord = appointment?.mediumData?.password;

                const iat = Math.round(new Date().getTime() / 1000) - 30;
                const exp = iat + 60 * 60 * 2

                const oHeader = { alg: 'HS256', typ: 'JWT' }

                const oPayload = {
                    sdkKey: ZOOM_MEETING_SDK_KEY,
                    mn: meetingNumber,
                    role: role,
                    iat: iat,
                    exp: exp,
                    appKey: ZOOM_MEETING_SDK_KEY,
                    tokenExp: iat + 60 * 60 * 2
                }

                const sHeader = JSON.stringify(oHeader)
                const sPayload = JSON.stringify(oPayload)
                const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, ZOOM_MEETING_SDK_SECRET)

                return {
                    status: statusCodeConstants.SUCCESS,
                    message: 'Signature created',
                    data: {
                        signature: signature,
                        sdkKey: ZOOM_MEETING_SDK_KEY,
                        meetingNumber: meetingNumber,
                        password: passWord,
                        userName: hostEmail?.split('@')?.[0],
                        userEmail: hostEmail
                    }
                }
            }

            return {
                status: statusCodeConstants.NO_CONTENT,
                message: 'No valid information found'
            }
        } catch (error) {
            return {
                status: statusCodeConstants.ERROR,
                message: 'Error in creating signature'
            }
        }
    }

    async getToken() {
        try {
            const { ZOOM_MEETING_SDK_KEY, ZOOM_MEETING_SDK_SECRET, ZOOM_ACCOUNT_ID } = await this.getCredentials();

            let config = {
                method: 'post',
                url: `${this.ZOOM_OAUTH_ENDPOINT}?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${ZOOM_MEETING_SDK_KEY}:${ZOOM_MEETING_SDK_SECRET}`).toString('base64')}`
                }
            };

            const response = await axios.request(config);
            return await response.data;
        } catch (error) {
            console.log(error.response?.data)
            return false;
        }
    }

    async createMeeting(details) {
        try {
            const { access_token } = await this.getToken();

            console.log("access_token access_token access_token", access_token);

            let { agenda, hostEmail, duration, customerEmail, topic, appointDateTime, 
                tranEntity, eventType, tranCategory, tranType, serviceCategory, serviceType,
                hostUserGroup, customerUserGroup, hostMobilePrefix, hostMobileNo,
                customerMobilePrefix, customerMobileNo, txnNo
            } = details;

            hostEmail = "ragesh.k@bahwancybertek.com";

            const checkEmailPath = `users/email?email=${hostEmail}`;

            const headers = {
                'Authorization': `Bearer ${access_token}`
            }

            const { result: checkEmailResponse, error: checkEmailError } = await this.getZoomService(checkEmailPath, headers);

            console.log({ checkEmailResponse, checkEmailError });

            let userId;
            if (checkEmailResponse && checkEmailResponse.hasOwnProperty("existed_email")) {
                if (checkEmailResponse.existed_email) {
                    const getUserPath = `users/${hostEmail}`;

                    const { result: getUserResponse, error: getUserError } = await this.getZoomService(getUserPath, headers);

                    console.log({ getUserResponse, getUserError });

                    userId = getUserResponse?.id;
                } else {
                    const createUserPath = `users`;

                    const body = {
                        action: "custCreate",
                        user_info: {
                            email: hostEmail,
                            type: 1
                        }
                    }

                    const { result: createUserResponse, error: createUserError } = await this.getZoomService(createUserPath, headers, "post", body);

                    console.log({ createUserResponse, createUserError });

                    userId = createUserResponse?.id;
                }

                console.log({ userId })

                const password = generatePassword.generate({ length: constantCode.common.PASSWORD_LENGTH, numbers: true })

                let meetingPayload = {
                    "agenda": agenda,
                    "default_password": false,
                    "duration": duration, // mins
                    "password": password,
                    "schedule_for": hostEmail,
                    "settings": {
                        "meeting_invitees": [
                            {
                                "email": customerEmail
                            }
                        ]
                    },
                    "start_time": appointDateTime, //"2022-03-25T07:32:55Z",
                    "topic": topic,
                    "type": 2
                }

                const createMeetLinkPath = `users/${userId}/meetings`;

                headers['User-Agent'] = "Zoom-api-Jwt-Request";

                const { result: createMeetLinkResponse, error: createMeetLinkError } = await this.getZoomService(createMeetLinkPath, headers, "post", meetingPayload);

                console.log({ createMeetLinkResponse, createMeetLinkError });

                if (createMeetLinkResponse?.join_url) {
                    let notifyData = {
                        tranEntity, eventType, tranCategory, tranType, serviceCategory, serviceType, txnNo,
                        join_url: createMeetLinkResponse.join_url,
                        meet_id: createMeetLinkResponse.id,
                        password: createMeetLinkResponse.password,
                        notify_mediums: [
                            { email: hostEmail, userGroup: hostUserGroup, hostMobilePrefix, hostMobileNo },
                            { email: customerEmail, userGroup: customerUserGroup, customerMobilePrefix, customerMobileNo }
                        ]
                    }
                    em.emit('NOTIFY_MEET_USER_VIA_EMAIL', notifyData)
                }

                return {
                    status: createMeetLinkResponse?.join_url ? statusCodeConstants.SUCCESS : statusCodeConstants.ERROR,
                    message: createMeetLinkResponse?.join_url ? 'Appointment scheduled' : 'Error in scheduling appointment',
                    data: {
                        medium: "ZOOM",
                        mediumData: createMeetLinkResponse,
                        meetingUrl: createMeetLinkResponse?.join_url
                    }
                }
            } else {
                return {
                    status: statusCodeConstants.ERROR,
                    message: 'Error in scheduling appointment'
                }
            }
        } catch (error) {
            console.log(error)
            // console.log(error.response);
            // console.log(error.response?.data)
            return {
                status: statusCodeConstants.ERROR,
                message: 'Error in scheduling appointment'
            }
        }
    }

    async getZoomService(path, headers, method = "get", data = {}) {
        const url = `${this.ZOOM_API_ENDPOINT}/${path}`;

        if (method === "post") headers['Content-Type'] = "application/json";

        return new Promise((resolve, reject) => {
            axios.request({ url, method, headers, data })
                .then((response) => {
                    // console.log("Zoom response", response);
                    resolve({ result: response.data });
                })
                .catch((error) => {
                    // console.log("Zoom error", error);
                    resolve({ error });
                });
        })
    }
}

module.exports = ZoomService