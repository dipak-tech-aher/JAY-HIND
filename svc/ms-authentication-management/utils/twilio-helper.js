
export const sendTwilioSMS = async (accountSid, authToken, content, from, to) => {
  const client = require('twilio')(accountSid, authToken)
  return await client.messages
    .create({
      body: content,
      from,
      to
    })
    .then(message => { return message; }).catch(error => console.log(error, 'error from sms provider'))
}
