const path = require('path');
const fs = require('fs');
const config = require(`${__dirname}/config.json`);
const logFolder = path.join(config.gameServerDir, 'logs');

var top = {data: 'is here'};


function cleanUp() {
  console.count('cleanup-function')
  var now = new Date();
  var lastMonth = now.setMonth(now.getMonth() - 1);
  var folder = './oldTop';
  if (!fs.existsSync(folder)){
    fs.mkdirSync(folder);
  }
  var filename = `./oldTop/${lastMonth}.json`;
  fs.writeFile(filename, JSON.stringify(top), e => {
    if (e) return console.log(`${new Date()} - Error saving ${__dirname}/oldTop/${lastMonth}.json`, err);
    if (!fs.existsSync(filename)){
      return console.log(`${new Date()} - Error saving ${__dirname}/oldTop/${lastMonth}.json`);
    }
    console.log(`${new Date()} - top player data saved as ${__dirname}/oldTop/${lastMonth}.json`);
    var numFiles = 0;
    fs.readdir(logFolder, (err, files) => {
      console.log(`${new Date()} - Running log file clean up`);
      numFiles = numFiles + files.length;
      var howMany = files.length;
      files.forEach(file => {
        copyFile(file);
        console.log(file);
      });
      fs.readdir(config.gameServerDir, (err, files) => {
        console.log(`${new Date()} - Running demo file clean up`);
        files.forEach(file => {
          numFiles = numFiles + files.length;
          if (path.extname(file) === '.dem') {
            copyFile(file);
            console.log(file);
            howMany--;
            if (howMany <= 0) {
              console.log(`${new Date()} - Clean up complete. ${numFiles} files processed and backed up to ${__dirname}/oldLogs/${lastMonth}`);
              parseLogs();
            }
          }
        });
      });
    });
  });
;}

function copyFile(filename) {
  var now = new Date();
  var lastMonth = now.setMonth(now.getMonth() - 1);
  var folder = './oldLogs';
  if (!fs.existsSync(folder)){
    fs.mkdirSync(folder);
  }
  if (!fs.existsSync(`${lastMonth}`)){
    fs.mkdirSync(`${lastMonth}`);
  }
  fs.createReadStream(`${logFolder}/${filename}`).pipe(fs.createWriteStream(`${__dirname}/oldLogs/${lastMonth}/${filename}`));
}

cleanUp();
