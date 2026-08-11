const fs = require('fs');

function fixInputs(path) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/<input([^>]*?)className=[\"']([^\"']*?)[\"']/g, (match, before, classes) => {
    if (!classes.includes('neo-input')) {
      return `<input${before}className="neo-input ${classes}"`;
    }
    return match;
  });
  
  // also <select>
  content = content.replace(/<select([^>]*?)className=[\"']([^\"']*?)[\"']/g, (match, before, classes) => {
    if (!classes.includes('neo-input')) {
      return `<select${before}className="neo-input ${classes}"`;
    }
    return match;
  });

  fs.writeFileSync(path, content);
  console.log('Fixed inputs in', path);
}

fixInputs('frontend/src/pages/Finans.jsx');
fixInputs('frontend/src/pages/Kayit.jsx');
fixInputs('frontend/src/pages/Yoklama.jsx');
