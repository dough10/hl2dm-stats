const path = require('path');
const fs = require('fs');
const express = require('express')
const app = express();
const Gamedig = require('gamedig');
var schedule = require('node-schedule');

const dir = "/appdata/hl2dm/hl2mp";
const serverDir = '/var/www/hl2dm';

var users = {};
var totalFiles = 0;
var top = [];
var weapons = {};

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
    'rpg_missile'
  ];
  return w.includes(weapon);
}

function validateIPaddress(ip) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}

function cacheResponse() {
  parseLogs().then(stats => {
    weapons.physics = weapons.physics + weapons.physbox;
    delete weapons.physbox;
    top = stats;
  });
}

function parseLogs() {
  return new Promise((resolve, reject) => {
    weapons = {};
    const directoryPath = path.join(dir, 'logs');
    fs.readdir(directoryPath, (err, files) => {
      var remaining = '';
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }
      totalFiles = files.length;
      files.forEach(function (file) {
        try {
          log = fs.createReadStream(path.join(dir, 'logs', file));
          log.on('data', data => {
            remaining += data;
            var index = remaining.indexOf('\n');
            while (index > -1) {
              var line = remaining.substring(0, index);
              remaining = remaining.substring(index + 1);
              scanLine(line);
              index = remaining.indexOf('\n');
            }
          });
          log.on('end', _ => {
            if (remaining.length > 0) {
              scanLine(remaining);
            }
          });
          log.on('close', _ => {
            totalFiles = totalFiles - 1;
            if (totalFiles === 0) {
              console.log(users)
              resolve(sortUsersByKDR());
            }
          });
        } catch (e) {
          console.error(e);
        }
      });
    });
  });
}

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

function getID(word) {
  if (!word) {
    return false;
  }
  var u = word.search('U:1:');
  if (u < 0) {
    return false;
  }
  var start = u + 4;
  word = word.substring(start)
  var end = word.search(']');
  var str = '';
  for (var i = 0; i < end; i++) {
    str = str + word[i];
  }
  return str;
}

function buildKillerNameString(line, end)  {
  var name = '';
  for (var i = 4; i < end; i++) {
    name = name + line[i] + ' ';
  }
  return name
}

function buildKilledNameString(line, start) {
  var end = 7;
  for (var i = start; i < line.length; i++) {
    if (line[i] === 'with') {
      end = i;
    }
  }
  var name = '';
  for (var i = start; i < end; i++) {
    name = name + line[i] + ' ';
  }
  return name;
}

function lineIsKill(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === 'killed') {
      return i;
    }
  }
  return false;
}

function lineIsConnect(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === 'connected,') {
      return i;
    }
  }
  return false;
}

function lineIsSuicide(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === 'committed') {
      return i;
    }
  }
  return false;
}

function lineIsChat(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === 'say') {
      return i;
    }
  }
  return false;
}

function scanLine(line) {
  var word  = line.split(' ');
  var isKill = lineIsKill(word);
  var isConnect = lineIsConnect(word);
  var isSuicide = lineIsSuicide(word);
  var isChat = lineIsChat(word);
  if (isKill) {
    var killerNameString = buildKillerNameString(word, isKill);
    var killerID = getID(killerNameString);
    var killerName = getName(killerNameString);
    var killedNameString = buildKilledNameString(word, isKill + 1);
    var killedID = getID(killedNameString);
    var killedName = getName(killedNameString);
    // killer
    if (!users[killerID]) {
      users[killerID] = {
        name: killerName,
        id:killerID,
        kills: 0,
        deaths: 0,
        kdr: 0,
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
        chat: []
      };
    }
    // add kill
    users[killerID].kills = users[killerID].kills + 1;
    // add death
    users[killedID].deaths = users[killedID].deaths + 1
    // calculate KDR
    users[killerID].kdr = Number((users[killerID].kills / users[killerID].deaths).toFixed(2));
    if (users[killerID].kdr === Infinity) {
      users[killerID].kdr = users[killerID].kills;
    }
    users[killedID].kdr = Number((users[killedID].kills / users[killedID].deaths).toFixed(2));
    // add weapon
    var weapon = word[word.length - 1].replace('"', '');
    weapon = weapon.replace('"', '');
    if (!isWeapon(weapon)) {
      return;
    }
    if (!users[killerID][weapon]) {
      users[killerID][weapon] = 0;
    }
    users[killerID][weapon] = users[killerID][weapon] + 1;
    if (!weapons[weapon]) {
      weapons[weapon] = 0;
    }
    weapons[weapon] = weapons[weapon] + 1;
    return;
  }
  if (isConnect) {
    var connectedNameString = buildKillerNameString(word, isConnect);
    var connectedUser = getID(connectedNameString);
    var connectedUserName = getName(connectedNameString);
    var ip = word[isConnect  + 2].replace('"', '');
    ip = ip.replace('"', '');
    ip = ip.replace(/:\d{4,5}$/, '');
    if (validateIPaddress(ip)) {
      if (!users[connectedUser]) {
        users[connectedUser] = {name: connectedUserName, id:connectedUser, ip: ip, kills: 0, deaths: 0, kdr: 0, chat: []};
      } else {
        users[connectedUser].ip = ip;
      }
    }
  }
  if (isSuicide) {
    var nameString = buildKillerNameString(word, isSuicide);
    var id = getID(nameString);
    var name = getName(nameString);
    if (!users[id]) {
      users[id] = {name: name, id: id, kills: 0, deaths: 0, kdr: 0, chat: []};
    }
    users[id].kills = users[id].kills - 1;
    users[id].deaths = users[id].deaths + 1;
    users[id].kdr = Number((users[id].kills / users[id].deaths).toFixed(2));
    var weapon = word[word.length - 1].replace('"', '');
    weapon = weapon.replace('"', '');
    if (!isWeapon(weapon)) {
      return;
    }
    if (!users[id][weapon]) {
      users[id][weapon] = 0;
    }
    users[id][weapon] = users[id][weapon] + 1
    if (!weapons[weapon]) {
      weapons[weapon] = 0;
    }
    weapons[weapon] = weapons[weapon] + 1;
    return;
  }
  if (isChat) {
    var nameString = buildKillerNameString(word, isChat);
    var id = getID(nameString);
    var name = getName(nameString);

    if (!users[id]) {
      users[id] = {
        name: name,
        id: id,
        kills: 0,
        deaths: 0,
        kdr: 0,
        chat: []
      };
    }
    var said = '';
    for (var i = (isChat + 1); i < word.length; i++) {
      said = said + word[i] + ' ';
    }
    said.replace('"', '');
    said.replace('"', '');
    users[id].chat.push(said);
  }
}

function sortUsersByKDR() {
  var arr = [];
  for (var user in users) {
    if (users[user].kills >= 100) {
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

function getDemos() {
  return new Promise((resolve, reject) => {
    var demos = [];
    fs.readdir(dir, (err, files) => {
      for (var i = 0; i < files.length; i++) {
        if (path.extname(files[i]) === '.dem') {
          demos.push(files[i]);
        }
      }
      resolve(demos);
    });
  });
}

function createdDate(file) {
  const stats = fs.statSync(file)
  return stats.mtime
}

function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename)
  var fileSizeInBytes = stats["size"]
  return fileSizeInBytes
}

function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function cleanUp() {
  const directoryPath = path.join(dir, 'logs');
  fs.readdir(directoryPath, (err, files) => {
    files.forEach(fs.unlinkSync);
  });
  fs.readdir(dir, (err, files) => {
    files.forEach(file => {
      if (path.extname(file) === '.dem') {
        fs.unlinkSync(file);
      }
    });
  });
;}

cacheResponse();
setInterval(cacheResponse, 600000);

app.get('/stats', (req, res) => {
  res.send(JSON.stringify([top, weapons]));
});

app.get('/status', (reg, res) => {
  Gamedig.query({
      type: 'hl2dm',
      host: 'hl2dm.dough10.me'
  }).then((state) => {
      res.send(state);
  }).catch((error) => {
      res.send("Server is offline");
  });
});

app.get('/download/:file', (reg, res) => {
  var dl = dir + '/' + reg.params.file;
  res.download(dl, reg.params.file);
});

app.get('/demos', (reg,res) => {
 var html = '<head><title>Lo-g Deathmatch Hoedown Demos</title></head><h1 style="text-align: center">Lo-g Deathmatch Hoedown Demos</h1><table style="width: 100%"><tr><th>filename</th><th>size</th><th>date/time</th></tr>';
 getDemos().then(demos => {
   for (var i = 0; i < demos.length; i++) {
     html = html + '<tr><th><a href="/api/download/' + demos[i] + '">' + demos[i] + '</a></th><th>' + bytesToSize(getFilesizeInBytes(dir + '/' + demos[i])) + '</th><th>' + createdDate(dir + '/' + demos[i]) + '</th></tr>'
   }
   res.send(html + '</table>');
 });
});

app.listen(3000);

var j = schedule.scheduleJob('* * * 1 * *', cleanUp);
