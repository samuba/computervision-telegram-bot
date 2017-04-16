'use strict'

let https = require('https')
let fs = require('fs');
let azure = require('azure-storage')
let crypto = require('crypto');

let fileService = azure.createFileService(process.env.AZURE_FILE_STORAGE_NAME, process.env.AZURE_FILE_STORAGE_KEY)

let db = null

module.exports = {
  
  init: (firebase) => db = firebase.database(),
  
  addRequest: (req) => {
    let name = (new Date()).toISOString().replace(".", ":").replace(/:/g, "-")
    persistFile(req.imageUri, name, url => {
      req.imageUri = url
      console.log("uploaded url", url)
      db.ref("requests/" + name).set(req).then(
        ok => console.log("firebase set succesfull"),
        err => console.error("firebase set failed", err)
      )  
    })
  },
  
  getRequests: (limit) => {
    return db.ref("requests").limitToLast(limit || 8).once("value")
  },
  
  getUsers: () => {
    return new Promise((resolve, reject) => {
      console.log(1)
      db.ref("requests").once("value").then(data => {
        let users = []
        let requests = Object.values(data.val())
        requests = requests.map(x => x.user)
        requests = requests.map(x => Number.isInteger(x) ? { id: x } : x) //convert users that have not given any name
        requests = requests.map(x => {
          if (users.find(y => y.id == x.id)) return
          x.calls = requests.reduce((acc, item) => item.id == x.id ? acc + 1 : acc, 0) //count all requests of this user
          users.push(x)
        })
        resolve(users)
      })
    })
  }, 
  
}

function persistFile(uri, name, callback) {
  downloadFile(uri, (filePath) => {
    uploadToPermanentStorage(filePath, name, (url) => callback(url))
  })
}

function uploadToPermanentStorage(filePath, name, callback) {
  let shareName = "uploads"
  let dir = "images"
  name += ".jpg"
  
  fileService.createFileFromLocalFile(shareName, dir, name, filePath,  (err, res, resp) => {
    let sasToken = fileService.generateSharedAccessSignature(shareName, dir, name, {
      AccessPolicy: {
        Permissions: azure.FileUtilities.SharedAccessPermissions.READ,
        Start: "2015-12-24T18:21Z",
        Expiry: "2099-12-24T18:21Z"
      }
    })
    let url = fileService.getUrl(shareName, dir, name, sasToken, true)
    callback(url)
  })
}

function downloadFile(uri, callback) {
  let localFilePath = "/tmp/" + crypto.randomBytes(4).readUInt32LE(0)
  let localFile = fs.createWriteStream(localFilePath)
  https.get(uri, response => { 
    response.pipe(localFile)
    localFile.on('finish', () => {
      localFile.close(() => {
        callback(localFilePath)
      })
    })
  })
}