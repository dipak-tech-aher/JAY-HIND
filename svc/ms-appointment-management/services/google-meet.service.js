const { google } = require('googleapis');
const axios = require('axios');
import { config } from '@config/env.config'
import dayjs from 'dayjs'
import { v4 as uuid } from 'uuid'

import em from '@emitters'
import {
    statusCodeConstants, constantCode
} from '@utils'

const { googleConfig } = config
console.log('googleConfig------->', googleConfig)
// const oauth2Client = new google.auth.OAuth2(
//     googleConfig.clientId,
//     googleConfig.clientSecret,
//     googleConfig.redirectUrl
// )

const scopes = ['https://www.googleapis.com/auth/calendar'];

const calendar = google.calendar({
    version: "v3",
    auth: googleConfig?.apiKey
})

let instance;
class GoogleMeetService {
    constructor(conn) {
        if (!instance) {
            instance = this
        }
        instance.conn = conn;
        return instance
    }

    async getCredentials() {
        const appConfig = await this.conn.BcaeAppConfig.findOne();

        const ZOOM_MEETING_SDK_KEY = appConfig?.appointChannelSetupPayload?.zoomPortalSetting?.clientId;
        const ZOOM_MEETING_SDK_SECRET = appConfig?.appointChannelSetupPayload?.zoomPortalSetting?.clientSecretKey;
        const ZOOM_ACCOUNT_ID = appConfig?.appointChannelSetupPayload?.zoomPortalSetting?.accountId;

        return {
            ZOOM_MEETING_SDK_KEY, ZOOM_MEETING_SDK_SECRET, ZOOM_ACCOUNT_ID
        }
    }

    async googleLogin() {
        // const url = oauth2Client.generateAuthUrl({
        //     access_type: "offline",
        //     scope: scopes
        // });
        // return url
    }

    async googleRedirect(req) {
        const code = req?.query?.code
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens)
    }

    async googleScheduleEvent(req) {
        const data = calendar.events.insert({
            calendarId: "primary",
            auth: oauth2Client,
            conferenceDataVersion: 1,
            requestBody: {
                summary: "This is test event",
                description: "testing description..",
                start: {
                    dateTime: dayjs(new Date()).add(1, 'day').toISOString(),
                    timeZone: 'Asia/Kolkata'
                },
                end: {
                    dateTime: dayjs(new Date()).add(1, 'day').add(1, 'hour').toISOString(),
                    timeZone: 'Asia/Kolkata'
                },
                conferenceData: {
                    createRequest: {
                        requestId: uuid()
                    }
                },
                attendees: [{
                    email: "dipakaher000@gmail.com"
                }]
            }
        })
        const result = data.then((r) => {
            console.log('r-------->', r?.data?.hangoutLink)
        })
    }
}

module.exports = GoogleMeetService