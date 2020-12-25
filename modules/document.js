const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs'); 

jsdoc2md.render({ files: 'api.js' }).then(md => {
  fs.writeFile('docs/api.md', md, e => {
    if (e) {
      throw e;
    }
    if (!fs.existsSync('docs/api.md')){
      throw new Error('Error saving markdown!! aka. Shits broke.');
    }
    console.log(`markdown data saved`);
  });
})