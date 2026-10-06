'use client';

import Image from 'next/image';
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
    <aside className="w-64 bg-[#F4B6C2] text-gray-800 min-h-screen flex flex-col border-r border-[#EAA2B0] shadow-xl">
      <div className="p-5 flex items-center justify-between border-b border-white/40">
        <div className="bg-white px-2 py-1.5 rounded-xl shadow-sm w-full flex justify-center items-center">
          <Image 
            src="/logo.png" 
            alt="CMU Library Logo" 
            width={120} 
            height={40} 
            className="object-contain"
            priority 
          />
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 ml-2 text-gray-500 hover:text-gray-800 flex-shrink-0">
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
                      ? 'bg-white text-[#D94F70] font-bold shadow-sm shadow-[#F4B6C2]/40 scale-[1.02]' 
                      : 'text-gray-700 hover:bg-white/40 hover:text-gray-900 hover:scale-[1.02]'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-[#D94F70]'}`} />
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
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-md shadow-pink-500/40 scale-[1.02] font-bold' 
                    : 'border-white/50 text-[#D94F70] hover:bg-white/40 hover:text-[#C14664] hover:border-white hover:scale-[1.02]'
                }`}
              >
                <Shield className={`w-5 h-5 transition-transform duration-300 ${pathname.startsWith('/admin') ? 'scale-110 text-white' : 'group-hover:scale-110'}`} />
                <span>Admin Panel</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>
      <div className="p-4 border-t border-white/40">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 text-gray-600 hover:text-red-600 cursor-pointer transition-all duration-300 px-4 py-3 rounded-lg hover:bg-white/50 hover:scale-[1.02] group"
        >
          <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:text-red-600" />
          <span className="group-hover:text-red-600 transition-colors font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
