const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

let totalReplaced = 0;

walk('src', (file) => {
  if (!file.endsWith('.jsx')) return;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace colorful pale backgrounds with solid backgrounds + white text
  
  // Emerald / Green
  content = content.replace(/bg-(emerald|green)-(50|100) dark:bg-(emerald|green)-950(?:\/80)?(?: hover:bg-(emerald|green)-(100|200) dark:hover:bg-(emerald|green)-900)? text-(emerald|green)-(700|800) dark:text-(emerald|green)-(300|400|200)(?: dark:text-\\[#2eb82e\\])? border border-(emerald|green)-(200|300) dark:border-(emerald|green)-(700|800)(?:\/80|\/60)?/g, 'bg-[#2eb82e] text-white border-transparent shadow-sm');
  
  // Rose / Red
  content = content.replace(/bg-(rose|red)-(50|100) dark:bg-(rose|red)-950(?:\/80)?(?: hover:bg-(rose|red)-(100|200) dark:hover:bg-(rose|red)-900)? text-(rose|red)-(700|800) dark:text-(rose|red)-(300|400|200) border border-(rose|red)-(200|300) dark:border-(rose|red)-(700|800)(?:\/80|\/60)?/g, 'bg-rose-600 text-white border-transparent shadow-sm');
  
  // Sky / Blue
  content = content.replace(/bg-(sky|blue)-(50|100) dark:bg-(sky|blue)-950(?:\/80)?(?: hover:bg-(sky|blue)-(100|200) dark:hover:bg-(sky|blue)-900)? text-(sky|blue)-(700|800) dark:text-(sky|blue)-(300|400|200)(?: dark:text-\\[#0284c7\\])? border border-(sky|blue)-(200|300) dark:border-(sky|blue)-(700|800)(?:\/80|\/60)?/g, 'bg-[#0284c7] text-white border-transparent shadow-sm');
  
  // Indigo / Purple
  content = content.replace(/bg-(indigo|purple)-(50|100) dark:bg-(indigo|purple)-950(?:\/80)?(?: hover:bg-(indigo|purple)-(100|200) dark:hover:bg-(indigo|purple)-900)? text-(indigo|purple)-(700|800) dark:text-(indigo|purple)-(300|400|200) border border-(indigo|purple)-(200|300) dark:border-(indigo|purple)-(700|800)(?:\/80|\/60)?/g, 'bg-indigo-500 text-white border-transparent shadow-sm');
  
  // Amber / Yellow
  content = content.replace(/bg-(amber|yellow)-(50|100) dark:bg-(amber|yellow)-950(?:\/80)?(?: hover:bg-(amber|yellow)-(100|200) dark:hover:bg-(amber|yellow)-900)? text-(amber|yellow)-(700|800) dark:text-(amber|yellow)-(300|400|200) border border-(amber|yellow)-(200|300) dark:border-(amber|yellow)-(700|800)(?:\/80|\/60)?/g, 'bg-amber-500 text-white border-transparent shadow-sm');

  // Some without border definition, just background and text
  // Emerald
  content = content.replace(/bg-(emerald|green)-(50|100)(?:\/[0-9]+)? dark:bg-(emerald|green)-950(?:\/[0-9]+)? text-(emerald|green)-(700|800|900) dark:text-(emerald|green)-(200|300|400)(?: dark:text-\\[#2eb82e\\])?/g, 'bg-[#2eb82e] text-white border-transparent');
  
  // Rose
  content = content.replace(/bg-(rose|red)-(50|100)(?:\/[0-9]+)? dark:bg-(rose|red)-950(?:\/[0-9]+)? text-(rose|red)-(700|800|900) dark:text-(rose|red)-(200|300|400)/g, 'bg-rose-600 text-white border-transparent');

  // Sky
  content = content.replace(/bg-(sky|blue)-(50|100)(?:\/[0-9]+)? dark:bg-(sky|blue)-950(?:\/[0-9]+)? text-(sky|blue)-(700|800|900) dark:text-(sky|blue)-(200|300|400)(?: dark:text-\\[#0284c7\\])?/g, 'bg-[#0284c7] text-white border-transparent');

  // Indigo
  content = content.replace(/bg-(indigo|purple)-(50|100)(?:\/[0-9]+)? dark:bg-(indigo|purple)-950(?:\/[0-9]+)? text-(indigo|purple)-(700|800|900) dark:text-(indigo|purple)-(200|300|400)/g, 'bg-indigo-500 text-white border-transparent');

  // Amber
  content = content.replace(/bg-(amber|yellow)-(50|100)(?:\/[0-9]+)? dark:bg-(amber|yellow)-950(?:\/[0-9]+)? text-(amber|yellow)-(700|800|900) dark:text-(amber|yellow)-(200|300|400)/g, 'bg-amber-500 text-white border-transparent');

  // Clean up any remaining "border border-(color)-300 dark:border-(color)-700/60" that might be left orphaned
  content = content.replace(/border border-(emerald|rose|sky|indigo|amber|green|red|blue|purple|yellow)-[0-9]{2,3}(?:\/[0-9]+)? dark:border-(emerald|rose|sky|indigo|amber|green|red|blue|purple|yellow)-[0-9]{2,3}(?:\/[0-9]+)?/g, 'border-transparent');


  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    totalReplaced++;
    console.log('Updated pale classes in', file);
  }
});
console.log('Total files updated:', totalReplaced);
