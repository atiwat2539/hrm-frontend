const fs = require('fs');

let code = fs.readFileSync('src/app/kpi/page.tsx', 'utf8');

// 1. Remove history button
const historyRegex = /\{yearResults\.length > 0 && \([\s\S]*?ดูประวัติ \{yearResults\.length\} รายการ[\s\S]*?<\/button>\s*\)\}/;
code = code.replace(historyRegex, '');

// 2. Replace Manage Column dynamically
const manageStartStr = '<td className="px-4 py-4 text-center">\n                            <div className="flex items-center justify-center space-x-2">\n                              <button \n                                onClick={() => handleOpenModalForEdit(kpi)}';
const manageStartIdx = code.indexOf(manageStartStr);

if (manageStartIdx !== -1) {
  const nextTd = code.indexOf('</td>', manageStartIdx);
  
  const newManageCol = `<td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {/* History */}
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
                              </button>

                              <button 
                                onClick={() => handleOpenModalForEdit(kpi)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="แก้ไขภาระงาน"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(kpi.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="ลบภาระงาน"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          `;

  code = code.substring(0, manageStartIdx) + newManageCol + code.substring(nextTd);
  console.log("Replaced using dynamic search");
} else {
  console.log("Could not find manage start string");
}

fs.writeFileSync('src/app/kpi/page.tsx', code, 'utf8');
