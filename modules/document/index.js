/*jshint esversion: 6 */

const files = [
  'api',
  'modules/auth/auth',
  'modules/Timer/Timer',
  'modules/data-model/data-model',
  'modules/cacheDemos/cacheDemos',
  'modules/fileCleanup/fileCleanup',
  'modules/lineScanner/lineScanner'
];

const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs'); 
const head = fs.readFileSync('./modules/document/head.md').toString();
const foot = fs.readFileSync('./modules/document/foot.md').toString();
const pack = require('../../package.json');


function writeFile(name, md) {
  return new Promise((resolve, reject) => {
    fs.writeFile(name, md, e => {
      if (e) {
        throw e;
      }
      if (!fs.existsSync(name)){
        throw new Error('Error saving markdown!! aka. Shits broke.');
      }
      resolve(`${name} saved to disk`);
    });
  });
}

function renderDoc(filename) {
  jsdoc2md.render({ 
    files: `${filename}.js`
  }).then(md => {
    writeFile(`${filename}-doc.md`, md).then(console.log);
  });
}

function dependencies() {
  var dep = pack.dependencies;
  var out = '## Dependencies\n\n';
  for (var item in dep) {
    out = out + `- ${item}: ${dep[item]}\n`;
  }
  return out;
}

function devDependencies() {
  var dep = pack.devDependencies;
  var out = '## Dev Dependencies\n\n';
  for (var item in dep) {
    out = out + `- ${item}: ${dep[item]}\n`;
  }
  return out;
}

var out = '\n## Documentation\n\n';
for (var i = 0; i < files.length; i++) {
  renderDoc(files[i]);
  if (i === 0) {
    out = out + `- [${files[i]}-doc.md](${files[i]}-doc.md)\n`;
  } else {
    out = out + `  - [${files[i]}-doc.md](${files[i]}-doc.md)\n`;
  }
}

function hulkSmash() {
  return `# ${pack.name} V:${pack.version}\n` + head + out + '\n' + foot + '\n' + dependencies() + '\n' + devDependencies();
}

writeFile('README.md', hulkSmash()).then(console.log);