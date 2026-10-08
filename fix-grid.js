const fs = require('fs');
let code = fs.readFileSync('src/components/CalendarClient.tsx', 'utf8');

code = code.replace(/<div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">/g, '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">');
code = code.replace(/<div className="grid grid-cols-2 gap-5">/g, '<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">');

fs.writeFileSync('src/components/CalendarClient.tsx', code, 'utf8');
console.log('Fixed grid-cols-2 to grid-cols-1 sm:grid-cols-2');
