'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, Check, Info, AlertCircle } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<{username: string, email: string, role: string} | null>(null);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{employees: any[], kpis: any[], trainings: any[]} | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Search logic with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearchOpen(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSearchResults(res.data);
        setIsSearchOpen(true);
      } catch (error) {
        console.error('Search error', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIconForType = (type: string) => {
    switch(type) {
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'success': return <Check className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 relative z-30">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="lg:hidden p-2 mr-2 text-gray-500 hover:text-gray-700">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative w-48 sm:w-64 md:w-96" ref={searchRef}>
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาพนักงาน, KPI, การอบรม..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchQuery.trim()) setIsSearchOpen(true); }}
          />

          {isSearchOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-gray-500">กำลังค้นหา...</div>
              ) : searchResults ? (
                <div className="py-2">
                  {searchResults.employees.length > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-1 text-xs font-bold text-gray-500 bg-gray-50 uppercase tracking-wider">พนักงาน (Personnel)</div>
                      {searchResults.employees.map((emp) => (
                        <div key={emp.id} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer" onClick={() => { router.push('/personnel'); setIsSearchOpen(false); }}>
                          <p className="text-sm font-medium text-gray-900">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-gray-500">{emp.position} - {emp.department}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.kpis.length > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-1 text-xs font-bold text-gray-500 bg-gray-50 uppercase tracking-wider">KPI</div>
                      {searchResults.kpis.map((kpi) => (
                        <div key={kpi.id} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer" onClick={() => { router.push('/kpi'); setIsSearchOpen(false); }}>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{kpi.title}</p>
                          <p className="text-xs text-gray-500">เป้าหมาย: {kpi.target} {kpi.unit}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.trainings.length > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-1 text-xs font-bold text-gray-500 bg-gray-50 uppercase tracking-wider">การอบรม (Training)</div>
                      {searchResults.trainings.map((t) => (
                        <div key={t.id} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer" onClick={() => { router.push('/training'); setIsSearchOpen(false); }}>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{t.title}</p>
                          <p className="text-xs text-gray-500">{t.category}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.employees.length === 0 && searchResults.kpis.length === 0 && searchResults.trainings.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500">ไม่พบข้อมูลที่ค้นหา</div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`relative p-2 rounded-full transition-colors ${isOpen ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800">การแจ้งเตือน</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    อ่านทั้งหมด
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                      className={`p-4 border-b border-gray-50 flex items-start gap-3 cursor-pointer transition-colors hover:bg-gray-50 ${!notification.is_read ? 'bg-indigo-50/30' : ''}`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {getIconForType(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-gray-900 ${!notification.is_read ? 'font-bold' : ''}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1.5">
                          {new Date(notification.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5 flex-shrink-0"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    ไม่มีการแจ้งเตือน
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-gray-100 text-center bg-gray-50">
                <Link href="/notifications" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium block w-full py-1">
                  ดูการแจ้งเตือนทั้งหมด
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative" ref={profileDropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-3 border-l border-gray-200 pl-4 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-sm">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="hidden md:block text-sm text-left">
              <p className="font-medium text-gray-800">{user?.username || 'Admin User'}</p>
              <p className="text-gray-500 text-xs">{user?.email || 'admin@hrm.com'}</p>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="py-1">
                <Link 
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors block"
                >
                  แก้ไขข้อมูล
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                >
                  ออกจากระบบ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
