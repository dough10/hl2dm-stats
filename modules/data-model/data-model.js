/*jshint esversion: 9 */

/**
 * Class to hold and manipulate the app data
 * @fileOverview data Class 
 * @module data-model
 * @author Jimmy Doughten <https://github.com/dough10>
 * @requires geoip-lite
 * @requires modules/Timer
 * @exports Data
 * @example <caption>Example usage of Data class.</caption>
 * var Datamodel = require('modules/data-model/data-model');
 * var appData = new Datamodel();
 * // call some functions
 */
const geoip = require('geoip-lite');
const Timer = require('../Timer/Timer.js');

/** 
 * get the length / size of a object
 * @returns {Number} count of items in the object
 * 
 * @example <caption>Example usage of Object.size() function.</caption>
 * var totalPlayers = Object.size(users); 
 */
Object.size = obj => {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

/**
 * returns a player object
 *
 * @param {String} name - name mof the player
 * @param {String} id - player steamID
 * @param {Number} time - new Date().getTime() output
 * @param {String} ip - users ip address
 * 
 * @returns {Object} object with the passed in data and some 0 values
 * 
 * @example <caption>Example usage of playerObj() function.</caption>
 * var bob = playerObj('bob', '374586912', 1609123414390, '25.65.8.357');
 * // console.log(bob) = {
 * //   name: 'bob',
 * //   id: '374586912',
 * //   ip: '25.65.8.357',
 * //   geo: [object Object],
 * //   kills: 0,
 * //   deaths: 0,
 * //   kdr: 0,
 * //   banned: false,
 * //   suicide: {
 * //     count:0
 * //   },
 * //   updated: 1609123414390,
 * //   chat: []
 * // }
 */
function playerObj(name, id, time, ip) {
  return {
    name: name,
    id: id,
    ip: ip,
    geo: geoip.lookup(ip),
    kills: 0,
    deaths: 0,
    kdr: 0,
    banned: false,
    suicide: {
      count:0
    },
    updated: time,
    chat: []
  };
}

/**
 * returns defualt weapon object
 * 
 * @returns {Object} weapon object
 * 
 * @example <caption>Example usage of weaponObj() function.</caption>
 * var bob = playerObj('bob', '374586912', 1609123414390, '25.65.8.357');
 * bob['357'] = weaponObj();
 * // console.log(bob['357']) = {
 * //     kills: 0,
 * //     shots: 0,
 * //     hits: 0,
 * //     headshots: 0,
 * //     head: 0,
 * //     chest: 0,
 * //     stomach: 0,
 * //     leftarm: 0,
 * //     rightarm: 0,
 * //     leftleg: 0,
 * //     rightleg:0,
 * //     damage:0,
 * //     hss:0,
 * //     lss:9999
 * //   }
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
 * returns % value
 *
 * @param {Number} small - small #
 * @param {Number} big - big #
 * 
 * @returns {Number} precentage
 * 
 * @example <caption>Example usage of calculatePrecent() function.</caption>
 * var precent = calculatePrecent(60, 100);
 * // console.log(precent) = 60
 */
function calculatePrecent(small, big) {
  return Math.round((small / big) * 100);
}

/**
 * calculates weapon stats values ie shots per kill, average damage per hit, headshot %, and more
 *
 * @param {String} weapon.name - name of the weapon
 * @param {Object} weapon - stats associated with the named weapon
 * 
 * @returns {Array} weapon stats
 * 
 * @example <caption>Example usage of calculateWeaponStats() function.</caption>
 * var bob = playerObj('bob', '374586912', 1609123414390, '25.65.8.357');
 * bob['357'] = weaponObj();
 * bob.weapons['357'] = calculateWeaponStats('357', bob['357']);
 * delete bob['357'];
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
 * @param {Object} user - user object
 * 
 * @returns {Array} array of weapons sorted by kill count
 * 
 * @example <caption>Example usage of sortWeapons() function.</caption>
 * var bob = playerObj('bob', '374586912', 1609123414390, '25.65.8.357');
 * bob['357'] = weaponObj();
 * // got some kills 
 * bob.weapons = sortWeapons();
 */
function sortWeapons(user) {
  var sortArr = [];
  for (var weapon in user) {
    if (require('../weaponsCheck.js')(weapon)) {
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
 * merge all physics kills, physbox & world kills to physics kills 
 *
 * @param {Object} user - a user object
 * 
 * @returns {void} Nothing
 * 
 * @example <caption>Example usage of sortWeapons() function.</caption>
 * var bob = playerObj('bob', '374586912', 1609123414390, '25.65.8.357');
 * bob['357'] = weaponObj();
 * mergePhysicsKills(bob);
 * bob.weapons = sortWeapons();
 */
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
    delete user.physics;
  }
}


/**
 * Class to hold and manipulate the app data
 * @class
 */
class Data {

  /**
   * @constructor
   * 
   * @returns {void} Nothing
   */
  constructor() {
    this.users = {};                // object of all users and their data
    this.bannedUsers = {};          // object of players who have been banned
    this.totalPlayers = 0;          // total # of players to have joined the server / been added to this.users object
    this.weapons = {};              // server wide weapon data not specific to any player
    this.demos = [];                // array of demo Files
    this.gameStatus = {};
    this.playerTimes = {};
    // imported function
    this.getNewUsers = require('../getNewUsers.js');
    this.getReturnUsers = require('../getReturnUsers.js');
    this.authorize = require('../auth/auth.js');
  }

  /**
   * gets the status stored for the gameserver
   * 
   * @returns {Object} game server status
   * 
   * @example <caption>Example usage of getStatus() function.</caption>
   * var status = appData.getStatus();
   */
  getStatus() {
    return this.gameStatus;
  }

  /**
   * update stored gameserver status
   * 
   * @param {Object} status - set the  game server status from Gamedig 
   * 
   * @returns {void} Nothing
   * 
   * @example <caption>Example usage of updateStatus() function.</caption>
   * appData.updateStatus({
   *  // game server status object
   * });
   */
  updateStatus(status) {
    this.gameStatus = status;
  }

  /**
   * reset data model
   * 
   * @returns {Promise<String>} alert message notifying the change to data
   * 
   * @example <caption>Example usage of reset() function.</caption>
   * appData.reset().then(resetString => {
   * // console.log(resetString) = `Data model reset`
   * });
   */
  reset() {
    return new Promise((resolve, reject) => {
      this.users = {};
      this.bannedUsers = {};
      this.totalPlayers = 0;
      this.weapons = {};
      this.demos = [];
      resolve(`Data model reset`);
    });
  }

  /**
   * a player has connected to the game server
   *
   * @param {Number} time - time the connection happened
   * @param {String} id - steamid3 of the connecting player
   * @param {String} name - player name of the connection player
   * @param {String} ip - ip address of the connection player
   * 
   * @returns {Boolean} true: new for a player, false: if they have been here before
   * 
   * @example <caption>Example usage of playerConnect() function.</caption>
   * var newUser = appData.playerConnect(time, id, name, ip);
   * if (!newUser) {
   *   // do a thing
   * }
   * // do something else
   */
  playerConnect(time, id, name, ip) {
    this.playerTimes[id] = new Timer(name);
    var newUser = false;
    if (!this.users[id]) {
      this.users[id] = playerObj(name, id, time, ip);
      newUser = true;
    }
    if (!this.users[id].ip) {
      this.users[id].ip = ip;
      this.users[id].geo = geoip.lookup(ip);
    }
    if (time >= this.users[id].updated) {
      // update address
      this.users[id].ip = ip;
      // update user name if changed
      this.users[id].updated = time;
      this.users[id].name = name;
    }
    return newUser;
  }

  /**
   * a player has connected to the game server
   *
   * @param {String} id - steamid3 of the connecting player
   * 
   * @returns {Promise<String>} timer object string
   * 
   * @example <caption>Example usage of playerDisconnect() function.</caption>
   * appData.playerDisconnect(id).then(timeOnline => {
   * // console.log(timeOnline) = '0 hours 10 minutes 15.347 seconds'
   * });
   */
  playerDisconnect(id) {
    return new Promise((resolve, reject) => {
      var time;
      if (this.playerTimes[id]) {
        time = this.playerTimes[id].endString();
        delete this.playerTimes[id];
      }
       resolve(time);
    });
  }

  /**
   * creates a array of players with greater than or equal to 100 kills
   * 
   * @returns {Array} list of players and their statistics
   * 
   * @example <caption>Example usage of generateTop() function.</caption>
   * var top = appData.generateTop();
   * // console.log(top) = [
   * //   { .. player },
   * //   { .. another player }
   * // ]
   */
  generateTop() {
    var arr = [];
    this.totalPlayers = Object.size(this.users);   // total # of players to have joined the server
    for (var user in this.users) {
      // push non banned players with greater then or equal to 100 kills to "top" Array
      if (this.users[user].kills >= 100 && !this.users[user].banned) {
        var obj = { ... this.users[user] };
        mergePhysicsKills(obj);
        obj.weapons = sortWeapons(obj);
        arr.push(obj);
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
   * creates a array of weapon data
   * 
   * @returns {Array} list of weapons sorted by kill count
   * 
   * @example <caption>Example usage of generateWeapons() function.</caption>
   * var weaponsData = appData.generateWeapons();
   */
  generateWeapons() {
    let obj = { ... this.weapons };
    mergePhysicsKills(obj);
    return sortWeapons(obj);
  }

  /**
   * creates a array of players who have been banned
   * 
   * @returns {Array} list of players
   * 
   * @example <caption>Example usage of generateBannedPlayerList() function.</caption>
   * var bannedPlayers = appData.generateBannedPlayerList(); 
   */
  generateBannedPlayerList() {
    var arr = [];
    for (var player in this.bannedUsers) {
      var obj = { ... this.bannedUsers[player] };
      mergePhysicsKills(obj);
      obj.weapons = sortWeapons(obj);
      arr.push(obj);
    }
    return arr;
  }

  /**
   * creates a object of a individual players stats
   * 
   * @returns {Object} players statistis 
   * 
   * @example <caption>Example usage of generatePlayerStats() function.</caption>
   * var playerStats = appData.generatePlayerStats();
   */
  generatePlayerStats(playerId) {
    for (var u in this.users) {
      if (playerId === u) {
        var obj = { ... this.users[u] };
        mergePhysicsKills(obj);
        obj.weapons = sortWeapons(obj);
        return obj;
      }
    }
    return;
  }

  /**
   * returns the player name associated with the passed in ip address
   * 
   * @param {String} ip - ip address from Express req.ip
   * 
   * @returns {String} name of a player, or the passed in ip address 
   * 
   * @example <caption>Example usage of who() function.</caption>
   * var who = appData.who(24.564.76.24);
   * // console.log(who) = 'bob'
   */
  who(ip) {
    var i = ip;
    for (var id in this.users)  {
      if (this.users[id].ip === i) {
        i = this.users[id].name;
      }
    }
    if (i === '::1') i = 'LAN User';
    return i;
  }

  /**
   * calculates player stats when a kill takes place
   *
   * @param {Number} time time the kill happened
   * @param {Object} killer player details
   * @param {String} killer.id steamid of the killer
   * @param {String} killer.name name of the player who scored the kill
   * @param {Object} killed player details
   * @param {String} killed.id steamid of the killed player
   * @param {String} killed.name name of the player killed
   * @param {String} weapon name of the weapon used
   * 
   * @returns {void} Nothing
   * 
   * @example <caption>Example usage of addKill() function.</caption>
   * appData.addKill(1609123414390, {...}, {...}, '357');
   */
  addKill(time, killer, killed, weapon) {

    // killer object
    if (!this.users[killer.id]) {
      this.users[killer.id] = playerObj(killer.name, killer.id, time);
    }

    // killed object
    if (!this.users[killed.id]) {
      this.users[killed.id] = playerObj(killed.name, killed.id, time);
    }
    
    // add weapon for killer if doesn't exist
    if (!this.users[killer.id][weapon]) {
      this.users[killer.id][weapon] = weaponObj();
    }
    
    if (!this.weapons[weapon]) {
      this.weapons[weapon] = weaponObj();
    }
    
    // update killer name
    if (time >= this.users[killer.id].updated) {
      this.users[killer.id].updated = time;
      this.users[killer.id].name = killer.name;
    }

    // update killed name
    if (time > this.users[killed.id].updated) {
      this.users[killed.id].updated = time;
      this.users[killed.id].name = killed.name;
    }

    // add killers kill
    this.users[killer.id].kills++;

    // add killed player death
    this.users[killed.id].deaths++;

    // add killer kill with weapon
    this.users[killer.id][weapon].kills++;

    // add server wide kill with weapon
    this.weapons[weapon].kills++;

    // calculate killer KDR
    this.users[killer.id].kdr = Number((this.users[killer.id].kills / this.users[killer.id].deaths).toFixed(2));

    // if killer has not died KDR will be # of kills
    if (this.users[killer.id].kdr === Infinity) {
      this.users[killer.id].kdr = this.users[killer.id].kills;
    }

    // calculate killed KDR
    this.users[killed.id].kdr = Number((this.users[killed.id].kills / this.users[killed.id].deaths).toFixed(2));
  }

  /**
   * calculates players stats when a suicide takes place
   *
   * @param {Number} time - time the suicide happened
   * @param {String} id - steamid3 of the player
   * @param {String} name - players name
   * @param {String} weapon - name of the weapon used
   * 
   * @returns {void} Nothing
   * 
   * @example <caption>Example usage of addSuicide() function.</caption>
   * appData.addSuicide(1609123414390, '374586912', 'bob', '357');
   */
  addSuicide(time, id, name, weapon) {
    if (!this.users[id]) {
      this.users[id] = playerObj(name, id, time);
    }
    if (time >= this.users[id].updated) {
      this.users[id].updated = time;
      this.users[id].name = name;
    }
    this.users[id].kills--;
    this.users[id].deaths++;
    this.users[id].suicide.count++;
    this.users[id].kdr = Number((this.users[id].kills / this.users[id].deaths).toFixed(2));
    if (!this.users[id].suicide[weapon]) {
      this.users[id].suicide[weapon] = 0;
    }
    this.users[id].suicide[weapon]++;
    if (!this.weapons[weapon]) {
      this.weapons[weapon] = weaponObj();
    }
    this.weapons[weapon].kills++;
  }

  /**
   * calculates stats when a headshot takes place
   *
   * @param {Number} time - time the headshot happened
   * @param {String} id - steamid3 of the player
   * @param {String} name - player name
   * @param {String} weapon - name of the weapon used
   * 
   * @returns {void} Nothing
   * 
   * @example <caption>Example usage of addHeadshot() function.</caption>
   * appData.addHeadshot(1609123414390, '374586912', 'bob'):
   */
  addHeadshot(time, id, name) {
    if (!this.users[id]) {
      this.users[id] = playerObj(name, id, time);
    }
    if (!this.users[id].headshots) {
      this.users[id].headshots = {
        kills:0
      };
    }
    this.users[id].headshots.kills++;
    if (time >= this.users[id].updated) {
      this.users[id].updated = time;
      this.users[id].name = name;
    }
    if (!this.weapons.headshots) {
      this.weapons.headshots = {
        kills:0
      };
    }
    this.weapons.headshots.kills++;
  }

  /**
   * add player to the banned list
   *
   * @param {String} id - steamid3 of the player
   * 
   * @returns {JSON} player object
   * 
   * @example <caption>Example usage of addBanned() function.</caption>
   * var player = appData.addBanned('374586912');
   */
  addBanned(id) {
    if (!this.users[id]) {
      this.users[id] = {
        id: id,
        banned: true
      };
    }
    // mark player as banned
    this.users[id].banned = true;
    this.bannedUsers[id] = this.users[id];
    // data to be returned
    var r = { ... this.bannedUsers[id] };
    r.weapons = sortWeapons(r);
    delete r.weapons;
    delete r.banned;
    delete r.kills;
    delete r.deaths;
    delete r.kdr;
    delete r.suicide;
    return r;
  }

  /**
   * add change to user object
   *
   * @param {Number} time - time the headshot happened
   * @param {String} id - steamid3 of the player
   * @param {String} name - player name
   * @param {String} said - chat line with timestamp
   * 
   * @returns {void} Nothing
   * 
   * @example <caption>Example usage of addChat() function.</caption>
   * appData.addChat(1609123414390, '374586912', 'bob', 'nice shot!');
   */
  addChat(time, id, name, said) {
    // create user object if it doesn't exist
    if (!this.users[id]) {
      this.users[id] = playerObj(name, id, time);
    }
    // update player name if it has changed
    if (time >= this.users[id].updated) {
      this.users[id].updated = time;
      this.users[id].name = name;
    }
    this.users[id].chat.push(said);
  }

  /**
   * add weapon stats to player object
   *
   * @param {Number} time - time the headshot happened
   * @param {String} id - steamid3 of the player
   * @param {String} name - player name
   * @param {Object} weapon - object of weapn data
   * 
   * @returns {void} Nothing
   * 
   * @example <caption>Example usage of addWeaponStats() function.</caption>
   * appData.addWeaponStats(1609123414390, '374586912', 'bob', {name: '357' ... });
   */
  addWeaponStats(time, id, name, weapon) {
    if (!this.users[id]) {
      this.users[id] = playerObj(name, id, time);
    }
    if (!this.users[id][weapon.name]) {
      this.users[id][weapon.name] = weaponObj();
    }
    // highest damage single shot
    if (weapon.hits === 1 && weapon.damage > this.users[id][weapon.name].hss) {
      this.users[id][weapon.name].hss = weapon.damage;
    }
    // lowest damage single shot
    if (weapon.hits === 1 && weapon.damage < this.users[id][weapon.name].lss && weapon.damage !== 0) {
      this.users[id][weapon.name].lss = weapon.damage;
    }
    // running total of values for player
    this.users[id][weapon.name].shots += weapon.shots;
    this.users[id][weapon.name].hits += weapon.hits;
    this.users[id][weapon.name].headshots += weapon.hs;
    this.users[id][weapon.name].damage += weapon.damage;
    // server wide weapon stats data object
    if (!this.weapons[weapon.name]) {
      this.weapons[weapon.name] = weaponObj();
    }
    // highest single shot damage
    if (weapon.hits === 1 && weapon.damage > this.weapons[weapon.name].hss) {
      this.weapons[weapon.name].hss = weapon.damage;
    }
    // lowest single shot damage
    if (weapon.hits === 1 && weapon.damage < this.weapons[weapon.name].lss && weapon.damage !== 0) {
      this.weapons[weapon.name].lss = weapon.damage;
    }
    // running total of values for server
    this.weapons[weapon.name].shots += weapon.shots;
    this.weapons[weapon.name].hits += weapon.hits;
    this.weapons[weapon.name].headshots += weapon.hs;
    this.weapons[weapon.name].damage += weapon.damage;
  }

  /**
   * add weapon stats to player object
   *
   * @param {Number} time - time the headshot happened
   * @param {String} id - steamid3 of the player
   * @param {String} name - player name
   * @param {object} weapon - object of weapn data
   * 
   * @returns {void} Nothing
   * 
   * @example <caption>Example usage of addWeaponStats2() function.</caption>
   * appData.addWeaponStats2(1609123414390, '374586912', 'bob', {name: '357' ... });
   */
  addWeaponStats2(time, id, name, weapon) {
    if (!this.users[id]) {
      this.users[id] = playerObj(name, id, time);
    }
    if (!this.users[id][weapon.name]) {
      this.users[id][weapon.name] = weaponObj();
    }
    this.users[id][weapon.name].head += Number(weapon.head);
    this.users[id][weapon.name].chest += Number(weapon.chest);
    this.users[id][weapon.name].stomach += Number(weapon.stomach);
    this.users[id][weapon.name].leftarm += Number(weapon.leftarm);
    this.users[id][weapon.name].rightarm += Number(weapon.rightarm);
    this.users[id][weapon.name].leftleg += Number(weapon.leftleg);
    this.users[id][weapon.name].rightleg += Number(weapon.rightleg);
    if (!this.weapons[weapon.name]) {
      this.weapons[weapon.name] = weaponObj();
    }
    this.weapons[weapon.name].head += Number(weapon.head);
    this.weapons[weapon.name].chest += Number(weapon.chest);
    this.weapons[weapon.name].stomach += Number(weapon.stomach);
    this.weapons[weapon.name].leftarm += Number(weapon.leftarm);
    this.weapons[weapon.name].rightarm += Number(weapon.rightarm);
    this.weapons[weapon.name].leftleg += Number(weapon.leftleg);
    this.weapons[weapon.name].rightleg += Number(weapon.rightleg);
  }

  /**
   * caches list of avaliable demo files
   * 
   * @async
   * 
   * @returns {void} Nothing
   * 
   * @example <caption>Example usage of cacheDemos() function.</caption>
   * appData.cacheDemos();
   */
  cacheDemos() {
    require('../cacheDemos/cacheDemos.js')().then(demos => {
      this.demos = demos;
    });
  }

  /**
   * runs end of month file cleanup process
   * @see <a href=../fileCleanup/fileCleanup-doc.md>fileCleanup-doc.md</a>
   * 
   * @returns {void} Nothing
   * 
   * @example <caption>Example usage of runCleanup() function.</caption>
   * appData.runCleanup();
   */
  runCleanup() {
    require('../fileCleanup/fileCleanup')(
      this.generateTop(), 
      this.generateWeapons(), 
      this.totalPlayers, 
      this.generateBannedPlayerList(), 
      new Date().getTime()
    );
  }
} 


module.exports = Data;