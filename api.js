#!/usr/bin/env node
const path = require('path');                             // merger file / url names
const fs = require('fs');                                 // work with the file system
const readline = require('readline');                     // read file one line at a time
const schedule = require('node-schedule');                // cronjob type schecduler
const compression = require('compression');               // compress api responses
const express = require('express');                       // web api routing
const app = express();                                    // express init
const expressWs = require('express-ws')(app);             // WebSocket init
const colors = require('colors');                         // colorize text
var config = require(`./config.json`);                    // config file location

if (process.platform === "win32") {
  config = require(`./config-win.json`);  
}

const logFolder = path.join(config.gameServerDir, 'logs');// game server log location

// modules
const init = require(path.join(__dirname, 'modules', 'init.js'));
const Timer = require(path.join(__dirname, 'modules', 'Timer.js'));
const authorize = require(path.join(__dirname, 'modules', 'auth.js'));
const getServerStatus = require(path.join(__dirname, 'modules', 'gameServerStatus.js'));
const cleanUp = require(path.join(__dirname, 'modules', 'fileCleanup.js'));
const isWeapon = require(path.join(__dirname, 'modules', 'weaponsCheck.js'));
const print = require(path.join(__dirname, 'modules', 'printer.js'));
const ioError = require(path.join(__dirname, 'modules', 'ioerror.js'));
const scanLine = require(path.join(__dirname, 'modules', 'lineScanner.js'));

init();                                                    // ascii text /cheer

print('Configure Express');
app.use(compression());
app.set('trust proxy', true);
app.disable('x-powered-by');

print(`Setup storage Variables`);

var users = {};              // all users go in this object ie. {steamid: {name:playername, kills: 1934, deaths: 1689, kdr: 1.14, .....}, steamid: {..}, ..}
var bannedPlayers = {};      // banned bitches
var totalFiles = 0;          // total # of log files in "logs" folder
var top = [];                // players with over 100 kills sorted by KDR
var weapons = {};            // server wide weapon stats
var serverStatus;            // placeholder for gamedig state data
var totalPlayers = 0;        // count of total players to have joined the server
var lastUpdate;              // last time the stats were updated. time in ms
var demoList = [];           // list of all the demo files avaliable for download
var updated = false;         // if stats have been updated when a player reaches end of game kill count

var socket;



print(`Load Functions`);

Object.size = obj => {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

function mergePhysicsKills(user) {
  // merge physics kills
  if (!user.physics) {
    user.physics = {
      kills: 0
    };
  }
  if (!user.physbox) {
    user.physbox = {
      kills: 0
    };
  }
  if (!user.world) {
    user.world = {
      kills: 0
    };
  }
  user.physics.kills = (user.physics.kills + user.physbox.kills) + user.world.kills;
  delete user.physbox;
  delete user.world;
  if (user.physics.kills === 0) {
    delete user.physics
  }
}

/**
 * stores top data in memory for fast response times
 * cleans up un nessacery entrys and merges physics kills,
 * sorts weapons into array and out of the main object
 */
function cacheTopResponse() {
  return new Promise((resolve, reject) => {


    print(`Clearing cache & parsing logs`);
    // reset objects
    users = {};
    weapons = {};
    bannedPlayers = {};


    var time = new Timer();
    parseLogs().then(stats => {
      top = stats;

      // weapons stats
      mergePhysicsKills(weapons);
      weapons = sortWeapons(weapons);

      // players stats
      for (var i = 0; i < top.length; i++) {
        mergePhysicsKills(top[i]);
        delete top[i].updated;
        top[i].weapons = sortWeapons(top[i]);
      }
      
      // banned players stats
      var arr = [];
      for (var player in bannedPlayers) {
        mergePhysicsKills(bannedPlayers[player]);
        if (!bannedPlayers[player].weapons) {
          bannedPlayers[player].weapons = sortWeapons(bannedPlayers[player]);
        }
        arr.push(bannedPlayers[player]);
      }
      bannedPlayers = arr;

      setTimeout(_ => {
        updated = false;
      }, 60000);
      print(`Logs parsed & cached. ${time.endString()} to process`);
      lastUpdate = new Date().getTime();
      print(`Next stats update will be ${new Date(lastUpdate + (config.logRefreshTime * 1000) * 60).toLocaleString().cyan}`)
      resolve();
    }).catch(reject);
  });
}

/**
 * get list of log files and send to scanner line by line
 */
function parseLogs() {
  return new Promise((resolve, reject) => {
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
          var lNum = 0;
          rl.on('line', line => {
            lNum++;
            scanLine(line, users, weapons, bannedPlayers, lNum, totalFiles);
          });
          rl.on('close', _ => {
            totalFiles--;
            lNum = 0;
            if (totalFiles === 0) {
              resolve(sortUsersByKDR());
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
 * returns % value
 *
 * @param {Number} small - small #
 * @param {Number} big - big #
 */
function calculatePrecent(small, big) {
  return Math.round((small / big) * 100);
}

/**
 * calculates weapon stats values ie shots per kill, average damage per hit, headshot %, and more
 *
 * @param {String} weaponName - name of the weapon
 * @param {String} weapon - stats associated with the named weapon
 */
function calculateWeaponStats(weaponsName, weapon) {
  var shots = weapon.shots || 0;
  var acc = calculatePrecent(weapon.hits, weapon.shots) || 0;
  var hs = calculatePrecent(weapon.headshots, weapon.shots) || 0;
  var shotsToKill = Math.floor(weapon.shots / weapon.kills) || 0;
  var damage = weapon.damage || 0;
  var adpk = Math.floor(weapon.damage / weapon.kills) || 0;
  var adph = Math.floor(weapon.damage / weapon.hits) || 0;
  var hss = weapon.hss || 0;
  var lss = weapon.lss || 0;
  return [
    weaponsName,
    weapon.kills,
    [
      shots,
      acc,
      hs,
      shotsToKill,
      damage,
      adpk,
      adph,
      hss,
      lss
    ]
  ];
}

/**
 * remove weapon specific data from user object and place it in it's own array
 *
 * @param {Object} user - a user object we need to construct a weapn data array
 */
function sortWeapons(user) {
  var sortArr = [];
  for (var weapon in user) {
    if (isWeapon(weapon)) {
      if (user[weapon].kills !== 0) {
        sortArr.push(calculateWeaponStats(weapon, user[weapon]));
      }
      delete user[weapon];
    }
  }
  // sort array by kill count
  sortArr.sort((a, b) => {
    return a[1] - b[1];
  });
  // reverse array cause i still can't javascript
  sortArr.reverse();
  return sortArr;
}

/**
 * sort users highest to lowest KDR
 */
function sortUsersByKDR() {
  var arr = [];
  totalPlayers = Object.size(users);   // total # of players to has joined the server
  for (var user in users) {
    // push non banned players with over 100 kills to top Array
    if (users[user].kills >= 100 && !users[user].banned) {
      arr.push(users[user]);
    }
  }
  // do the actual sorting
  arr.sort((a,b) => {
    return a.kdr - b.kdr;
  });
  // rever array cause i don't know how to javascript.
  arr.reverse();
  return arr;
}

/**
 * returns array of demo files from game server dir
 */
function getDemos() {
  return new Promise((resolve, reject) => {
    var demos = [];
    fs.readdir(config.gameServerDir, (err, files) => {
      if (err) {
        reject('Unable to scan directory', err);
      }
      for (var i = 0; i < files.length; i++) {
        if (path.extname(files[i]) === '.dem') {
          demos.push(files[i]);
        }
      }
      resolve(demos);
    });
  });
}

/**
 * returns created date of a file
 *
 * @param {String} file - path to the file
 */
function createdDate(file) {
  const stats = fs.statSync(file)
  return stats.mtime
}

/**
 * returns file size in bytes
 *
 * @param {String} filename - file path
 */
function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename)
  var fileSizeInBytes = stats["size"]
  return fileSizeInBytes
}

/**
 * makes bytes readable
 *
 * @param {Number} bytes - file size yay
 */
function bytesToSize(bytes) {
   var sizes = [
     'Bytes',
     'KB',
     'MB',
     'GB',
     'TB'
   ];
   if (bytes === 0) {
     return '0 Byte';
   }
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return `${Math.round(bytes / Math.pow(1024, i), 2)} ${sizes[i]}`;
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
        ioError('Unable to scan directory', err);
        return;
      }
      if (!month) {
        return resolve(files);
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
 * returns month name in string form
 *
 * @param {Number} month - month number 0 - 11
 */
function monthName(month) {
  if (typeof month !== 'number') {
    month = Number(month)
  }
  switch (month) {
    case 0:
      return 'January';
      break;
    case 1:
      return 'Febuary';
      break;
    case 2:
      return 'March';
      break;
    case 3:
      return 'April';
      break;
    case 4:
      return 'May';
      break;
    case 5:
      return 'June';
      break;
    case 6:
      return 'July';
      break;
    case 7:
      return 'August';
      break;
    case 8:
      return 'September';
      break;
    case 9:
      return 'October';
      break;
    case 10:
      return 'November';
      break;
    case 11:
      return 'December';
      break;

  }
}

/**
 * print out player name when a known ip views page
 *
 * @param {String} ip - ip addres of the user
 * @param {String} message - message string
 */
function who(req, message) {
  var i = req.ip;
  for (var id in users)  {
    if (users[id].ip === i) {
      i = users[id].name;
    }
  }
  if (i === '::1') i = 'LAN User';
  print(`${i.grey} ${message}`);
}

/**
 * caches list of avaliable demo files
 */
function cacheDemos() {
  var t = new Timer();
  var arr = [];
  getDemos().then(demos => {
   for (var i = 0; i < demos.length; i++) {
     if (i !== demos.length - 1) {
       var filepath = path.join(config.gameServerDir, demos[i])
       arr.push([
         demos[i],
         bytesToSize(getFilesizeInBytes(filepath)),
         createdDate(filepath)
       ]);
     }
   }
   arr.reverse();
   demoList = arr;
   print(`demo file list cached ${t.endString()} to complete`);
 }).catch(ioError);
}

/**
 * runs when player reaches fragLimit
 */
function roundEnd() {
  updated = true;
  cacheTopResponse().then(cacheDemos);
}

/**
 * caches list of avaliable demo files
 */
function statsLoop() {
  setTimeout(statsLoop, 5000);
  getServerStatus(roundEnd, updated).then(status => {
    serverStatus = status;
    if (socket) {
      socket.send(JSON.stringify(serverStatus), e => {});
    }
  }).catch(_ => {
    serverStatus = 'offline';
  });
}

// run again & again & again;
cacheTopResponse().then(cacheDemos).catch(ioError);
setInterval(_ => {
  cacheTopResponse().then(cacheDemos).catch(ioError);
}, (config.logRefreshTime * 1000) * 60);

statsLoop();

var j = schedule.scheduleJob('0 5 1 * *', _ => {
  cleanUp(top, weapons, totalPlayers, bannedPlayers, lastUpdate).catch(ioError);
});

print(`Loading API endpoints`);

/**
 * route for gettings player stats
 */
app.get('/stats', (req, res) => {
  var t = new Timer();
  res.send(JSON.stringify([
    top,
    weapons,
    totalPlayers,
    bannedPlayers,
    lastUpdate
  ]));
  who(req, `is viewing ` + '/stats'.green + ` data ` + `${t.end()[2]} seconds`.cyan + ` response time`);
});

/**
 * route for gettings a list of banned players
 */
app.get('/banned', (req, res) => {
  var t = new Timer();
  res.send(JSON.stringify(bannedPlayers));
  who(req, `is viewing ` + '/banned'.green + ` data ` + `${t.end()[2]} seconds`.cyan + ` response time`);
});

/**
 * route for gettings the status of the game server
 */
app.get('/status', (req, res) => {
  res.send(serverStatus);
});

/**
 * route for getting who has played in server
 */
app.get('/playersList', (req, res) => {
  var t = new Timer();
  var arr = [];
  for (var id in users) {
    arr.push(users[id].name);
  }
  res.send(arr);
  who(req, `is viewing ` + '/playersList'.green + ` data ` + `${t.end()[2]} seconds`.cyan + ` response time`);
});

/**
 * route for gettings a individual players stats
 */
app.get('/playerStats/:name', (req, res) => {
  var t = new Timer();
  var name = req.params.name;
  for (var id in users) {
    if (users[id].name === name) {
      var obj = {...users[id]};
      if (!obj.weapons) {
        obj.weapons = sortWeapons(obj);
      }
      who(req, `is viewing ` + '/playerStats'.green + ` data for ${name.grey} ` + `${t.end()[2]} seconds`.cyan + ` response time`);
      return res.send(JSON.stringify(obj));
    }
  }
  res.status(404).sendFile(path.join(__dirname, 'html', '404.html'));
});

/**
 * route for downloading current months demo file
 */
app.get('/download/:file', (req, res) => {
  var t = new Timer();
  var dl = path.join(config.gameServerDir, req.params.file);
  if (!fs.existsSync(dl)){
    res.status(404).sendFile(path.join(__dirname, 'html', '404.html'));
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
    res.status(404).sendFile(path.join(__dirname, 'html', '404.html'));
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
    res.status(404).sendFile(path.join(__dirname, 'html', '404.html'));
  }
  who(req, `qued download for file ${dl.green} ` + `${t.end()[2]} seconds`.cyan + ` response time`);
  res.download(dl, req.params.file);
});

/**
 * route for getting a list of svaliable old months data
 */
app.get('/old-months', (req, res) => {
  getOldStatsList().then(stats => {
    res.send(stats);
  }).catch(e => {
    res.status(404).sendFile(path.join(__dirname, 'html', '404.html'));
  });
});

/**
 * route for getting a old months stats data
 */
app.get('/old-stats/:month', (req, res) => {
  var t = new Timer();
  getOldStatsList(req.params.month).then(stats => {
    who(req, `is viewing ` + '/old-stats'.green + ` ${monthName(req.params.month).cyan} ` + 'data' + ` ${t.end()[2]} seconds`.cyan + ` response time`);
    res.send(stats);
  }).catch(e => {
    res.status(404).sendFile(path.join(__dirname, 'html', '404.html'));
  });
});

/**
 * route to get list of demo recording on the server
 */
app.get('/demos', (req, res) => {
  var t = new Timer();
  res.send(JSON.stringify(demoList));
  who(req, `is viewing ` + '/demos'.green + ` data ` + `${t.end()[2]} seconds`.cyan + ` response time`);
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
  authorize(name, req.query.k).then(authorized => {
    if (!authorized) {
      return res.status(404).send('fail');
    }
    who(req, `authorized for streaming as streamid ${name.grey} ` + `${t.end()[2]} seconds`.cyan + ` response time`);
    res.send('ok');
  }).catch(ioError);
});

/**
 * route for WebSocket
 */
app.ws('/', ws => {
  socket = ws;
  socket.send(JSON.stringify(serverStatus));
});

/**
 * 404
 */
app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'html', '404.html'));
});

app.listen(config.port);

print('API Version:' + `${require('./package.json').version}`.red + ' active on port: ' + `${config.port}`.red);
print(`log folder = ${logFolder.green}`);
