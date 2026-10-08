const fs = require('fs');

let code = fs.readFileSync('src/app/kpi/page.tsx', 'utf8');

// 1. Remove the history button correctly
const historyRegex = /\{yearResults\.length > 0 && \([\s\S]*?ดูประวัติ \{yearResults\.length\} รายการ[\s\S]*?<\/button>\s*\)\}/;
code = code.replace(historyRegex, '');

// 2. Replace Manage Column
const oldManageCol = `<td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                onClick={() => handleOpenModalForEdit(kpi)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="แก้ไข"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(kpi.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>`;

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
                          </td>`;

if (code.includes(oldManageCol)) {
  code = code.replace(oldManageCol, newManageCol);
  console.log("Successfully replaced manage column");
} else {
  console.log("Manage col NOT FOUND!");
}

fs.writeFileSync('src/app/kpi/page.tsx', code, 'utf8');
