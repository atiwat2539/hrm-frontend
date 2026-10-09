const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const modalJsx = `
      {/* Weather Modal */}
      {isWeatherModalOpen && weather && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsWeatherModalOpen(false)}>
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setIsWeatherModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">พยากรณ์อากาศ เชียงใหม่</h2>
              <p className="text-gray-500">พยากรณ์ล่วงหน้า 7 วัน (Open-Meteo)</p>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {weather.daily?.map((d: any, idx: number) => {
                const dateObj = new Date(d.date);
                const isToday = idx === 0;
                return (
                  <div key={idx} className={\`flex items-center justify-between p-4 rounded-2xl \${isToday ? 'bg-indigo-50 border border-indigo-100' : 'bg-gray-50'}\`}>
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl drop-shadow-sm">{d.icon}</div>
                      <div>
                        <p className={\`font-medium \${isToday ? 'text-indigo-900' : 'text-gray-900'}\`}>
                          {isToday ? 'วันนี้' : dateObj.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-xs text-gray-500">{d.text}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{d.max}°C</p>
                      <p className="text-xs text-gray-500">{d.min}°C</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded-xl text-sm">
              <span className="text-gray-600">คุณภาพอากาศ (AQI) ปัจจุบัน:</span>
              <span className={\`font-bold \${weather.aqi <= 50 ? 'text-emerald-600' : weather.aqi <= 100 ? 'text-yellow-600' : weather.aqi <= 150 ? 'text-orange-600' : 'text-red-600'}\`}>
                {weather.aqi} 😷
              </span>
            </div>
          </div>
        </div>
      )}
`;

const lines = code.split('\n');
const lastClosingDivIdx = lines.findLastIndex(l => l.trim() === '</div>');
// insert the modal before the last '</div>'
lines.splice(lastClosingDivIdx, 0, modalJsx);

fs.writeFileSync('src/app/dashboard/page.tsx', lines.join('\n'), 'utf8');
console.log('Injected Weather Modal!');
