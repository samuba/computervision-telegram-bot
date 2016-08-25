'use strict'
let request = require('request-promise');

function getDescription(imageUrl) {
  return request({
    method: "POST",
    uri: "https://api.projectoxford.ai/vision/v1.0/analyze?visualFeatures=Description",
    headers: { 'Ocp-Apim-Subscription-Key': process.env.MS_COMPUTER_VISION_TOKEN },
    body: { url: imageUrl },
    json: true
  })
} 

function getFaces(imageUrl) {
  return request({
    method: "POST",
    uri: "https://api.projectoxford.ai/vision/v1.0/analyze?visualFeatures=Faces",
    headers: { 'Ocp-Apim-Subscription-Key': process.env.MS_COMPUTER_VISION_TOKEN },
    body: { url: imageUrl },
    json: true
  })
} 

module.exports = {
  getDescription: x => getDescription(x),
  getFaces: x => getFaces(x)
}