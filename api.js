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
 * @requires pug
 */
const scanner = require('./modules/lineScanner/lineScanner.js');
const Datamodel = require('./modules/data-model/data-model.js');
const print = require('./modules/printer/printer.js');
const Timer = require('./modules/Timer/Timer.js');
const monthName = require('./modules/month-name/month-name.js');
const gameServerStatus = require('./modules/gameServerStatus/gameServerStatus.js');
const mongoConnect = require('./modules/mongo-connect/mongo-connect.js');
const init = require('./modules/init/init.js');
const suffix = require('./modules/suffix.js');
const fs = require('fs');  
const pug = require('pug');
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
const config = require('./modules/loadConfig/loadConfig.js')();
const RconStats = require('./modules/RconStats/rcon.js');
const logFolder = path.join(config.gameServerDir, 'logs');
let receiver = new logReceiver.LogReceiver();
let appData = new Datamodel();
let db;
let socket;
let dashboard;

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
  console.error(`${new Date().toLocaleString().yellow} - ${e}`);
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
  u.new = appData.playerConnect(u.time, u.id, u.name, u.ip);
  if (u.loggingEnabled) print(`${u.name.grey} connected with IP address: ${u.ip.grey}`);
  let n = '';
  if (u.new) n += 'New User!!! '.red;
  u.date = new Date(u.time).getDate();
  u.month = new Date(u.time).getMonth();
  u.year = new Date(u.time).getFullYear();
  appData.logUser(db, u).then(user => {
    if (user && u.loggingEnabled) print(`${n}${user.name.grey} connection at ${new Date(user.time).toLocaleString().yellow} was logged into database`);
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
  if (u.loggingEnabled) {
    if (!isNaN(u.onlineFor)) {
      print(`${u.name.gray} disconnected: ${readableTime(u.onlineFor).cyan} online`);
    } else {
      print(`${u.name.gray} disconnected: ` + 'Unknown ammout of time'.cyan +  ` online`);
    }
  }
  appData.playerDisconnect(u.id);
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
function playerBan(id) {
  let player = appData.addBanned(id);
  appData.logBan(db, player).then(p => {
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
      print(`Log parser complete in ${seconds.cyan}`);
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
  print(`Current log file ` + `L${logId}.log`.green);
  let now = new Date();
  let y = now.getFullYear();
  let m = now.getMonth() + 1;
  if (m < 10) m = `0${m}`;
  let d = now.getDate();
  if (d < 10) d = `0${d}`;
  let h = now.getHours();
  if (h < 10) h = `0${h}`;
  let min = now.getMinutes();
  if (min < 10) min = `0${min}`;
  // console.log("appData.playersPlayed: ", appData.playersPlayed);
  // console.log("appData.demoName: ", appData.demoName.green);
  // console.log("fs.existsSync(appData.demoName): ", fs.existsSync(appData.demoName));
  // console.log("Will delete file?: ", !appData.playersPlayed && appData.demoName && fs.existsSync(appData.demoName));
  if (!appData.playersPlayed && appData.demoName && fs.existsSync(appData.demoName)) {
    fs.unlinkSync(appData.demoName);
    print(`${appData.demoName.green} deleted. Inactive map.`);
  } else if (appData.demoName && !fs.existsSync(appData.demoName)) {
    print(`${appData.demoName.green} does not match a demo filename`);
  }
  appData.demoName = path.join(config.gameServerDir, `auto-${y}${m}${d}-${h}${min}-dm_bellas_room_d1.dem`);
  appData.playersPlayed = false;
}

/**
 * callback server statistics
 * @callback
 * 
 * @example <caption>Example usage of rconStats() function.</caption>
 * new RconStats('127.0.0.1', 'supersecurepassword', rconStats).ping();
 */
function rconStats(stats) {
  // console.log(stats);
  appData.rconStats = stats;
  if (dashboard) dashboard.send(JSON.stringify(stats), e => {});
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
function getOldStatsList(month, year) {
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
      year = Number(year);
      for (let i = 0; i < files.length; i++) {
        let date = Number(path.basename(files[i], '.json'));
        let fileMonth = new Date(date).getMonth();
        let fileYear = new Date(date).getFullYear();
        if (fileMonth === month && fileYear === year) {
          let data = require(path.join(__dirname, 'old-top', files[i]));
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
async function statsLoop() {
  setTimeout(statsLoop, 5000);
  try{
    let status = await gameServerStatus();
    appData.updateStatus(status);
    if (socket) {
      socket.send(JSON.stringify(status), e => {});
    }
  } catch(e) {
    serverStatus = 'offline';
  }
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
    let t = new Timer();
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
          rl.on('line', line => scanner(
            line, 
            appData.addKill.bind(appData), 
            appData.addChat.bind(appData), 
            appData.addSuicide.bind(appData), 
            appData.addHeadshot.bind(appData),
            appData.addWeaponStats.bind(appData),
            appData.addWeaponStats2.bind(appData),
            userConnected, 
            userDisconnected, 
            mapStart, 
            mapEnd, 
            playerBan, 
            false
          ));
          rl.on('close', _ => {
            totalFiles--;
            if (totalFiles === 0) {
              resolve(t.endString());
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
 * convert milliseconds to readable time string
 * @param {Number} ms time in milliseconds
 * 
 * @returns {String} readable time string
 * 
 * @example <caption>Example usage of readableTime() function.</caption>
 * let string = readableTime(67541983);
 */
function readableTime(ms) {
  let line = '';
  let seconds = ms / 1000;
  let days = Math.floor(seconds / 86400);
  seconds = seconds % 86400;
  let hours = Math.floor(seconds / 3600);
  seconds = seconds % 3600;
  let minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  if (days) line += `${days} days `;
  if (hours) line += `${hours} hours `;
  if (minutes) line += `${minutes} minutes `;
  line += `${seconds.toFixed(3)} seconds`;
  return line;
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
  let reqadd = {
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
  let reqadd = {
    protocol: req.protocol,
    host:req.get('host'),
    pathname:req.originalUrl
  };
  who(req, `requested ` + `${url.format(reqadd)}`.green + ` got ` + `error 500! (╬ Ò﹏Ó)`.red);
  res.status(500).sendFile(path.join(__dirname, 'assets', '500.html'));
}

schedule.scheduleJob('0 5 1 * *', _ => {
  appData.runCleanup(false).then(appData.reset.bind(appData));
});

app.use(compression());
app.set('trust proxy', true);
app.disable('x-powered-by');

app.use(express.static('admin-assets', { maxAge: ((1000 * 60) * 60) * 24 }));

/**
 * redirect to admin
 * @function
 * @name /
 * 
 * @returns {Void} redirect
 */
app.get('/', (req, res) => {
  res.redirect('admin');
  who(req, `is being redirected to ` + '/admin'.green + ` portal`);
});

/**
 * route for WebSocket
 * @function
 * @name /
 * 
 * @returns {JSON} websocket pipeline
 * 
 * @example <caption>Example usage of / api endpoint.</caption>
 * let socket = new WebSocket('http://localhost:3000/);
 */
app.ws('/', ws => {
  socket = ws;
  socket.send(JSON.stringify(appData.getStatus()));
});

/**
 * route for gettings the status of the game server
 * @function
 * @name /status
 * 
 * @returns {JSON} game server rcon status response
 * 
 * @example <caption>Example usage of /status api endpoint.</caption>
 * fetch('http://localhost:3000/status').then(response => {
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
 * fetch('http://localhost:3000/auth?name=stream1&k=supersecurepassword').then(response => {
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
    let t = new Timer();
    who(req, `is requesting authorization`);
    let name = req.query.name;
    appData.authorize(db, name, req.query.k).then(authorized => {
      if (!authorized) {
        who(req, `failed to authorize as id ${name.grey} ` + `${t.endString()}`.cyan + ` response time`);
        return res.status(401).json({
          status: 401,
          authorized: authorized
        });
      }
      who(req, `was successfully authorized as id ${name.grey} ` + `${t.endString()}`.cyan + ` response time`);
      res.status(200).json({
        status: 200,
        authorized: authorized
      });
    }).catch(e => {
      who(req, `failed to authorize: ${e.message} ` + `${t.endString()}`.cyan + ` response time`);
      return res.status(401).json({
        status: 401,
        authorized: false
      });
    });
  } catch (err) {
    fiveHundred(req, res);
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
 * fetch('http://localhost:3000/stats').then(response => {
 *   response.json().then(json => {
 *     console.log(json); // player statistics
 *   });
 * });
 */
app.get('/stats', (req, res) => {
  let t = new Timer();
  res.send([
    appData.generateTop(),
    appData.generateWeapons(),
    appData.totalPlayers,
    appData.generateBannedPlayerList(),
    new Date().getTime()
  ]);
  who(req, `is viewing ` + '/stats'.green + ` data ` + `${t.endString()}`.cyan + ` response time`);
});

/**
 * route for getting a list of avaliable data for prevoius months
 * @function
 * @name /old-months
 * 
 * @returns {JSON | HTML} list of months with stats history | 500
 * 
 * @example <caption>Example usage of /old-months api endpoint.</caption>
 * fetch('http://localhost:3000/old-months').then(response => {
 *   response.json().then(json => {
 *     console.log(json); // list of previous months that have player statistics
 *   });
 * }); 
 */
app.get('/old-months', (req, res) => {
  let t = new Timer();
  getOldStatsList().then(stats => {
    who(req, `is viewing ` + '/old-months'.green + ' data' + ` ${t.endString()}`.cyan + ` response time`);
    res.send(stats);
  }).catch(e => {
    fiveHundred(req, res);
  });
});

/**
 * route for getting a old months stats data
 * @function
 * @name /old-stats/:month/:year
 * @param {Number} req.query.month - index number of the months data
 * @param {Number} req.params.year - year
 * 
 * @returns {JSON | HTML} statistics from a previous month | 500
 * 
 * @example <caption>Example usage of /old-stats/:month api endpoint.</caption>
 * fetch('http://localhost:3000/old-stats/11/2020').then(response => {
 *   response.json().then(json => {
 *     console.log(json); // statistics for the month of December
 *   });
 * });
 */
app.get('/old-stats/:month/:year', (req, res) => {
  let t = new Timer();
  getOldStatsList(req.params.month, req.params.year).then(stats => {
    who(req, `is viewing ` + '/old-stats'.green + ' data for ' + `${monthName(req.params.month).yellow} ${req.params.year.yellow}` + ` ${t.endString()}`.cyan + ` response time`);
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
 * fetch('http://localhost:3000/playerList').then(response => {
 *   response.json().then(json => {
 *     console.log(json); // list of plyaers that have joined the server
 *   });
 * });
 */
app.get('/playerList', (req, res) => {
  let t = new Timer();
  let arr = [];
  Object.keys(appData.users).map(id => {
    let country = 'US';
    if (appData.users[id].geo) {
      country = appData.users[id].geo.country;
    }
    arr.push({
      name: appData.users[id].name,
      country: country,
      id: appData.users[id].id
    });
  });
  res.send(arr);
  who(req, `is viewing ` + '/playersList'.green + ` data of ` + `${arr.length} players `.grey + `${t.endString()}`.cyan + ` response time`);
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
 * fetch('http://localhost:3000/newPlayer/1').then(response => {
 *   response.json().then(json => {
 *     console.log(json); // list of players that played in the server for the first time on the first of the month
 *   });
 * });
 */
app.get('/newPlayers/:date', oneOf([
  check('date').escape()
]), async (req, res) => {
  let t = new Timer();
  let date = req.params.date;
  try {
    let users = await appData.getNewUsers(db, date);
    if (date === '0') {
      date = new Date().getDate();
    }
    who(req, `is viewing ` + `/newPlayers/${date}`.green + ` data on ` + `${monthName(new Date().getMonth())} ${suffix(date)} `.yellow + `${users.length} new players`.grey + ` ${t.endString()}`.cyan + ` response time`);
    res.send(users);
  } catch(e) {
    fiveHundred(req, res);
  }
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
 * fetch('http://localhost:3000/returnPlayer/1').then(response => {
 *   response.json().then(json => {
 *     console.log(json); // list of returning players that played in the server on the first of the month
 *   });
 * });
 */
app.get('/returnPlayers/:date', async (req, res) => {
  let t = new Timer();
  let date = req.params.date;
  try {
    let users = await appData.getReturnUsers(db, date);
    if (date === '0') {
      date = new Date().getDate();
    }
    who(req, `is viewing ` + `/returnPlayers/${date}`.green + ` data for ` + `${monthName(new Date().getMonth())} ${suffix(date)} `.yellow + `${users.length} players`.grey + ` ${t.endString()}`.cyan + ` response time`);
    res.send(users);
  } catch(e) {
    fiveHundred(req, res);
  }
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
 * fetch('http://localhost:3000/playerStats/1025678454').then(response => {
 *   response.json().then(json => {
 *     console.log(json); // player statistics for player with the id 1025678454
 *   });
 * });
 */
app.get('/playerStats/:id', (req, res) => {
  let t = new Timer();
  let id = req.params.id;
  let player = appData.generatePlayerStats(id);
  if (typeof player !== 'object') {
    fourohfour(req, res);
    return;
  }
  who(req, `is viewing ` + `/playerStats/${id}`.green + ` data for player ` + `${player.name}`.grey + ` ${t.endString()}`.cyan + ` response time`);
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
  let t = new Timer();
  let dl = path.join(config.gameServerDir, req.params.file);
  if (!fs.existsSync(dl)){
    fourohfour(req, res);
    return;
  }
  who(req, `qued download for file ${dl.green} ` + `${t.endString()}`.cyan + ` response time`);
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
  let t = new Timer();
  let dl = path.join(config.bulkStorage, 'logs', req.params.file);
  if (!fs.existsSync(dl)){
    fourohfour(req, res);
    return;
  }
  who(req, `qued download for file ${dl.green} ` + `${t.endString()}`.cyan + ` response time`);
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
  let t = new Timer();
  let dl = path.join(config.bulkStorage, 'demos', req.params.file);
  if (!fs.existsSync(dl)){
    fourohfour(req, res);
    return;
  }
  who(req, `qued download for file ${dl.green} ` + `${t.endString()}`.cyan + ` response time`);
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
 * fetch('http://localhost:3000/demos').then(response => {
 *   response.json().then(json => {
 *     console.log(json); // list of demo files that can be downloaded
 *   });
 * });
 */
app.get('/demos', (req, res) => {
  let t = new Timer();
  res.send(appData.demos);
  who(req, `is viewing ` + '/demos'.green + ` data ` + `${t.endString()}`.cyan + ` response time`);
});

/**
 * route to get list of hl2dm server cvar's
 * @function
 * @name /cvarlist
 * 
 * @returns {Text} list of cvar commands 
 * 
 * @example <caption>Example usage of /cvarlist api endpoint.</caption>
 * fetch('http://localhost:3000/cvarlist').then(response => {
 *   response.text().then(text => {
 *     console.log(text); // list of srcds conosle commands
 *   });
 * });
 */
app.get('/cvarlist', (req, res) => {
  let t = new Timer();
  if (!fs.existsSync(`${__dirname}/assets/cvarlist.txt`)){
    fourohfour(req, res);
    return;
  }
  res.sendFile(`${__dirname}/assets/cvarlist.txt`);
  who(req, `is viewing ` + '/cvarlist'.green + ` data ` + `${t.endString()}`.cyan + ` response time`);
});

/**
 * tests the file cleanup function that runs every month on the first @ 5 am
 * @function
 * @name /testCleanup
 *
 * @returns {Text} test start confirmation string
 * 
 * @example <caption>Example usage of /testCleanup api endpoint.</caption>
 * fetch('http://localhost:3000/testCleanup').then(response => {
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
 * stats dashboard websocket
 * @function
 * @name /dashboard
 * 
 * @returns {JSON} RCON stats
 */
app.ws('/dashboard', ws => {
  dashboard = ws;
  ws.send(appData.rconStats);
});

/**
 * admin portal
 * @function
 * @name /admin
 * 
 * @returns {HTML} admin page
 */
app.get('/admin', (req, res) => {
  let t = new Timer();
  res.send(pug.renderFile('./admin-assets/template.pug', {
    title: 'Lo-g Hoedown Admin'
  }));
  who(req, `is viewing ` + '/admin'.green + ` data ` + `${t.endString()}`.cyan + ` response time`);
});

app.get('*', fourohfour);

init(logFolder);

app.listen(config.port, _ => mongoConnect().then(database => {
  db = database;
  console.log(`MongoDB connected. URL: ${config.dbURL.green}`);
  console.log('Endpoints active on port: ' + `${config.port}`.red);
  console.log('');
  print('Online. ' + 'o( ❛ᴗ❛ )o'.red);
  statsLoop();
  new RconStats(config.gameServerHostname, process.env.RCONPW, rconStats);
  appData.cacheDemos();
  parseLogs().then(seconds => {
    print(`Log parser complete in ${seconds.cyan}`);
    receiver.on("data", data => {
      if (data.isValid) {
        scanner(
          data.message,
          appData.addKill.bind(appData), 
          appData.addChat.bind(appData), 
          appData.addSuicide.bind(appData), 
          appData.addHeadshot.bind(appData),
          appData.addWeaponStats.bind(appData),
          appData.addWeaponStats2.bind(appData),
          userConnected, 
          userDisconnected, 
          mapStart, 
          mapEnd, 
          playerBan, 
          true
        );
      }
    });
  }).catch(errorHandler);
}));
