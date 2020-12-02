var cleanUp = require('../modules/fileCleanup.js')
var data = require('../old-top/1604228400061.json');
var top = data[0];
var weapons = data[1];
var totalPlayers = data[2];
var bannedPlayers = data[3];
var lastUpdate = new Date().getTime();


cleanUp('testsave', top, weapons, totalPlayers, bannedPlayers, lastUpdate).then(_ => {
  console.log('/cheer');
});
