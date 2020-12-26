const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs'); 

const files = [
  'api',
  'modules/auth',
  'modules/data-model'
];

function renderDoc(filename) {
  jsdoc2md.render({ files: `${filename}.js` }).then(md => {
    fs.writeFile(`docs/${filename}.md`, md, e => {
      if (e) {
        throw e;
      }
      if (!fs.existsSync(`docs/${filename}.md`)){
        throw new Error('Error saving markdown!! aka. Shits broke.');
      }
      console.log(`docs/${filename}.ms data saved`);
    });
  });
}


files.forEach(renderDoc);