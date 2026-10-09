import fs from 'fs';

const path = 'src/app/reports/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// I will overwrite the entire file since it requires massive restructuring for the new UI.
// But wait, I am in a Node script, I should just write to the file directly.
