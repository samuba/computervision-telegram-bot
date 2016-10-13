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
  
  analytics.getDescription(imageUri).then(desc => {
    console.log("description", desc.description.captions)
    sendDescription(recipientId, desc.description)
    
    analytics.getFaces(imageUri).then(fcs => {
      console.log("faces", fcs)
      
      if (fcs.faces && fcs.faces.length > 0) {
        sendFaces(recipientId, fcs.faces)
        
        analytics.getEmotions(imageUri).then(emotions => {
          console.log("emotions", emotions)
          sendEmotions(recipientId, emotions, fcs.faces)
        }) 
      }
    })
  
  }) 
}

function sendEmotions(recipientId, emotions, faces) {
  let finalEmotions = []
  emotions.map(em => {
    let ems = []
    ems.push({ name: "angry", value: em.scores.anger })
    ems.push({ name: "contempt", value: em.scores.contempt })
    ems.push({ name: "disgusted", value: em.scores.disgust })
    ems.push({ name: "in fear", value: em.scores.fear })
    ems.push({ name: "happy", value: em.scores.happiness })
    ems.push({ name: "neutral", value: em.scores.neutral })
    ems.push({ name: "sad", value: em.scores.sadness })
    ems.push({ name: "surprised", value: em.scores.surprise })
    ems.sort((a, b) => b.value - a.value)
    finalEmotions.push(ems[0])
    console.log("sorted", ems)
  })
  
  let answer = "I think "
  if (faces.length == 1) {
    answer += faces[0].gender == "Male" ? "he " : "she "
    answer += `seems to be ${finalEmotions[0].name}.`
  } else {
    answer += "they seem to be "
    finalEmotions.map(em => {
      if (em == finalEmotions[0]){
        answer += em.name // first element
      } else if (em == finalEmotions[finalEmotions.length - 1]) {
        answer += ` and ${em.name}.` // last element{
      } else {
        answer += ", " + em.name
      }
    })
  }
  
  bot.sendMessage(recipientId, answer);
}

function sendFaces(recipientId, faces) {
  console.log("faces", faces)
  
  let answer = ""
  if (faces.length > 1) {
    answer = "They "
  } else {
    answer = faces[0].gender == "Male" ? "He " : "She "
  }
  
  answer += "could be " 
  for(let i=0; i < faces.length; i++) {
    answer += faces[i].age
    answer += i != (faces.length - 1) ? " and " : ""
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