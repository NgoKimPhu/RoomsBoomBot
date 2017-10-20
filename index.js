var express = require('express');
var app = express();
var request = require('request');

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ strict: false, type() { return true; } }));

members = {};

app.post('/start', function(req, res) {
  if (req.query.secret != process.env.secret) {
    return res.status(401).send('Unauthorized');
  }
  const update = req.body;
  if (!update.message.text) {
    console.log("Non-message");
    console.log(update);
    return res.json({});
  }
  if (update.message.chat.type == 'private') {
    request.post('https://api.telegram.org/bot' + process.env.token + '/sendMessage',
      { qs: { chat_id: update.message.chat.id, text: 'Hi! Now go back to your game group!' } }).pipe(res);
  } else if (update.message.text.startsWith('/join')) {
    const t = update.message.text.split(' ');
    var team = ['blue', 'red'][t.length > 1 ? t[1].startsWith('r') ? 1 : 0 : Math.floor(Math.random()*2)];
    request.post('https://api.telegram.org/bot' + process.env.token + '/sendMessage',
    { qs: { chat_id: update.message.chat.id, text: update.message.from.first_name + ' joined team ' + team } },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if (members[update.message.chat.id] == undefined) {
          members[update.message.chat.id] = {red:[], blue:[]};
        } else {
          members[update.message.chat.id].red = members[update.message.chat.id].red.filter(x => x.id != update.message.from.id);
          members[update.message.chat.id].blue = members[update.message.chat.id].blue.filter(x => x.id != update.message.from.id);
        }
        members[update.message.chat.id][team].push(update.message.from);
        console.log('-----');
        console.log(members[update.message.chat.id]);
        console.log('-----');
        response.pipe(res);
      }
    });
  } else if (update.message.text.startsWith('/quit')) {
    members[update.message.chat.id].red = members[update.message.chat.id].red.filter(x => x.id != update.message.from.id);
    members[update.message.chat.id].blue = members[update.message.chat.id].blue.filter(x => x.id != update.message.from.id);
    request.post('https://api.telegram.org/bot' + process.env.token + '/sendMessage',
    { qs: { chat_id: update.message.chat.id, text: update.message.from.first_name + ' quitted' } }).pipe(res);
  } else if (update.message.text.startsWith('/list')) {
    if (members[update.message.chat.id] == undefined)
      request.post('https://api.telegram.org/bot' + process.env.token + '/sendMessage',
      { qs: { chat_id: update.message.chat.id, text: 'No one joined yet' } }).pipe(res);
    else
      request.post('https://api.telegram.org/bot' + process.env.token + '/sendMessage',
    { qs: { chat_id: update.message.chat.id, text: 'Current players: Red: ' + members[update.message.chat.id].red.map(from => from.first_name).join(', ') + '; Blue: ' + members[update.message.chat.id].blue.map(from => from.first_name).join(', ') } }).pipe(res);
  } else if (update.message.text.startsWith('/start')) {
    if (members[update.message.chat.id] == undefined || members[update.message.chat.id].red.length < 1 || members[update.message.chat.id].blue.length < 1)
      request.post('https://api.telegram.org/bot' + process.env.token + '/sendMessage',
      { qs: { chat_id: update.message.chat.id, text: 'Not enough players..' } }).pipe(res);
    else {
      ms = 2;
      p1 = members[update.message.chat.id].red[Math.floor(Math.random()*members[update.message.chat.id].red.length)];
      p2 = members[update.message.chat.id].blue[Math.floor(Math.random()*members[update.message.chat.id].blue.length)];
      request.post('https://api.telegram.org/bot' + process.env.token + '/sendMessage',
      { qs: { chat_id: p1.id, text: 'You are the Bomber. Can you kill the President? Good luck!' } },
      function (error, response, body) {if (!error && response.statusCode == 200) {
        if (!--ms) {
          request.post('https://api.telegram.org/bot' + process.env.token + '/sendMessage',
            { qs: { chat_id: update.message.chat.id, text: 'Game started! The Bomber and President were pm-ed. You do your own game-mastery thing from now on. Good luck and have fun!' } }).pipe(res);
        }
      } else {
        request.post('https://api.telegram.org/bot' + process.env.token + '/sendMessage',
            { qs: { chat_id: update.message.chat.id, text: p1.first_name + " hasn't sent me a private message... Game cannot start. Scold him/her." } }).pipe(res);
      }});
      request.post('https://api.telegram.org/bot' + process.env.token + '/sendMessage',
      { qs: { chat_id: p2.id, text: 'You are the President. Can you avoid the Bomber? Good luck!' } },
      function (error, response, body) {if (!error && response.statusCode == 200) {
        if (!--ms) {
          request.post('https://api.telegram.org/bot' + process.env.token + '/sendMessage',
            { qs: { chat_id: update.message.chat.id, text: 'Game started! The Bomber and President were pm-ed. You do your own game-mastery thing from now on. Good luck and have fun!' } }).pipe(res);
        }
      } else {
        request.post('https://api.telegram.org/bot' + process.env.token + '/sendMessage',
            { qs: { chat_id: update.message.chat.id, text: p2.first_name + " hasn't sent me a private message... Game cannot start. Scold him/her." } }).pipe(res);
      }});
    }
  }
  console.log(req.body);
});

app.listen(process.env.PORT);
