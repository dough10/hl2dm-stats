print(`Loading imports`);
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const Gamedig = require('gamedig');
const SteamID = require('steamid');
const schedule = require('node-schedule');
const child_process = require("child_process");
const express = require('express');
const compression = require('compression');
const bcrypt = require('bcrypt');
const app = express();
app.use(compression());
app.disable('x-powered-by');
var expressWs = require('express-ws')(app);
const io = require('@pm2/io');

const config = require(`${__dirname}/config.json`);
const logFolder = path.join(config.gameServerDir, 'logs');

var users = {};              // all users go in this object ie. {steamid: {name:playername, kills: 1934, deaths: 1689, kdr: 1.14, .....}, steamid: {..}, ..}
var totalFiles = 0;          // total # of log files in "logs" folder
var top = [];                // players with over 100 kills sorted by KDR
var weapons = {};            // server wide kill count sorted by weapons
var serverStatus;            // placeholder for gamedig state
var totalPlayers = 0;        // count of total players to have joined the server
var updated = false;         // if stats have been updated when a player reaches end of game kill count

var weaponStats =  {};
var bannedPlayers = {};
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
  console.log(`${new Date().toLocaleString()} - ${message}`)
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
    var arr = this.end();
    return `${arr[0]} hours ${arr[1]} minutes ${arr[2]} seconds`;
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
    var time = new Timer();
    parseLogs().then(stats => {
      top = stats;
      // merge physics kills
      if (!weapons.physics) {
        weapons.physics = 0;
      }
      if (!weapons.physbox) {
        weapons.physbox = 0;
      }
      if (!weapons.world) {
        weapons.world = 0;
      }
      weapons.physics = (weapons.physics + weapons.physbox) + weapons.world;
      delete weapons.physbox;
      delete weapons.world;
      if (weapons.physics === 0) {
        delete weapons.physics;
      }
      // convert weapons object into sorted array by kill count array
      weapons = sortWeapons(weapons);
      for (var i = 0; i < top.length; i++) {
        // merge player physics kills
        if (!top[i].physics) {
          top[i].physics = 0;
        }
        if (!top[i].physbox) {
          top[i].physbox = 0;
        }
        if (!top[i].world) {
          top[i].world = 0;
        }
        top[i].physics = (top[i].physics + top[i].physbox) + top[i].world;
        delete top[i].physbox;
        delete top[i].world;
        delete top[i].updated;
        if (top[i].physics === 0) {
          delete top[i].physics;
        }
        // extract weapons from player object and place in sorted by kill count array
        top[i].weapons = sortWeapons(top[i]);
      }
      setTimeout(_ => {
        updated = false;
      }, 60000);
      print(`Logs parsed & cached. ${time.endString()} to process`);
      resolve();
    });
  });
}

/**
 * get list of log files and send to scanner line by line
 */
function parseLogs() {
  return new Promise((resolve, reject) => {
    weapons = {};
    weaponStats = {};
    fs.readdir(logFolder, (err, files) => {
      var remaining = '';
      if (err) {
        io.notifyError(new Error(`Unable to scan directory: ` + err), {
          custom: {
            folder: logFolder
          }
        });
        return print(`Unable to scan directory: ` + err);
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
          io.notifyError(new Error(`Unable to scan directory: ` + e), {
            custom: {
              file: file
            }
          });
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
  if (word[3] && isTime(word[3])) {
    var lineTime = new Date(`${word[3].slice(0, -1)} ${word[1]}`).getTime();
  }
  if (isConsole) {
     return;
  } else if (isChat) {
    const nameString = buildKillerNameString(word, isChat);
    const id = getID3(nameString);
    const name = getName(nameString);
    if (!users[id]) {
     users[id] = {
       name: name,
       id: id,
       kills: 0,
       deaths: 0,
       kdr: 0,
       suicide: 0,
       updated: lineTime,
       banned: false,
       chat: []
     };
    }
    if (lineTime >= users[id].updated) {
     users[id].updated = lineTime;
     users[id].name = name;
    }
    var said = `${new Date(lineTime).toLocaleString()}, `;
    for (var i = (isChat + 1); i < word.length; i++) {
     said = `${said}${word[i]} `;
    }
    said.replace('"', '');
    said.replace('"', '');
    users[id].chat.push(said);
  } else if (isBanned) {
    const nameString = buildKillerNameString(word, isBanned);
    const name = getName(nameString);
    const id = getID3(nameString);
    // console.log(name, id);
    if (!id) {
      return;
    }
    if (!users[id]) {
      users[id] = {
        id: id,
        banned: true,
        name: name
      };
      bannedPlayers[id] = {
        id: id,
        banned: true,
        name: name
      };
      return;
    }
    users[id].banned = true;
    bannedPlayers[id] = users[id];
  } else if (isConnect) {
    const connectedNameString = buildKillerNameString(word, isConnect);
    const connectedUser = getID3(connectedNameString);
    const connectedUserName = getName(connectedNameString);
    const ip = word[isConnect  + 2].replace('"', '').replace('"', '').replace(/:\d{4,5}$/, '');
    if (validateIPaddress(ip)) {
      if (!users[connectedUser]) {
        users[connectedUser] = {
          name: connectedUserName,
          id:connectedUser,
          ip: ip,
          kills: 0,
          deaths: 0,
          kdr: 0,
          suicide: 0,
          updated: lineTime,
          banned: false,
          chat: []
        };
      } else {
        users[connectedUser].ip = ip;
      }
      if (lineTime >= users[connectedUser].updated) {
        users[connectedUser].updated = lineTime;
        users[connectedUser].name = connectedUserName;
      }
    }
  } else if (isKill) {
    const killerNameString = buildKillerNameString(word, isKill);
    const killerID = getID3(killerNameString);
    const killerName = getName(killerNameString);
    const killedNameString = buildKilledNameString(word, isKill + 1);
    const killedID = getID3(killedNameString);
    const killedName = getName(killedNameString);
    const weapon = word[word.length - 1].replace('"', '').replace('"', '');
    if (!killerID) {
      io.notifyError(new Error(`Forming killer ID: ${line}`), {
        custom: {
          error: 'Forming killer ID'
        }
      });
      return;
    }
    if (!killerName) {
      io.notifyError(new Error(`Forming killer name: ${line}`), {
        custom: {
          error: 'Forming killer name'
        }
      });
      return;
    }
    if (!killedID) {
      io.notifyError(new Error(`Forming killed ID: ${line}`), {
        custom: {
          error: 'Forming killed ID'
        }
      });
      return;
    }
    if (!killedName) {
      io.notifyError(new Error(`Forming killed name: ${line}`), {
        custom: {
          error: 'Forming killed name'
        }
      });
      return;
    }
    if (!isWeapon(weapon)) {
      io.notifyError(new Error(`Forming weapon name: ${line}`), {
        custom: {
          error: 'Forming weapon name'
        }
      });
      return;
    }
    // killer
    if (!users[killerID]) {
      users[killerID] = {
        name: killerName,
        id:killerID,
        kills: 0,
        deaths: 0,
        kdr: 0,
        suicide: 0,
        updated: lineTime,
        banned: false,
        chat: []
      };
    }
    // killed
    if (!users[killedID]) {
      users[killedID] = {
        name: killedName,
        id: killedID,
        kills: 0,
        deaths: 0,
        kdr: 0,
        updated: lineTime,
        banned: false,
        chat: []
      };
    }
    if (lineTime >= users[killerID].updated) {
      users[killerID].updated = lineTime;
      users[killerID].name = killerName;
    }
    if (lineTime > users[killedID].updated) {
      users[killedID].updated = lineTime;
      users[killedID].name = killedName;
    }
    // add kill
    users[killerID].kills++;
    // add death
    users[killedID].deaths++;
    // calculate KDR
    users[killerID].kdr = Number((users[killerID].kills / users[killerID].deaths).toFixed(2));
    if (users[killerID].kdr === Infinity) {
      users[killerID].kdr = users[killerID].kills;
    }
    users[killedID].kdr = Number((users[killedID].kills / users[killedID].deaths).toFixed(2));
    // add weapon for killer
    if (!users[killerID][weapon]) {
      users[killerID][weapon] = 0;
    }
    // add weapon for server
    if (!weapons[weapon]) {
      weapons[weapon] = 0;
    }
    // add killer kill with weapon
    users[killerID][weapon]++;
    // add server wide weapon kill
    weapons[weapon]++;
  } else if (isSuicide) {
    const nameString = buildKillerNameString(word, isSuicide);
    const id = getID3(nameString);
    const name = getName(nameString);
    if (!id) {
      io.notifyError(new Error(`Forming player ID: ${line}`), {
        custom: {
          error: 'Forming player ID'
        }
      });
      return;
    }
    if (!users[id]) {
      users[id] = {
        name: name,
        id: id,
        kills: 0,
        deaths: 0,
        kdr: 0,
        suicide: 0,
        banned: false,
        chat: []
      };
    }
    if (lineTime >= users[id].updated) {
      users[id].updated = lineTime;
      users[id].name = name;
    }
    users[id].kills--;
    users[id].deaths++;
    users[id].suicide++
    users[id].kdr = Number((users[id].kills / users[id].deaths).toFixed(2));
    var weapon = word[word.length - 1].replace('"', '');
    weapon = weapon.replace('"', '');
    if (!isWeapon(weapon)) {
      console.log(`${line} weapon error`);
      return;
    }
    if (!weapons[weapon]) {
      weapons[weapon] = 0;
    }
    weapons[weapon]++;
  } else if (isHeadshot) {
    if (!weapons.headshots) {
      weapons.headshots = 0;
    }
    weapons.headshots++;
    const killerNameString = buildKillerNameString(word, isHeadshot);
    const id = getID2(killerNameString);
    const name = getName(killerNameString);
    const sid = new SteamID(id);
    const id3 = getID3(sid.getSteam3RenderedID());
    if (!id3) {
      io.notifyError(new Error(`Forming player ID: ${line}`), {
        custom: {
          error: 'Forming player ID'
        }
      });
      return;
    }
    if (!users[id3]) {
      users[id3] = {
        name: name,
        id: id3,
        kills: 0,
        deaths: 0,
        updated: lineTime,
        kdr: 0,
        suicide: 0,
        banned: false,
        chat: []
      };
    }
    if (!users[id3].headshots) {
      users[id3].headshots = 0;
    }
    users[id3].headshots++;
    if (lineTime >= users[id3].updated) {
      users[id3].updated = lineTime;
      users[id3].name = name;
    }
  } else if (isStats) {
    const killedNameString = buildKillerNameString(word, isStats - 1);
    const id = getID2(killedNameString);
    const name = getName(killedNameString);
    const sid = new SteamID(id);
    const id3 = getID3(sid.getSteam3RenderedID());
    if (!id3) {
      io.notifyError(new Error(`Forming player ID: ${line}`), {
        custom: {
          error: 'Forming player ID'
        }
      });
      return;
    }
    if (!weaponStats[id3]) {
      weaponStats[id3] = {};
    }
    // clean up extra chars
    for (var i = 0; i < word.length; i++) {
      word[i] = word[i].replace('"', '').replace('(', '').replace(')', '').replace('"', '');
    }
    var weaponName = word[isStats + 2];
    if (!isWeapon(weaponName)) {
      console.log(`${line} weapon error`);
      return;
    }
    if (!weaponStats[id3][weaponName]) {
      weaponStats[id3][weaponName] = {
        shots: 0,
        hits: 0,
        headshots:0,
        head:0,
        chest:0,
        stomach:0,
        leftarm:0,
        rightarm:0,
        leftleg:0,
        rightleg:0
      };
    }
    weaponStats[id3][weaponName].shots = weaponStats[id3][weaponName].shots + Number(word[isStats + 4]);
    weaponStats[id3][weaponName].hits = weaponStats[id3][weaponName].hits + Number(word[isStats + 6]);
    weaponStats[id3][weaponName].headshots = weaponStats[id3][weaponName].headshots + Number(word[isStats + 8]);
  } else if (isStats2) {
    const killedNameString = buildKillerNameString(word, isStats2 - 1);
    const id = getID2(killedNameString);
    const name = getName(killedNameString);
    const sid = new SteamID(id);
    const id3 = getID3(sid.getSteam3RenderedID());
    if (!id3) {
      return;
    }
    if (!weaponStats[id3]) {
      weaponStats[id3] = {};
    }
    // clean up extra chars
    for (var i = 0; i < word.length; i++) {
      word[i] = word[i].replace('"', '').replace('(', '').replace(')', '').replace('"', '');
    }
    var weaponName = word[isStats2 + 2];
    if (!isWeapon(weaponName)) {
      io.notifyError(new Error(`Forming weapon name: ${line}`), {
        custom: {
          error: 'Forming weapon name'
        }
      });
      return;
    }
    if (!weaponStats[id3][weaponName]) {
      weaponStats[id3][weaponName] = {
        shots: 0,
        hits: 0,
        headshots:0,
        head:0,
        chest:0,
        stomach:0,
        leftarm:0,
        rightarm:0,
        leftleg:0,
        rightleg:0
      };
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
    // console.log(id3, weaponName, head, chest, stomach, leftarm, rightarm, leftleg, rightleg);
    weaponStats[id3][weaponName].head = weaponStats[id3][weaponName].head + Number(head);
    weaponStats[id3][weaponName].chest = weaponStats[id3][weaponName].chest + Number(chest);
    weaponStats[id3][weaponName].stomach = weaponStats[id3][weaponName].stomach + Number(stomach);
    weaponStats[id3][weaponName].leftarm = weaponStats[id3][weaponName].leftarm + Number(leftarm);
    weaponStats[id3][weaponName].rightarm = weaponStats[id3][weaponName].rightarm + Number(rightarm);
    weaponStats[id3][weaponName].leftleg = weaponStats[id3][weaponName].leftleg + Number(leftleg);
    weaponStats[id3][weaponName].rightleg = weaponStats[id3][weaponName].rightleg + Number(rightleg);
  }
}

function totalWeaponStats() {
  var obj = {};
  for (var id in weaponStats) {
    for (var weapon in weaponStats[id]) {
      if (!obj[weapon]) {
        obj[weapon] = {
          shots: 0,
          hits:0,
          headshots:0
        };
      }
      obj[weapon].shots = obj[weapon].shots + weaponStats[id][weapon].shots;
      obj[weapon].hits = obj[weapon].hits + weaponStats[id][weapon].hits;
      obj[weapon].headshots = obj[weapon].headshots + weaponStats[id][weapon].headshots;
    }
  }
  return obj;
}

function calculatePrecent(small, big) {
  return Math.round((small / big) * 100);
}

/**
 * removes weapon specific data from user object and places it in it's own array
 *
 * @param {Object} user - a user object we need to reconstruct a weapn data array fro
 */
function sortWeapons(user) {
  // console.log(weaponStats);
  var sortArr = [];
  if (!user.id) {
    var allWeaponStats = totalWeaponStats();
    for (weapon in user) {
      var acc = 0;
      var hs = 0;
      var shots = 0;
      var shotsToKill = 0;
      if (isWeapon(weapon) && allWeaponStats[weapon]) {
         shots = allWeaponStats[weapon].shots;
         acc = calculatePrecent(allWeaponStats[weapon].hits, allWeaponStats[weapon].shots);
         hs = calculatePrecent(allWeaponStats[weapon].headshots, allWeaponStats[weapon].shots);
         shotsToKill = Number((allWeaponStats[weapon].shots / allWeaponStats[weapon].kills).toFixed(2));
      }
      sortArr.push([
        weapon,
        user[weapon],
        [shots, acc, hs, shotsToKill]
      ]);
      delete user[weapon];
    }
  } else {
    for (var weapon in user) {
      var acc = 0;
      var hs = 0;
      var shots = 0;
      var shotsToKill = 0;
      if (isWeapon(weapon)) {
        if (weaponStats[user.id] && weaponStats[user.id][weapon]) {
          shots = weaponStats[user.id][weapon].shots;
          acc = calculatePrecent(weaponStats[user.id][weapon].hits, weaponStats[user.id][weapon].shots);
          hs = calculatePrecent(weaponStats[user.id][weapon].headshots, weaponStats[user.id][weapon].shots);
          shotsToKill = Number((weaponStats[user.id][weapon].shots / user.kills).toFixed(2));
          console.log(users[user.id][weapon])
        }
        sortArr.push([
          weapon,
          user[weapon],
          [shots, acc, hs, shotsToKill]
        ]);
        delete user[weapon];
      }
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
  users = {};
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
        io.notifyError(new Error(`Unable to scan directory: ` + err), {
          custom: {
            folder: config.gameServerDir
          }
        });
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
 * get GameDig data from game server
 */
function getServerStatus() {
  Gamedig.query({
    type: 'hl2dm',
    host: config.serverHostname
  }).then((state) => {
    serverStatus = state;
    socket.send(JSON.stringify(serverStatus));
    if (serverStatus.players.length > 0) {
      for (var i = 0; i < serverStatus.players.length; i++) {
        if (serverStatus.players[i].score === Number(serverStatus.raw.rules.mp_fraglimit) && !updated) {
          updated = true;
          setTimeout(cacheTopResponse, 10000);
        }
      }
      if (serverStatus.players[0].name) {
        print(`Players Online`);
      }
      for (var i = 0; i < serverStatus.players.length; i++) {
        if (serverStatus.players[i].name) {
          var name = serverStatus.players[i].name;
          var score = serverStatus.players[i].score.toString();
          var l = ((80 - name.length) - score.length) - 9;
          var space = '';
          for (var n = 1; n < l; n++) {
            space = space + '-';
          }
          console.log(`${name} ${space} score: ${score}`)
        }
      }
    }
  }).catch((error) => {
    serverStatus = 'offline';
  });
}

/**
 * end of month file cleanup process
 */
function cleanUp() {
  var now = new Date();
  console.log(`${now} - Clean up started`);
  var lastMonth = now.setMonth(now.getMonth() - 1);
  var times = new Timer();
  zipDemos(lastMonth).then(zipLogs).then(saveTop).then(_ => {
    var numFiles = 0;
    fs.readdir(logFolder, (err, files) => {
      if (err) {
        io.notifyError(new Error(`Unable to scan directory: ` + err), {
          custom: {
            folder: logFolder
          }
        });
      }
      print(`Running log file clean up`);
      numFiles = numFiles + files.length;
      files.forEach(file => {
        fs.unlinkSync(path.join(logFolder, file));
      });
      fs.readdir(config.gameServerDir, (err, filess) => {
        if (err) {
          io.notifyError(new Error(`Unable to scan directory: ` + err), {
            custom: {
              folder: config.gameServerDir
            }
          });
        }
        print(`Running demo file clean up`);
        var howMany = filess.length;
        numFiles = numFiles + filess.length;
        filess.forEach(file => {
          howMany--;
          if (path.extname(file) === '.dem') {
            fs.unlinkSync(path.join(config.gameServerDir, file));
            if (howMany <= 0) {
              var ended = times.end();
              print(`Clean up complete. ${numFiles} files processed and backed up.`);
              print(`Complete process took ${ended[0]} hours ${ended[1]} minutes  ${ended[2].toFixed(3)} seconds`)
              top = [];
              users = {};
              cacheTopResponse();
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
        io.notifyError(new Error(`Unable to scan directory: ` + err), {
          custom: {
            folder: `${__dirname}/old-top`
          }
        });
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
      totalPlayers
    ]), e => {
      if (e) {
        reject(e);
      }
      if (!fs.existsSync(filename)){
        reject();
      }
      print(`top player data saved to ${__dirname}/old-top/${lastMonth}.json`);
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
    print(`Logs saved as ${config.bulkStorage}/logs/${lastMonth}.zip`);
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
    print(`Demos saved as ${config.bulkStorage}/demos/${lastMonth}.zip`);
    resolve(lastMonth);
  })
}

print(`Getting data`);
cacheTopResponse();
setInterval(cacheTopResponse, 3600000);

getServerStatus();
setInterval(getServerStatus, 5000);

var j = schedule.scheduleJob('0 5 1 * *', cleanUp);

print(`Loading API backend calls`);


fs.watch(logFolder, (event, filename) => {
  console.log(event, filename);
});

/**
 * route for gettings player stats
 */
app.get('/stats', (req, res) => {
  res.send(JSON.stringify([
    top,
    weapons,
    totalPlayers,
    bannedPlayers
  ]));
});

/**
 * route for gettings the status of the game server
 */
app.get('/status', (reg, res) => {
  res.send(serverStatus);
});

/**
 * route for downloading current months demo file
 */
app.get('/download/:file', (reg, res) => {
  var dl = `${config.gameServerDir}/${reg.params.file}`;
  if (!fs.existsSync(dl)){
    return res.status(404).send('File does not exist');
  }
  print(`File downloaded ${dl}`);
  res.download(dl, reg.params.file);
});

/**
 * route for downloading a previous months logs zip files
 */
app.get('/download/logs-zip/:file', (reg, res) => {
  var dl = `/media/nas/old-stats/logs/${reg.params.file}`;
  if (!fs.existsSync(dl)){
    return res.status(404).send('File does not exist');

  }
  print(`File downloaded ${dl}`);
  res.download(dl, reg.params.file);
});

/**
 * route for downloading a previous months demo zip files
 */
app.get('/download/demos-zip/:file', (reg, res) => {
  var dl = `/media/nas/old-stats/demos/${reg.params.file}`;
  if (!fs.existsSync(dl)){
    return res.status(404).send('File does not exist');

  }
  print(`File downloaded ${dl}`);
  res.download(dl, reg.params.file);
});

/**
 * route for getting a list of svaliable old months data
 */
app.get('/old-months', (reg, res) => {
  getOldStatsList().then(stats => {
    res.send(stats);
  }).catch(e => {
    res.status(404).send('File does not exist');
  });
});

/**
 * route for getting a old months stats data
 */
app.get('/old-stats/:month', (reg, res) => {
  getOldStatsList(reg.params.month).then(stats => {
    res.send(stats);
  }).catch(e => {
    res.status(404).send('no stats exist for this month');
  });
});

/**
 * route to get list of demo recording on the server
 */
app.get('/demos', (reg, res) => {
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
   res.send(arr);
  });
});

/**
 * authorize stream upload
 *
 * @param {String} req.query.name - the name of the stream
 * @param {String} req.query.k - the streams auth key
 */
app.get('/auth', (req, res) => {
  var name = req.query.name;
  var pass = req.query.k;
  if (!config.streamKeys[name]) {
    return res.status(404).send('fail');
  }
  bcrypt.compare(pass, config.streamKeys[name], (err, match) => {
    if (err) {
      io.notifyError(new Error(`Error hashing password: ` + err), {
        custom: {
          user: name
        }
      });
      return console.error(err);
    }
    if (!match) {
      return res.status(404).send('fail');
    }
    return res.send('ok');
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
 * route for 404
 */
app.get('*', (req, res) => {
  res.status(404).sendFile(`${__dirname}/html/404.html`);
});

app.listen(3000);

print(`API is now active on port 3000`);
print(`log folder = ${logFolder}`);
