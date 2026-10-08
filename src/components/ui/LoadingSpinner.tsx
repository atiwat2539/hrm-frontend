'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 w-full h-full min-h-[40vh] bg-transparent">
      <div className="relative mb-8 flex flex-col items-center">
        {/* The Jumping Square container */}
        <div 
          className="w-14 h-14 bg-gradient-to-tr from-[#A3C4BC] to-[#E5989B] rounded-2xl shadow-xl shadow-[#A3C4BC]/40 animate-bounce flex items-center justify-center relative overflow-hidden"
          style={{ animationDuration: '0.8s' }}
        >
          {/* Inner spinning element for flip effect */}
          <div 
            className="absolute -inset-4 bg-white/20 animate-spin" 
            style={{ animationDuration: '2s' }}
          ></div>
          <div className="w-5 h-5 bg-white/60 backdrop-blur-md rounded-lg shadow-inner animate-pulse"></div>
        </div>
        
        {/* Shadow blob under the square */}
        <div className="absolute -bottom-5 w-10 h-1.5 bg-gray-200 rounded-[100%] animate-pulse blur-[1px]"></div>
      </div>
      
      <p className="text-[#87B3A8] font-bold tracking-wider animate-pulse text-sm mt-2">กำลังโหลดข้อมูลระบบ...</p>
    </div>
  );
}
