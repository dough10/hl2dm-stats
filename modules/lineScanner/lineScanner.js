/**
 * @module modules/lineScanner
 * @author Jimmy Doughten <https://github.com/dough10>
 * @requires steamid
 * @requires modules/weaponsCheck
 * @requires modules/printer
 * @exports scanLine
 */
const SteamID = require('steamid');
const isWeapon = require('../weaponsCheck/weaponsCheck.js');
const print = require('../printer/printer.js');
const playerTimes = {};

/**
 * check if ip  address is valid
 * @param {String} ip - ip address
 * 
 * @returns {Boolean} true: validated, false: failed
 * 
 * @example <caption>Example usage of validateIPAddress() function.</caption>
 * console.log(validateIPaddress('192.168.0.1')); = true
 */
function validateIPaddress(ip) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}

/**
 * scans the line for file start
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} reads as Boolean value. true: is the index of the landmark word, false: word was not present
 * 
 * @example <caption>Example usage of isFileStart() function.</caption>
 * isFileStart([
 *   'list',
 *   'of',
 *   'words',
 *   'to',
 *   'check'
 * ]);
 */
function isFileStart(word) {
  for (var i = 0 ; i < word.length; i++) {
    if (word[i] === 'started' && word[i - 1] === 'file' && word[i - 2] === 'Log') {
      return i;
    }
  }
  return false;
}

/**
 * scans the line for file end
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} reads as Boolean value. true: is the index of the landmark word, false: word was not present
 * 
 * @example <caption>Example usage of isFileEnd() function.</caption>
 * isFileEnd([
 *   'list',
 *   'of',
 *   'words',
 *   'to',
 *   'check'
 * ]);
 */
function isFileEnd(word) {
  for (var i = 0; i < word.length; i++) {
    if (word[i] === 'closed.' && word[i - 1] === 'file' && word[i - 2] === 'Log') {
      return i;
    }
  }
  return false;
}

/**
 * returns the player name string
 * @param {String} word - player name string
 * 
 * @returns {String} players name
 * 
 * @example <caption>Example usage of getName() function.</caption>
 * var name = getName([
 *   'list',
 *   'of',
 *   'words',
 *   'to',
 *   'check'
 * ]);
 */
function getName(word) {
  if (!word) {
    return false;
  }
  word = word.replace('"', '');
  var end = word.search(/<([1-9][0-9]{0,2}|1000)></);
  var str = '';
  for (var i = 0; i < end; i++) {
    str = str + word[i];
  }
  return str;
}

/**
 * returns the player steamID in format 2
 * @param {String} word - player name string
 * 
 * @returns {String} players steamid in steamid2 format
 * 
 * @example <caption>Example usage of getID2() function.</caption>
 * var steamid = getID2([
 *   'list',
 *   'of',
 *   'words',
 *   'to',
 *   'check'
 * ]);
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
  word = word.substring(start);
  const end = word.search('>');
  let str = '';
  for (var i = 0; i < end; i++) {
    str = str + word[i];
  }
  return str;
}

/**
 * returns the player steamID in format 3
 * @param {String} word - player name string
 * 
 * @returns {String} returns players SteamID in steamid3 format without [U:1:XXXXXXXXX] jsut the numbers
 * 
 * @example <caption>Example usage of getID3() function.</caption>
 * var steamid = getID3([
 *   'list',
 *   'of',
 *   'words',
 *   'to',
 *   'check'
 * ]);
 */
function getID3(word) {
  if (!word) {
    return false;
  }
  let u = word.search(/U:[0-1]:/);
  if (u < 0) {
    return false;
  }
  let start = u + 4;
  word = word.substring(start);
  let end = word.search(']');
  let str = '';
  for (var i = 0; i < end; i++) {
    str = str + word[i];
  }
  return str;
}

/**
 * if a string of text a time string
 * @param {String} str - player name string
 * 
 * @returns {Boolean} true: string is a time string, false: is not time string
 * 
 * console.log(isTime('12:59:59')); = true
 */
function isTime(str) {
  return /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d):$/.test(str);
}

/**
 * builds a name string if name was broken by .split()
 * @param {Array} line - one line from a log file broken at spaces
 * @param {Number} end - index point of the end of the name string
 * 
 * @returns {String} returns killers name
 * 
 * @example <caption>Example usage of buildKillerNameString() function.</caption>
 * var killer = buildKillerNameString([
 *   'list',
 *   'of',
 *   'words',
 *   'to',
 *   'check',
 *   '.'
 * ], 6);
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
  return name;
}

/**
 * builds a name string if name was broken by .split()
 * @param {Array} line - one line from a log file broken @ spaces
 * @param {Number} start - index point of the start of the name string
 * 
 * @returns {String} returns killed player name string 
 * 
 * @example <caption>Example usage of buildKilledNameString() function.</caption>
 * var killed = buildKilledNameString([
 *   'list',
 *   'of',
 *   'words',
 *   'to',
 *   'check',
 *   '.'
 * ], 4);
 */
function buildKilledNameString(line, start) {
  var end = 7;
  for (var i = start; i < line.length; i++) {
    if (line[i] === 'with') {
      end = i;
    }
  }
  var name = '';
  for (let i = start; i < end; i++) {
    name = `${name}${line[i]} `;
  }
  return name;
}

/**
 * scans the line for player kill
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} reads as Boolean value. true: is the index of the landmark word, false: word was not present
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
 * scans the line for player connection
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} reads as Boolean value. true: is the index of the landmark word, false: word was not present
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
 * scans the line for suicide
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} reads as Boolean value. true: is the index of the landmark word, false: word was not present
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
 * scans the line for chat
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} reads as Boolean value. true: is the index of the landmark word, false: word was not present
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
 * scans the line for headshot
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} reads as Boolean value. true: is the index of the landmark word, false: word was not present
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
 * scans the line for weaponstats
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} reads as Boolean value. true: is the index of the landmark word, false: word was not present
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
 * scans the line for weaponstats2
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} reads as Boolean value. true: is the index of the landmark word, false: word was not present
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
 * scans the line for console message
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} reads as Boolean value. true: is the index of the landmark word, false: word was not present
 */
function lineIsConsole(line) {
  var ipstring = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):\d{4,5}$/;
  for (var i = 0; i < line.length; i++) {
    let addr = line[i + 2];
    if (!addr) return false;
    if (line[i] === 'rcon' && line[i + 1] === 'from' && ipstring.test(line[i + 2].slice(0, -1).replace('"', '').replace('"', ''))) {
      return i;
    }
  }
  return false;
}

/**
 * scans the line for ban
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} reads as Boolean value. true: is the index of the landmark word, false: word was not present
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
 * scans the line for player disconnect
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} reads as Boolean value. true: is the index of the landmark word, false: word was not present
 */
function playerHasDisconnected(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === 'disconnected') {
      return i;
    }
  }
  return false;
}

/**
 * scans the line for time
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} reads as Boolean value. true: is the index of the landmark word, false: word was not present
 */
function getLineTime(line) {
  for (var i = 0; i < line.length; i++) {
    if (isTime(line[i])) {
      return new Date(`${line[i].slice(0, -1)} ${line[i - 2]}`).getTime();
    }
  }
  return false;
}

var startDebounceTime = 0;
var endDebounceTime = 0;

/**
 * scans the line for usable data for the data-model   **update params**
 *
 * @param {Array} line - one line of the log file being parsed split at spaces
 * @param {Function} onKill - callback for when a player gets a kill
 * @param {Function} onChat - callback for when a player chats
 * @param {Function} onSuicide - callback for when a player killer themselves
 * @param {Function} onHeadshot - callback for when a player gets a headshot 
 * @param {Function} onStats - callback for when a player stats is posted
 * @param {Function} onStats2 - callback for when a player stats2 is posted
 * @param {Function} onJoin - callback when player joins server @link api-doc.md#module_api..userConnected
 * @param {Function} onDisconnect - callback when player leaves server @link api-doc.md#module_api..userDisconnected
 * @param {Function} onMapStart - callback when the map begins @link api-doc.md#apimapstart
 * @param {Function} onMapEnd - callback when the map ends @link api-doc.md#apimapend
 * @param {Boolean} loggingEnabled - log to console. (used to avoid spam when scanning logs when getting data from realtime from rcon logs)
 */
function scanLine(line, onKill, onChat, onSuicide, onHeadshot, onStats, onStats2, onJoin, onDisconnect, onMapStart, onMapEnd, onBan, loggingEnabled) {
  var word  = line.split(' ');  // array
  var isKill = lineIsKill(word);
  var isConnect = lineIsConnect(word);
  var isSuicide = lineIsSuicide(word);
  var isChat = lineIsChat(word);
  var isHeadshot  = lineIsHeadshot(word);
  var isStats = lineIsStats(word);
  var isStats2 = lineIsStats2(word);
  var isConsole = lineIsConsole(word);
  var isBanned = playerIsBanned(word);
  var isStart = isFileStart(word);
  var isEnd = isFileEnd(word);
  var hasDisconnected = playerHasDisconnected(word);
  var lineTime = getLineTime(word);
  if (isConsole) {
     return;
  } else if (isChat) {
    // important data
    const nameString = buildKillerNameString(word, isChat);
    const id = getID3(nameString);
    const name = getName(nameString);
    // check if variables have data
    if (!id) {
      return;
    }
    if (!name) {
      return;
    }
    for (var i = 0; i < word.length; i++) {
      word[i] = word[i].replace('"', '').replace('"', '');
    }
    // log chat
    var said = '';
    for (let i = isChat + 1; i < word.length; i++) {
      said = `${said}${word[i]} `;
    }
    if (onChat) onChat(lineTime, id, name, `${new Date(lineTime).toLocaleString()} - ${said}`);
    if (loggingEnabled) print(`${name.grey} said ${said.magenta}`);
  } else if (isBanned) {
    // important data
    const nameString = buildKillerNameString(word, isBanned);
    // const name = getName(nameString);
    const id = getID3(nameString);
    // check if variables have data
    if (!id) {
      return;
    }
    // add the ban
    if (onBan) onBan(id);
  } else if (isConnect) {
    // get user details
    const nameString = buildKillerNameString(word, isConnect);
    const id = getID3(nameString);
    const name = getName(nameString);
    const ip = word[isConnect  + 2].replace('"', '').replace('"', '').replace(/:\d{4,5}$/, '');
    // check for important data
    if (!name) {
      return;
    }
    if (!id) {
      return;
    }
    if (!validateIPaddress(ip) || ip === 'none') {
      return;
    }
    if (loggingEnabled) {
      playerTimes[id] = lineTime;
      print(`${name.grey} connected with IP address: ${ip.grey}`);
    }
    if (onJoin) {
      onJoin({
        name: name,
        id: id,
        ip: ip,
        time: lineTime,
        date: new Date(lineTime).getDate(),
        month: new Date(lineTime).getMonth(),
        year: new Date(lineTime).getFullYear()
      });
    }
  } else if (isKill) {
    // get players details
    const killerNameString = buildKillerNameString(word, isKill);  // isKill is the index after the last index of the player name
    const killedNameString = buildKilledNameString(word, isKill + 1); // isKill + 1 is the index @ the beginning of the killed players name
    const killer = {
      name: getName(killerNameString),
      id: getID3(killerNameString)
    };
    const killed = {
      name: getName(killedNameString),
      id: getID3(killedNameString)
    };
    const weapon = word[word.length - 1].replace('"', '').replace('"', '');
    // check important data exists
    if (!killer.id) {
      return;
    }
    if (!killer.name) {
      return;
    }
    if (!killed.id) {
      return;
    }
    if (!killed.name) {
      return;
    }
    if (!isWeapon(weapon)) {
      return;
    }
    if (onKill) onKill(lineTime, killer, killed, weapon);
    if (loggingEnabled) print(`${killer.name.grey} killed ${killed.name.grey} with weapon ${weapon.magenta}`);
  } else if (isSuicide) {
    const nameString = buildKillerNameString(word, isSuicide);
    const id = getID3(nameString);
    const name = getName(nameString);
    const weapon = word[word.length - 1].replace('"', '').replace('"', '');
    if (!id) {
      return;
    }
    if (!name) {
      return;
    }
    if (!isWeapon(weapon)) {
      return;
    }
    if (onSuicide) onSuicide(lineTime, id, name, weapon);
    if (loggingEnabled) print(`${name.grey} has commit suicide with ${weapon.magenta}`);
  } else if (isHeadshot) {
    const killerNameString = buildKillerNameString(word, isHeadshot);
    const name = getName(killerNameString);
    const id = getID3(new SteamID(getID2(killerNameString)).getSteam3RenderedID());
    if (!id) {
      return;
    }
    if (!name) {
      return;
    }
    if (onHeadshot) onHeadshot(lineTime, id, name);
    if (loggingEnabled) print(`${name.grey} got a ` + `HEADSHOT!!`.magenta);
  } else if (isStats) {
     // get important information
    const killedNameString = buildKillerNameString(word, isStats - 1);
    const name = getName(killedNameString);
    const id3 = getID3(new SteamID(getID2(killedNameString)).getSteam3RenderedID());
    // check variables have data
    if (!id3) {
      return;
    }
    if (!name) {
      return;
    }
    for (let i = 0; i < word.length; i++) {
      word[i] = word[i].replace('"', '').replace('(', '').replace(')', '').replace('"', '');
    }
    var weaponName = word[isStats + 2];
    if (!isWeapon(weaponName)) {
      return;
    }
    if (onStats) onStats(lineTime, id3, name, {
      name: weaponName,
      shots: Number(word[isStats + 4]),
      hits: Number(word[isStats + 6]),
      hs: Number(word[isStats + 8]),
      damage: Number(word[isStats + 14])
    });
  } else if (isStats2) {
    const killedNameString = buildKillerNameString(word, isStats2 - 1);
    const name = getName(killedNameString);
    const id = getID3(new SteamID(getID2(killedNameString)).getSteam3RenderedID());
    if (!id) {
      return;
    }
    if (!name) {
      return;
    }
    // clean up extra chars
    for (let i = 0; i < word.length; i++) {
      word[i] = word[i].replace('"', '').replace('(', '').replace(')', '').replace('"', '');
    }
    let weaponName = word[isStats2 + 2];
    if (!isWeapon(weaponName)) {
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
    if (onStats2) onStats2(lineTime, id, name, {
      name: weaponName,
      head: head,
      chest: chest,
      stomach: stomach,
      leftarm: leftarm,
      rightarm: rightarm,
      leftleg: leftleg,
      rightleg: rightleg
    });
  } else if (isStart) {
    if (new Date().getTime() - startDebounceTime < 15000) {
      return;
    }
    var log = Number(word[isStart + 2].replace('"logs/L', '').replace('.log")', '')) + 1;
    if (loggingEnabled) print(`Current log file ` + `L${log}.log`.green);
    if (onMapStart) onMapStart(`L${log}`);
    startDebounceTime = new Date().getTime();
  } else if (isEnd) {
    if (loggingEnabled) {
      if (new Date().getTime() - endDebounceTime < 15000) {
        return;
      }
      print(`Map reset.`);
      if (onMapEnd) onMapEnd();
      endDebounceTime = new Date().getTime();
    }
  } else if (hasDisconnected) {
    var nameString = buildKillerNameString(word, hasDisconnected);
    var name = getName(nameString);
    var id = getID3(nameString);
    var onlineFor = lineTime - playerTimes[id];
    delete playerTimes[id];
    if (onDisconnect) onDisconnect({
      name: name,
      id: id,
      time: lineTime,
      date: new Date(lineTime).getDate(),
      month: new Date(lineTime).getMonth(),
      year: new Date(lineTime).getFullYear(),
      onlineFor: onlineFor
    });
  }
}

module.exports = scanLine;
