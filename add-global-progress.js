const fs = require('fs');

let code = fs.readFileSync('src/components/layout/DashboardLayout.tsx', 'utf8');

// 1. Add axios import if missing
if (!code.includes("import axios")) {
  code = code.replace("import { usePathname", "import axios from 'axios';\nimport { usePathname");
}

// 2. Add state variables
const stateHookStr = `  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Global Save Progress State
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);`;

code = code.replace("  const [isSidebarOpen, setIsSidebarOpen] = useState(false);", stateHookStr);

// 3. Add useEffect for Axios Interceptors
const axiosEffect = `
  // Axios Interceptors for Global Save Progress
  useEffect(() => {
    let intervalId: any;
    
    const reqInterceptor = axios.interceptors.request.use((config) => {
      // Trigger progress for POST, PUT, PATCH, DELETE
      if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
        setIsSaving(true);
        setSaveProgress(0);
        
        // Simulate progress bar filling up
        clearInterval(intervalId);
        intervalId = setInterval(() => {
          setSaveProgress((prev) => {
            if (prev >= 90) return prev;
            return prev + Math.random() * 10;
          });
        }, 150);
      }
      return config;
    });

    const resInterceptor = axios.interceptors.response.use(
      (response) => {
        if (['post', 'put', 'patch', 'delete'].includes(response.config.method?.toLowerCase() || '')) {
          clearInterval(intervalId);
          setSaveProgress(100);
          
          // Hide modal after a short delay so user sees 100%
          setTimeout(() => {
            setIsSaving(false);
            setTimeout(() => setSaveProgress(0), 300); // Reset after fade out
          }, 500);
        }
        return response;
      },
      (error) => {
        clearInterval(intervalId);
        setIsSaving(false);
        setSaveProgress(0);
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
      clearInterval(intervalId);
    };
  }, []);
`;

// Insert the effect right before auto-logout logic
code = code.replace("// Auto Logout Logic", axiosEffect + "\n  // Auto Logout Logic");

// 4. Add the Overlay Modal in the JSX return
const overlayJSX = `
      {/* Global Save Progress Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-[#A3C4BC]/20 to-[#87B3A8]/20 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-10 h-10 text-[#87B3A8] animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 mb-2">กำลังบันทึกข้อมูล...</h3>
            <p className="text-sm text-gray-500 mb-8 text-center font-medium">กรุณารอสักครู่ ระบบกำลังประมวลผล</p>
            
            <div className="w-full bg-gray-100 rounded-full h-3 mb-3 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-[#A3C4BC] to-[#87B3A8] h-3 rounded-full transition-all duration-300 ease-out" 
                style={{ width: \`\${saveProgress}%\` }}
              ></div>
            </div>
            <div className="w-full flex justify-end">
              <span className="text-sm font-black text-[#87B3A8]">{Math.round(saveProgress)}%</span>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  "{/* Mobile Sidebar Overlay */}", 
  overlayJSX + "\n      {/* Mobile Sidebar Overlay */}"
);

fs.writeFileSync('src/components/layout/DashboardLayout.tsx', code, 'utf8');
console.log('DashboardLayout updated successfully!');
