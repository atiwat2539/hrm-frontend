const fs = require('fs');

let code = fs.readFileSync('src/app/kpi/page.tsx', 'utf8');

// 1. Add selectedStatusFilter state
const stateMatch = "const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('all');";
code = code.replace(
  stateMatch,
  `const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('all');\n  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');`
);

// 2. Compute fyTotal and stats dynamically
const statsRegex = /\/\/ Stats calculation \(based on filtered data\)[\s\S]*?const belowTarget = filteredKpis\.filter\(k => k\.status === 'rejected'\)\.length;/;

const newStatsLogic = `// Stats calculation (based on filtered data)
  const computedKpis = filteredKpis.map(kpi => {
    let fyTotal = 0;
    if (kpi.results) {
      kpi.results.forEach((r: any) => {
        const monthInt = parseInt(r.month);
        if (monthInt >= 6 && monthInt <= 12 && r.year === matrixYear - 1) fyTotal += r.actual;
        else if (monthInt >= 1 && monthInt <= 5 && r.year === matrixYear) fyTotal += r.actual;
      });
    }
    return { ...kpi, _fyTotal: fyTotal };
  });

  const totalKpis = computedKpis.length;
  const achieved = computedKpis.filter(k => k._fyTotal >= k.target).length;
  const inProgress = computedKpis.filter(k => k._fyTotal > 0 && k._fyTotal < k.target).length;
  const belowTarget = computedKpis.filter(k => k._fyTotal === 0).length;

  const finalKpis = computedKpis.filter(k => {
    if (selectedStatusFilter === 'achieved') return k._fyTotal >= k.target;
    if (selectedStatusFilter === 'in_progress') return k._fyTotal > 0 && k._fyTotal < k.target;
    if (selectedStatusFilter === 'below_target') return k._fyTotal === 0;
    return true;
  });

  // Group filtered KPIs by Main Topic
  const groupedKpis = finalKpis.reduce((acc, kpi) => {
    if (!acc[kpi.title]) acc[kpi.title] = [];
    acc[kpi.title].push(kpi);
    return acc;
  }, {} as Record<string, any[]>);`;

code = code.replace(statsRegex, newStatsLogic);

// Ensure the old groupedKpis is replaced
code = code.replace(`  // Group filtered KPIs by Main Topic
  const groupedKpis = filteredKpis.reduce((acc, kpi) => {
    if (!acc[kpi.title]) acc[kpi.title] = [];
    acc[kpi.title].push(kpi);
    return acc;
  }, {} as Record<string, any[]>);`, '');

// 3. Update the Cards
const cardsRegex = /<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const newCards = `<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div 
          onClick={() => setSelectedStatusFilter('all')}
          className={\`p-4 rounded-2xl shadow-sm border cursor-pointer flex items-center space-x-4 transition-all duration-300 group \${selectedStatusFilter === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1'}\`}
        >
          <div className="p-3 bg-blue-100 rounded-full text-blue-600 transition-all duration-300 group-hover:scale-110"><Target className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500">ภาระงานทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-900">{totalKpis}</p>
          </div>
        </div>
        
        <div 
          onClick={() => setSelectedStatusFilter('achieved')}
          className={\`p-4 rounded-2xl shadow-sm border cursor-pointer flex items-center space-x-4 transition-all duration-300 group \${selectedStatusFilter === 'achieved' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-white hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1'}\`}
        >
          <div className="p-3 bg-emerald-100 rounded-full text-emerald-600 transition-all duration-300 group-hover:scale-110"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500">สำเร็จตามเป้า</p>
            <p className="text-2xl font-bold text-gray-900">{achieved}</p>
          </div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter('in_progress')}
          className={\`p-4 rounded-2xl shadow-sm border cursor-pointer flex items-center space-x-4 transition-all duration-300 group \${selectedStatusFilter === 'in_progress' ? 'border-amber-500 bg-amber-50' : 'border-gray-100 bg-white hover:shadow-xl hover:shadow-amber-900/5 hover:-translate-y-1'}\`}
        >
          <div className="p-3 bg-amber-100 rounded-full text-amber-600 transition-all duration-300 group-hover:scale-110"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500">กำลังดำเนินการ</p>
            <p className="text-2xl font-bold text-gray-900">{inProgress}</p>
          </div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter('below_target')}
          className={\`p-4 rounded-2xl shadow-sm border cursor-pointer flex items-center space-x-4 transition-all duration-300 group \${selectedStatusFilter === 'below_target' ? 'border-rose-500 bg-rose-50' : 'border-gray-100 bg-white hover:shadow-xl hover:shadow-rose-900/5 hover:-translate-y-1'}\`}
        >
          <div className="p-3 bg-rose-100 rounded-full text-rose-600 transition-all duration-300 group-hover:scale-110"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500">ยังไม่เริ่มดำเนินการ</p>
            <p className="text-2xl font-bold text-gray-900">{belowTarget}</p>
          </div>
        </div>
      </div>`;

code = code.replace(cardsRegex, newCards);

// 4. Update the "มอบหมายภาระงาน" button
const btnRegex = /<Button onClick=\{handleOpenModalForCreate\} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white whitespace-nowrap px-5 py-2\.5 rounded-lg shadow-md hover:shadow-lg hover:shadow-indigo-500\/30 transition-all duration-300 hover:scale-\[1\.02\] active:scale-95">/g;
const newBtn = `<Button onClick={handleOpenModalForCreate} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white whitespace-nowrap px-8 py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-95">`;

code = code.replace(btnRegex, newBtn);

fs.writeFileSync('src/app/kpi/page.tsx', code, 'utf8');
console.log('Features updated');
