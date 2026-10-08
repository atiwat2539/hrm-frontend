const fs = require('fs');

let code = fs.readFileSync('src/app/kpi/page.tsx', 'utf8');
code = code.replace('<tr><tbody><tr><td colSpan={17}', '<tbody><tr><td colSpan={17}');
code = code.replace('<tr><tbody><tr><td colSpan={9}', '<tbody><tr><td colSpan={9}');
fs.writeFileSync('src/app/kpi/page.tsx', code, 'utf8');
