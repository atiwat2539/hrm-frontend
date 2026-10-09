const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const fetchRegex = /const fetchWeather = async \(\) => \{[\s\S]*?catch \(e\) \{\s*console\.error\('Weather fetch error', e\);\s*\}\s*\};/g;

const newFetchWeather = `const fetchWeather = async () => {
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

code = code.replace(fetchRegex, newFetchWeather);
fs.writeFileSync('src/app/dashboard/page.tsx', code, 'utf8');
console.log('Fixed fetchWeather replacement.');
