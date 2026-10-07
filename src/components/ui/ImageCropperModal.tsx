'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/utils/cropImage';
import { X, Check } from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  onCropComplete: (croppedFile: File, previewUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropperModal({ imageSrc, onCropComplete, onCancel }: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
      if (croppedFile) {
        const previewUrl = URL.createObjectURL(croppedFile);
        onCropComplete(croppedFile, previewUrl);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">ปรับขนาดรูปโปรไฟล์</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1.5 rounded-full transition"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="p-6">
          <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteHandler}
              onZoomChange={onZoomChange}
            />
          </div>
          
          <div className="mt-6 flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">ย่อ/ขยาย</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 shrink-0">
          <button onClick={onCancel} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition">ยกเลิก</button>
          <button onClick={handleSave} className="px-5 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 font-medium transition flex items-center">
            <Check className="w-4 h-4 mr-2" />
            บันทึกรูป
          </button>
        </div>
      </div>
    </div>
  );
}
