const fs = require('fs');

let code = fs.readFileSync('src/app/reports/page.tsx', 'utf8');

// 1. Update outer wrapper and inject CSS
const oldOuter = '<div className="space-y-6 max-w-[1400px] mx-auto pb-10">';
const newOuter = `<div className="space-y-6 max-w-[1400px] mx-auto pb-10 print:max-w-none print:m-0 print:p-0">
      <style>{\`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; }
          table { page-break-inside: auto; width: 100% !important; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        }
      \`}</style>`;
code = code.replace(oldOuter, newOuter);

// 2. Update overflow-x-auto to be visible during print
code = code.replace('<div className="overflow-x-auto">', '<div className="overflow-x-auto print:overflow-visible w-full">');

// 3. Make the table layout fixed to prevent column squishing or pushing
code = code.replace('<table className="w-full text-left border-collapse">', '<table className="w-full text-left border-collapse table-auto print:table-fixed print:text-xs">');

fs.writeFileSync('src/app/reports/page.tsx', code, 'utf8');
console.log('Fixed PDF print layout successfully');
