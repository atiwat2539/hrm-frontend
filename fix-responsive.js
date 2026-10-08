const fs = require('fs');

// 1. Fix Topbar search input
let topbarCode = fs.readFileSync('src/components/layout/Topbar.tsx', 'utf8');
topbarCode = topbarCode.replace(
  /<div className="relative w-48 sm:w-64 md:w-96" ref={searchRef}>/,
  '<div className="relative flex-1 max-w-[140px] sm:max-w-[200px] md:max-w-xs lg:max-w-md mx-2 md:mx-4" ref={searchRef}>'
);
topbarCode = topbarCode.replace(
  /placeholder="ค้นหาบุคลากร, KPI, การอบรม\.\.\."/,
  'placeholder="ค้นหา..."'
);
fs.writeFileSync('src/components/layout/Topbar.tsx', topbarCode, 'utf8');
console.log('Topbar updated');

// 2. Add responsive CSS for FullCalendar
let cssCode = fs.readFileSync('src/app/globals.css', 'utf8');
if (!cssCode.includes('.fc-toolbar')) {
  cssCode += `

/* FullCalendar Mobile Responsive */
@media (max-width: 640px) {
  .fc .fc-toolbar {
    display: flex !important;
    flex-direction: column !important;
    gap: 0.75rem !important;
    align-items: center !important;
  }
  .fc .fc-toolbar-title {
    font-size: 1.25rem !important;
  }
  .fc .fc-button {
    padding: 0.25rem 0.5rem !important;
    font-size: 0.875rem !important;
  }
  .fc .fc-toolbar-chunk {
    display: flex !important;
    justify-content: center !important;
    flex-wrap: wrap !important;
    gap: 0.25rem !important;
  }
}
`;
  fs.writeFileSync('src/app/globals.css', cssCode, 'utf8');
  console.log('globals.css updated');
}

// 3. Check for any other hardcoded widths that might break mobile
