var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ strict: false, type() { return true; } }));

app.post('/start', function(req, res) {
  if (req.query.secret != process.env.secret) {
    return res.status(401).send('Unauthorized');
  }
  console.log(req.body);
  res.json({});
});

app.listen(process.env.PORT);
