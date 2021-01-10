#! /usr/bin/env node
/**
 * @fileOverview API backend for HL2DM game server stats. Reads log files generated by the server as well as rcon log port stream to generate player stats. 
 * @module api
 * @author Jimmy Doughten <https://github.com/dough10>
 * @exports api.js
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
const scanner = require('./modules/lineScanner/lineScanner.js');
const Datamodel = require('./modules/data-model/data-model.js');
const logUser = require('./modules/logUser.js');
const logBan = require('./modules/logBan');
const print = require('./modules/printer/printer.js');
const Timer = require('./modules/Timer/Timer.js');
const monthName = require('./modules/month-name/month-name.js');
const gameServerStatus = require('./modules/gameServerStatus/gameServerStatus.js');
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
const { check, oneOf, validationResult } = require('express-validator');
const colors = require('colors'); 
const config = require('./modules/loadConfig.js')();
const RconStats = require('./modules/RconStats/rcon.js');
const logFolder = path.join(config.gameServerDir, 'logs');
var receiver = new logReceiver.LogReceiver();
var appData = new Datamodel();
var db;
var socket;

/**
 * prints error message to console
 * @param {Object} e error object
 * 
 * @returns {Void} nothing
 * 
 * @example <caption>Example usage of errorHandler() function.</caption>
 * doStuff().then(doMoreStuff).catch(errorHandler);
 */
function errorHandler(e) {
  console.error(e.message.red);
}

/**
 * callback for when a player joins server
 * @async
 * @callback
 * 
 * @param {Object} u user object with name, id, time, date, month, year, and if user is new to server
 * 
 * @example <caption>Example usage of userConnected() function.</caption>
 * scanner(.., .., .., .., userConnected, .., ..);
 */
function userConnected(u) {
  logUser(db, u).then(user => {
    if (user) print(`${user.name.grey} connection at ${new Date(user.time).toLocaleString().yellow} was logged into database`);
  }).catch(e => console.error(e.message));
}

/**
 * callback for when a player leaves server
 * @callback 
 * 
 * @param {Object} u user object with name, id, time, date, month, year, and if user is new to server
 * 
 * @example <caption>Example usage of userDisconnected() function.</caption>
 * scanner(.., .., .., .., userDisconnected, .., ..);
 */
function userDisconnected(u) {
  //...
}

/**
 * callback for when a player is banned
 * @callback
 * @async
 * 
 * @param {Object} player user object of the banned player
 * 
 * @example <caption>Example usage of playerBan() function.</caption>
 * scanner(.., .., .., .., playerBan, .., ..);
 */
function playerBan(player) {
  logBan(db, player).then(p => {
    if (p && p.name) print(`${p.name.grey} was saved to ban database`);
  });
}

/**
 * callback for when a round / map has ended
 * @async
 * @callback
 * 
 * @example <caption>Example usage of mapEnd() function.</caption>
 * scanner(.., .., .., .., mapEnd, .., ..);
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
 * @callback
 * 
 * @example <caption>Example usage of mapStart() function.</caption>
 * scanner(.., .., .., .., mapStart, .., ..);
 */
function mapStart(logId) {

}

/**
 * callback server statistics
 * @callback
 * 
 * @example <caption>Example usage of rconStats() function.</caption>
 * new RconStats('127.0.0.1', 'supersecurepassword', rconStats).ping();
 */
function rconStats(stats) {
  appData.rconStats = stats;
  if (socket) socket.send(JSON.stringify(stats), e => {});
}

/**
 * prints out the players name when a known ip views a page or makes a request
 * @see modules <a href=modules/data-model/data-model-doc.md#module_data-model..Data+who>data-model-doc.md</a>
 *
 * @param {String} ip ip addres of the user viewing a page or making a request
 * @param {String} message the rest of the message
 * 
 * @returns {Void} nothing
 * 
 * @example <caption>Example usage of who() function.</caption>
 * who(req, 'is online');
 */
function who(req, message) {
  print(`${appData.who(req.ip).grey} ${message}`);
}

/**
 * grabs stats object from json file for a given month
 * @async
 *
 * @param {Number} month number of the month 0 - 11 **optional**
 * 
 * @returns {Promise<Array>} list of months. / players stats for the passed in month
 * 
 * @example <caption>Example usage of getOldStatsList() function.</caption>
 * getOldStatsList().then(months => {
 * // console.log(months); = [1609123414390.json]
 * });
 * getOldStatsList(11).then(month => {
 * // console.log(month); = [
 * //   [ over 100 kills sorted by KDR ],
 * //   [ weapon data ],
 * //   212, // player count
 * //   [ banned players ],
 * //   1609123414390 // time stats were generated
 * //]
 * });
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
          return resolve(data);
        }
      }
      reject();
    });
  });
}

/**
 * loops to get Gamedig data for game server
 * @async
 * @callback
 * @see <a href=modules/gameSeverStatus.js>gameSeverStatus.js</a>
 * @see <a href=modules/data-model/data-model-doc.md#dataupdatestatusstatus--void>data-model-doc.md</a>
 * 
 * @return {Void} nothing
 * 
 * @example <caption>Example usage of statsLoop() function.</caption>
 * statsLoop(); // it will run every 5 seconds after being called
 */
function statsLoop() {
  setTimeout(statsLoop, 5000);
  gameServerStatus().then(status => {
    appData.updateStatus(status);
    if (socket) {
      socket.send(JSON.stringify(status), e => {});
    }
  }).catch(e => {
    errorHandler(e);
    serverStatus = 'offline';
  });
}

/**
 * parse folder of logs 1 line @ a time. dumping each line into the scanner
 * @async
 * @see <a href=modules/lineScanner/lineScanner.js>lineScanner.js</a>
 * 
 * @returns {Promise<String>} duration for task to complete
 * 
 * @example <caption>Example usage of parseLogs() function.</caption>
 * parseLogs().then(seconds => {
 * //  print(`Log parser complete in ` + `${seconds} seconds`); = '12/28/2020, 9:28:55 PM - Log parser complete in 1.768 seconds'
 * });
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
            scanner(line, appData, userConnected, userDisconnected, mapStart, mapEnd, playerBan, false);
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
 * @param {Object} req express request object
 * @param {Object} res express response object
 * 
 * @returns {HTML} 404 
 * 
 * @example <caption>Example usage of fourohfour() function.</caption>
 * fourohfour(req, res);
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
 * 500 page
 * @param {Object} req express request object
 * @param {Object} res express response object
 * 
 * @returns {HTML} 500
 * 
 * @example <caption>Example usage of fiveHundred() function.</caption>
 * fiveHundred(req, res);
 */
function fiveHundred(req, res) {
  var reqadd = {
    protocol: req.protocol,
    host:req.get('host'),
    pathname:req.originalUrl
  };
  who(req, `requested ` + `${url.format(reqadd)}`.green + ` got ` + `error 500! (╬ Ò﹏Ó)`.red);
  res.status(500).sendFile(path.join(__dirname, 'assets', '500.html'));
}

schedule.scheduleJob('0 5 1 * *', _ => {
  appData.runCleanup(false).then(appData.reset);
});

app.use(compression());
app.set('trust proxy', true);
app.disable('x-powered-by');

/**
 * route for WebSocket
 * @function
 * @name /
 * 
 * @returns {JSON} websocket pipeline
 * 
 * @example <caption>Example usage of / api endpoint.</caption>
 * var socket = new WebSocket('localhost:3000/);
 */
app.ws('/', ws => {
  socket = ws;
  socket.send(JSON.stringify(appData.getStatus()));
  socket.send(JSON.stringify(appData.rconStats));
});

/**
 * route for gettings the status of the game server
 * @function
 * @name /status
 * 
 * @returns {JSON} game server rcon status response
 * 
 * @example <caption>Example usage of /status api endpoint.</caption>
 * fetch('localhost:3000/status').then(response => {
 *   response.json().then(json => {
 *     console.log(json); // game server status
 *   });
 * });
 */
app.get('/status', (req, res) => {
  res.send(appData.getStatus());
});

/**
 * login system
 * @function
 * @name /auth
 * 
 * @see <a href=modules/auth/auth-doc.md#module_modules/auth..auth>auth-doc.md</a>
 * 
 * @param {String} req.query.name - the name of the stream
 * @param {String} req.query.k - the streams auth key
 * 
 * @returns {JSON} ok: authorized, fail: failed to authorize
 * 
 * @example <caption>Example usage of /auth api endpoint.</caption>
 * fetch('localhost:3000/auth?name=stream1&k=supersecurepassword').then(response => {
 *   response.json().then(json => {
 *     console.log(json);  = {staus: 200 | 401, authorized: true | false}
 *   });
 * });
 * 
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
 * @name /stats
 * 
 * @returns {JSON} stats top players list, server wide weapons list, # of total players, list of banned players, time of generation
 * 
 * @example <caption>Example usage of /stats api endpoint.</caption>
 * fetch('localhost:3000/stats').then(response => {
 *   response.json().then(json => {
 *     console.log(json); // player statistics
 *   });
 * });
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
 * route for getting a list of avaliable data for prevoius months
 * @function
 * @name /old-months
 * 
 * @returns {JSON | HTML} list of months with stats history | 500
 * 
 * @example <caption>Example usage of /old-months api endpoint.</caption>
 * fetch('localhost:3000/old-months').then(response => {
 *   response.json().then(json => {
 *     console.log(json); // list of previous months that have player statistics
 *   });
 * }); 
 */
app.get('/old-months', (req, res) => {
  var t = new Timer();
  getOldStatsList().then(stats => {
    who(req, `is viewing ` + '/old-months'.green + ' data' + ` ${t.end()[2]} seconds`.cyan + ` response time`);
    res.send(stats);
  }).catch(e => {
    fiveHundred(req, res);
  });
});

/**
 * route for getting a old months stats data
 * @function
 * @name /old-stats/:month
 * @param {Number} req.query.month - index number of the months data
 * 
 * @returns {JSON | HTML} statistics from a previous month | 500
 * 
 * @example <caption>Example usage of /old-stats/:month api endpoint.</caption>
 * fetch('localhost:3000/old-stats/11').then(response => {
 *   response.json().then(json => {
 *     console.log(json); // statistics for the month of December
 *   });
 * });
 */
app.get('/old-stats/:month', (req, res) => {
  var t = new Timer();
  getOldStatsList(req.params.month).then(stats => {
    who(req, `is viewing ` + '/old-stats'.green + ' data for ' + `${monthName(req.params.month).yellow}` + ` ${t.end()[2]} seconds`.cyan + ` response time`);
    res.send(stats);
  }).catch(e => {
    fiveHundred(req, res);
  });
});

/**
 * route for getting list of all players who has played in server
 * @function
 * @name /playerList
 * 
 * @returns {JSON} list of all players to join server
 * 
 * @example <caption>Example usage of /playerList api endpoint.</caption>
 * fetch('localhost:3000/playerList').then(response => {
 *   response.json().then(json => {
 *     console.log(json); // list of plyaers that have joined the server
 *   });
 * });
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
 * @function
 * @name /newPlayers/:date
 * @param {Number} req.params.date - date of the month you want to view users for 0 = today
 * 
 * @returns {JSON} list of players from the given date
 * 
 * @example <caption>Example usage of /newPlayer/:date api endpoint.</caption>
 * fetch('localhost:3000/newPlayer/1').then(response => {
 *   response.json().then(json => {
 *     console.log(json); // list of players that played in the server for the first time on the first of the month
 *   });
 * });
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
  }).catch(e => {
    fiveHundred(req, res);
  });
});

/**
 * return array of return users
 * @function
 * @name /returnPlayer/:date
 * @param {Number} req.params.date - date of this month you want to view user for 0 = today
 * 
 * @returns {Array} list of players from the given date
 * 
 * @example <caption>Example usage of /returnPlayer/:date api endpoint.</caption>
 * fetch('localhost:3000/returnPlayer/1').then(response => {
 *   response.json().then(json => {
 *     console.log(json); // list of returning players that played in the server on the first of the month
 *   });
 * });
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
  }).catch(e => {
    fiveHundred(req, res);
  });
});

/**
 * route for gettings a individual players stats
 * @function
 * @name /playerStats/:id
 * @param {Number} req.params.id - steamid3 of the player
 * 
 * @returns {JSON | HTML} players stat data | 404 
 * 
 * @example <caption>Example usage of /playerStats/:id api endpoint.</caption>
 * fetch('localhost:3000/playerStats/1025678454').then(response => {
 *   response.json().then(json => {
 *     console.log(json); // player statistics for player with the id 1025678454
 *   });
 * });
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
 * route for downloading a demo file
 * @function
 * @name /download/:file
 * @param {String} file - file name requested for download
 * 
 * @returns {File | HTML} .dem file | 404
 * 
 * @example <caption>Example usage of /download/:file api endpoint.</caption>
 * <a href="localhost:3000/download/auto-20210101-0649-dm_bellas_room_d1.dem"></a>
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
 * @function
 * @name /download/logs-zip/:file
 * @param {String} file - filename requested for download
 * 
 * @returns {File | HTML}  .zip file | 404
 * 
 * @example <caption>Example usage of /download/logs-zip/:file api endpoint.</caption>
 * <a href="localhost:3000/download/logs-zip/1609123414390.zip"></a>
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
 * @function
 * @name /download/demos-zip/:file
 * @param {String} file - filename requested for download
 * 
 * @returns {File | HTML}  .zip file | 404
 * 
 * @example <caption>Example usage of /download/demos-zip/:file api endpoint.</caption>
 * <a href="localhost:3000/download/demos-zip/1609123414390.zip"></a>
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
 * @function
 * @name /demos
 * 
 * @returns {JSON} list of demo files
 * 
 * @example <caption>Example usage of /demos api endpoint.</caption>
 * fetch('localhost:3000/demos').then(response => {
 *   response.json().then(json => {
 *     console.log(json); // list of demo files that can be downloaded
 *   });
 * });
 */
app.get('/demos', (req, res) => {
  var t = new Timer();
  res.send(appData.demos);
  who(req, `is viewing ` + '/demos'.green + ` data ` + `${t.end()[2]} seconds`.cyan + ` response time`);
});

/**
 * route to get list of hl2dm server cvar's
 * @function
 * @name /cvarlist
 * 
 * @returns {Text} list of cvar commands 
 * 
 * @example <caption>Example usage of /cvarlist api endpoint.</caption>
 * fetch('localhost:3000/cvarlist').then(response => {
 *   response.text().then(text => {
 *     console.log(text); // list of srcds conosle commands
 *   });
 * });
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
 * tests the file cleanup function that runs every month on the first @ 5 am
 * @function
 * @name /testCleanup
 *
 * @returns {Text} test start confirmation string
 * 
 * @example <caption>Example usage of /testCleanup api endpoint.</caption>
 * fetch('localhost:3000/testCleanup').then(response => {
 *   response.text().then(text => {
 *     console.log(text); // 'cleanup test started'
 *   });
 * });
 */
app.get('/testCleanup', (req, res) => {
  res.send('cleanup test started');
  appData.runCleanup(true).catch(errorHandler);
});

/**
 * admin portal
 * @function
 * @name /dashboard
 * 
 * @returns {HTML} admin portal
 */
app.get('/dashboard', (req, res) => {
  res.send(appData.rconStats);
});

app.get('*', fourohfour);

init(logFolder);

var server = app.listen(config.port, _ => mongoConnect().then(database => {
  db = database;
  console.log(`MongoDB connected. URL: ${config.dbURL.green}`);
  console.log('Endpoints active on port: ' + `${config.port}`.red);
  console.log('');
  print('Online. ' + 'o( ❛ᴗ❛ )o'.red);
  statsLoop();
  new RconStats(config.gameServerHostname, process.env.RCONPW, rconStats);
  appData.cacheDemos();
  parseLogs().then(seconds => {
    print(`Log parser complete in ` + `${seconds} seconds`.cyan);
    receiver.on("data", data => {
      if (data.isValid) {
        scanner(data.message, appData, userConnected, userDisconnected, mapStart, mapEnd, playerBan, true);
      }
    });
  }).catch(errorHandler);
}));

process.on('SIGTERM', _ => {
  // db.close();
  server.close(_ => {
    console.log('Process terminated');
  });
});
