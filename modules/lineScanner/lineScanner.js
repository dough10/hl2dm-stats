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
let playerTimes = {};

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
 * @returns {Boolean} result of Array.indexOf();
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
  for (let i = 0 ; i < word.length; i++) {
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
 * @returns {Boolean} result of Array.indexOf();
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
  for (let i = 0; i < word.length; i++) {
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
 * let name = getName([
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
  let end = word.search(/<([1-9][0-9]{0,2}|1000)></);
  let str = '';
  for (let i = 0; i < end; i++) {
    str += word[i];
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
 * let steamid = getID2([
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
  let u = word.search(/STEAM_[0-1]:[0-1]:/g);
  if (u < 0) {
    return false;
  }
  let start = u;
  word = word.substring(start);
  let end = word.search('>');
  let str = '';
  for (let i = 0; i < end; i++) {
    str += word[i];
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
 * let steamid = getID3([
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
  for (let i = 0; i < end; i++) {
    str += word[i];
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
 * let killer = buildKillerNameString([
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
  for (let i = start; i < end; i++) {
    name = `${name}${line[i]} `; // formated like this to keep spaces in names
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
 * let killed = buildKilledNameString([
 *   'list',
 *   'of',
 *   'words',
 *   'to',
 *   'check',
 *   '.'
 * ], 4);
 */
function buildKilledNameString(line, start) {
  let end = 7;
  for (let i = start; i < line.length; i++) {
    if (line[i] === 'with') {
      end = i;
    }
  }
  let name = '';
  for (let i = start; i < end; i++) {
    name = `${name}${line[i]} `; // formated like this to keep spaces in names
  }
  return name;
}

/**
 * scans the line for player kill
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Number} result of Array.indexOf();
 */
function lineIsKill(line) {
  return line.indexOf('killed');
}

/**
 * scans the line for player connection
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} result of Array.indexOf();
 */
function lineIsConnect(line) {
  return line.indexOf('connected,');
}

/**
 * scans the line for suicide
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} result of Array.indexOf();
 */
function lineIsSuicide(line) {
  return line.indexOf('committed');
}

/**
 * scans the line for chat
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} result of Array.indexOf();
 */
function lineIsChat(line) {
  return line.indexOf('say');
}

/**
 * scans the line for headshot
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} result of Array.indexOf();
 */
function lineIsHeadshot(line) {
  return line.indexOf('"headshot"');
}

/**
 * scans the line for weaponstats
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} result of Array.indexOf();
 */
function lineIsStats(line) {
  return line.indexOf('"weaponstats"');
}

/**
 * scans the line for weaponstats2
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} result of Array.indexOf();
 */
function lineIsStats2(line) {
  return line.indexOf('"weaponstats"');
}


/**
 * scans the line for console message
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} result of Array.indexOf();
 */
function lineIsConsole(line) {
  let ipstring = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):\d{4,5}$/;
  for (let i = 0; i < line.length; i++) {
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
 * @returns {Boolean} result of Array.indexOf();
 */
function playerIsBanned(line) {
  return line.indexOf('banned');
}

/**
 * scans the line for player disconnect
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} result of Array.indexOf();
 */
function playerHasDisconnected(line) {
  return line.indexOf('disconnected');
}

/**
 * scans the line for time
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {String} timestring;
 */
function getLineTime(line) {
  for (let i = 0; i < line.length; i++) {
    if (isTime(line[i])) {
      return new Date(`${line[i].slice(0, -1)} ${line[i - 2]}`).getTime();
    }
  }
  return false;
}

let startDebounceTime = 0;
let endDebounceTime = 0;


/**
 * scans the line for usable data for the data-model   **update params**
 *
 * @param {Array} line - one line of the log file being parsed split at spaces
 * @param {Function} onKill - callback for when a player gets a kill
 * @param {Function} onChat - callback for when a player chats
 * @param {Function} onSuicide - callback for when a player kills themselves
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
  const word  = line.split(' ');  // array
  const isKill = lineIsKill(word);
  const isConnect = lineIsConnect(word);
  const isSuicide = lineIsSuicide(word);
  const isChat = lineIsChat(word);
  const isHeadshot  = lineIsHeadshot(word);
  const isStats = lineIsStats(word);
  const isStats2 = lineIsStats2(word);
  const isConsole = lineIsConsole(word);
  const isBanned = playerIsBanned(word);
  const isStart = isFileStart(word);
  const isEnd = isFileEnd(word);
  const hasDisconnected = playerHasDisconnected(word);
  const lineTime = getLineTime(word);
  if (isConsole) {
     return;
  } else if (isChat > -1) {
    const nameString = buildKillerNameString(word, isChat);
    const id = getID3(nameString);
    const name = getName(nameString);
    if (!id) return;
    if (!name) return;
    for (let i = 0; i < word.length; i++) {
      word[i] = word[i].replace('"', '').replace('"', '');
    }
    let said = '';
    for (let i = isChat + 1; i < word.length; i++) said = `${said}${word[i]} `;
    if (onChat) onChat(lineTime, id, name, said, loggingEnabled);
    if (loggingEnabled) print(`${name.grey} said ${said.magenta}`);
  } else if (isBanned > -1) {
    const nameString = buildKillerNameString(word, isBanned);
    // const name = getName(nameString);
    const id = getID3(nameString);
    if (!id) return;
    if (onBan) onBan(id);
  } else if (isConnect > -1) {
    const nameString = buildKillerNameString(word, isConnect);
    const id = getID3(nameString);
    const name = getName(nameString);
    const ip = word[isConnect  + 2].replace('"', '').replace('"', '').replace(/:\d{4,5}$/, '');
    if (!name) return;
    if (!id) return;
    if (!validateIPaddress(ip) || ip === 'none') return; // none = hltv bot
    if (loggingEnabled) playerTimes[id] = lineTime;
    if (onJoin) onJoin({
      name: name,
      id: id,
      ip: ip,
      time: lineTime,
      loggingEnabled: loggingEnabled
    });
  } else if (isKill > -1) {
    const killerNameString = buildKillerNameString(word, isKill);  // isKill is the index after the last index of the player name
    const killer = {
      name: getName(killerNameString),
      id: getID3(killerNameString)
    };
    const killedNameString = buildKilledNameString(word, isKill + 1); // isKill + 1 is the index @ the beginning of the killed players name
    const killed = {
      name: getName(killedNameString),
      id: getID3(killedNameString)
    };
    const weapon = word[word.length - 1].replace('"', '').replace('"', '');
    if (!killer.id) return;
    if (!killer.name) return;
    if (!killed.id) return;
    if (!killed.name) return;
    if (!isWeapon(weapon)) return;
    if (onKill) onKill(lineTime, killer, killed, weapon, loggingEnabled);
    if (loggingEnabled) print(`${killer.name.grey} killed ${killed.name.grey} with weapon ${weapon.magenta}`);
  } else if (isSuicide > -1) {
    const nameString = buildKillerNameString(word, isSuicide);
    const id = getID3(nameString);
    const name = getName(nameString);
    const weapon = word[word.length - 1].replace('"', '').replace('"', '');
    if (!id) return;
    if (!name) return;
    if (!isWeapon(weapon)) return;
    if (onSuicide) onSuicide(lineTime, id, name, weapon);
    if (loggingEnabled) print(`${name.grey} has commit suicide with ${weapon.magenta}`);
  } else if (isHeadshot > -1) {
    const killerNameString = buildKillerNameString(word, isHeadshot);
    const name = getName(killerNameString);
    const id = getID3(new SteamID(getID2(killerNameString)).getSteam3RenderedID());
    if (!id) return;
    if (!name) return;
    if (onHeadshot) onHeadshot(lineTime, id, name);
    if (loggingEnabled) print(`${name.grey} got a ` + `HEADSHOT!!`.magenta);
  } else if (isStats > -1) {
    const killedNameString = buildKillerNameString(word, isStats - 1);
    const name = getName(killedNameString);
    const id3 = getID3(new SteamID(getID2(killedNameString)).getSteam3RenderedID());
    if (!id3) return;
    if (!name) return;
    for (let i = 0; i < word.length; i++) {
      word[i] = word[i].replace('"', '').replace('(', '').replace(')', '').replace('"', '');
    }
    const weaponName = word[isStats + 2];
    if (!isWeapon(weaponName)) return;
    if (onStats) onStats(lineTime, id3, name, {
      name: weaponName,
      shots: Number(word[isStats + 4]),
      hits: Number(word[isStats + 6]),
      hs: Number(word[isStats + 8]),
      damage: Number(word[isStats + 14])
    });
  } else if (isStats2 > -1) {
    const killedNameString = buildKillerNameString(word, isStats2 - 1);
    const name = getName(killedNameString);
    const id = getID3(new SteamID(getID2(killedNameString)).getSteam3RenderedID());
    if (!id) return;
    if (!name) return;
    // clean up extra chars
    for (let i = 0; i < word.length; i++) {
      word[i] = word[i].replace('"', '').replace('(', '').replace(')', '').replace('"', '');
    }
    let weaponName = word[isStats2 + 2];
    if (!isWeapon(weaponName)) return;
    const head = word[isStats2 + 4];
    const chest = word[isStats2 + 6];
    const stomach = word[isStats2 + 8];
    const leftarm = word[isStats2 + 10];
    const rightarm = word[isStats2 + 12];
    const leftleg = word[isStats2 + 14];
    const rightleg = word[isStats2 + 16];
    if (!head) return;
    if (!chest) return;
    if (!stomach) return;
    if (!leftarm) return;
    if (!rightarm) return;
    if (!leftleg) return;
    if (!rightleg) return;
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
    if (new Date().getTime() - startDebounceTime < 15000) return;
    const log = Number(word[isStart + 2].replace('"logs/L', '').replace('.log")', '')) + 1;
    if (loggingEnabled && onMapStart) onMapStart(`L${log}`);
    startDebounceTime = new Date().getTime();
  } else if (isEnd) {
    if (loggingEnabled) {
      if (new Date().getTime() - endDebounceTime < 15000) return;
      print(`Map reset.`);
      if (onMapEnd) onMapEnd();
      endDebounceTime = new Date().getTime();
    }
  } else if (hasDisconnected > -1) {
    const nameString = buildKillerNameString(word, hasDisconnected);
    const name = getName(nameString);
    const id = getID3(nameString);
    let onlineFor; 
    if (loggingEnabled) {
      onlineFor = lineTime - playerTimes[id];
      delete playerTimes[id];
    }
    if (onDisconnect) onDisconnect({
      name: name,
      id: id,
      time: lineTime,
      onlineFor: onlineFor,
      loggingEnabled: loggingEnabled
    });
  }
}

module.exports = scanLine;
