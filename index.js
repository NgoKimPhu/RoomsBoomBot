var express = require('express');
var app = express();

app.post('/start', function(req, res) {
  if (req.query.secret != process.env.secret) {
    return res.status(401).send('Unauthorized');
  }
  console.log(req.body);
  res.json({});
});

app.listen(process.env.PORT);
