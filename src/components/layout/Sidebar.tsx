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
  X
} from 'lucide-react';

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
                  className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 text-slate-300 hover:text-white cursor-pointer transition-colors px-4 py-2 rounded-md hover:bg-slate-800"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
