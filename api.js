#! /usr/bin/env node
/**
 * @requires fs
 * @requires readline
 * @requires compression
 * @requires express
 * @requires node-schedule
 * @requires path
 * @requires url
 * @requires srcds-log-receiver
 * @requires expresss-ws
 * @requires express-validator
 * @requires colors
 */

/** reads log one line at a time looking for game events */
const scanner = require('./modules/lineScanner.js');
/** data - this data has Class ;) */
const Datamodel = require('./modules/data-model/data-model.js');
/** logs a user connection to a mongodb session */
const logUser = require('./modules/logUser.js');
/** log line a to console with timestamp */
const print = require('./modules/printer.js');
/** time things */
const Timer = require('./modules/Timer/Timer.js');
/** switch statement for month name */
const monthName = require('./modules/month-name.js');
const gameServerStatus = require('./modules/gameServerStatus.js');
const mongoConnect = require('./modules/mongo-connect.js');
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
/** input validation */
const { check, oneOf, validationResult } = require('express-validator');
const colors = require('colors'); 
const config = require('./modules/loadConfig.js')();
const logFolder = path.join(config.gameServerDir, 'logs');


var db;
var socket;

init(logFolder);

/**
 *  application data model
 * 
 *  contains variables users, bannedUsers, totalPlayers, weapons, demos & playerTimer
 * 
 */
var appData = new Datamodel();

/**
 *  Recieve logs on UDP port# 9871
 */
var receiver = new logReceiver.LogReceiver();

/**
 *  throw a error message stopping app when something breaks
 * @param {Object} e - error object
 * @throws error message
 */
function errorHandler(e) {
  console.error(e);
}

/**
 * callback for when a player joins server
 *
 * @param {Object} u - user object with name, id, time, date, month, year, and if user is new to server
 */
function userConnected(u) {
  logUser(db, u).then(user => {
    if (user) print(`${user.name.grey} connection at ${new Date(user.time).toLocaleString().yellow} was logged into database`);
  }).catch(e => console.error(e.message));
}

/**
 * callback for when a player leaves server
 *
 * @param {Object} u - user object with name, id, time, date, month, year, and if user is new to server
 */
function userDisconnected(u) {
  //...
}

/**
 * callback for when a round / map has ended
 */
function mapEnd() {
  appData.reset().then(m => {
    print(m);
    appData.cacheDemos();
    parseLogs().then(seconds => {
      print(`Log parser complete in ` + `${seconds} seconds`.cyan);
    }).catch(errorHandler);
  });
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
 * 
 */
function statsLoop() {
  setTimeout(statsLoop, 5000);
  gameServerStatus().then(status => {
    appData.updateStatus(status);
    if (socket) {
      socket.send(JSON.stringify(status), e => {});
    }
  }).catch(e => {
    print(`Got offline status from server`);
    serverStatus = 'offline';
  });
}

/**
 * parse folder of logs 1 line @ a time. dumping each line into the scanner
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

/**
 * 404 page
 */
function fourohfour(req, res) {
  var reqadd = {
    protocol: req.protocol,
    host:req.get('host'),
    pathname:req.originalUrl
  };
  who(req, `requested ` + `${url.format(reqadd)}`.green + ` got ` + `error 404! ╭∩╮(︶︿︶)╭∩╮`.red);
  res.status(404).sendFile(path.join(__dirname, 'assets', '404.html'));
}

/**
 * cleanup files on first @ 5:00am
 */
schedule.scheduleJob('0 5 1 * *', appData.runCleanup);

app.use(compression());
app.set('trust proxy', true);
app.disable('x-powered-by');

/**
 * route for WebSocket
 * @function
 * @name api/
 * @returns {Array} websocket pipeline
 */
app.ws('/', ws => {
  socket = ws;
  socket.send(JSON.stringify(appData.getStatus()));
});

/**
 * route for gettings the status of the game server
 * @function
 * @name api/status
 * @returns {Object} game server rcon status response
 */
app.get('/status', (req, res) => {
  who(req, `is viewing ` + '/status'.green + ` data ` + `${t.end()[2]} seconds`.cyan + ` response time`);
  res.send(appData.getStatus());
});

/**
 * authorize stream for hoedowntv
 * @function
 * @name api/auth
 * @param {String} req.query.name - the name of the stream
 * @param {String} req.query.k - the streams auth key
 * 
 * @returns {String} ok: authorized, fail: failed to authorize
 */
app.get('/auth', oneOf([
  check('name').exists().escape().stripLow(),
  check('k').exists().escape().stripLow()
]), (req, res) => {
  try {
    validationResult(req).throw();
    var t = new Timer();
    who(req, `is requesting stream authorization`);
    var name = req.query.name;
    appData.authorize(db, name, req.query.k).then(authorized => {
      if (!authorized) {
        who(req, `failed to authorize for streaming as streamid ${name.grey} ` + `${t.end()[2]} seconds`.cyan + ` response time`);
        return res.status(401).json({
          status: 401,
          authorized: authorized
        });
      }
      who(req, `was successfully authorized for streaming as streamid ${name.grey} ` + `${t.end()[2]} seconds`.cyan + ` response time`);
      res.status(200).json({
        status: 200,
        authorized: authorized
      });
    }).catch(e => {
      who(req, `failed to authorize for streaming: ${e} ` + `${t.end()[2]} seconds`.cyan + ` response time`);
      return res.status(401).json({
        status: 401,
        authorized: false
      });
    });
  } catch (err) {
    fourohfour(req, res);
  }
});

/**
 * route for gettings player stats
 * @function
 * @name api/stats
 * @returns {Array} stats top players list, server wide weapons list, # of total players, list of banned players, time of generation
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
 * 
 * @returns {Array} list of months with stats history
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
 * 
 * @returns {Array} statistics from a previous month
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
 * 
 * @returns {Array} list of all players to join server
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
 * 
 * @returns {Array} list of players from the given date
 */
app.get('/newPlayers/:date', oneOf([
  check('date').escape()
]), (req, res) => {
  var t = new Timer();
  var date = req.params.date;
  appData.getNewUsers(db, date).then(users => {
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
 * 
 * @returns {Array} list of players from the given date
 */
app.get('/returnPlayers/:date', (req, res) => {
  var t = new Timer();
  var date = req.params.date;
  appData.getReturnUsers(db, date).then(users => {
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
  if (!fs.existsSync(`${__dirname}/assets/cvarlist.txt`)){
    fourohfour(req, res);
    return;
  }
  res.sendFile(`${__dirname}/assets/cvarlist.txt`);
  who(req, `is viewing ` + '/cvarlist'.green + ` data ` + `${t.end()[2]} seconds`.cyan + ` response time`);
});

/**
 * 404
 */
app.get('*', fourohfour);

/**
 * express server instance listening on config.port
 */
var server = app.listen(config.port, _ => mongoConnect().then(database => {
  db = database;
  console.log(`MongoDB connected. URL: ${config.dbURL.green}`);
  console.log('Endpoints active on port: ' + `${config.port}`.red)
  console.log('');
  print('Online. ' + 'ᕦ(ò_óˇ)ᕤ'.red);
  statsLoop();
  appData.cacheDemos();
  parseLogs().then(seconds => {
    print(`Log parser complete in ` + `${seconds} seconds`.cyan);

    /**
     * recieved log line / lines from server
     */
    receiver.on("data", data => {
      if (data.isValid) scanner(data.message, appData, userConnected, userDisconnected, mapStart, mapEnd, true);
    });
  }).catch(errorHandler);

}));

process.on('SIGTERM', _ => {
  // db.close();
  server.close(_ => {
    console.log('Process terminated');
  });
});




