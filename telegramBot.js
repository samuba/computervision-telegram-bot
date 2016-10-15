'use strict'; 
let TelegramBot = require('node-telegram-bot-api')
let analytics = require('./analytics')
let db = require('./database')
let answer = require('./answer')

let bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {webHook: true});
bot.setWebHook(process.env.TELEGRAM_WEBHOOK_URL)

bot.on("text", (msg, match) => {
  if (/\/start$/.exec(msg.text)) {
    bot.sendMessage(msg.from.id, `Send me a picture (or image link) and I tell you what I see 🙈`);
    return
  }
  
  if (/^(http:.*)|^(https:.*)/.exec(msg.text)) {
    answerToPicture(msg.from.id, msg.text)
    return
  }
  
  if (/\/requests/.exec(msg.text)) {
    db.getRequests().then(
      data => bot.sendMessage(msg.from.id, JSON.stringify(data.val(), null, 2).replace(/"|,|{|}/g, '')),
      error => bot.sendMessage(msg.from.id, error)
    )
    return
  }
  
  notSupported(msg.from.id)
});

bot.on('document', (msg, match) => {
  if (msg.document.mime_type.indexOf("image") < 0) {
    notSupported()
    return
  }
  
  let fileId = msg.document.file_id
  bot.getFileLink(fileId).then(imageUri => answerToPicture(msg.from, imageUri))
});

bot.on('photo', (msg, match) => {
  console.log(msg)
  let fileId = msg.photo[msg.photo.length - 1].file_id
  bot.getFileLink(fileId).then(imageUri => answerToPicture(msg.from, imageUri))
});

function notSupported(recipientId) {
  bot.sendMessage(recipientId, "I can only look at pictures 😔");
}

function answerToPicture(recipient, imageUri) {
  bot.sendChatAction(recipient.id, "typing")
  
  analytics.getDescription(imageUri).then(desc => { 
    console.log("description", desc.description.captions)
    let descAnswer = answer.buildDescriptionAnswer(desc.description)
    bot.sendMessage(recipient.id, descAnswer);
    
    analytics.getFaces(imageUri).then(fcs => {
      console.log("faces", fcs)
      
      if (fcs.faces && fcs.faces.length > 0) {
        let ageAnswer = answer.buildAgeAnswer(fcs.faces, fcs.faces[0].gender)
        bot.sendMessage(recipient.id, ageAnswer);
        
        analytics.getEmotions(imageUri).then(emotions => {
          let emotionsAnswer = answer.buildEmotionsAnswer(emotions, fcs.faces[0].gender)
          bot.sendMessage(recipient.id, emotionsAnswer);
          
          db.addRequest({ 
            user: recipient,
            description: desc.description.captions[0].text,
            emotions: emotionsAnswer,
            age: ageAnswer,
            imageUri: imageUri,
          })
        }) 
      } else {
        db.addRequest({ 
          user: recipient,
          description: desc.description.captions[0].text,
          imageUri: imageUri,
        })
      }
    })
  
  }) 
}

module.exports = {
  processUpdate: update => bot.processUpdate(update)
}