const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs'); 

const files = [
  'api',
  'modules/auth/auth',
  'modules/data-model/data-model',
  'modules/Timer/Timer'
];

function renderDoc(filename) {
  jsdoc2md.render({ 
    files: `${filename}.js`
  }).then(md => {
    fs.writeFile(`${filename}-doc.md`, md, e => {
      if (e) {
        throw e;
      }
      if (!fs.existsSync(`${filename}-doc.md`)){
        throw new Error('Error saving markdown!! aka. Shits broke.');
      }
      console.log(`${filename}-doc.md data saved`);
    });
  });
}


files.forEach(renderDoc);