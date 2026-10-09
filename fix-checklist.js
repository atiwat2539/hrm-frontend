const fs = require('fs');

let code = fs.readFileSync('src/app/projects/page.tsx', 'utf8');

const targetStr = `                  <div 
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: \`\${selectedProject.progress || 0}%\` }}
                  ></div>
                </div>
              </div>`;

const replaceStr = `                  <div 
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: \`\${selectedProject.progress || 0}%\` }}
                  ></div>
                </div>
              </div>

              {selectedProject.checklists && selectedProject.checklists.length > 0 ? (
                <div className="border border-gray-200 p-5 rounded-xl bg-gray-50/50">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <ListChecks className="w-5 h-5 mr-2 text-indigo-500" /> 
                    รายการที่ต้องทำ (Checklists)
                  </p>
                  <ul className="space-y-3">
                    {selectedProject.checklists.map((chk: any, idx: number) => (
                      <li key={idx} className="flex items-start bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        {chk.is_completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 mr-3 shrink-0 mt-0.5"></div>
                        )}
                        <span className={\`text-sm \${chk.is_completed ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}\`}>
                          {chk.task_name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="border border-gray-200 p-5 rounded-xl bg-gray-50/50 text-center">
                  <ListChecks className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">ยังไม่มีรายการที่ต้องทำ</p>
                </div>
              )}`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('src/app/projects/page.tsx', code, 'utf8');
  console.log('Fixed checklist!');
} else {
  console.log('Target string not found!');
}
