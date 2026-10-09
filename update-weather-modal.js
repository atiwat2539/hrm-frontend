const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// 1. Add Modal state
code = code.replace(
  "const [weather, setWeather] = useState<{ temp: number, text: string, icon: string, aqi: number } | null>(null);",
  "const [weather, setWeather] = useState<any>(null);\n  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);"
);

// 2. Update fetchWeather to include daily forecast
const fetchRegex = /const fetchWeather = async \(\) => \{[\s\S]*?catch \(e\) \{\s*console\.error\('Weather fetch error', e\);\s*\}\s*\};/g;

const newFetchWeather = `const fetchWeather = async () => {
      try {
        const lat = 18.7883;
        const lon = 98.9853;
        const [weatherRes, aqiRes] = await Promise.all([
          axios.get(\`https://api.open-meteo.com/v1/forecast?latitude=\${lat}&longitude=\${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia/Bangkok\`),
          axios.get(\`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=\${lat}&longitude=\${lon}&current=us_aqi\`)
        ]);
        
        const code = weatherRes.data.current_weather.weathercode;
        const temp = weatherRes.data.current_weather.temperature;
        const aqi = aqiRes.data.current.us_aqi;
        
        const getWeatherIconAndText = (code: number) => {
          if (code >= 1 && code <= 3) return { icon: '⛅', text: 'มีเมฆบางส่วน' };
          if (code >= 45 && code <= 48) return { icon: '🌫️', text: 'มีหมอก' };
          if (code >= 51 && code <= 67) return { icon: '🌧️', text: 'มีฝนตก' };
          if (code >= 80 && code <= 82) return { icon: '🌦️', text: 'ฝนตกปรอยๆ' };
          if (code >= 95) return { icon: '⛈️', text: 'ฝนฟ้าคะนอง' };
          return { icon: '☀️', text: 'แจ่มใส' };
        };

        const current = getWeatherIconAndText(code);
        
        const daily = weatherRes.data.daily.time.map((t: string, i: number) => {
          const wt = getWeatherIconAndText(weatherRes.data.daily.weathercode[i]);
          return {
            date: t,
            max: weatherRes.data.daily.temperature_2m_max[i],
            min: weatherRes.data.daily.temperature_2m_min[i],
            icon: wt.icon,
            text: wt.text
          };
        });
        
        setWeather({ temp, text: current.text, icon: current.icon, aqi, daily });
      } catch (e) {
        console.error('Weather fetch error', e);
      }
    };`;

code = code.replace(fetchRegex, newFetchWeather);

// 3. Update the JSX for the Weather Card (Make it clickable, Add AQI badge)
const oldWeatherJsxRegex = /\{weather && \([\s\S]*?<span className="text-xl drop-shadow-sm">\{weather\.icon\}<\/span>[\s\S]*?<\/div>\s*\)\}/;

const newWeatherJsx = `{weather && (
            <>
              <div 
                onClick={() => setIsWeatherModalOpen(true)}
                className="bg-white/80 backdrop-blur px-5 py-2.5 rounded-2xl shadow-sm border border-[#F0EEE9] text-gray-700 font-medium flex items-center gap-2 transition-all hover:scale-105 cursor-pointer hover:shadow-md hover:border-indigo-200" title="คลิกเพื่อดูพยากรณ์อากาศล่วงหน้า 7 วัน">
                <span className="text-xl drop-shadow-sm">{weather.icon}</span>
                <span>{weather.temp}°C <span className="text-sm text-gray-500 ml-1">เชียงใหม่ ({weather.text})</span></span>
              </div>
              <div 
                onClick={() => setIsWeatherModalOpen(true)}
                className={\`bg-white/80 backdrop-blur px-5 py-2.5 rounded-2xl shadow-sm border border-[#F0EEE9] font-medium flex items-center gap-2 transition-all hover:scale-105 cursor-pointer hover:shadow-md
                \${weather.aqi <= 50 ? 'text-emerald-700' : 
                  weather.aqi <= 100 ? 'text-yellow-600' : 
                  weather.aqi <= 150 ? 'text-orange-600' : 
                  weather.aqi <= 200 ? 'text-red-600' : 'text-purple-600'}\`}
                title="ดัชนีคุณภาพอากาศ (AQI) เชียงใหม่"
              >
                <span className="text-xl drop-shadow-sm">😷</span>
                <span>AQI: {weather.aqi} <span className="text-sm opacity-80 ml-1">
                  ({weather.aqi <= 50 ? 'ดีมาก' : 
                    weather.aqi <= 100 ? 'ปานกลาง' : 
                    weather.aqi <= 150 ? 'เริ่มมีผลกระทบ' : 
                    weather.aqi <= 200 ? 'มีผลกระทบ' : 'อันตราย'})
                </span></span>
              </div>
            </>
          )}`;

code = code.replace(oldWeatherJsxRegex, newWeatherJsx);

// 4. Add the Weather Modal at the end of the file (before the last closing div of the component)
// The Dashboard component returns a div, and ends with `</div>\n    </div>\n  );\n}`
// Let's inject it before the final `</div>\n    </div>`
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

            <div className="space-y-3">
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

const lastDivsRegex = /<\/div>\s*<\/div>\s*\)\;\s*\}\s*$/;
code = code.replace(lastDivsRegex, `${modalJsx}\n    </div>\n  </div>\n  );\n}`);

fs.writeFileSync('src/app/dashboard/page.tsx', code, 'utf8');
console.log('Successfully updated Dashboard with weather modal and AQI badge.');
