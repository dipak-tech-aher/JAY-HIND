export const sendTwilioSMS = async (accountSid, authToken, content, from, to) => {
  const client = require('twilio')(accountSid, authToken)

  await client.messages
    .create({
      body: content,
      from,
      to
    })
    .then(message => console.log(message.sid))
}
