const fs = require('fs');

const files = [
  'src/app/personnel/page.tsx',
  'src/app/kpi/page.tsx',
  'src/components/CalendarClient.tsx',
  'src/app/training/page.tsx',
  'src/app/onboarding/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');

    code = code.replace(/className=(["'])fixed inset-0([^"']*)\1/g, (match, p1, p2) => {
      let newClasses = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200";
      return 'className="' + newClasses + '"';
    });

    code = code.replace(/className=(["'])(bg-white rounded-[a-z0-9-]+ shadow-[a-z0-9-]+ w-full max-w-[a-z0-9-]+[^"']*)\1/g, (match, p1, p2) => {
      let newClasses = p2;
      if (!newClasses.includes('animate-in')) {
        newClasses += ' animate-in fade-in zoom-in-95 duration-200';
      }
      newClasses = newClasses.replace(/rounded-[a-z0-9-]+/, 'rounded-2xl');
      newClasses = newClasses.replace(/shadow-[a-z0-9-]+/, 'shadow-xl');
      
      return 'className="' + newClasses + '"';
    });

    // Handle Calendar Modal which might have different container classes:
    // Calendar typically has 'bg-white rounded-lg shadow-xl w-full max-w-...'
    // Wait, the regex 'bg-white rounded-[a-z0-9-]+ shadow-[a-z0-9-]+ w-full max-w-[a-z0-9-]+' will catch it.
    
    // Check for KPI modals explicitly if they were not caught
    // In KPI, history modal: className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
    // Wait, History modal is already rounded-2xl shadow-xl, so it will just get the animate-in.

    fs.writeFileSync(file, code, 'utf8');
    console.log('Updated: ' + file);
  } else {
    console.log('File not found: ' + file);
  }
});
