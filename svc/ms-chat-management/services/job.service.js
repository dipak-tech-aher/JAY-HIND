import { config } from '@config/env.config'
import { logger } from '@utils'
import { differenceInMinutes } from 'date-fns'
import { isEmpty } from 'lodash'
import { Op } from 'sequelize'

const { tenantId, chatAbandonedTimeout } = config
const { getTenantConnection } = require('@services/connection-service')

export const processAbandonedChat = async (conn) => {
  if (!conn) {
    conn = await getTenantConnection(tenantId)
  }
  const t = await conn.sequelize.transaction()
  try {
    logger.debug('Processing chat abandoned')
    const chats = await conn.Chat.findAll({ where: { status: ['NEW'], userId: { [Op.eq]: null } } })
    if (chats && !isEmpty(chats)) {
      const chatList = []
      // const socalMediaChatList = []
      for (const chat of chats) {
        if (differenceInMinutes(new Date(), chat?.createdAt) >= chatAbandonedTimeout) {
          // console.log('Chat ID :', chat.chatId)
          chatList.push(chat.chatId)
          // if (['WHATSAPP-LIVECHAT', 'FB-LIVECHAT', 'IG-LIVECHAT'].includes(chat.source)) {
          //   socalMediaChatList.push(chat)
          // }
        }
      }
      // const replyMessage = 'We are sorry to keep you waiting. Our live agent are currently busy.'
      //   for (const s of socalMediaChatList) {
      //     logger.debug('Sending Live Chat Social Media Adandoned Messages')
      //     // console.log('socalMediaChatList', socalMediaChatList)\
      //     const senderID = await getSenderId(s.contactNo)
      //     const data = {
      //       contactNo: senderID
      //     }
      //     try {
      //       await Got.post({
      //         headers: { 'content-type': 'application/json' },
      //         url: 'http://localhost:4000/api/live-chat/chatCleanUp', // chatByWorkflow is calling from here
      //         body: JSON.stringify(data),
      //         retry: 0
      //       }, {
      //         https: {
      //           rejectUnauthorized: false
      //         }
      //       })
      //     } catch (error) {
      //       console.error(error)
      //     }

      //     // console.log('data', data)
      //     // console.log('senderID', senderID)

      //     if (senderID) {
      //       try {
      //         logger.debug('Sending ABANDONED Message')
      //         await callMetaSendAPI(s.source === 'WHATSAPP-LIVECHAT' ? PHONENUMBERID : FB_PAGE_ID, senderID, chatProperties.abandonedChatReplyMessage || 'We thank you for your patience. Our Live Agents are currently occupied.\nAlternatively, you may directly call us at Talian Darussalam 123\nOR\nSimply send us an email at (Info@123.com.bn)', s.source)
      //       } catch (error) {
      //         console.log('error', error)
      //       }
      //     }
      //   }

      await conn.Chat.update({ status: 'ABANDONED', abandonedDate: new Date() }, {
        logging: true,
        where: {
          chatId: chatList,
          status: 'NEW',
          userId: { [Op.eq]: null }
        },
        transaction: t
      })
      await t.commit()
      logger.info('Done processing chat abandoned')
    } else {
      logger.info('There is no chat to process abandoned')
    }
  } catch (error) {
    logger.error(error, 'Error while sending notification sms')
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}
