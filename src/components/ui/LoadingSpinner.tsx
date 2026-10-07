'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 w-full h-full min-h-[40vh] bg-transparent">
      <div className="relative flex items-center justify-center w-20 h-20 mb-6">
        {/* Outer subtle ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-100/80"></div>
        
        {/* Spinning primary ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-400 animate-spin"></div>
        
        {/* Inner reversed spinning ring */}
        <div className="absolute inset-3 rounded-full border-4 border-transparent border-b-violet-500 border-l-violet-300 animate-[spin_1.5s_linear_infinite_reverse]"></div>
        
        {/* Center dot */}
        <div className="absolute w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-md shadow-indigo-500/50"></div>
      </div>
      <p className="text-gray-500 font-semibold tracking-wide animate-pulse">กำลังโหลดข้อมูลระบบ...</p>
    </div>
  );
}
