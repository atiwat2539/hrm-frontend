const fs = require('fs');
const file = 'src/app/personnel/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Insert import for ImageCropperModal
if (!content.includes('ImageCropperModal')) {
  content = content.replace(/import Image from 'next\/image';/g, "import Image from 'next/image';\nimport ImageCropperModal from '@/components/ui/ImageCropperModal';");
}

// Add state for cropper
if (!content.includes('cropImageSrc')) {
  content = content.replace(/const \[previewUrl, setPreviewUrl\] = useState<string \| null>\(null\);/g, "const [previewUrl, setPreviewUrl] = useState<string | null>(null);\n  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);");
}

// Update handleFileChange to show cropper
const oldHandleFileChange = `  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };`;

const newHandleFileChange = `  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setCropImageSrc(objectUrl);
      // Reset input value so same file can be selected again
      e.target.value = '';
    }
  };`;

content = content.replace(oldHandleFileChange, newHandleFileChange);

// Render the cropper modal
const cropperJsx = `
      {cropImageSrc && (
        <ImageCropperModal 
          imageSrc={cropImageSrc} 
          onCancel={() => setCropImageSrc(null)}
          onCropComplete={(croppedFile, newPreviewUrl) => {
            setSelectedFile(croppedFile);
            setPreviewUrl(newPreviewUrl);
            setCropImageSrc(null);
          }} 
        />
      )}
`;

if (!content.includes('ImageCropperModal imageSrc=')) {
  content = content.replace(/return \(\s*<div/g, 'return (\n    <div').replace(/return \(\n\s*<div/g, 'return (' + cropperJsx + '    <div');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Personnel updated');
