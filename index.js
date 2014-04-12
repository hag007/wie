var e = require('express')();

e.get("/", function(req, res) {
  res.status(200).send('hello from gal');
});

e.listen(process.env.PORT || 8080);