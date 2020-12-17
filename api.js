#! /usr/bin/env node
const scanner = require('./modules/lineScanner.js');
const Datamodel = require('./modules/data-model.js');
const logUser = require('./modules/logUser.js');
const print = require('./modules/printer.js');
const Timer = require('./modules/Timer.js');
const monthName = require('./modules/month-name.js');
const init = require('./modules/init.js');
const suffix = require('./modules/suffix.js');
const fs = require('fs');  
const readline = require('readline');
const compression = require('compression'); 
const express = require('express');
const schedule = require('node-schedule');
const path = require('path');
const url = require('url');
const logReceiver = require("srcds-log-receiver");
const app = express();   
const expressWs = require('express-ws')(app); 
const colors = require('colors'); 

var socket;
var configPath = path.join(__dirname, `config-win.json`);
var config = require(configPath);
const logFolder = path.join(config.gameServerDir, 'logs');

init(logFolder, configPath);

/**
 *  DATA!!!!!!
 */
var appData = new Datamodel();

/**
 *  Log reciver
 */
var receiver = new logReceiver.LogReceiver();

/**
 *  throw a error
 */
function errorHandler(e) {
  throw new Error(e);
}

/**
 * callback for when a player joins server
 *
 * @param {Object} user - user object with name, id, time, date, month, year, and if user is new to server
 */
function userConnected(user) {
  logUser(user);
}

/**
 * callback for when a player leaves server
 *
 * @param {Object} user - user object with name, id, time, date, month, year, and if user is new to server
 */
function userDisconnected(user) {

}

/**
 * callback for when a round / map has ended
 */
function mapEnd() {
  appData.reset();
  appData.cacheDemos();
  parseLogs().then(seconds => {
    print(`Log parser complete in ` + `${seconds} seconds`.cyan);
  }).catch(errorHandler);
}

/**
 * callback for when a round / map has started
 */
function mapStart(logId) {

}

/**
 * print out player name when a known ip views page
 *
 * @param {String} ip - ip addres of the user
 * @param {String} message - message string
 */
function who(req, message) {
  print(`${appData.who(req.ip).grey} ${message}`);
}

/**
 * grabs stats object from json file for a given month
 *
 * @param {Number} month - number of the month 0 - 11
 */
function getOldStatsList(month) {
  return new Promise((resolve, reject) => {
    fs.readdir(path.join(__dirname, 'old-top'), (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      if (!month) {
        resolve(files);
        return;
      }
      month = Number(month);
      for (var i = 0; i < files.length; i++) {
        var date = path.basename(files[i], '.json');
        var fileMonth = new Date(Number(date)).getMonth();
        if (fileMonth === month) {
          var data = require(`${__dirname}/old-top/${files[i]}`);
          resolve(data);
        }
      }
      reject();
    });
  });
}

/**
 * parse folder of logs 1 line @ a time.
 */
function parseLogs() {
  return new Promise((resolve, reject) => {
    print(`Running log parser`);
    var t = new Timer();
    fs.readdir(logFolder, (err, files) => {
      if (err) {
        reject(`Unable to scan directory: ` + err);
        return ;
      }
      totalFiles = files.length;
      files.forEach(file => {
        try {
          const rl = readline.createInterface({
            input: fs.createReadStream(path.join(logFolder, file)),
            crlfDelay: Infinity
          });
          rl.on('line', line => {
            scanner(line, appData, userConnected, userDisconnected, mapStart, mapEnd, false);
          });
          rl.on('close', _ => {
            totalFiles--;
            if (totalFiles === 0) {
              resolve(t.end()[2]);
            }
          });
        } catch (e) {
          reject(e);
        }
      });
    });
  });
}

function fourohfour(req, res) {
  var reqadd = {
    protocol: req.protocol,
    host:req.get('host'),
    pathname:req.originalUrl
  };
  who(req, `requested ` + `${url.format(reqadd)}`.green + ` got ` + `error 404! ╭∩╮(︶︿︶)╭∩╮`.red);
  res.status(404).sendFile(path.join(__dirname, 'html', '404.html'));
}

/**
 * cleanup files on first @ 5:00am
 */
var j = schedule.scheduleJob('0 5 1 * *', appData.runCleanup);

app.use(compression());
app.set('trust proxy', true);
app.disable('x-powered-by');

/**
 * route for WebSocket
 */
app.ws('/', ws => {
  socket = ws;
  socket.send('');
});

/**
 * authorize stream upload
 *
 * @param {String} req.query.name - the name of the stream
 * @param {String} req.query.k - the streams auth key
 */
app.get('/auth', (req, res) => {
  var t = new Timer();
  who(req, `is requesting stream authorization`);
  var name = req.query.name;
  appData.authorize(name, req.query.k).then(authorized => {
    if (!authorized) {
      who(req, `failed to authorize for streaming as streamid ${name.grey} ` + `${t.end()[2]} seconds`.cyan + ` response time`);
      return res.status(404).send('fail');
    }
    who(req, `was successfully authorized for streaming as streamid ${name.grey} ` + `${t.end()[2]} seconds`.cyan + ` response time`);
    res.send('ok');
  }).catch(errorHandler);
});

/**
 * route for gettings player stats
 */
app.get('/stats', (req, res) => {
  var t = new Timer();
  res.send([
    appData.generateTop(),
    appData.generateWeapons(),
    appData.totalPlayers,
    appData.generateBannedPlayerList(),
    new Date().getTime()
  ]);
  who(req, `is viewing ` + '/stats'.green + ` data ` + `${t.end()[2]} seconds`.cyan + ` response time`);
});

/**
 * route for getting a list of svaliable old months data
 */
app.get('/old-months', (req, res) => {
  var t = new Timer();
  getOldStatsList().then(stats => {
    who(req, `is viewing ` + '/old-months'.green + ' data' + ` ${t.end()[2]} seconds`.cyan + ` response time`);
    res.send(stats);
  }).catch(e => {
    fourohfour(req, res);
  });
});

/**
 * route for getting a old months stats data
 */
app.get('/old-stats/:month', (req, res) => {
  var t = new Timer();
  getOldStatsList(req.params.month).then(stats => {
    who(req, `is viewing ` + '/old-stats'.green + ' data for ' + `${monthName(req.params.month).yellow}` + ` ${t.end()[2]} seconds`.cyan + ` response time`);
    res.send(stats);
  }).catch(e => {
    fourohfour(req, res);
  });
});

/**
 * route for getting app players who has played in server
 */
app.get('/playerList', (req, res) => {
  var t = new Timer();
  var arr = [];
  for (var id in appData.users) {
    arr.push({
      name: appData.users[id].name,
      id: appData.users[id].id
    });
  }
  res.send(arr);
  who(req, `is viewing ` + '/playersList'.green + ` data of ` + `${arr.length} players `.grey + `${t.end()[2]} seconds`.cyan + ` response time`);
});

/**
 * return array of new users
 *
 * @param {Number} req.params.date - date of this month you want to view user for 0 = today
 */
app.get('/newPlayers/:date', (req, res) => {
  var t = new Timer();
  var date = req.params.date;
  appData.getNewUsers(date).then(users => {
    if (date === '0') {
      date = new Date().getDate();
    }
    who(req, `is viewing ` + `/newPlayers/${date}`.green + ` data on ` + `${monthName(new Date().getMonth())} ${suffix(date)} `.yellow + `${users.length} new players`.grey + ` ${t.end()[2]} seconds`.cyan + ` response time`);
    res.send(users);
  });
});

/**
 * return array of return users
 *
 * @param {Number} req.params.date - date of this month you want to view user for 0 = today
 */
app.get('/returnPlayers/:date', (req, res) => {
  var t = new Timer();
  var date = req.params.date;
  appData.getReturnUsers(date).then(users => {
    if (date === '0') {
      date = new Date().getDate();
    }
    who(req, `is viewing ` + `/returnPlayers/${date}`.green + ` data on ` + `${monthName(new Date().getMonth())} ${suffix(date)} `.yellow + `${users.length} new players`.grey + ` ${t.end()[2]} seconds`.cyan + ` response time`);
    res.send(users);
  });
});

/**
 * route for gettings a individual players stats
 */
app.get('/playerStats/:id', (req, res) => {
  var t = new Timer();
  var id = req.params.id;
  var player = appData.generatePlayerStats(id);
  if (typeof player !== 'object') {
    fourohfour(req, res);
    return;
  }
  who(req, `is viewing ` + `/playerStats/${id}`.green + ` data for player ` + `${player.name}`.grey + ` ${t.end()[2]} seconds`.cyan + ` response time`);
  res.send(player);
});

/**
 * route for downloading current months demo file
 */
app.get('/download/:file', (req, res) => {
  var t = new Timer();
  var dl = path.join(config.gameServerDir, req.params.file);
  if (!fs.existsSync(dl)){
    fourohfour(req, res);
    return;
  }
  who(req, `qued download for file ${dl.green} ` + `${t.end()[2]} seconds`.cyan + ` response time`);
  res.download(dl, req.params.file);
});

/**
 * route for downloading a previous months logs zip files
 */
app.get('/download/logs-zip/:file', (req, res) => {
  var t = new Timer();
  var dl = path.join(config.bulkStorage, 'logs', req.params.file);
  if (!fs.existsSync(dl)){
    fourohfour(req, res);
    return;
  }
  who(req, `qued download for file ${dl.green} ` + `${t.end()[2]} seconds`.cyan + ` response time`);
  res.download(dl, req.params.file);
});

/**
 * route for downloading a previous months demo zip files
 */
app.get('/download/demos-zip/:file', (req, res) => {
  var t = new Timer();
  var dl = path.join(config.bulkStorage, 'demos', req.params.file);
  if (!fs.existsSync(dl)){
    fourohfour(req, res);
    return;
  }
  who(req, `qued download for file ${dl.green} ` + `${t.end()[2]} seconds`.cyan + ` response time`);
  res.download(dl, req.params.file);
});

/**
 * route to get list of demo recording on the server
 */
app.get('/demos', (req, res) => {
  var t = new Timer();
  res.send(appData.demos);
  who(req, `is viewing ` + '/demos'.green + ` data ` + `${t.end()[2]} seconds`.cyan + ` response time`);
});

/**
 * route to get list of hl2dm server cvar's
 */
app.get('/cvarlist', (req, res) => {
  var t = new Timer();
  if (!fs.existsSync(`${__dirname}/cvarlist.txt`)){
    fourohfour(req, res);
    return;
  }
  res.sendFile(`${__dirname}/cvarlist.txt`);
  who(req, `is viewing ` + '/cvarlist'.green + ` data ` + `${t.end()[2]} seconds`.cyan + ` response time`);
});

/**
 * 404
 */
app.get('*', fourohfour);

/**
 * Go Live!!
 */
var server = app.listen(config.port, _ => {
  console.log('Endpoints active on port: ' + `${config.port}`.red)
  console.log('');
  print('Online.')
  parseLogs().then(seconds => {
    print(`Log parser complete in ` + `${seconds} seconds`.cyan);
  }).catch(errorHandler);
});

process.on('SIGTERM', _ => {
  server.close(_ => {
    console.log('Process terminated');
  });
});


/**
 * recieved log line / lines from server
 */
receiver.on("data", data => {
	if (data.isValid) {
    scanner(data.message, appData, userConnected, userDisconnected, mapStart, mapEnd, true);
	}
});
