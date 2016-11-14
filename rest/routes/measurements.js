var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('iot.jeanbrito.com', 27017, {auto_reconnect: true});
db = new Db('home', server);

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

exports.findAll = function(req, res) {
    db.collection('measurements', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.lastMeasurement= function(req, res) {
    db.collection('measurements', function(err, collection) {
        collection.find().sort({$natural:-1}).limit(1).toArray(function(err, items) {
            res.send(items);
        });
    });
};
