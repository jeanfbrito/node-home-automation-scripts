var TelegramBot = require('node-telegram-bot-api');

var fs = require('fs'),
    request = require('request');

var token = '142952712:AAELSde5_kmxUjPhx1KTvbK-d2IUtADPN6U';
// Setup polling way
var bot = new TelegramBot(token, {polling: true});

bot.onText(/\/gate/, function (msg) {
  var chatId = msg.chat.id;
  console.log(msg);
  var tryCount = 0;
  var doRequest = function() {
    request({
      url : 'http://mortunha.servegame.com:8000/picture/1/current',
      //url : 'http://mortunha.servegame.com:8000/picture/1/current',
      //make the returned body a Buffer
      encoding : null
      }, function(error, response, body) {
          if (body != undefined && body != 0) {
            console.log(body);
            bot.sendPhoto(chatId, body)
          } else if(tryCount < 5){
            console.log("lets try again" + tryCount);
            tryCount++;
            setTimeout(doRequest, 500);
          } else {
            bot.sendMessage(chatId, "A camera permanece indisponível após 5 tentativas.")
          }

    });
  };

  doRequest();
});
