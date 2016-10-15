'use strict'

let firebase = require('firebase');

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  databaseURL: process.env.FIREBASE_DB_URL,
  //authDomain: "projectId.firebaseapp.com",
  //storageBucket: "bucket.appspot.com"
})

let db = firebase.database();

module.exports = {
  
  addRequest: (req) => {
    db.ref("requests/" + (new Date()).toISOString().replace(".", ":")).set(req).then(
      ok => console.log("firebase set succesfull"),
      err => console.error("firebase set failed", err)
    )
  },
  
  getRequests: (limit) => {
    limit = !limit ? 10: limit
    return db.ref("requests").limitToLast(limit).once("value")
  }
  
}