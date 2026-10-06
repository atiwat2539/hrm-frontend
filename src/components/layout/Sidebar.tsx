'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Target,
  GraduationCap,
  Calendar,
  FileText,
  Bell,
  Settings,
  LogOut,
  X,
  Shield
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface SidebarProps {
  onClose?: () => void;
}

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Personnel', path: '/personnel', icon: Users },
  { name: 'Onboarding', path: '/onboarding', icon: UserPlus },
  { name: 'KPIs', path: '/kpi', icon: Target },
  { name: 'Training', path: '/training', icon: GraduationCap },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-[#2A3432] text-white min-h-screen flex flex-col border-r border-[#1C2322] shadow-xl">
      <div className="p-6 flex items-center justify-between border-b border-[#3B4745]">
        <h1 className="text-2xl font-bold tracking-tight text-[#F0EEE9]">HRM System</h1>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-[#A3C4BC] hover:text-[#F0EEE9]">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 mt-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);
            return (
              <li key={item.name}>
                <Link
                  href={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#A3C4BC] to-[#87B3A8] text-[#1C2322] font-bold shadow-md shadow-[#A3C4BC]/20 scale-[1.02]' 
                      : 'text-[#C9D6D3] hover:bg-[#3B4745] hover:text-[#F0EEE9] hover:scale-[1.02]'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-[#F0EEE9]'}`} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
          
          {userRole === 'admin' && (
            <li>
              <Link
                href="/admin"
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 mt-4 rounded-xl transition-all duration-300 border group ${
                  pathname.startsWith('/admin') 
                    ? 'bg-gradient-to-r from-[#E5989B] to-[#D58386] text-white border-transparent shadow-md shadow-[#E5989B]/30 scale-[1.02] font-bold' 
                    : 'border-[#4A5755] text-[#E5989B] hover:bg-[#3B4745] hover:text-[#F4D8D8] hover:border-[#E5989B] hover:scale-[1.02]'
                }`}
              >
                <Shield className={`w-5 h-5 transition-transform duration-300 ${pathname.startsWith('/admin') ? 'scale-110 text-white' : 'group-hover:scale-110'}`} />
                <span>Admin Panel</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 text-slate-400 hover:text-white cursor-pointer transition-all duration-300 px-4 py-3 rounded-lg hover:bg-slate-800/80 hover:scale-[1.02] group"
        >
          <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:text-red-400" />
          <span className="group-hover:text-red-100 transition-colors">Logout</span>
        </button>
      </div>
    </aside>
  );
}
