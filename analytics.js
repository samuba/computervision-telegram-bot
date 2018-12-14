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
      uri: "https://westeurope.api.cognitive.microsoft.com/face/v1.0/detect",
      headers: { 'Ocp-Apim-Subscription-Key': process.env.MS_FACE_API_KEY },
      qs: {
        'returnFaceId': 'false',
        returnFaceRectangle: 'false',
        'returnFaceLandmarks': 'false',
        'returnFaceAttributes': 'emotion'
      },
      body: { url: imageUrl },
      json: true
    })
  },
  
}