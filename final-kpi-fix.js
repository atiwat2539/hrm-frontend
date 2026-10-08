const fs = require('fs');

let code = fs.readFileSync('src/app/kpi/page.tsx', 'utf8');
const lines = code.split('\n');

const historyStart = lines.findIndex(l => l.includes('yearResults.length > 0 && ('));
// We want to delete until the matching )} which is around 6 lines below
if (historyStart > -1) {
  let historyEnd = historyStart;
  for (let i = historyStart; i < lines.length; i++) {
    if (lines[i].includes(')}')) {
      historyEnd = i;
      break;
    }
  }
  lines.splice(historyStart, historyEnd - historyStart + 1);
  console.log('Removed history button');
}

const editStart = lines.findIndex(l => l.includes('handleOpenModalForEdit(kpi)'));
if (editStart > -1) {
  const insertIndex = editStart - 1; 
  
  const inject = `                              {/* History */}
                              <button 
                                onClick={() => { setSelectedKpiHistory({...kpi, results: yearResults}); setIsHistoryModalOpen(true); }}
                                className={\`p-1.5 rounded \${yearResults.length > 0 ? 'text-indigo-600 hover:bg-indigo-50' : 'text-gray-300'}\`}
                                title="ดูประวัติการบันทึก"
                                disabled={yearResults.length === 0}
                              >
                                <History className="w-4 h-4" />
                              </button>

                              {/* Clear Results */}
                              <button 
                                onClick={() => handleDeleteResults(kpi.id)}
                                className={\`p-1.5 rounded \${yearResults.length > 0 ? 'text-orange-500 hover:bg-orange-50' : 'text-gray-300'}\`}
                                title="ลบข้อมูลการบันทึกที่ผ่านมา"
                                disabled={yearResults.length === 0}
                              >
                                <Eraser className="w-4 h-4" />
                              </button>`;
                              
  lines.splice(insertIndex, 0, inject);
  
  const divLine = lines.findIndex((l, i) => i < insertIndex && i > insertIndex - 5 && l.includes('space-x-2'));
  if (divLine > -1) {
    lines[divLine] = lines[divLine].replace('space-x-2', 'space-x-1');
  }
  
  console.log('Added manage buttons');
}

fs.writeFileSync('src/app/kpi/page.tsx', lines.join('\n'), 'utf8');
