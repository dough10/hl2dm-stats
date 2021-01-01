/**
 *  make a zip and clean up previous months files 
 * @module modules/fileCleanup
 * @requires path
 * @requires fs
 * @requires modules/loadConfig.js
 * @requires child_process
 * @requires colors
 * @requires modules/Timer
 * @requires modules/printer.js
 * @exports cleanUp
 */
const path = require('path');
const fs = require('fs');
var config = require('../loadConfig.js')();
const child_process = require("child_process");
const logFolder = path.join(config.gameServerDir, 'logs');
const colors = require('colors');
const Timer = require('./Timer.js');  // time things
const print = require(path.join(__dirname, 'printer.js'));
var numFiles = 0;

/**
 * saves top data before log clear
 * @param {Number} lastMonth - new Date() output for the time cleanup() was run
 * @param {Array} top - over 100 kills by kdr
 * @param {Array} weapons - weapon stat data
 * @param {Number} totalPlayers - count of players
 * @param {Array} bannedPlayers - list of banned players
 * @param {Number} lastUpdate - new Date() output
 * 
 * @returns {Promise<Number>} lastmonth time string
 * @example <caption>Example usage of saveTop() function.</caption>
 * saveTop(1609123414390, [ 'players with over 100 kills sorted by kdr'], [ 'weapons' ], 212, [ 'banned players' ], 1609123414390).then(time => {
 * // time = 1609123414390
 * });
 */
function saveTop(lastMonth, top, weapons, totalPlayers, bannedPlayers, lastUpdate) {
  return new Promise((resolve, reject) => {
    var folder = path.join(__dirname, `old-top`);
    if (!fs.existsSync(folder)){
      fs.mkdirSync(folder);
    }
    var filename = path.join(folder, `${lastMonth}.json`);
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
        reject('Error saving Top Data!! aka. Shits broke.');
        return;
      }
      print(`top player data saved to ` + filename.green);
      resolve(lastMonth);
    });
  });
}

/**
 * zip log files before cleanUp deletes them
 * @param {Number} lastMonth - new Date() output for the time cleanup() was run
 * 
 * @returns {Promise<Number>} lastmonth time string
 * 
 * @example <caption>Example usage of zipLogs() function.</caption>
 * zipLogs(1609123414390).then(time => {
 * // time = 1609123414390
 * });
 */
function zipLogs(lastMonth) {
  return new Promise((resolve, reject) => {
    var folder = path.join(config.bulkStorage, `logs`);
    if (!fs.existsSync(folder)){
      fs.mkdirSync(folder);
    }
    var t = new Timer();
    var filename = path.join(folder, `${lastMonth}.zip`);
    child_process.execSync(`zip -r ${filename} *`, {
      cwd: logFolder
    });
    if (!fs.existsSync(filename)){
      reject('Error saving Log Zip!! aka. Shits broke.');
      return;
    }
    print(`Zippin logs complete: ${t.endString()} time to complete`);
    print(`Logs saved as ` + `${filename}`.green);
    resolve(lastMonth);
  });
}

/**
 * will create a zip of all demo files in game server directory
 * @param {Number} lastMonth - new Date() output for the time cleanup() was run
 * 
 * @returns {Promise<Number>} lastmonth time string
 * 
 * @example <caption>Example usage of zipDemos() function.</caption>
 * zipDemos(1609123414390).then(time => {
 * // time = 1609123414390
 * });
 */
function zipDemos(lastMonth) {
  return new Promise((resolve, reject) => {
    var folder = path.join(config.bulkStorage, 'demos');
    if (!fs.existsSync(folder)){
      fs.mkdirSync(folder);
    }
    var t = new Timer();
    var filename = path.join(folder, `${lastMonth}.zip`);
    child_process.execSync(`zip -r ${filename} *.dem`, {
      cwd: config.gameServerDir
    });
    if (!fs.existsSync(filename)){
      reject('Error saving Demos Zip!! aka. Shits broke.');
      return;
    }
    print(`Zippin demos complete: ${t.endString()} time to complete`);
    print(`Demos saved as ` + `${filename}`.green);
    resolve(lastMonth);
  });
}

/**
 * will remove all log files from logs folder **can not be undone**
 * 
 * @returns {Promise<Void>} nothing
 * @example <caption>Example usage of deleteLogs() function.</caption>
 * deleteLogs().then(_ => {
 * // logs are gone!!
 * });
 */
function deleteLogs() {
  return new Promise((resolve, reject) => {
    fs.readdir(logFolder, (err, files) => {
      if (err) {
        reject('Unable to scan directory', err);
        return;
      }
      print(`Running log file clean up`);
      for (var i = 0; i < files.length; i++) {
        numFiles++;
        // console.log(path.join(logFolder, files[i]));
        fs.unlinkSync(path.join(logFolder, files[i]));
      }
      resolve();
    });
  });
}

/**
 * will remove all demo files from game folder **can not be undone**
 * 
 * @returns {Promise<Void>} nothing
 * 
 * @example <caption>Example usage of deleteDemos() function.</caption>
 * deleteDemos().then(_ => {
 * // demos are gone!!
 * });
 */
function deleteDemos() {
  return new Promise((resolve, reject) => {
    fs.readdir(config.gameServerDir, (err, files) => {
      if (err) {
        reject('Unable to scan directory', err);
        return;
      }
      print(`Running demo file clean up`);
      for (var i = 0; i < files.length; i++) {
        if (path.extname(files[i]) === '.dem') {
          numFiles++;
          // console.log(path.join(config.gameServerDir, files[i]));
          fs.unlinkSync(path.join(config.gameServerDir, files[i]));
        }
      }
      resolve();
    });
  });
}

/**
 * end of month file cleanup process
 * @param {Array} top - over 100 kills by kdr
 * @param {Array} weapons - weapon stat data
 * @param {Number} totalPlayers - count of players
 * @param {Array} bannedPlayers - list of banned players
 * @param {Number} lastUpdate - new Date() output
 * 
 * @returns {Promise<Void>} nothing
 * 
 * @example <caption>Example usage of cleanUp() function.</caption>
 * cleanUp([ 'players with over 100 kills sorted by kdr'], [ 'weapons' ], 212, [ 'banned players' ], 1609123414390).then(_ => {
 *  // cleanup complete
 * });
 */
function cleanUp(top, weapons, totalPlayers, bannedPlayers, lastUpdate) {
  return new Promise((resolve, reject) => {
    print(`Clean up started`);
    var now = new Date();
    var lastMonth = now.setMonth(now.getMonth() - 1);
    var time = new Timer();
    saveTop(lastMonth, top, weapons, totalPlayers, bannedPlayers, lastUpdate)
    .then(zipLogs)
    .then(zipDemos)
    .then(deleteLogs)
    .then(deleteDemos)
    .then(_ => {
      print(`Clean up complete. ${numFiles} files processed and backed up.`);
      print(`Complete process took ${time.endString()}`);
      resolve();
    })
    .catch(reject);
  });
}


module.exports = cleanUp;
