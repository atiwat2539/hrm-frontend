const fs = require('fs');
let text = fs.readFileSync('src/app/personnel/page.tsx', 'utf8');
text = text.replace(
  /const handleFileChange = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?\};/,
  `const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setCropImageSrc(objectUrl);
      e.target.value = '';
    }
  };`
);
fs.writeFileSync('src/app/personnel/page.tsx', text, 'utf8');
console.log('Fixed handleFileChange');
