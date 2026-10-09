const fs = require('fs');

let code = fs.readFileSync('src/app/projects/page.tsx', 'utf8');

// 1. Remove small info button
const smallInfoBtn = '<button onClick={() => handleOpenDetails(project)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition" title="ดูรายละเอียด"><Info className="w-5 h-5" /></button>\n                  ';
code = code.replace(smallInfoBtn, '');

// 2. Insert large button at the end of the card
const progressEndRegex = /<div className="bg-gradient-to-r from-indigo-500 to-violet-600 h-3 rounded-full transition-all duration-1000" style=\{\{ width: \`\$\{project\.progress\}%\` \}\}\><\/div>\s*<\/div>\s*<\/div>/;

const largeBtnJsx = `<div className="bg-gradient-to-r from-indigo-500 to-violet-600 h-3 rounded-full transition-all duration-1000" style={{ width: \`\${project.progress}%\` }}></div>
                </div>
              </div>
              
              <button 
                onClick={() => handleOpenDetails(project)}
                className="mt-6 w-full py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Info className="w-5 h-5" />
                <span>ดูรายละเอียดโครงการ</span>
              </button>`;

code = code.replace(progressEndRegex, largeBtnJsx);

// 3. Insert checklist in modal
const modalProgressEndRegex = /<div \s*className="bg-indigo-600 h-3 rounded-full transition-all duration-500" \s*style=\{\{ width: \`\$\{selectedProject\.progress \|\| 0\}%\` \}\}\>\s*<\/div>\s*<\/div>\s*<\/div>/;

const checklistModalJsx = `<div 
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: \`\${selectedProject.progress || 0}%\` }}
                  ></div>
                </div>
              </div>

              {selectedProject.checklists && selectedProject.checklists.length > 0 && (
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
                          {chk.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}`;

code = code.replace(modalProgressEndRegex, checklistModalJsx);

fs.writeFileSync('src/app/projects/page.tsx', code, 'utf8');
console.log('Project UI updated successfully!');
