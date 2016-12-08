'use strict'

module.exports = {

  buildEmotionsAnswer: (emotions, gender) => {
    let sortedEmotions = processEmotions(emotions);
    if (sortedEmotions.length == 1) {
      let emotionDescription = sortedEmotions[0][0].singleDesc 
      return resolveGenderPlaceholders(emotionDescription, gender)
    } 
    
    let answer = "I think they seem to be "
    sortedEmotions.map(em => {
      let topEmotion = em[0].name
      if (em == sortedEmotions[0]){
        answer += topEmotion // first element
      } else if (em == sortedEmotions[sortedEmotions.length - 1]) {
        answer += ` and ${topEmotion}.` // last element{
      } else {
        answer += ", " + topEmotion
      }
    })
    return answer
  },
  
  buildAgeAnswer: (faces, gender) => {
    let answer = faces.length > 1 ? "They " : resolveGenderPlaceholders("<heshe> ", gender)
    answer += "could be " 
    for(let i=0; i < faces.length; i++) {
      answer += faces[i].age
      answer += i != (faces.length - 1) ? " and " : ""
    }
    return answer + " years old"
  },
  
  buildDescriptionAnswer: (description) => {
    let desc = description.captions[0].text
    let answer = "That looks like "
    if (desc[0] == "a" && desc[1] == " ") {
      return answer + desc
    } else {
      return answer + "a " + desc
    }
  },
  
}

function resolveGenderPlaceholders(text, gender) {
  let heshe
  if (text[text.indexOf("<heshe>") - 2] === "." || text.indexOf("<heshe>") === 0) {
    heshe = gender == "Male" ? "He" : "She"
  } else {
    heshe = gender == "Male" ? "he" : "she"
  }
  text = text.replace("<heshe>", heshe)
  
  let himher
  if (text[text.indexOf("<himher>") - 2] === "." || text.indexOf("<himher>") === 0) {
    himher = gender == "Male" ? "Him" : "Her"
  } else {
    himher = gender == "Male" ? "him" : "her"
  }
  text = text.replace("<himher>", himher)
  
  return text 
}

function processEmotions(emotions) {
  let sortedEmotions = []
  emotions.map(em => {
    let ems = []
    ems.push({ 
      name: "angry", 
      singleDes: "Woah. What did you do to make <himher> so angry? 😡",
      value: em.scores.anger 
    })
    ems.push({ 
      name: "contempt", 
      singleDesc: "Pfff. <heshe> is obiously better then you! 😒",
      value: em.scores.contempt 
    })
    ems.push({ 
      name: "disgusted", 
      singleDesc: "Wüah! <heshe> looks disgusted! 😖", 
      value: em.scores.disgust
    })
    ems.push({ 
      name: "in fear", 
      singleDesc: "<heshe> is in fear. 😱 Help <himher>!", 
      value: em.scores.fear 
    })
    ems.push({ 
      name: "happy", 
      singleDesc: "Haha. <heshe> looks happy! 😃",
      value: em.scores.happiness })
    ems.push({ 
      name: "neutral", 
      singleDesc: "<heshe> does not show any particular emotion. 😐", 
      value: em.scores.neutral 
    })
    ems.push({ 
      name: "sad", 
      singleDes: "Oh no. <heshe> he is sad. 😢",
      value: em.scores.sadness 
    })
    ems.push({ 
      name: "surprised", 
      singleDesc: "BOO! <heshe> is surpised! 😲",
      value: em.scores.surprise
    })
    ems = ems.sort((a, b) => b.value - a.value)
    sortedEmotions.push(ems)
    console.log("sorted", ems)
  })
  return sortedEmotions;
}