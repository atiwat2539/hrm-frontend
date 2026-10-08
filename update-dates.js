const fs = require('fs');
let code = fs.readFileSync('src/components/CalendarClient.tsx', 'utf8');

const oldStart = `<span className="font-semibold text-gray-500">เริ่มต้น:</span>
                  <span className="col-span-3 font-medium">`;
const newStart = `<span className="font-semibold text-gray-500 text-lg">เริ่มต้น:</span>
                  <span className="col-span-3 font-medium text-lg text-gray-900">`;

const oldEnd = `<span className="font-semibold text-gray-500">สิ้นสุด:</span>
                      <span className="col-span-3 font-medium">`;
const newEnd = `<span className="font-semibold text-gray-500 text-lg">สิ้นสุด:</span>
                      <span className="col-span-3 font-medium text-lg text-gray-900">`;

code = code.replace(oldStart, newStart);
code = code.replace(oldEnd, newEnd);

// Also replace gap-2 mb-2 with gap-4 mb-3
code = code.replace(/<div className="grid grid-cols-4 gap-2 mb-2">/g, '<div className="grid grid-cols-4 gap-4 mb-3">');
code = code.replace(/<div className="grid grid-cols-4 gap-2">/g, '<div className="grid grid-cols-4 gap-4 mb-3">');

fs.writeFileSync('src/components/CalendarClient.tsx', code, 'utf8');
console.log('Fixed dates.');
