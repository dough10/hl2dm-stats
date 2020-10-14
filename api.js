const path = require('path');
const fs = require('fs');
const express = require('express')
const app = express();
const Gamedig = require('gamedig');

const dir = "/appdata/hl2dm/hl2mp";
const serverDir = '/var/www/hl2dm';

var users = {};
var totalFiles = 0;
var top = [];
var weapons = {};

function cacheResponse() {
  parseLogs().then(stats => {
    top = stats;
  });
}

function parseLogs() {
  return new Promise((resolve, reject) => {
    const directoryPath = path.join(dir, 'logs');
    fs.readdir(directoryPath, (err, files) => {
      var remaining = '';
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }
      weapons = {};
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
              resolve(sortUsersByKDR());
              setTimeout(_ => {
                cacheResponse()
              }, 600000);
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
  var end = word.search('^<([1-9][0-9]{0,2}|1000)>$');
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
  var start = u + 5;
  var end = word.search(']');
  var str = '';
  for (var i = start; i < end; i++) {
    str = str + word[i];
  }
  return str;
}

function scanLine(line) {
  var word  = line.split(' ');
  if (word[5] === 'killed') {
    var killerID = getID(word[4]);
    var killerName = getName(word[4]);
    var killedID = getID(word[6]);
    var killedName = getName(word[6]);
    if (!killedID) {
      killedID = getID(word[6] + ' ' + word[7]);
      killedName = getName(word[6] + ' ' + word[7]);
    }
    // killer
    if (!users[killerID]) {
      users[killerID] = {
        name: killerName,
        id:killerID,
        kills: 0,
        deaths: 0,
        kdr: 0
      };
    }
    // killed
    if (!users[killedID]) {
      users[killedID] = {
        name: killedName,
        id: killedID,
        kills: 0,
        deaths: 0,
        kdr: 0
      };
    }

    // add kill
    users[killerID].kills = users[killerID].kills + 1;
    // add death
    users[killedID].deaths = users[killedID].deaths + 1
    // add weapon
    if (word.length >= 8) {
      var weapon = word[word.length - 1].replace('"', '');
      weapon = weapon.replace('"', '');
      if (!users[killerID][weapon]) {
        users[killerID][weapon] = 0;
      }
      users[killerID][weapon] = users[killerID][weapon] + 1;
      if (!weapons[weapon]) {
        weapons[weapon] = 0;
      }
      weapons[weapon] = weapons[weapon] + 1;
    }
    // calculate KDR
    users[killerID].kdr = Number((users[killerID].kills / users[killerID].deaths).toFixed(2));
    if (users[killerID].kdr === Infinity) {
      users[killerID].kdr = users[killerID].kills;
    }
    users[killedID].kdr = Number((users[killedID].kills / users[killedID].deaths).toFixed(2));
    return;
  }
  if (word[6] === 'killed') {
    var killerID = getID(word[4] + ' ' + word[5]);
    var killerName = getName(word[4] + ' ' + word[5]);
    var killedID = getID(word[7]);
    var killedName = getName(word[7]);
    if (!killedID) {
      killedID = getID(word[7] + ' ' + word[8]);
      killedName = getName(word[7] + ' ' + word[8]);
    }
    // killer
    if (!users[killerID]) {
      users[killerID] = {
        name: killerName,
        id:killerID,
        kills: 0,
        deaths: 0,
        kdr: 0
      };
    }
    // killed
    if (!users[killedID]) {
      users[killedID] = {
        name: killedName,
        id: killedID,
        kills: 0,
        deaths: 0,
        kdr: 0
      };
    }
    // add kill
    users[killerID].kills = users[killerID].kills + 1;
    // add death
    users[killedID].deaths = users[killedID].deaths + 1
    // add weapon
    if (word.length >= 8) {
      var weapon = word[word.length - 1].replace('"', '');
      weapon = weapon.replace('"', '');
      if (!users[killerID][weapon]) {
        users[killerID][weapon] = 0;
      }
      users[killerID][weapon] = users[killerID][weapon] + 1;
      if (!weapons[weapon]) {
        weapons[weapon] = 0;
      }
      weapons[weapon] = weapons[weapon] + 1;
    }
    // calculate KDR
    users[killerID].kdr = Number((users[killerID].kills / users[killerID].deaths).toFixed(2));
    if (users[killerID].kdr === Infinity) {
      users[killerID].kdr = users[killerID].kills;
    }
    users[killedID].kdr = Number((users[killedID].kills / users[killedID].deaths).toFixed(2));
    return;
  }
  if (word[5] === 'connected,') {
    var connectedUser = getID(word[4]);
    var connectedUserName = getName(word[4]);
    var ip = word[7].replace('"', '')
    ip = ip.replace('"', '')
    ip = ip.replace(':27005', '')
    if (!users[connectedUser]) {
      users[connectedUser] = {name: connectedUserName, id:connectedUser, ip: ip, kills: 0, deaths: 0, kdr: 0};
    } else {
      users[connectedUser].ip = ip;
    }
    return;
  }
  if (word[6] === 'connected,') {
    var connectedUser = getID(word[4] + ' ' + word[5]);
    var connectedUserName = getName(word[4] + ' ' + word[5]);
    var ip = word[8].replace('"', '')
    ip = ip.replace('"', '')
    ip = ip.replace(':27005', '')
    if (!users[connectedUser]) {
      users[connectedUser] = {name: connectedUserName, id:connectedUser, ip: ip, kills: 0, deaths: 0, kdr: 0};
    } else {
      users[connectedUser].ip = ip;
    }
    return;
  }
  if (word[5] === 'committed') {
    var killerID = getID(word[4]);
    var killerName = getName(word[4]);
    if (!users[killerID]) {
      users[killerID] = {name: killerName, id:killerID, kills: 0, deaths: 0, kdr: 0};
    }
    users[killerID].deaths = users[killerID].deaths + 1;
    users[killerID].kdr = Number((users[killerID].kills / users[killerID].deaths).toFixed(2));
    var weapon = word[word.length - 1].replace('"', '');
    weapon = weapon.replace('"', '');
    if (!users[killerID][weapon]) {
      users[killerID][weapon] = 0;
    }
    users[killerID][weapon] = users[killerID][weapon] + 1
    if (!weapons[weapon]) {
      weapons[weapon] = 0;
    }
    weapons[weapon] = weapons[weapon] + 1;
    return;
  }
  if (word[6] === 'committed') {
    var killerID = getID(word[4] + ' ' + word[5]);
    var killerName = getName(word[4] + ' ' + word[5]);
    if (!users[killerID]) {
      users[killerID] = {name: killerName, id:killerID, kills: 0, deaths: 0, kdr: 0};
    }
    users[killerID].deaths = users[killerID].deaths + 1;
    users[killerID].kdr = Number((users[killerID].kills / users[killerID].deaths).toFixed(2));
    var weapon = word[word.length - 1].replace('"', '');
    weapon = weapon.replace('"', '');
    if (!users[killerID][weapon]) {
      users[killerID][weapon] = 0;
    }
    users[killerID][weapon] = users[killerID][weapon] + 1
    if (!weapons[weapon]) {
      weapons[weapon] = 0;
    }
    weapons[weapon] = weapons[weapon] + 1;
    return;
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

cacheResponse()

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
