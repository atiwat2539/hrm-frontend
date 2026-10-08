const fs = require('fs');
let code = fs.readFileSync('src/app/kpi/page.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  "import { Target, TrendingUp, AlertTriangle, X, Plus, Edit2, Trash2 } from 'lucide-react';",
  "import { Target, TrendingUp, AlertTriangle, X, Plus, Edit2, Trash2, History, Eraser } from 'lucide-react';"
);

// 2. Add handleDeleteResults function
const delFunc = `
  const handleDeleteResults = async (id: number) => {
    if (!confirm('ยืนยันการลบข้อมูลการบันทึกทั้งหมดของ KPI นี้? (หากลบแล้วข้อมูลยอดสะสมจะกลายเป็น 0)')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(\`\${API_URL}/\${id}/results\`, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to clear results');
    }
  };

  const handleDelete = async`;

code = code.replace("  const handleDelete = async", delFunc);

// 3. Remove history button from Accumulated Total column
const oldHistoryBtn = `{yearResults.length > 0 && (
                                <button 
                                  onClick={() => { setSelectedKpiHistory({...kpi, results: yearResults}); setIsHistoryModalOpen(true); }}
                                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1 font-medium bg-blue-50 px-2 py-0.5 rounded"
                                >
                                  ดูประวัติ {yearResults.length} รายการ
                                </button>
                              )}`;
code = code.replace(oldHistoryBtn, "");

// 4. Update Manage column
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

code = code.replace(oldManageCol, newManageCol);

fs.writeFileSync('src/app/kpi/page.tsx', code, 'utf8');
console.log('Frontend updated');
