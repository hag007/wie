require('simpleplan')();
var dependencies = {};

var path = dependencies.path = require('path');
var express = dependencies.express = require('express');
var bodyParser = dependencies.bodyParser = require('body-parser');
var cookieParser = dependencies.cookieParser = require('cookie-parser');

var monami = dependencies.monami = require('monami');
var Mongoose = dependencies.Mongoose = require('mongoose');

var getEnvVar = dependencies.getEnvVar = function(name, defaultValue) {
  return process.env[name] || defaultValue;
};

require('./models/dude')(dependencies);

var app = express();
var server = dependencies.server = require('http').createServer(app);
app.use(bodyParser());
app.use('/api', monami(Mongoose));
app.use(express.static(path.resolve(__dirname, "../public")));

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
  socket.on('userStatusChange', function(userData) {
    console.log(userData);
    Mongoose.models.Dude.findByIdAndUpdate(userData._id, { $set: { here: userData.here, why: userData.why } }, function(err, data) {
      if (err) {
        socket.emit('error', 'an error occured!');
      } else {
        socket.broadcast.emit('userStatusChange', data);
        socket.emit('success', 'success!');
      }
    })
  });
});

var mongoAddress = process.env.MONGOHQ_URL || "mongodb://localhost/wie2_test";
if (process.env.VCAP_SERVICES) {
  var env = JSON.parse(process.env.VCAP_SERVICES);
  mongoAddress = env['mongodb-1.8'][0]['credentials'];
}

// Connect to the DB
Mongoose.connect(mongoAddress);

if (!module.parent) {
  var port = process.env.PORT || process.env.VCAP_APP_PORT || 8080;
  server.listen(port);
  console.log("Listening on port " + port + "..");
}