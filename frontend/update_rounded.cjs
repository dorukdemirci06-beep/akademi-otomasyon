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
  
  // Replace rounded-* with rounded-full in className="" for button, span, a, and Link
  let newContent = content.replace(/<(button|span|a|Link)\b([^>]*)className=[\"']([^\"']*)[\"']([^>]*)>/gi, (match, tag, before, classNames, after) => {
    // Replace if it contains rounded- something
    let newClassNames = classNames.replace(/\brounded-(sm|md|lg|xl|2xl|3xl)\b/g, 'rounded-full');
    return '<' + tag + before + 'className=\"' + newClassNames + '\"' + after + '>';
  });

  // Also replace in buttonClassName props (used in CustomDatePicker)
  newContent = newContent.replace(/buttonClassName=[\"']([^\"']*)[\"']/gi, (match, classNames) => {
    let newClassNames = classNames.replace(/\brounded-(sm|md|lg|xl|2xl|3xl)\b/g, 'rounded-full');
    return 'buttonClassName=\"' + newClassNames + '\"';
  });

  // Specifically for Yoklama.jsx - make the Katılım pill fully rounded and update pale backgrounds to solid colors for the interactive buttons
  // Update: Wait, if I just want to replace all pale backgrounds in Yoklama to solid...
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    totalReplaced++;
    console.log('Updated', file);
  }
});
console.log('Total files updated:', totalReplaced);
