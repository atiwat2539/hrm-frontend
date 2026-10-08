const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const startIdx = code.indexOf('{/* Event Details Modal */}');
if (startIdx === -1) {
  console.log("Could not find Event Details Modal");
  process.exit(1);
}

// Find the last closing tag of the modal and component
const regex = /\{\/\* Event Details Modal \*\/\}([\s\S]*?)<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*\);\s*\}\s*$/;
const match = code.match(regex);

if (!match) {
  console.log("Could not match the end of the file.");
  process.exit(1);
}

const newModal = `{/* Event Details Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header / Accent */}
            <div 
              className="h-32 w-full relative shrink-0"
              style={{ backgroundColor: selectedEvent.color || '#A3C4BC' }}
            >
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-6 right-6 text-white hover:bg-white/20 bg-black/10 backdrop-blur-md rounded-full p-2 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 md:px-10 pb-10 pt-0 -mt-12 relative z-10 flex flex-col">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl shadow-black/5 border border-gray-100 flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span 
                      className="text-xs font-extrabold px-3 py-1.5 rounded-md text-white shadow-sm uppercase tracking-wider"
                      style={{ backgroundColor: selectedEvent.color || '#A3C4BC' }}
                    >
                      {selectedEvent.category || 'กิจกรรม'}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">{selectedEvent.title}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#F0EEE9]/40 border border-[#F0EEE9] hover:bg-[#F0EEE9]/70 transition-colors">
                  <div className="bg-white p-3 rounded-2xl text-indigo-500 shadow-sm shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">เวลา</p>
                    <p className="text-gray-900 font-extrabold text-lg">
                      {selectedEvent.time} {selectedEvent.end_time ? \`- \${selectedEvent.end_time}\` : ''}
                    </p>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-rose-50/60 border border-rose-100 hover:bg-rose-50 transition-colors">
                    <div className="bg-white p-3 rounded-2xl text-rose-500 shadow-sm shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">สถานที่</p>
                      <p className="text-gray-900 font-extrabold text-lg">{selectedEvent.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <div className="mt-4 md:mt-6 flex items-start gap-4 p-6 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <div className="bg-white p-3 rounded-2xl text-blue-500 shadow-sm shrink-0">
                    <AlignLeft className="w-6 h-6" />
                  </div>
                  <div className="w-full">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">รายละเอียด</p>
                    <div className="text-gray-800 whitespace-pre-wrap text-base leading-relaxed">
                      {selectedEvent.description}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

code = code.replace(regex, newModal);

fs.writeFileSync('src/app/dashboard/page.tsx', code, 'utf8');
console.log('Successfully replaced Modal');
