const fs = require('fs');
let code = fs.readFileSync('src/app/personnel/page.tsx', 'utf8');
const lines = code.split('\n');
const tableIdx = lines.findIndex(l => l.includes('<table'));
console.log('Table is at line: ' + tableIdx);
if (tableIdx > 0) console.log(lines.slice(Math.max(0, tableIdx - 5), tableIdx + 5).join('\n'));
