const fs = require('fs');

let code = fs.readFileSync('src/app/kpi/page.tsx', 'utf8');

// The dangling part:
// <td colSpan={17} className="px-4 py-3 font-bold text-indigo-900 text-[15px]">
//   หัวข้อหลัก: {mainTopic}
// </td>
// </tr>

code = code.replace(/<td colSpan=\{17\} className="px-4 py-3 font-bold text-indigo-900 text-\[15px\]">\s*หัวข้อหลัก: \{mainTopic\}\s*<\/td>\s*<\/tr>/g, '');
code = code.replace(/<td colSpan=\{9\} className="px-4 py-3 font-bold text-indigo-900 text-\[15px\]">\s*หัวข้อหลัก: \{mainTopic\}\s*<\/td>\s*<\/tr>/g, '');

fs.writeFileSync('src/app/kpi/page.tsx', code, 'utf8');
