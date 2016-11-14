var mqtt = require('mqtt'); //includes mqtt server
var mongodb = require('mongodb'); // includes mongoDB
var mongodbClient = mongodb.MongoClient; //initialises the mongoDB client
var mongodbURI = 'mongodb://localhost:27017/home'; //activating the MongoDB port 27017, here TempMontor is the name of the database
var measurements, devices, client; //initialise collection and client

mongodbClient.connect(mongodbURI, setupCollection); //connect the database with collecion

function setupCollection(err, db) {
    if (err) throw err;
    measurements = db.collection("measurements"); //name of the collection in the database
    devices = db.collection("devices");
    client = mqtt.connect({
        host: 'localhost',
        port: 1883
    }); //connecting the mqtt server with the MongoDB database
    client.subscribe("sensors/#"); //subscribing to the topic name
    client.subscribe("devices/#"); //subscribing to the topic name
    client.on('message', handleMessages); //inserting the event
}

//function that displays the data in the MongoDataBase
/*function handleMessages(topic, message) {
    console.log(topic.split("/"));
    var json = JSON.parse(message);
    var timestampData = new Date(json.timestamp*1000).toISOString();
    json.date = timestampData;
    collection.insert(json, function(err, doc) {
        console.log(message);
    if(err) throw err;
  });
}*/

function update1Hz() {
   timestamp = Math.floor(Date.now());
   client.publish("hub/1hz", ""+ timestamp);
}

setInterval(update1Hz, 1000);


function handleMessages(topic, message) {
    message = message.toString();
    var splittedTopic = topic.split("/");
    console.log(splittedTopic);
    switch (splittedTopic[0]) {
        case "sensors":
            var json = JSON.parse(message);
            var timestampData = new Date(json.timestamp*1000).toISOString();
            json.date = timestampData;
              measurements.insert(json, function(err, doc) {
                  console.log("measurement saved on DB");
              if(err) throw err;
            });
            break;
        case "devices":
            console.log("device");
            devices.insert({device:splittedTopic[1], status:message, date:new Date()});
            break;
    }
}
