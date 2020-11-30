#!/usr/bin/env node
const figlet = require('figlet');                         // ascii art
const path = require('path');                             // merger file / url names
const fs = require('fs');                                 // work with the file system
const readline = require('readline');                     // read file one line at a time
const Gamedig = require('gamedig');                       // get data about game servers
const SteamID = require('steamid');                       // work with steamid's
const schedule = require('node-schedule');                // cronjob type schecduler
const child_process = require("child_process");           // system peocesses
const compression = require('compression');               // compress api responses
const bcrypt = require('bcrypt');                         // hash and check passwords
const express = require('express');                       // web api routing
const app = express();                                    // express init
var expressWs = require('express-ws')(app);               // WebSocket init
const io = require('@pm2/io');                            // pm2 functions
const colors = require('colors');                         // colorize text
const config = require(`${__dirname}/config.json`);       // config file location
const logFolder = path.join(config.gameServerDir, 'logs');// game server log location
const useragent = require('express-useragent');           // user browser data
const MongoClient = require('mongodb').MongoClient;       // mongodb for streamkey storage
const clear = require('clear');                           // clear screen


clear();
console.log(figlet.textSync('dough10/hl2dm-stats', {
  horizontalLayout: 'default'
}));

print('Configure Express');
app.use(compression());
app.set('trust proxy', true);
app.disable('x-powered-by');
app.use(useragent.express());

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

print(`Configure PM2 metrics`);

io.init({
  transactions: true,
  http: true
});

print(`Load Functions`);

Object.size = obj => {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

/**
 * print strings to log with cuttent time
 */
function print(message) {
  var now = new Date().toLocaleString();
  console.log(`${now.yellow} - ${message}`);
}

/**
 * A class for timing duration of things
 */
class Timer {
  constructor() {
    this.startTime = new Date().getTime();
  }
  end() {
    var ms = new Date().getTime() - this.startTime;
    var seconds = ms / 1000;
    var hours = parseInt( seconds / 3600 );
    seconds = seconds % 3600;
    var minutes = parseInt( seconds / 60 );
    seconds = seconds % 60;
    return [
      hours,
      minutes,
      seconds
    ];
  }
  endString() {
    var endTime = this.end();
    return `${endTime[0]} hours ${endTime[1]} minutes ${endTime[2]} seconds`.cyan;
  }
}

/**
 * checks if weapon selection is a valid weapon name
 *
 * @param {String} weapon - name of a weapon
 */
function isWeapon(weapon) {
  var w = [
    '357',
    'ar2',
    'combine_ball',
    'crossbow_bolt',
    'crowbar',
    'grenade_frag',
    'physbox',
    'physics',
    'pistol',
    'shotgun',
    'smg1',
    'smg1_grenade',
    'stunstick',
    'rpg_missile',
    'world',
    'headshots',
    'physcannon'
  ];
  return w.includes(weapon);
}

/**
 * check if ip  address is valid
 *
 * @param {String} ip - ip address
 */
function validateIPaddress(ip) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}

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
          rl.on('line', scanLine);
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
 * returns the player name string
 *
 * @param {String} word - player name string
 */
function getName(word) {
  if (!word) {
    return false;
  }
  word = word.replace('"', '');
  var end = word.search(/<([1-9][0-9]{0,2}|1000)>/);
  var str = '';
  for (var i = 0; i < end; i++) {
    str = str + word[i];
  }
  return str;
}

/**
 * returns the player steamID in format 2
 *
 * @param {String} word - player name string
 */
function getID2(word) {
  if (!word) {
    return false;
  }
  const u = word.search(/STEAM_[0-1]:[0-1]:/g);
  if (u < 0) {
    return false;
  }
  const start = u;
  word = word.substring(start)
  const end = word.search('>');
  let str = '';
  for (var i = 0; i < end; i++) {
    str = str + word[i];
  }
  return str;
}

/**
 * returns the player steamID in format 3
 *
 * @param {String} word - player name string
 */
function getID3(word) {
  if (!word) {
    return false;
  }
  const u = word.search(/U:[0-1]:/);
  if (u < 0) {
    return false;
  }
  const start = u + 4;
  word = word.substring(start)
  const end = word.search(']');
  let str = '';
  for (var i = 0; i < end; i++) {
    str = str + word[i];
  }
  return str;
}

/**
 * if a string of text a time string
 *
 * @param {String} str - player name string
 */
function isTime(str) {
  return /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d):$/.test(str);
}

/**
 * builds a name string if name was broken by .split()
 *
 * @param {Array} line - one line from a log file broken @ spaces
 * @param {Number} end - index point of the end of the name string
 */
function buildKillerNameString(line, end)  {
  let name = '';
  let start = 4;
  for (let i = 0; i < line.length; i++) {
    if (isTime(line[i])) {
      start = i + 1;
    }
  }
  if (line[4] === 'Banid:') {
    start = 5;
  }
  for (var i = start; i < end; i++) {
    name = `${name}${line[i]} `;
  }
  return name
}

/**
 * builds a name string if name was broken by .split()
 *
 * @param {Array} line - one line from a log file broken @ spaces
 * @param {Number} start - index point of the start of the name string
 */
function buildKilledNameString(line, start) {
  var end = 7;
  for (var i = start; i < line.length; i++) {
    if (line[i] === 'with') {
      end = i;
    }
  }
  var name = '';
  for (var i = start; i < end; i++) {
    name = `${name}${line[i]} `;
  }
  return name;
}

/**
 * scans the line for landmarks in order to get usable strings of data
 *
 * @param {String} line - one line of the log file being parsed
 */
function lineIsKill(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === 'killed') {
      return i;
    }
  }
  return false;
}

/**
 * scans the line for landmarks in order to get usable strings of data
 *
 * @param {String} line - one line of the log file being parsed
 */
function lineIsConnect(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === 'connected,') {
      return i;
    }
  }
  return false;
}

/**
 * scans the line for landmarks in order to get usable strings of data
 *
 * @param {String} line - one line of the log file being parsed
 */
function lineIsSuicide(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === 'committed') {
      return i;
    }
  }
  return false;
}

/**
 * scans the line for landmarks in order to get usable strings of data
 *
 * @param {String} line - one line of the log file being parsed
 */
function lineIsChat(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === 'say') {
      return i;
    }
  }
  return false;
}

/**
 * scans the line for landmarks in order to get usable strings of data
 *
 * @param {String} line - one line of the log file being parsed
 */
function lineIsHeadshot(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === '"headshot"') {
      return i - 1;
    }
  }
  return false;
}

/**
 * scans the line for landmarks in order to get usable strings of data
 *
 * @param {String} line - one line of the log file being parsed
 */
function lineIsStats(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === '"weaponstats"') {
      return i;
    }
  }
  return false;
}

/**
 * scans the line for landmarks in order to get usable strings of data
 *
 * @param {String} line - one line of the log file being parsed
 */
function lineIsStats2(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === '"weaponstats2"') {
      return i;
    }
  }
  return false;
}


/**
 * scans the line for landmarks in order to get usable strings of data
 *
 * @param {String} line - one line of the log file being parsed
 */
function lineIsConsole(line) {
  var ipstring = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):\d{4,5}$/
  for (var i = 0; i < line.length; i++) {
    if (line[i] === 'rcon' && line[i + 1] === 'from' && ipstring.test(line[i + 2].slice(0, -1).replace('"', '').replace('"', ''))) {
      return i;
    }
  }
  return false;
}

/**
 * scans the line for landmarks in order to get usable strings of data
 *
 * @param {String} line - one line of the log file being parsed
 */
function playerIsBanned(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === 'banned') {
      return i - 1;
    }
  }
  return false;
}

/**
 * returns a player object
 *
 * @param {String} name - name mof the player
 * @param {Number} id - player steamID
 * @param {Number} time - new Date().getTime() output
 */
function playerObj(name, id, time) {
  return {
    name: name,
    id: id,
    kills: 0,
    deaths: 0,
    kdr: 0,
    banned: false,
    suicide: {count:0},
    updated: time,
    chat: []
  };
}

/**
 * returns defualt weapon object valuse
 */
function weaponObj() {
  return {
    kills: 0,
    shots: 0,
    hits: 0,
    headshots: 0,
    head: 0,
    chest: 0,
    stomach: 0,
    leftarm: 0,
    rightarm: 0,
    leftleg: 0,
    rightleg:0,
    damage:0,
    hss:0,
    lss:9999
  };
}

/**
 * sends error message to PM2 io.app
 *
 * @param {String} err - the error message
 * @param {String} line - one line of the log file being parsed
 */
function ioError(err, line) {
  new Error(err, line.red);
  io.notifyError(new Error(`${err}: ${line}`), {
    custom: {
      error: err
    }
  });
}

/**
 * scans the line for landmarks in order to get usable strings of data
 *
 * @param {String} line - one line of the log file being parsed
 */
function scanLine(line) {
  var word  = line.split(' ');
  var isKill = lineIsKill(word);
  var isConnect = lineIsConnect(word);
  var isSuicide = lineIsSuicide(word);
  var isChat = lineIsChat(word);
  var isHeadshot  = lineIsHeadshot(word);
  var isStats = lineIsStats(word);
  var isStats2 = lineIsStats2(word);
  var isConsole = lineIsConsole(word);
  var isBanned = playerIsBanned(word);
  var lineTime;
  if (word[3] && isTime(word[3])) {
    lineTime = new Date(`${word[3].slice(0, -1)} ${word[1]}`).getTime();
  }
  if (isConsole) {
     return;
  } else if (isChat) {
    // important data
    const nameString = buildKillerNameString(word, isChat);
    const id = getID3(nameString);
    const name = getName(nameString);
    // check if variables have data
    if (!id) {
      // ioError('Forming player ID', line);
      return;
    }
    if (!name) {
      // ioError('Forming player name', line);
      return;
    }
    // create user object if it doesn't exist
    if (!users[id]) {
     users[id] = playerObj(name, id, lineTime);
    }
    // update player name if it has changed
    if (lineTime >= users[id].updated) {
     users[id].updated = lineTime;
     users[id].name = name;
    }
    // log chat
    var said = `${new Date(lineTime).toLocaleString()}, `;
    for (var i = (isChat + 1); i < word.length; i++) {
     said = `${said}${word[i]} `;
    }
    said.replace('"', '');
    said.replace('"', '');
    users[id].chat.push(said);
  } else if (isBanned) {
    // important data
    const nameString = buildKillerNameString(word, isBanned);
    const name = getName(nameString);
    const id = getID3(nameString);
    // check if variables have data
    if (!id) {
      // ioError('Forming player ID', line);
      return;
    }
    // create user object if it doesn't exist

    if (!users[id]) {
      users[id] = {
        id: id,
        banned: true
      };
      bannedPlayers[id] = {
        id: id,
        banned: true
      };
      return;
    }
    // mark player as banned
    users[id].banned = true;
    bannedPlayers[id] = users[id];
  } else if (isConnect) {
    // get user details
    const connectedNameString = buildKillerNameString(word, isConnect);
    const connectedUser = getID3(connectedNameString);
    const connectedUserName = getName(connectedNameString);
    const ip = word[isConnect  + 2].replace('"', '').replace('"', '').replace(/:\d{4,5}$/, '');
    // check for important data
    if (!connectedUserName) {
      // ioError('Forming player name', line);
      return;
    }
    if (!connectedUser) {
      // ioError('Forming player ID', line);
      return;
    }
    if (!validateIPaddress(ip)) {
      ioError('Forming player ip address', line);
      return;
    }
    // create users object if doesn't exist
    if (!users[connectedUser]) {
      users[connectedUser] = playerObj(connectedUserName, connectedUser, lineTime);
    }
    // set address
    users[connectedUser].ip = ip;
    // update user name if changed
    if (lineTime >= users[connectedUser].updated) {
      users[connectedUser].updated = lineTime;
      users[connectedUser].name = connectedUserName;
    }
  } else if (isKill) {
    // get players details
    const killerNameString = buildKillerNameString(word, isKill);
    const killerID = getID3(killerNameString);
    const killerName = getName(killerNameString);
    const killedNameString = buildKilledNameString(word, isKill + 1);
    const killedID = getID3(killedNameString);
    const killedName = getName(killedNameString);
    const weapon = word[word.length - 1].replace('"', '').replace('"', '');
    // check important data exists
    if (!killerID) {
      ioError('Forming killer ID', line);
      return;
    }
    if (!killerName) {
      ioError('Forming killer name', line);
      return;
    }
    if (!killedID) {
      ioError('Forming killed ID', line);
      return;
    }
    if (!killedName) {
      ioError('Forming killed name', line);
      return;
    }
    if (!isWeapon(weapon)) {
      ioError('Forming weapon name', line);
      return;
    }
    // killer object
    if (!users[killerID]) {
      users[killerID] = playerObj(killerName, killerID, lineTime);
    }
    // killed object
    if (!users[killedID]) {
      users[killedID] = playerObj(killedName, killedID, lineTime);
    }
    // update killer name if changed
    if (lineTime >= users[killerID].updated) {
      users[killerID].updated = lineTime;
      users[killerID].name = killerName;
    }
    // update killed name if changed
    if (lineTime > users[killedID].updated) {
      users[killedID].updated = lineTime;
      users[killedID].name = killedName;
    }
    // add killers kill
    users[killerID].kills++;
    // add killed player death
    users[killedID].deaths++;
    // calculate everyones involveds KDR
    users[killerID].kdr = Number((users[killerID].kills / users[killerID].deaths).toFixed(2));
    if (users[killerID].kdr === Infinity) {
      users[killerID].kdr = users[killerID].kills;
    }
    users[killedID].kdr = Number((users[killedID].kills / users[killedID].deaths).toFixed(2));
    // add weapon for killer if doesn't exist
    if (!users[killerID][weapon]) {
      users[killerID][weapon] = weaponObj();
    }
    // add killer kill with weapon
    users[killerID][weapon].kills++;
    // add weapon for server
    if (!weapons[weapon]) {
      weapons[weapon] = weaponObj();
    }
    // add server wide weapon kill
    weapons[weapon].kills++;
  } else if (isSuicide) {
    const nameString = buildKillerNameString(word, isSuicide);
    const id = getID3(nameString);
    const name = getName(nameString);
    const weapon = word[word.length - 1].replace('"', '').replace('"', '');
    if (!id) {
      ioError('Forming player ID', line);
      return;
    }
    if (!name) {
      ioError('Forming player name', line);
      return;
    }
    if (!isWeapon(weapon)) {
      ioError('Forming weapon name', line);
      return;
    }
    if (!users[id]) {
      users[id] = playerObj(name, id, lineTime);
    }
    if (lineTime >= users[id].updated) {
      users[id].updated = lineTime;
      users[id].name = name;
    }
    users[id].kills--;
    users[id].deaths++;
    users[id].suicide.count++;
    users[id].kdr = Number((users[id].kills / users[id].deaths).toFixed(2));
    if (!users[id].suicide[weapon]) {
      users[id].suicide[weapon] = 0;
    }
    users[id].suicide[weapon]++;
    if (!weapons[weapon]) {
      weapons[weapon] = weaponObj();
    }
    weapons[weapon].kills++;
  } else if (isHeadshot) {
    if (!weapons.headshots) {
      weapons.headshots = {kills:0};
    }
    weapons.headshots.kills++;
    const killerNameString = buildKillerNameString(word, isHeadshot);
    const id = getID2(killerNameString);
    const name = getName(killerNameString);
    const sid = new SteamID(id);
    const id3 = getID3(sid.getSteam3RenderedID());
    if (!id3) {
      ioError('Forming player ID', line);
      return;
    }
    if (!name) {
      ioError('Forming player name', line);
      return;
    }
    if (!users[id3]) {
      users[id3] = playerObj(name, id3, lineTime);
    }
    if (!users[id3].headshots) {
      users[id3].headshots = {kills:0};
    }
    users[id3].headshots.kills++;
    if (lineTime >= users[id3].updated) {
      users[id3].updated = lineTime;
      users[id3].name = name;
    }
  } else if (isStats) {
     // get important information
    const killedNameString = buildKillerNameString(word, isStats - 1);
    const id = getID2(killedNameString);
    const name = getName(killedNameString);
    const sid = new SteamID(id);
    const id3 = getID3(sid.getSteam3RenderedID());
    // check variables have data
    if (!id3) {
      ioError('Forming player ID', line);
      return;
    }
    if (!name) {
      ioError('Forming player name', line);
      return;
    }
    // create user object if doesn't exist
    if (!users[id3]) {
      users[id3] = playerObj(name, id3, lineTime);
    }
    // clean up extra chars from logs
    for (var i = 0; i < word.length; i++) {
      word[i] = word[i].replace('"', '').replace('(', '').replace(')', '').replace('"', '');
    }
    var weaponName = word[isStats + 2];
    if (!isWeapon(weaponName)) {
      ioError('Forming weapon name', line);
      return;
    }
    // create players weapon object if doesn't exist
    if (!users[id3][weaponName]) {
      users[id3][weaponName] = weaponObj();
    }
    // get weapon data values
    var shots = Number(word[isStats + 4]);
    var hits = Number(word[isStats + 6]);
    var hs = Number(word[isStats + 8]);
    var damage = Number(word[isStats + 14]);
    /*
     * single shot damage
     * this is not accurate in that if more then 1 shot hits it will be ignored
     */
     // highest damage single shot
    if (hits === 1 && damage > users[id3][weaponName].hss) {
      users[id3][weaponName].hss = damage;
    }
    // lowest damage single shot
    if (hits === 1 && damage < users[id3][weaponName].lss && damage !== 0) {
      users[id3][weaponName].lss = damage;
    }
    // running total of values for player
    users[id3][weaponName].shots = users[id3][weaponName].shots + shots;
    users[id3][weaponName].hits = users[id3][weaponName].hits + hits;
    users[id3][weaponName].headshots = users[id3][weaponName].headshots + hs;
    users[id3][weaponName].damage = users[id3][weaponName].damage + damage;
    // server wide weapon stats data object
    if (!weapons[weaponName]) {
      weapons[weaponName] = weaponObj();
    }
    // highest single shot damage
    if (hits === 1 && damage > weapons[weaponName].hss && damage < 1000) {
      weapons[weaponName].hss = damage;
    }
    // lowest single shot damage
    if (hits === 1 && damage < weapons[weaponName].lss && damage !== 0) {
      weapons[weaponName].lss = damage;
    }
    // running total of values for server
    weapons[weaponName].shots = weapons[weaponName].shots + shots;
    weapons[weaponName].hits = weapons[weaponName].hits + hits;
    weapons[weaponName].headshots = weapons[weaponName].headshots + hs;
    weapons[weaponName].damage = weapons[weaponName].damage + damage;
  } else if (isStats2) {
    const killedNameString = buildKillerNameString(word, isStats2 - 1);
    const id = getID2(killedNameString);
    const name = getName(killedNameString);
    const sid = new SteamID(id);
    const id3 = getID3(sid.getSteam3RenderedID());
    if (!id3) {
      ioError('Forming player id', line);
      return;
    }
    if (!name) {
      ioError('Forming player name', line);
      return;
    }
    if (!users[id3]) {
      users[id3] = playerObj(name, id3, lineTime);
    }
    // clean up extra chars
    for (var i = 0; i < word.length; i++) {
      word[i] = word[i].replace('"', '').replace('(', '').replace(')', '').replace('"', '');
    }
    var weaponName = word[isStats2 + 2];
    if (!isWeapon(weaponName)) {
      ioError('Forming weapon name', line);
      return;
    }
    var head = word[isStats2 + 4];
    var chest = word[isStats2 + 6];
    var stomach = word[isStats2 + 8];
    var leftarm = word[isStats2 + 10];
    var rightarm = word[isStats2 + 12];
    var leftleg = word[isStats2 + 14];
    var rightleg = word[isStats2 + 16];
    if (!head) {
      return;
    }
    if (!chest) {
      return;
    }
    if (!stomach) {
      return;
    }
    if (!leftarm) {
      return;
    }
    if (!rightarm) {
      return;
    }
    if (!leftleg) {
      return;
    }
    if (!rightleg) {
      return;
    }
    if (!users[id3][weaponName]) {
      users[id3][weaponName] = weaponObj();
    }
    users[id3][weaponName].head = users[id3][weaponName].head + Number(head);
    users[id3][weaponName].chest = users[id3][weaponName].chest + Number(chest);
    users[id3][weaponName].stomach = users[id3][weaponName].stomach + Number(stomach);
    users[id3][weaponName].leftarm = users[id3][weaponName].leftarm + Number(leftarm);
    users[id3][weaponName].rightarm = users[id3][weaponName].rightarm + Number(rightarm);
    users[id3][weaponName].leftleg = users[id3][weaponName].leftleg + Number(leftleg);
    users[id3][weaponName].rightleg = users[id3][weaponName].rightleg + Number(rightleg);
    if (!weapons[weaponName]) {
      weapons[weaponName] = weaponObj();
    }
    weapons[weaponName].head = weapons[weaponName].head + Number(head);
    weapons[weaponName].chest = weapons[weaponName].chest + Number(chest);
    weapons[weaponName].stomach = weapons[weaponName].stomach + Number(stomach);
    weapons[weaponName].leftarm = weapons[weaponName].leftarm + Number(leftarm);
    weapons[weaponName].rightarm = weapons[weaponName].rightarm + Number(rightarm);
    weapons[weaponName].leftleg = weapons[weaponName].leftleg + Number(leftleg);
    weapons[weaponName].rightleg = weapons[weaponName].rightleg + Number(rightleg);
  }
}

/**
 * returns % value
 *
 * @param {Number} small - small #
 * @param {Number} big - big #
 */
function calculatePrecent(small, big) {
  return Math.round((small / big) * 100) || 0;
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
      if (!user.id && weapons[weapon].kill !== 0) {
        var shots = weapons[weapon].shots || 0;
        var acc = calculatePrecent(weapons[weapon].hits, weapons[weapon].shots);
        var hs = calculatePrecent(weapons[weapon].headshots, weapons[weapon].shots);
        var shotsToKill = Math.floor(weapons[weapon].shots / weapons[weapon].kills) || 0;
        var damage = weapons[weapon].damage || 0;
        var adpk = Math.floor(weapons[weapon].damage / weapons[weapon].kills) || 0;
        var adph = Math.floor(weapons[weapon].damage / weapons[weapon].hits) || 0;
        var hss = weapons[weapon].hss || 0;
        var lss = weapons[weapon].lss || 0;
        sortArr.push([
          weapon,
          user[weapon].kills,
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
        ]);
      } else if (user[weapon].kills !== 0) {
        var shots = user[weapon].shots || 0;
        var acc = calculatePrecent(user[weapon].hits, user[weapon].shots);
        var hs = calculatePrecent(user[weapon].headshots, user[weapon].shots);
        var shotsToKill = Math.floor(user[weapon].shots / user[weapon].kills) || 0;
        var damage = user[weapon].damage;
        var adpk = Math.floor(user[weapon].damage / user[weapon].kills) || 0;
        var adph = Math.floor(user[weapon].damage / user[weapon].hits) || 0;
        var hss = user[weapon].hss || 0;
        var lss = user[weapon].lss || 0;
        if (user[weapon].kills !== 0) {
          sortArr.push([
            weapon,
            user[weapon].kills,
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
          ]);
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

var nr = 0;
function printPlayersToConsole(players) {
  if (!config.logPlayersToConsole) {
    return;
  }
  if (new Date().getTime() < nr) {
    return;
  }
  if (players[0].name) {
    print(`Players Online`);
  }
  // print out players in server name and score  with a fixed length of 80 chars
  for (var i = 0; i < players.length; i++) {
    if (players[i].name) {
      var name = players[i].name;
      var score = players[i].score.toString();
      var l = ((80 - name.length) - score.length) - 9;
      var space = '';
      for (var n = 1; n < l; n++) {
        space = space + '-';
      }
      console.log(`${name.cyan} ${space.grey} score: ${score.green}`)
    }
  }
  nr = new Date().getTime() + 60000;
}

/**
 * get GameDig data from game server
 */
function getServerStatus() {
  Gamedig.query({
    type: 'hl2dm',
    host: config.gameServerHostname
  }).then((state) => {
    serverStatus = state;
    socket.send(JSON.stringify(serverStatus));
    if (serverStatus.players.length > 0) {
      // if a player has 60 kills update stats
      for (var i = 0; i < serverStatus.players.length; i++) {
        if (serverStatus.players[i].score === Number(serverStatus.raw.rules.mp_fraglimit) && !updated) {
          updated = true;
          setTimeout(_ => {
            cacheTopResponse().then(cacheDemos);
          }, 5000);
        }
      }
    }
    printPlayersToConsole(serverStatus.players);
  }).catch((error) => {
    serverStatus = 'offline';
  });
}

/**
 * end of month file cleanup process
 */
function cleanUp() {
  print('Clean up started');
  var now = new Date();
  var lastMonth = now.setMonth(now.getMonth() - 1);
  var times = new Timer();
  zipDemos(lastMonth).then(zipLogs).then(saveTop).then(_ => {
    var numFiles = 0;
    fs.readdir(logFolder, (err, files) => {
      if (err) {
        ioError('Unable to scan directory', err);
        return;
      }
      print(`Running log file clean up`);
      numFiles = numFiles + files.length;
      files.forEach(file => {
        fs.unlinkSync(path.join(logFolder, file));
      });
      fs.readdir(config.gameServerDir, (err, filess) => {
        if (err) {
          ioError('Unable to scan directory', err);
        }
        print(`Running demo file clean up`);
        var howMany = filess.length;
        numFiles = numFiles + filess.length;
        filess.forEach(file => {
          howMany--;
          if (path.extname(file) === '.dem') {
            fs.unlinkSync(path.join(config.gameServerDir, file));
            if (howMany <= 0) {
              print(`Clean up complete. ${numFiles} files processed and backed up.`);
              print(`Complete process took ${times.endString()}`)
              top = [];
              users = {};
              cacheTopResponse().then(cacheDemos);
            }
          }
        });
      });
    });
  }).catch(e => {
    console.log(e.message);
  });
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
 * saves top data before log clear
 *
 * @param {Number} lastMonth - new Date() output for the time cleanup() was run
 */
function saveTop(lastMonth) {
  return new Promise((resolve, reject) => {
    var folder = `${__dirname}/old-top`;
    if (!fs.existsSync(folder)){
      fs.mkdirSync(folder);
    }
    var filename = `${__dirname}/old-top/${lastMonth}.json`;
    fs.writeFile(filename, JSON.stringify([
      top,
      weapons,
      totalPlayers,
      bannedPlayers,
      lastUpdate
    ]), e => {
      if (e) {
        reject(e);
      }
      if (!fs.existsSync(filename)){
        reject();
      }
      print('top player data saved to ' + filename.green);
      resolve();
    });
  });
}

/**
 * zips up log files before clear
 *S
 * @param {Number} lastMonth - new Date() output for the time cleanup() was run
 */
function zipLogs(lastMonth) {
  return new Promise((resolve, reject) => {
    var folder = `${config.bulkStorage}/logs`;
    if (!fs.existsSync(folder)){
      fs.mkdirSync(folder);
    }
    var t = new Timer();
    child_process.execSync(`zip -r ${config.bulkStorage}/logs/${lastMonth}.zip *`, {
      cwd: logFolder
    });
    print(`Zippin logs complete: ${t.endString()} time to complete`);
    print('Logs saved as ' + `${config.bulkStorage}/logs/${lastMonth}.zip`.green);
    resolve(lastMonth);
  });
}

/**
 * zip up demo files before clear
 *
 * @param {Number} lastMonth - new Date() output for the time cleanup() was run
 */
function zipDemos(lastMonth) {
  return new Promise((resolve, reject) => {
    var folder = `${config.bulkStorage}/demos`;
    if (!fs.existsSync(folder)){
      fs.mkdirSync(folder);
    }
    var t = new Timer();
    child_process.execSync(`zip -r ${config.bulkStorage}/demos/${lastMonth}.zip *.dem`, {
      cwd: config.gameServerDir
    });
    print(`Zippin demos complete: ${t.endString()} time to complete`);
    print('Demos saved as ' + `${config.bulkStorage}/demos/${lastMonth}.zip`.green);
    resolve(lastMonth);
  })
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
  if (i === '::1') i = 'LAN User'
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


cacheTopResponse().then(cacheDemos);
setInterval(_ => {
  cacheTopResponse().then(cacheDemos);
}, (config.logRefreshTime * 1000) * 60);

getServerStatus();
setInterval(getServerStatus, 5000);

var j = schedule.scheduleJob('0 5 1 * *', cleanUp);

print(`Loading API backend calls`);

/**
 * route for gettings player stats
 */
app.get('/stats', (req, res) => {
  // console.log(req.useragent.isChrome);
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
  var pass = req.query.k;
  MongoClient.connect(config.dbURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  }, (err, db) => {
    if (err) throw err;
    var dbo = db.db("hl2dm");
    dbo.collection("stream-keys").findOne({
      name: name
    }, (err, result) => {
      if (err) throw err;
      db.close();
      bcrypt.compare(pass, result.key, (err, match) => {
        if (err) {
          ioError('Error hashing password', err);
          return console.error(err);
        }
        if (!match) {
          return res.status(404).send('fail');
        }
        who(req, `authorized for streaming as streamid ${name.grey} ` + `${t.end()[2]} seconds`.cyan + ` response time`);
        return res.send('ok');
      });
    });
  });
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
