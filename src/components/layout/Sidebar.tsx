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
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">HRM System</h1>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 mt-6">
        <ul className="space-y-1 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);
            return (
              <li key={item.name}>
                <Link
                  href={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-900/50 scale-[1.02]' 
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white hover:scale-[1.02]'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-indigo-400'}`} />
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
                className={`flex items-center space-x-3 px-4 py-3 mt-4 rounded-lg transition-all duration-300 border group ${
                  pathname.startsWith('/admin') 
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-500 shadow-md shadow-rose-900/50 scale-[1.02]' 
                    : 'border-slate-800 text-rose-400 hover:bg-slate-800/80 hover:text-rose-300 hover:border-rose-900 hover:scale-[1.02]'
                }`}
              >
                <Shield className={`w-5 h-5 transition-transform duration-300 ${pathname.startsWith('/admin') ? 'scale-110' : 'group-hover:scale-110'}`} />
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
