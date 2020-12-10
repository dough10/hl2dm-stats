const fs = require('fs');                                 // work with the file system
const path = require('path');                             // merger file / url names
const readline = require('readline');                     // read file one line at a time
const colors = require('colors');                         // colorize text
var config = require(`../config.json`);                    // config file location
const print = require(path.join(__dirname, 'printer.js'));
const scanLine = require(path.join(__dirname, 'lineScanner.js'));
const Timer = require(path.join(__dirname, 'Timer.js'));
const isWeapon = require(path.join(__dirname, 'weaponsCheck.js'));
if (process.platform === "win32") {
  config = require(`../config-win.json`);  
}
const logFolder = path.join(config.gameServerDir, 'logs');// game server log location

Object.size = obj => {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

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
function sortUsersByKDR(users) {
  var arr = [];
  totalPlayers = Object.size(users);   // total # of players to has joined the server
  for (var user in users) {
    // push non banned players with over 100 kills to "top" Array
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
 * get list of log files and send to scanner line by line
 */
function parseLogs(users, weapons, bannedPlayers, totalPlayers) {
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
              resolve(sortUsersByKDR(users, totalPlayers));
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
 * stores top data in memory for fast response times
 * cleans up un nessacery entrys and merges physics kills,
 * sorts weapons into array and out of the main object
 */
function cacheTopResponse(top, users, weapons, bannedPlayers, totalPlayers, lastUpdate, updated) {
  return new Promise((resolve, reject) => {

    var time = new Timer();

    print(`Clearing cache & parsing logs`);
    // reset objects
    users = {};
    weapons = {};
    bannedPlayers = {};

    parseLogs(top, users, weapons, bannedPlayers, totalPlayers).then(stats => {
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
      console.log(top)

      
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

module.exports = cacheTopResponse;