const SteamID = require('steamid');                       // work with steamid's
const path = require('path');                             // merger file / url names
const isWeapon = require(path.join(__dirname, 'weaponsCheck.js'));

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
 * scans the line for landmarks in order to get usable strings of data
 *
 * @param {String} line - one line of the log file being parsed
 */
function scanLine(line, users, weapons, bannedPlayers) {
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
    if (hits === 1 && damage > weapons[weaponName].hss) {
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
 * check if ip  address is valid
 *
 * @param {String} ip - ip address
 */
function validateIPaddress(ip) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}

module.exports = scanLine;
