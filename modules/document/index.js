const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs'); 
const {render} = require('mustache');

const head = fs.readFileSync('./modules/document/head.md').toString();

const parent = `- {{file}}.md\n`;
const child = `  - {{file}}.md\n`;

// file names without extensions ie. .js, .html
const files = [
  'api',
  'modules/auth/auth',
  'modules/data-model/data-model',
  'modules/Timer/Timer',
  'modules/cacheDemos/cacheDemos'
];

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


for (var i = 0; i < files.length; i++) {
  renderDoc(files[i]);
  var obj = {file: files[i]};
  if (i === 0) {
    out = out + render(parent, obj);
  } else {
    out = out + render(child, obj);
  }
}

writeFile('README.md', head + out);