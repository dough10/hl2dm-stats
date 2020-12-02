const path = require('path');                             // merger file / url names
const fs = require('fs');                                 // work with the file system
const config = require(`../config.json`);                 // config file location
const child_process = require("child_process");           // system peocesses
const logFolder = path.join(config.gameServerDir, 'logs');// game server log location
const colors = require('colors');                         // colorize text
const Timer = require(path.join(__dirname, 'Timer.js'));
/**
 * saves top data before log clear
 *
 * @param {Number} lastMonth - new Date() output for the time cleanup() was run
 */
function saveTop(lastMonth, top, weapons, totalPlayers, bannedPlayers, lastUpdate) {
  return new Promise((resolve, reject) => {
    var folder = `../old-top`;
    if (!fs.existsSync(folder)){
      fs.mkdirSync(folder);
    }
    var filename = `../old-top/${lastMonth}.json`;
    fs.writeFile(filename, JSON.stringify([
      top,
      weapons,
      totalPlayers,
      bannedPlayers,
      lastUpdate
    ]), e => {
      if (e) {
        reject(e);
        return;
      }
      if (!fs.existsSync(filename)){
        reject();
        return;
      }
      console.log(`${new Date().toLocaleString()} - top player data saved to ` + filename.green);
      resolve(lastMonth);
    });
  });
}

/**
 * zips up log files before clear
 *S
 * @param {Number} lastMonth - new Date() output for the time cleanup() was run
 */
function zipLogs(lastMonth) {
  return new Promise((resolve, reject) => {
    var folder = `${config.bulkStorage}/logs`;
    if (!fs.existsSync(folder)){
      fs.mkdirSync(folder);
    }
    var t = new Timer();
    child_process.execSync(`zip -r ${config.bulkStorage}/logs/${lastMonth}.zip *`, {
      cwd: logFolder
    });
    console.log(`${new Date().toLocaleString()} - Zippin logs complete: ${t.endString()} time to complete`);
    console.log(`${new Date().toLocaleString()} - Logs saved as ` + `${config.bulkStorage}/logs/${lastMonth}.zip`.green);
    resolve(lastMonth);
  });
}

/**
 * zip up demo files before clear
 *
 * @param {Number} lastMonth - new Date() output for the time cleanup() was run
 */
function zipDemos(lastMonth) {
  return new Promise((resolve, reject) => {
    var folder = `${config.bulkStorage}/demos`;
    if (!fs.existsSync(folder)){
      fs.mkdirSync(folder);
    }
    var t = new Timer();
    child_process.execSync(`zip -r ${config.bulkStorage}/demos/${lastMonth}.zip *.dem`, {
      cwd: config.gameServerDir
    });
    console.log(`${new Date().toLocaleString()} - Zippin demos complete: ${t.endString()} time to complete`);
    console.log(`${new Date().toLocaleString()} - Demos saved as ` + `${config.bulkStorage}/demos/${lastMonth}.zip`.green);
    resolve(lastMonth);
  })
}

function deleteLogs() {
  return new Promise((resolve, reject) => {
    fs.readdir(logFolder, (err, files) => {
      if (err) {
        reject('Unable to scan directory', err);
        return;
      }
      console.log(`${new Date().toLocaleString()} - Running log file clean up`);
      for (var i = 0; i < files.length; i++) {
        console.log(path.join(logFolder, files[i]));
        // fs.unlinkSync(path.join(logFolder, files[i]));
      }
      resolve();
    });
  });
}


function deleteDemos() {
  fs.readdir(config.gameServerDir, (err, files) => {
    if (err) {
      ioError('Unable to scan directory', err);
      return;
    }
    console.log(`${new Date().toLocaleString()} - Running demo file clean up`);
    for (var i = 0; i < files.length; i++) {
      if (path.extname(files[i]) === '.dem') {
        console.log(path.join(config.gameServerDir, files[i]));
        // fs.unlinkSync(path.join(config.gameServerDir, files[i]));
      }
    }
    console.log(`${new Date().toLocaleString()} - Clean up complete. ${numFiles} files processed and backed up.`);
    console.log(`${new Date().toLocaleString()} - Complete process took ${times.endString()}`)
    cacheTopResponse().then(cacheDemos);
  });
}

/**
 * end of month file cleanup process
 */
function cleanUp(lastMonth, top, weapons, totalPlayers, bannedPlayers, lastUpdate) {
  console.log(`${new Date().toLocaleString()} - Clean up started`);
  var now = new Date();
  var lastMonth = now.setMonth(now.getMonth() - 1);
  var times = new Timer();
  saveTop(lastMonth, top, weapons, totalPlayers, bannedPlayers, lastUpdate)
  .then(zipLogs)
  .then(zipDemos)
  .then(deleteLogs)
  .then(deleteDemos)
  .catch(e => {
    console.log(e.message);
  });
}


module.exports = cleanUp;
