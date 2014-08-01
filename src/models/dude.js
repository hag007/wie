require('simpleplan')();

module.exports = function(Mongoose) {
  var dudes = new Mongoose.Schema({
    here: Boolean,
    why: String,
    name: String,
    team: String
  });

  dudes.methods.toJSON = function() {
    var obj = this.toObject();
    obj.id = obj._id;
    delete obj._id;
    return obj;
  };

  var Dude = Mongoose.model('Dude', dudes);
}.inject();