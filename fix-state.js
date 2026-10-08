const fs = require('fs');
let code = fs.readFileSync('src/app/kpi/page.tsx', 'utf8');

code = code.replace(
  "const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('all');",
  "const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('all');\n  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');"
);

fs.writeFileSync('src/app/kpi/page.tsx', code, 'utf8');
