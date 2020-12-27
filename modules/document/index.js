const files = [
  'api',
  'modules/auth/auth',
  'modules/Timer/Timer',
  'modules/data-model/data-model',
  'modules/cacheDemos/cacheDemos',
  'modules/fileCleanup/fileCleanup'
];

const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs'); 
const {render} = require('mustache');
const head = fs.readFileSync('./modules/document/head.md').toString();
const foot = fs.readFileSync('./modules/document/foot.md').toString();
const parent = `- [{{file}}-doc.md]({{file}}-doc.md)\n`;
const child = `  - [{{file}}-doc.md]({{file}}-doc.md)\n`;
const pack = require('../../package.json');

var out = '\n## Documentation\n\n';

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
    out = out + `${item}: ${dep[item]}\n`;
  }
  return out;
}

for (var i = 0; i < files.length; i++) {
  renderDoc(files[i]);
  var obj = {
    file: files[i]
  };
  if (i === 0) {
    out = out + render(parent, obj);
  } else {
    out = out + render(child, obj);
  }
}

writeFile('README.md', head + out + '\n' + foot + '\n' + dependencies()).then(console.log);