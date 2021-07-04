const fs = require('fs');
const path = require('path');
const readline = require('readline');


function processPhrases() {
  return new Promise(resolve => {
    const phrases = [];
    if (!fs.existsSync(path.join(__dirname, 'phrase.txt'))) {
      resolve(phrases);
      return;
    }
    const rl = readline.createInterface({
      input: fs.createReadStream(path.join(__dirname, 'phrase.txt')),
      crlfDelay: Infinity
    });
    rl.on('line', phrase =>{
      phrases.push(phrase);
    });
    rl.on('close', _ => resolve(phrases));
  });
}

async function checkPhrases(phrase) {
  let list = await processPhrases();
  let trimmed = phrase.trim();
  return list.includes(trimmed);
}


module.exports = checkPhrases;