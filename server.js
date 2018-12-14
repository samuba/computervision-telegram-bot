'use strict';
let express = require('express');
let bodyParser = require('body-parser');
let bot = require("./telegramBot")
let analytics = require('./analytics')

let app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
 
app.get("/", (req, resp) => {
  resp.sendFile(__dirname + '/views/index.html');
})
 
app.post("/" + process.env.TELEGRAM_BOT_TOKEN, (req, resp) => {
  console.log("msg from telegram", req.body)
  bot.processUpdate(req.body)  
  resp.send(200)
})

var listener = app.listen(process.env.PORT, () => { 
  console.log('Your app is listening on port ' + listener.address().port);
})


analytics.getEmotions("https://static6.businessinsider.de/image/5841903ddd089538448b4725/vor-24-jahren-starb-pablo-escobar--hier-sind-3-theorien-wer-ihn-wirklich-erschossen-hat.jpg").then(emotions => {
  console.log("emo", JSON.stringify(emotions))
}) 