const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// 1. Update state type
code = code.replace(
  "const [weather, setWeather] = useState<{ temp: number, text: string, icon: string } | null>(null);",
  "const [weather, setWeather] = useState<{ temp: number, text: string, icon: string, aqi: number } | null>(null);"
);

// 2. Update fetchWeather function
const oldFetchWeather = `    const fetchWeather = async () => {
      try {
        const res = await axios.get('https://api.open-meteo.com/v1/forecast?latitude=13.75&longitude=100.5167&current_weather=true');
        const code = res.data.current_weather.weathercode;
        const temp = res.data.current_weather.temperature;
        
        let icon = '☀️';
        let text = 'แจ่มใส';
        
        if (code >= 1 && code <= 3) { icon = '⛅'; text = 'มีเมฆบางส่วน'; }
        else if (code >= 45 && code <= 48) { icon = '🌫️'; text = 'มีหมอก'; }
        else if (code >= 51 && code <= 67) { icon = '🌧️'; text = 'มีฝนตก'; }
        else if (code >= 80 && code <= 82) { icon = '🌦️'; text = 'ฝนตกปรอยๆ'; }
        else if (code >= 95) { icon = '⛈️'; text = 'ฝนฟ้าคะนอง'; }
        
        setWeather({ temp, text, icon });
      } catch (e) {
        console.error('Weather fetch error', e);
      }
    };`;

const newFetchWeather = `    const fetchWeather = async () => {
      try {
        const lat = 18.7883;
        const lon = 98.9853;
        const [weatherRes, aqiRes] = await Promise.all([
          axios.get(\`https://api.open-meteo.com/v1/forecast?latitude=\${lat}&longitude=\${lon}&current_weather=true\`),
          axios.get(\`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=\${lat}&longitude=\${lon}&current=us_aqi\`)
        ]);
        
        const code = weatherRes.data.current_weather.weathercode;
        const temp = weatherRes.data.current_weather.temperature;
        const aqi = aqiRes.data.current.us_aqi;
        
        let icon = '☀️';
        let text = 'แจ่มใส';
        
        if (code >= 1 && code <= 3) { icon = '⛅'; text = 'มีเมฆบางส่วน'; }
        else if (code >= 45 && code <= 48) { icon = '🌫️'; text = 'มีหมอก'; }
        else if (code >= 51 && code <= 67) { icon = '🌧️'; text = 'มีฝนตก'; }
        else if (code >= 80 && code <= 82) { icon = '🌦️'; text = 'ฝนตกปรอยๆ'; }
        else if (code >= 95) { icon = '⛈️'; text = 'ฝนฟ้าคะนอง'; }
        
        setWeather({ temp, text, icon, aqi });
      } catch (e) {
        console.error('Weather fetch error', e);
      }
    };`;

code = code.replace(oldFetchWeather, newFetchWeather);

// 3. Update JSX
const oldJsx = `          {weather && (
            <div className="bg-white/80 backdrop-blur px-5 py-2.5 rounded-2xl shadow-sm border border-[#F0EEE9] text-gray-700 font-medium flex items-center gap-2 transition-all hover:scale-105 cursor-default">
              <span className="text-xl drop-shadow-sm">{weather.icon}</span>
              <span>{weather.temp}°C <span className="text-sm text-gray-500 ml-1">{weather.text}</span></span>
            </div>
          )}`;

const newJsx = `          {weather && (
            <>
              <div className="bg-white/80 backdrop-blur px-5 py-2.5 rounded-2xl shadow-sm border border-[#F0EEE9] text-gray-700 font-medium flex items-center gap-2 transition-all hover:scale-105 cursor-default" title="สภาพอากาศ เชียงใหม่">
                <span className="text-xl drop-shadow-sm">{weather.icon}</span>
                <span>{weather.temp}°C <span className="text-sm text-gray-500 ml-1">เชียงใหม่ ({weather.text})</span></span>
              </div>
              <div className={\`bg-white/80 backdrop-blur px-5 py-2.5 rounded-2xl shadow-sm border border-[#F0EEE9] font-medium flex items-center gap-2 transition-all hover:scale-105 cursor-default
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

code = code.replace(oldJsx, newJsx);

fs.writeFileSync('src/app/dashboard/page.tsx', code, 'utf8');
console.log('Successfully updated Dashboard weather to Chiang Mai with AQI.');
