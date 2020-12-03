#!/usr/bin/env node
const path = require('path');                             // merger file / url names
const fs = require('fs');                                 // work with the file system
const readline = require('readline');                     // read file one line at a time
const schedule = require('node-schedule');                // cronjob type schecduler
const compression = require('compression');               // compress api responses
const express = require('express');                       // web api routing
const app = express();                                    // express init
var expressWs = require('express-ws')(app);               // WebSocket init
const colors = require('colors');                         // colorize text
const config = require(`${__dirname}/config.json`);       // config file location
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

/**
 * stores top data in memory for fast response times
 * cleans up un nessacery entrys and merges physics kills
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
      // merge physics kills
      if (!weapons.physics) {
        weapons.physics = {
          kills: 0
        };
      }
      if (!weapons.physbox) {
        weapons.physbox = {
          kills: 0
        };
      }
      if (!weapons.world) {
        weapons.world = {
          kills: 0
        };
      }
      weapons.physics.kills = (weapons.physics.kills + weapons.physbox.kills) + weapons.world.kills;
      delete weapons.physbox;
      delete weapons.world;
      if (weapons.physics && weapons.physics.kills === 0) {
        delete weapons.physics
      }
      // convert weapons object into sorted array by kill count array
      weapons = sortWeapons(weapons);
      for (var i = 0; i < top.length; i++) {
        // merge player physics kills
        if (!top[i].physics) {
          top[i].physics = {
            kills: 0
          };
        }
        if (!top[i].physbox) {
          top[i].physbox = {
            kills: 0
          };
        }
        if (!top[i].world) {
          top[i].world = {
            kills: 0
          };
        }
        top[i].physics.kills = (top[i].physics.kills + top[i].physbox.kills) + top[i].world.kills;
        delete top[i].physbox;
        delete top[i].world;
        delete top[i].updated;
        // remove weapons with 0 kills from object
        if (top[i].physics.kills === 0) {
          delete top[i].physics;
        }
        // extract weapons from player object and place in sorted by kill count array
        top[i].weapons = sortWeapons(top[i]);
      }
      // do weapon stats for banned players
      var arr = [];
      for (var player in bannedPlayers) {
        bannedPlayers[player].weapons = sortWeapons(bannedPlayers[player]);
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
    });
  });
}

/**
 * get list of log files and send to scanner line by line
 */
function parseLogs() {
  return new Promise((resolve, reject) => {
    fs.readdir(logFolder, (err, files) => {
      var remaining = '';
      if (err) {
        ioError('Unable to scan directory', err);
        print(`Unable to scan directory: ` + err);
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
            scanLine(line, users, weapons, bannedPlayers);
          });
          rl.on('close', _ => {
            totalFiles--;
            if (totalFiles === 0) {
              resolve(sortUsersByKDR());
            }
          });
        } catch (e) {
          ioError('Unable to scan directory', e);
          console.error(e);
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
 * calculates weapon stat values
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
 * removes weapon specific data from user object and places it in it's own array
 *
 * @param {Object} user - a user object we need to reconstruct a weapn data array fro
 */
function sortWeapons(user) {
  var sortArr = [];
  for (weapon in user) {
    if (isWeapon(weapon)) {
      if (!user.id) {
        if (weapons[weapon].kills !== 0) {
          sortArr.push(calculateWeaponStats(weapon, weapons[weapon]));
        }
      } else {
        if (user[weapon].kills !== 0) {
          sortArr.push(calculateWeaponStats(weapon, user[weapon]));
        }
      }
      delete user[weapon];
    }
  }
  sortArr.sort((a, b) => {
    return a[1] - b[1];
  });
  sortArr.reverse();
  return sortArr;
}

/**
 * sort users highest to lowest KDR
 */
function sortUsersByKDR() {
  var arr = [];
  totalPlayers = Object.size(users);
  for (var user in users) {
    if (users[user].kills >= 100 && !users[user].banned) {
      arr.push(users[user]);
    }
  }
  arr.sort((a,b) => {
    return a.kdr - b.kdr;
  });
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
        ioError('Unable to scan directory', err);
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
   if (bytes == 0) {
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
    fs.readdir(`${__dirname}/old-top`, (err, files) => {
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
 * print out player name when a know ip views page
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
       arr.push([
         demos[i],
         bytesToSize(getFilesizeInBytes(`${config.gameServerDir}/${demos[i]}`)),
         createdDate(`${config.gameServerDir}/${demos[i]}`)
       ]);
     }
   }
   arr.reverse();
   demoList = arr;
   print(`demo file list cached ${t.endString()} to complete`);
 });
}

/**
 * total all players stats for all months
 *
 * @param {Array} files - list of all stats JSON files
 */
function totalStats(files) {
  // load file data into f variable
  var data = {};
  var f = [];
  // load files as month variable
  for (var i = 0; i < files.length; i++) {
    var month = require(path.join(__dirname, 'old-top', files[i]));
    // parse players for each month
    for (var player = 0; player < month[i].length; player++) {
      // create player obj if non existant
      if (!data[month[i][player].id]) {
        data[month[i][player].id] = month[i][player];
      }
    }
  }
  return data;
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
  getServerStatus(roundEnd, updated).then(status => {
    serverStatus = status;
    if (socket) {
      socket.send(JSON.stringify(serverStatus), e => {});
    }
  }).catch(err => {
    serverStatus = 'offline';
  });
}

cacheTopResponse().then(cacheDemos);
setInterval(_ => {
  cacheTopResponse().then(cacheDemos);
}, (config.logRefreshTime * 1000) * 60);

statsLoop();
setInterval(statsLoop, 5000);

var j = schedule.scheduleJob('0 5 1 * *', cleanUp);

print(`Loading API backend calls`);

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
 * route for gettings a total of player stats
 */
app.get('/total', (req, res) => {
  var t = new Timer();
  fs.readdir(`${__dirname}/old-top`, (err, files) => {
    if (err) {
      ioError('Unable to scan directory', err);
      return;
    }
    res.send(totalStats(files));
  });
  who(req, `is viewing ` + '/total'.green + ` data ` + `${t.end()[2]} seconds`.cyan + ` response time`);
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
app.get('/who', (req, res) => {
  var t = new Timer();
  var arr = [];
  for (var id in users) {
    arr.push(users[id].name);
  }
  res.send(arr);
  who(req, `is viewing ` + '/who'.green + ` data ` + `${t.end()[2]} seconds`.cyan + ` response time`);
});

/**
 * route for gettings a individual players stats
 */
app.get('/playerStats/:name', (req, res) => {
  var t = new Timer();
  var name = req.params.name;
  for (var id in users) {
    if (users[id].name === name) {
      var obj = { ...users[id] }
      obj.weapons = sortWeapons(obj);
      who(req, `is viewing ` + '/playerStats'.green + ` data for ${name.grey} ` + `${t.end()[2]} seconds`.cyan + ` response time`);
      return res.send(JSON.stringify(obj));
    }
  }
  res.status(404).send('');
});

/**
 * route for downloading current months demo file
 */
app.get('/download/:file', (req, res) => {
  var t = new Timer();
  var dl = `${config.gameServerDir}/${req.params.file}`;
  if (!fs.existsSync(dl)){
    return res.status(404).send('File does not exist');
  }
  who(req, `qued download for file ${dl.green} ` + `${t.end()[2]} seconds`.cyan + ` response time`);
  res.download(dl, req.params.file);
});

/**
 * route for downloading a previous months logs zip files
 */
app.get('/download/logs-zip/:file', (req, res) => {
  var t = new Timer();
  var dl = `/media/nas/old-stats/logs/${req.params.file}`;
  if (!fs.existsSync(dl)){
    return res.status(404).send('File does not exist');

  }
  who(req, `qued download for file ${dl.green} ` + `${t.end()[2]} seconds`.cyan + ` response time`);
  res.download(dl, req.params.file);
});

/**
 * route for downloading a previous months demo zip files
 */
app.get('/download/demos-zip/:file', (req, res) => {
  var t = new Timer();
  var dl = `/media/nas/old-stats/demos/${req.params.file}`;
  if (!fs.existsSync(dl)){
    return res.status(404).send('File does not exist');

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
    res.status(404).send('File does not exist');
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
    res.status(404).send('no stats exist for this month');
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
  }).catch(console.error);
});

/**
 * route for WebSocket
 */
app.ws('/', (ws, req) => {
  socket = ws;
  socket.send(JSON.stringify(serverStatus));
});

/**
 * 404
 */
app.get('*', (req, res) => {
  res.status(404).sendFile(`${__dirname}/html/404.html`);
});

app.listen(3000);

print('API active on port: ' + `3000`.red);
print(`log folder = ${logFolder.green}`);
