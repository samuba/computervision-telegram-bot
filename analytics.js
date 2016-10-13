'use strict'
let request = require('request-promise');

module.exports = {
  
  getDescription: (imageUrl) => {
    return request({
      method: "POST",
      uri: "https://api.projectoxford.ai/vision/v1.0/analyze?visualFeatures=Description",
      headers: { 'Ocp-Apim-Subscription-Key': process.env.MS_COMPUTER_VISION_TOKEN },
      body: { url: imageUrl },
      json: true
    })
  },
  
  getFaces: (imageUrl) => {
    return request({
      method: "POST",
      uri: "https://api.projectoxford.ai/vision/v1.0/analyze?visualFeatures=Faces",
      headers: { 'Ocp-Apim-Subscription-Key': process.env.MS_COMPUTER_VISION_TOKEN },
      body: { url: imageUrl },
      json: true
    })
  },
  
  getEmotions: (imageUrl) => {
    return request({
      method: "POST",
      uri: "https://api.projectoxford.ai/emotion/v1.0/recognize",
      headers: { 'Ocp-Apim-Subscription-Key': process.env.MS_EMOTION_TOKEN },
      body: { url: imageUrl },
      json: true
    })
  } 
  
}