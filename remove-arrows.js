const fs = require('fs');
let code = fs.readFileSync('src/app/kpi/page.tsx', 'utf8');

// 1. Remove Arrow buttons UI
code = code.replace(
  /\{\/\* Move Up\/Down \*\/\}[\s\S]*?<\/div>/g, 
  ''
);

// 2. Remove handleMove function
const handleMoveRegex = /const handleMove = async \([\s\S]*?catch \(err: any\) \{[\s\S]*?\}[\s\S]*?\};/;
code = code.replace(handleMoveRegex, '');

// 3. Remove from imports just to be clean
code = code.replace(', ArrowUp, ArrowDown', '');

fs.writeFileSync('src/app/kpi/page.tsx', code, 'utf8');
console.log('Removed arrows');
