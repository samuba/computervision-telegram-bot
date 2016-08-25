'use strict';
let TelegramBot = require('node-telegram-bot-api');
let analytics = require('./analytics')

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
  
  notSupported(msg.from.id)
});

bot.on('document', (msg, match) => {
  if (msg.document.mime_type.indexOf("image") < 0) {
    notSupported()
    return
  }
  
  let fileId = msg.document.file_id
  bot.getFileLink(fileId).then(imageUri => answerToPicture(msg.from.id, imageUri))
});

bot.on('photo', (msg, match) => {
  let fileId = msg.photo[msg.photo.length - 1].file_id
  bot.getFileLink(fileId).then(imageUri => answerToPicture(msg.from.id, imageUri))
});

function notSupported(recipientId) {
  bot.sendMessage(recipientId, "I can only look at pictures 😔");
}

function answerToPicture(recipientId, imageUri) {
  bot.sendChatAction(recipientId, "typing")
  
  analytics.getDescription(imageUri).then(x => {
    console.log("description", x)
    sendDescription(recipientId, x.description)
    
    analytics.getFaces(imageUri).then(x => {
      console.log("faces", x)
      sendFaces(recipientId, x.faces)
    })
  }) 
}

function sendFaces(recipientId, faces) {
  if (!faces || faces.length <= 0) {
      return
  }
  
  let answer = ""
  if (faces.length > 1) {
    answer = "They "
  } else {
    if (faces[0].gender == "Male") {
      answer = "He "
    } else {
      answer = "She "
    }
  }
  
  answer += "could be " 
  for(let i=0; i < faces.length; i++) {
    answer += faces[i].age
    if (i != faces.length - 1) answer += " and " 
  }
  
  answer += " years old."
  bot.sendMessage(recipientId, answer);
}

function sendDescription(recipientId, description) {
  let desc = description.captions[0].text
  let answer = "That looks like "
  if (desc[0] == "a" && desc[1] == " ") {
    answer += desc
  } else {
    answer += "a " + desc
  }
  bot.sendMessage(recipientId, answer + ".");
}

module.exports = {
  processUpdate: update => bot.processUpdate(update)
}