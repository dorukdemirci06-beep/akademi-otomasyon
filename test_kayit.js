const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/Kayit.jsx', 'utf8');
const match = content.match(/<select[^>]*?className=(['"])(.*?)\1/gs);
console.log(match);
