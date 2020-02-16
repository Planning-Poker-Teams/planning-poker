// pull in desired CSS/SASS files
require('./styles/styles.css');
require('../node_modules/font-awesome/css/font-awesome.css');
require('../node_modules/ace-css/css/ace.css');

// Workaround for referencing images from Elm code
// (generated filename with hash has to be used in code):
require('./img/*.png');

const Elm = require('../dist/main.js');
Elm.Main.embed(document.getElementById('main'));
