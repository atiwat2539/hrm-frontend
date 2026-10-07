const fs = require('fs');
const path = require('path');

const files = [
  'src/app/admin/page.tsx',
  'src/app/calendar/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/kpi/page.tsx',
  'src/app/notifications/page.tsx',
  'src/app/onboarding/page.tsx',
  'src/app/personnel/page.tsx',
  'src/app/projects/page.tsx',
  'src/app/reports/page.tsx',
  'src/app/training/page.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Insert import below use client
  if (!content.includes('LoadingSpinner')) {
    content = content.replace(/^'use client';\r?\n/, `'use client';\nimport LoadingSpinner from '@/components/ui/LoadingSpinner';\n`);
  }

  // Replace specific loading blocks
  content = content.replace(/<div className="flex h-\[400px\] items-center justify-center">\s*<p className="text-gray-500">Loading Dashboard...<\/p>\s*<\/div>/g, '<LoadingSpinner />');
  content = content.replace(/<div className="flex justify-center p-12 text-gray-500">.*?<\/div>/gs, '<LoadingSpinner />');
  content = content.replace(/<p className="text-center text-gray-500 py-4">.*?<\/p>/gs, '<LoadingSpinner />');
  content = content.replace(/<p className="text-center py-10 text-gray-500">.*?<\/p>/gs, '<LoadingSpinner />');
  content = content.replace(/<div className="flex h-64 items-center justify-center text-gray-500">.*?<\/div>/gs, '<LoadingSpinner />');
  content = content.replace(/<div className="flex justify-center items-center h-64">.*?<\/div>/gs, '<LoadingSpinner />');

  // Specific to calendar
  content = content.replace(/loading: \(\) => <div className="h-\[700px\] flex items-center justify-center text-gray-500">Loading Calendar...<\/div>/g, 'loading: () => <LoadingSpinner />');

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Done!');
