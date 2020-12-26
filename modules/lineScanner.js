const SteamID = require('steamid');                       // work with steamid's
const isWeapon = require('./weaponsCheck.js');
const print = require('./printer.js');
const Timer = require('./Timer/Timer.js');

/**
 * check if ip  address is valid
 *
 * @param {String} ip - ip address
 * 
 * @returns {Boolean} true: validated, false: failed
 */
function validateIPaddress(ip) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}

/**
 * scans the line for landmarks in order to get usable strings of data
 *
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} reads as Boolean value. true: is the index of the landmark word, false: word was not present
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
 * scans the line for landmarks in order to get usable strings of data
 *
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} reads as Boolean value. true: is the index of the landmark word, false: word was not present
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
 *
 * @param {String} word - player name string
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
 * 
 * @returns {String} returns players SteamID3 number
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
 * 
 * @returns {Boolean} true: string is a time string, false: is not time string
 */
function isTime(str) {
  return /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d):$/.test(str);
}

/**
 * builds a name string if name was broken by .split()
 *
 * @param {Array} line - one line from a log file broken at spaces
 * @param {Number} end - index point of the end of the name string
 * 
 * @returns {String} returns killers name
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
 * 
 * @returns {String} returns killed player name
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
 * scans the line for landmarks in order to get usable strings of data
 *
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
 * scans the line for landmarks in order to get usable strings of data
 *
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
 * scans the line for landmarks in order to get usable strings of data
 *
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
 * scans the line for landmarks in order to get usable strings of data
 *
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
 * scans the line for landmarks in order to get usable strings of data
 *
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
 * scans the line for landmarks in order to get usable strings of data
 *
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
 * scans the line for landmarks in order to get usable strings of data
 *
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} reads as Boolean value. true: is the index of the landmark word, false: word was not present
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
 * scans the line for landmarks in order to get usable strings of data
 *
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
 * scans the line for landmarks in order to get usable strings of data
 *
 * @param {Array} line - one line of the log file being parsed
 * 
 * @returns {Boolean} reads as Boolean value. true: is the index of the landmark word, false: word was not present
 */
function getLineTime(line) {
  for (var i = 0; i < line.length; i++) {
    if (isTime(line[i])) {
      return new Date(`${line[i].slice(0, -1)} ${line[i - 2]}`).getTime()
    }
  }
  return false;
}

var startDebounceTime = 0;
var endDebounceTime = 0;

/**
 * scans the line for landmarks in order to get usable strings of data
 *
 * @param {Array} line - one line of the log file being parsed
 * @param {Class} dataModel - data!!!!!!!
 * @param {Function} onJoin - callback when player joins server (to be used to Toast?)
 * @param {Function} onDisconnect - callback when player leaves server (to be used to Toast?)
 * @param {Function} onMapStart - callback when the map begins
 * @param {Function} onMapEnd - callback when the map ends
 * @param {Boolean} loggingEnabled - log to console or not. (used to avoid spam when scanning logs while still getting data from realtime to log to console)
 */
function scanLine(line, dataModel, onJoin, onDisconnect, onMapStart, onMapEnd, loggingEnabled) {
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
    for (var i = isChat + 1; i < word.length; i++) {
      said = `${said}${word[i]} `;
    }
    dataModel.addChat(lineTime, id, name, `${new Date(lineTime).toLocaleString()} - ${said}`);
    if (loggingEnabled) print(`${name.grey} said ${said.magenta}`)
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
    dataModel.addBanned(id);
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
    var newUser = dataModel.playerConnect(lineTime, id, name, ip);
    var constr = '';
    if (newUser) {
      constr = 'NEW USER! ';
    }
    dataModel.playerTimes[id] = new Timer();
    if (onJoin) {
      onJoin({
        name: name,
        id: id,
        ip: ip,
        time: lineTime,
        date: new Date(lineTime).getDate(),
        month: new Date(lineTime).getMonth(),
        year: new Date(lineTime).getFullYear(),
        new: newUser
      });
    }
    if (loggingEnabled) {
      print(`${constr.red}${name.grey} connected with IP address: ${ip.grey}`);
    }

    // debugging line
    if (!lineTime) {
      console.log(line);
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
    dataModel.addKill(lineTime, killer, killed, weapon);
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
    dataModel.addSuicide(lineTime, id, name, weapon);
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
    dataModel.addHeadshot(lineTime, id, name);
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
    for (var i = 0; i < word.length; i++) {
      word[i] = word[i].replace('"', '').replace('(', '').replace(')', '').replace('"', '');
    }
    var weaponName = word[isStats + 2];
    if (!isWeapon(weaponName)) {
      return;
    }
    dataModel.addWeaponStats(lineTime, id3, name, {
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
    for (var i = 0; i < word.length; i++) {
      word[i] = word[i].replace('"', '').replace('(', '').replace(')', '').replace('"', '');
    }
    var weaponName = word[isStats2 + 2];
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
    dataModel.addWeaponStats2(lineTime, id, name, {
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
    if (new Date().getTime() - startDebounceTime < 5000) {
      return;
    }
    var log = Number(word[isStart + 2].replace('"logs/L', '').replace('.log")', '')) + 1;
    if (loggingEnabled) print(`Current log file ` + `L${log}.log`.green);
    if (onMapStart) onMapStart(`L${log}`);
    startDebounceTime = new Date().getTime();
  } else if (isEnd) {
    if (loggingEnabled) {
      if (new Date().getTime() - endDebounceTime < 5000) {
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
    if (loggingEnabled && dataModel.playerTimes[id]) {
      print(`${name.grey} disconnected after ${dataModel.playerTimes[id].endString().cyan} online`);
    } else if (loggingEnabled) {
      print(`${name.grey} disconnected after` + ' an unknown ammount of time'.cyan + ` online`);
    }
    // if (dataModel.playerTimes[id] === undefined) console.count(name)
    if (onDisconnect) onDisconnect({
      name: name,
      id: id,
      time: lineTime,
      date: new Date(lineTime).getDate(),
      month: new Date(lineTime).getMonth(),
      year: new Date(lineTime).getFullYear(),
    });
  }
}

module.exports = scanLine;
