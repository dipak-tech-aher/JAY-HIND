/* eslint-disable indent */
import { defaultStatus, logger, statusCodeConstants, defaultCode, defaultMessage } from '@utils'
import { QueryTypes, Op } from 'sequelize'

export class JobService {
    constructor () {
        this.responseHelper = new ResponseHelper()
    }

    async getAllJobs (input, conn) {
        try {
            const resp = await conn.AppJobs.findAll({ order: ['id'] })
            // console.log(resp)
            logger.debug('Successfully fetched data')
            return {
                message: 'Success',
                data: resp,
                status: statusCodeConstants.SUCCESS
            }
        } catch (err) {
            logger.debug('Failed to fetch data', err)
            return {
                message: 'Internal Server Error',
                data: err,
                status: statusCodeConstants.ERROR
            }
        }
    }

    async updateJobService (input, conn, t) {
        try {
            const { state, jobId, method } = input
            if (state === 'start') {
                method == 'Workflow' ? processWorkFlow.start()
                : method == 'Helpdesk' ? helpdeskMailBox.start()
                : method == 'GenerateUnbilledContract' ? generateMonthlyContracts.start()
                : method == 'GenerateScheduledContract' ? scheduledMonthlyContracts.start()
                : method == 'EmailNotification' ? retrieNotifications.start()
                // method == 'SMSNotification' ? SMSNotifications.start() :
                : method == 'ChatCleanup'
? processChat.start()
                : method == 'FBPosts' ? processFBPosts.start() : null
            } else {
                method == 'Workflow' ? processWorkFlow.stop()
                : method == 'Helpdesk' ? helpdeskMailBox.stop()
                : method == 'GenerateUnbilledContract' ? generateMonthlyContracts.stop()
                : method == 'GenerateScheduledContract' ? scheduledMonthlyContracts.stop()
                : method == 'EmailNotification' ? retrieNotifications.stop()
                // method == 'SMSNotification' ? SMSNotifications.stop() :
                : method == 'ChatCleanup'
? processChat.stop()
                : method == 'FBPosts' ? processFBPosts.stop() : null
            }

            await conn.AppJobs.update(
                { status: state }
                , {
                    where: {
                        id: jobId
                    }
                })
            return {
                message: 'Started',
                status: statusCodeConstants.SUCCESS
            }
        } catch (err) {
            logger.debug('Failed to fetch data', err)
            return {
                message: 'Internal Server Error',
                data: err,
                status: statusCodeConstants.ERROR
            }
        }
    }

    // async jobHelpdesk(input, conn) {
    //     try {
    //         const { state, id } = input
    //         if (state === 'start') {
    //             helpdeskMailBox.start()
    //         } else {
    //             helpdeskMailBox.stop()
    //         }
    //         await conn.AppJobs.update(
    //             { status: state }
    //             , {
    //                 where: {
    //                     id
    //                 }
    //             })
    //             return {
    //                 message: 'Started',
    //                 status: statusCodeConstants.SUCCESS
    //             }
    //         } catch (err) {
    //             logger.debug('Failed to fetch data', err)
    //             return {
    //                 message: 'Internal Server Error',
    //                 data: err,
    //                 status: statusCodeConstants.ERROR
    //             }
    //         }
    // }

    // async jobUnbilled(input, conn) {
    //     try {
    //         const { state } = input
    //         if (state === 'start') {
    //             logger.info('Processing Unbilled Monthly Contracts')
    //             generateMonthlyContracts.start()
    //         } else {
    //             generateMonthlyContracts.stop()
    //         }
    //         await conn.AppJobs.update(
    //             { status: state }
    //             , {
    //                 where: {
    //                     id
    //                 }
    //             })
    //         return {
    //             message: 'Started',
    //             status: statusCodeConstants.SUCCESS
    //         }
    //     } catch (err) {
    //         logger.debug('Failed to fetch data', err)
    //         return {
    //             message: 'Internal Server Error',
    //             data: err,
    //             status: statusCodeConstants.ERROR
    //         }
    //     }
    // }

    // async jobScheduled(input, conn) {
    //     try {
    //         const { state, id } = input
    //         if (state === 'start') {
    //             logger.info('Processing Scheduled Monthly Contracts')
    //             scheduledMonthlyContracts.start()
    //         } else {
    //             scheduledMonthlyContracts.stop()
    //         }
    //         await conn.AppJobs.update(
    //             { status: state }
    //             , {
    //                 where: {
    //                     id
    //                 }
    //             })
    //         return {
    //             message: 'Started',
    //             status: statusCodeConstants.SUCCESS
    //         }
    //     } catch (err) {
    //         logger.debug('Failed to fetch data', err)
    //         return {
    //             message: 'Internal Server Error',
    //             data: err,
    //             status: statusCodeConstants.ERROR
    //         }
    //     }
    // }

    // async jobEmail(input, conn) {
    //     try {
    //         const { state, id } = input
    //         if (state === 'start') {
    //             task.start()
    //             retrieNotifications.start()
    //         } else {
    //             task.stop()
    //             retrieNotifications.stop()
    //         }
    //         await conn.AppJobs.update(
    //             { status: state }
    //             , {
    //                 where: {
    //                     id
    //                 }
    //             })
    //             return {
    //                 message: 'Started',
    //                 status: statusCodeConstants.SUCCESS
    //             }
    //         } catch (err) {
    //             logger.debug('Failed to fetch data', err)
    //             return {
    //                 message: 'Internal Server Error',
    //                 data: err,
    //                 status: statusCodeConstants.ERROR
    //             }
    //         }
    // }

    // async jobChat(input, conn) {
    //     try {
    //         const { state, id } = input
    //         if (state === 'start') {
    //             processChat.start()
    //         } else {
    //             processChat.stop()
    //         }
    //         await conn.AppJobs.update(
    //             { status: state }
    //             , {
    //                 where: {
    //                     id
    //                 }
    //             })
    //             return {
    //                 message: 'Started',
    //                 status: statusCodeConstants.SUCCESS
    //             }
    //         } catch (err) {
    //             logger.debug('Failed to fetch data', err)
    //             return {
    //                 message: 'Internal Server Error',
    //                 data: err,
    //                 status: statusCodeConstants.ERROR
    //             }
    //         }
    // }

    // async jobFBPost(input, conn) {
    //     try {
    //         const { state, id } = input
    //         if (state === 'start') {
    //             processFBPosts.start()
    //         } else {
    //             processFBPosts.stop()
    //         }
    //         await conn.AppJobs.update(
    //             { status: state }
    //             , {
    //                 where: {
    //                     id
    //                 }
    //             })
    //         return {
    //             message: 'Started',
    //             status: statusCodeConstants.SUCCESS
    //         }
    //     } catch (err) {
    //         logger.debug('Failed to fetch data', err)
    //         return {
    //             message: 'Internal Server Error',
    //             data: err,
    //             status: statusCodeConstants.ERROR
    //         }
    //     }
    // }
}
