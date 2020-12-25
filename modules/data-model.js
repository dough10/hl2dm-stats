/**
 * data module.
 * @module data-model
 */

const geoip = require('geoip-lite');


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
 * @param {String} weapon.name - name of the weapon
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
 * @param {Object} user - a user object
 */
function sortWeapons(user) {
  var sortArr = [];
  for (var weapon in user) {
    if (require('./weaponsCheck.js')(weapon)) {
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
 * merger all physics, physbox & world kills to physics kills 
 *
 * @param {Object} user - a user object
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
    delete user.physics
  }
}


/**
 *  DATA!!!!!!
 */
module.exports = class Data {
  /**
   * Data
   * @constructor
   */
  constructor() {
    this.users = {};                // object of all users and their data
    this.bannedUsers = {};          // object of players who have been banned
    this.totalPlayers = 0;          // total # of players to have joined the server / been added to this.users object
    this.weapons = {};              // server wide weapon data not specific to any player
    this.demos = [];                // {Array} array of demo Files
    this.gameStatus = {};
    this.playerTimes = {};
    // imported function
    this.getNewUsers = require('./getNewUsers.js');
    this.getReturnUsers = require('./getReturnUsers.js');
    this.authorize = require('./auth.js');
  }
  /**
   * gets the current status of gameserver
   */
  getStatus() {
    return this.gameStatus;
  }

  /**
   * update game server status
   * 
   * @param {Object} status - the game server status from Gamedig 
   */
  updateStatus(status) {
    this.gameStatus = status;
  }

  /**
   * reset data objects
   */
  reset() {
    this.users = {};
    this.bannedUsers = {};
    this.totalPlayers = 0;
    this.weapons = {};
    this.demos = [];
    console.log(`${new Date().toLocaleString().yellow} - Data model reset`);
  }

  /**
   * player has connected to thje server
   *
   * @param {Number} time - time the suicide happened
   * @param {String} id - steamid
   * @param {String} name - player name
   * @param {String} ip - ip address of the connected user
   * 
   * @returns {Boolean} true: new player, false: been bere before
   */
  playerConnect(time, id, name, ip) {
    var newUser = false;
    if (!this.users[id]) {
      this.users[id] = playerObj(name, id, time, ip);
      newUser = true;
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
   * creates a array of players with kills greater than or equal to 100
   * 
   * @returns {Array} list of players with kills greater than or equal to 100
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
   * @returns {Array} returns list of weapons sorted by kill count
   */
  generateWeapons() {
    let obj = { ... this.weapons };
    mergePhysicsKills(obj);
    return sortWeapons(obj);
  }

  /**
   * creates a array of players who have been banned
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
   * creates a obj of a individual players stats
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
    return false;
  }

  /**
   * returns the player name of the given ip address
   * 
   * @param {String} ip - ip address from Express
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
   * calculates stats when a kill takes place
   *
   * @param {Number} time - time the kill happened
   * @param {Object} killer - player details
   * @param {Object} killed - player details
   * @param {String} weapon - name of the weapon used
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
   * calculates stats when a suicide takes place
   *
   * @param {Number} time - time the suicide happened
   * @param {String} id - steamid
   * @param {String} name - player name
   * @param {String} weapon - name of the weapon used
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
   * @param {String} id - steamid
   * @param {String} name - player name
   * @param {String} weapon - name of the weapon used
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
   * @param {String} id - steamid
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
  }

  /**
   * add change to user object
   *
   * @param {Number} time - time the headshot happened
   * @param {String} id - steamid
   * @param {String} name - player name
   * @param {String} said - chat line with timestamp
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
   * @param {String} id - steamid
   * @param {String} name - player name
   * @param {Object} weapon - object of weapn data
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
   * @param {String} id - steamid
   * @param {String} name - player name
   * @param {object} weapon - object of weapn data
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
   */
  cacheDemos() {
    require('./cacheDemos.js')().then(demos => {
      this.demos = demos;
    });
  }

  /**
   * end of month file cleanup process
   */
  runCleanup() {
    require('./fileCleanup.js')(
      this.generateTop(), 
      this.generateWeapons(), 
      this.totalPlayers, 
      this.generateBannedPlayerList(), 
      new Date().getTime()
    )
  }
} 
