const fs = require('fs');
let code = fs.readFileSync('src/app/kpi/page.tsx', 'utf8');

// 1. Add ArrowUp, ArrowDown to lucide-react import
code = code.replace(
  "import { Target, TrendingUp, AlertTriangle, X, Plus, Edit2, Trash2, History, Eraser } from 'lucide-react';",
  "import { Target, TrendingUp, AlertTriangle, X, Plus, Edit2, Trash2, History, Eraser, ArrowUp, ArrowDown } from 'lucide-react';"
);

// 2. Add handleMove function
const handleMoveFunc = `
  const handleMove = async (kpiId: number, direction: 'up' | 'down') => {
    const targetKpi = kpis.find((x: any) => x.id === kpiId);
    if (!targetKpi) return;
    
    const topicKpis = kpis.filter((k: any) => k.title === targetKpi.title);
    const currentIndex = topicKpis.findIndex((k: any) => k.id === kpiId);
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === topicKpis.length - 1) return;
    
    // Assign sequential display_order first to ensure it's clean
    const reordered = topicKpis.map((k: any, i: number) => ({ id: k.id, display_order: i }));
    
    // Swap
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const temp = reordered[currentIndex].display_order;
    reordered[currentIndex].display_order = reordered[swapIndex].display_order;
    reordered[swapIndex].display_order = temp;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(\`\${API_URL}/reorder\`, { kpis: reordered }, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      fetchData();
    } catch (err: any) {
      alert('Failed to reorder: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteResults =`;

code = code.replace("  const handleDeleteResults =", handleMoveFunc);

// 3. Update Manage Column to include UP/DOWN arrows
const manageButtonsMatch = `                              {/* History */}
                              <button 
                                onClick={() => { setSelectedKpiHistory({...kpi, results: yearResults}); setIsHistoryModalOpen(true); }}`;

const newManageButtons = `                              {/* Move Up/Down */}
                              <div className="flex flex-col space-y-0.5 mr-1">
                                <button 
                                  onClick={() => handleMove(kpi.id, 'up')}
                                  className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded p-0.5"
                                  title="เลื่อนขึ้น"
                                >
                                  <ArrowUp className="w-3 h-3" strokeWidth={3} />
                                </button>
                                <button 
                                  onClick={() => handleMove(kpi.id, 'down')}
                                  className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded p-0.5"
                                  title="เลื่อนลง"
                                >
                                  <ArrowDown className="w-3 h-3" strokeWidth={3} />
                                </button>
                              </div>

                              {/* History */}
                              <button 
                                onClick={() => { setSelectedKpiHistory({...kpi, results: yearResults}); setIsHistoryModalOpen(true); }}`;

code = code.replace(manageButtonsMatch, newManageButtons);

fs.writeFileSync('src/app/kpi/page.tsx', code, 'utf8');
console.log('Frontend updated for reorder');
