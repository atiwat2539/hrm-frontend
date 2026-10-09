'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Global Save Progress State
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  
  // Don't wrap login/register pages with the dashboard layout
  
  
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

  // Auto Logout Logic (15 minutes of inactivity)
  useEffect(() => {
    if (pathname === '/login' || pathname === '/register') return;

    let intervalId: ReturnType<typeof setInterval>;
    let lastActionTime = Date.now();

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    };

    const checkIdle = () => {
      // 15 minutes = 15 * 60 * 1000 = 900000 ms
      if (Date.now() - lastActionTime >= 15 * 60 * 1000) {
        logout();
      }
    };

    const updateActivity = () => {
      lastActionTime = Date.now();
    };

    // Check every minute
    intervalId = setInterval(checkIdle, 60 * 1000);

    // Removed 'mousemove' as micro-movements of optical mice can prevent idle detection
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [pathname, router]);

  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-[#F0EEE9] overflow-hidden relative font-sans">
      
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
                style={{ width: `${saveProgress}%` }}
              ></div>
            </div>
            <div className="w-full flex justify-end">
              <span className="text-sm font-black text-[#87B3A8]">{Math.round(saveProgress)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile unless open, block on desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full bg-gradient-to-br from-[#F0EEE9]/90 to-[#FDFDFC]">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
