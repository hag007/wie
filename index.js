var e = require('express')();

e.get('/', function(req, res) {
  res.status(200).send("SHALOM");
});

e.listen(process.env.OPENSHIFT_NODEJS_PORT);