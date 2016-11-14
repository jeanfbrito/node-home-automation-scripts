var express = require('express'),
    wine = require('./routes/wines');
    measurement = require('./routes/measurements');

var app = express();

app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.get('/wines', wine.findAll);
app.get('/wines/:id', wine.findById);
app.post('/wines', wine.addWine);
app.put('/wines/:id', wine.updateWine);
app.delete('/wines/:id', wine.deleteWine);

app.get('/measurements', measurement.findAll);
app.get('/lasttemp', measurement.lastMeasurement);

app.listen(3000);
console.log('Listening on port 3000...');
