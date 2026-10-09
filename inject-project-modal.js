const fs = require('fs');

let code = fs.readFileSync('src/app/projects/page.tsx', 'utf8');

// 1. Import 'Info' from lucide-react
code = code.replace(
  "import { Plus, Edit2, Trash2, Calendar, CheckCircle2, Clock, X, User, Tag, ListChecks, Settings2 } from 'lucide-react';",
  "import { Plus, Edit2, Trash2, Calendar, CheckCircle2, Clock, X, User, Tag, ListChecks, Settings2, Info } from 'lucide-react';"
);

// 2. Add state
const stateMatch = "const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);";
code = code.replace(
  stateMatch,
  stateMatch + "\n  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);\n  const [selectedProject, setSelectedProject] = useState<any>(null);"
);

// 3. Add handler
const handlerMatch = "const handleOpenCreate = () => {";
const detailsHandler = `const handleOpenDetails = (project: any) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
  };\n\n  `;
code = code.replace(handlerMatch, detailsHandler + handlerMatch);

// 4. Add button
const buttonMatch = '<button onClick={() => handleOpenEdit(project)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"><Edit2 className="w-5 h-5" /></button>';
const detailsButton = '<button onClick={() => handleOpenDetails(project)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition" title="ดูรายละเอียด"><Info className="w-5 h-5" /></button>\n                  ';
code = code.replace(buttonMatch, detailsButton + buttonMatch);

// 5. Add Details Modal JSX
// Find the last closing div of the main component
const detailsModalJsx = `
      {/* Details Modal */}
      {isDetailsModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsDetailsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">รายละเอียดโครงการ</h2>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1.5 rounded-full transition"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedProject.name}</h3>
                {selectedProject.type && (
                  <span className="inline-block bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-lg">
                    {selectedProject.type}
                  </span>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-2">รายละเอียดโครงการ</p>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{selectedProject.description || '-'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-center space-x-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><User className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">ผู้รับผิดชอบ</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProject.owner ? \`\${selectedProject.owner.first_name} \${selectedProject.owner.last_name}\` : 'ไม่ระบุ'}</p>
                  </div>
                </div>

                <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl flex items-center space-x-3">
                  <div className="bg-green-100 text-green-600 p-2 rounded-lg"><Tag className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">รอบปีประเมิน</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProject.year ? selectedProject.year + 543 : '-'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 p-4 rounded-xl flex items-center space-x-3">
                  <div className="bg-gray-100 text-gray-600 p-2 rounded-lg"><Calendar className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">ระยะเวลาดำเนินการ</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString('th-TH') : '-'} ถึง {selectedProject.end_date ? new Date(selectedProject.end_date).toLocaleDateString('th-TH') : '-'}
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 p-4 rounded-xl flex items-center space-x-3">
                  <div className="bg-gray-100 text-gray-600 p-2 rounded-lg"><Clock className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">สถานะโครงการ</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedProject.status === 'not_started' ? 'ยังไม่เริ่ม' : 
                       selectedProject.status === 'in_progress' ? 'กำลังดำเนินการ' : 
                       selectedProject.status === 'completed' ? 'เสร็จสิ้น' : 
                       selectedProject.status === 'cancelled' ? 'ยกเลิก' : selectedProject.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 p-5 rounded-xl">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm font-semibold text-gray-700">ความคืบหน้าโครงการ</p>
                  <p className="text-2xl font-bold text-indigo-600">{selectedProject.progress || 0}%</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div 
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: \`\${selectedProject.progress || 0}%\` }}
                  ></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
`;

const lines = code.split('\n');
const lastClosingDivIdx = lines.findLastIndex(l => l.trim() === '</div>');
lines.splice(lastClosingDivIdx, 0, detailsModalJsx);
code = lines.join('\n');

fs.writeFileSync('src/app/projects/page.tsx', code, 'utf8');
console.log('Project details modal injected successfully!');
