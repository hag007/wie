var e = require('express')();

e.get("/", function(req, res) {
  res.status(200).send('hello from gal');
});

e.listen(process.env.VCAP_APP_PORT || 8080);