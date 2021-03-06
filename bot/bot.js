var TelegramBot = require('node-telegram-bot-api');
var mqtt = require('mqtt');

var fs = require('fs'),
    request = require('request');

var token = '142952712:AAELSde5_kmxUjPhx1KTvbK-d2IUtADPN6U';
// Setup polling way
var bot = new TelegramBot(token, {polling: true});

var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('192.168.13.91', 27017, {auto_reconnect: true});
db = new Db('home', server);


client = mqtt.connect({
    host: '192.168.13.91',
    port: 1883
}); //connecting the mqtt server with the MongoDB database
client.subscribe("sensors/#"); //subscribing to the topic name
client.subscribe("devices/#"); //subscribing to the topic name
client.on('message', handleMessages); //inserting the event

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'home' database");
        db.collection('measurements', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'home' collection doesn't exist. Creating it with sample data...");
                //populateDB();
            }
        });
    }
});

bot.onText(/\/water/, function (msg) {
  var chatId = msg.chat.id;
  console.log(msg);
  db.collection('measurements', function(err, collection) {
      collection.find( { "device": "18fe34f3632f" } ).sort({$natural:-1}).limit(1).toArray(function(err, items) {
          //console.log(items[0].device);
          bot.sendMessage(chatId, "Nivel da água: " + items[0].level);
      });
  });
});

bot.onText(/\/gate/, function (msg) {
  var chatId = msg.chat.id;
  console.log(msg);
  var tryCount = 0;
  var doRequest = function() {
    request({
      url : 'http://192.168.13.50:8000/picture/1/current',
      //url : 'http://mortunha.servegame.com:8000/picture/1/current',
      //make the returned body a Buffer
      encoding : null
      }, function(error, response, body) {
          if (body != undefined && body != 0) {
            console.log(body);
            bot.sendPhoto(chatId, body)
          } else if(tryCount < 5){
            console.log("lets try again " + tryCount);
            tryCount++;
            setTimeout(doRequest, 500);
          } else {
            bot.sendMessage(chatId, "A camera permanece indisponível após 5 tentativas.")
          }

    });
  };

  doRequest();
});

var lastHighLevel = 0;
var lastLowLevel = 0;

function handleMessages(topic, message) {
    message = message.toString();
    var splittedTopic = topic.split("/");
    console.log(splittedTopic);
    switch (splittedTopic[0]) {
        case "sensors":
            var json = JSON.parse(message);
            var timestampData = new Date(json.timestamp*1000).toISOString();
            json.date = timestampData;
            if(json.highlevel){
              if(json.highlevel !== lastHighLevel){
                lastHighLevel = json.highlevel;
                switch (lastHighLevel){
                  case 0:
                    bot.sendMessage(-125807515, "Caixa d'agua cheia! Nivel máximo atingido.");
                    break;

                  case 1:
                    bot.sendMessage(-125807515, "Caixa d'agua abaixo do nivel máximo.");
                    break;
                }
              }
            }
            if(json.lowLevel){
              if(json.lowLevel !== lastLowLevel){
                lastLowLevel = json.lowLevel;
                switch (lastLowLevel){
                  case 0:
                    bot.sendMessage(-125807515, "Caixa d'agua acima do nivel minimo.");
                    break;

                  case 1:
                    bot.sendMessage(-125807515, "Caixa d'agua abaixo do nivel minimo.");
                    break;
                }
              }
            }

            break;
        case "devices":
            bot.sendMessage(-125807515, "Dispositivo " + splittedTopic[1] + " mudou o status para " + message )
            console.log("device");
            break;
    }
}
