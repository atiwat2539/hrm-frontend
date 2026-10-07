'use client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Check, Info, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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

  const deleteNotification = async (id: number) => {
    // Actually our backend doesn't have a delete route yet for notifications.
    // If the user hasn't explicitly asked for it, we can just hide it or we can add the delete route.
    // Given the prompt "ปรับหน้า Notifications ให้ใช้งานได้", full CRUD is standard.
    // Wait, let me add the route to backend quickly or just implement a filter here for now.
    // I will add the delete route to backend.
    if (!confirm('ยืนยันการลบการแจ้งเตือนนี้?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete notification. Make sure the backend supports it.');
    }
  };

  const getIconForType = (type: string) => {
    switch(type) {
      case 'warning': return <AlertCircle className="w-6 h-6 text-amber-500" />;
      case 'success': return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      default: return <Info className="w-6 h-6 text-indigo-500" />;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bell className="w-6 h-6 mr-2 text-indigo-600" />
            การแจ้งเตือนทั้งหมด (Notifications)
          </h1>
          <p className="text-gray-500 mt-1">คุณมีข้อความที่ยังไม่อ่าน {unreadCount} รายการ</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-none">
            <Check className="w-4 h-4 mr-2" />
            อ่านทั้งหมด
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {notifications.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {notifications.map(notification => (
              <li 
                key={notification.id}
                className={`p-5 flex gap-4 transition-colors hover:bg-gray-50 ${!notification.is_read ? 'bg-indigo-50/20' : ''}`}
              >
                <div className="mt-1 flex-shrink-0">
                  {getIconForType(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-base font-medium text-gray-900 ${!notification.is_read ? 'font-bold' : ''}`}>
                        {notification.title}
                        {!notification.is_read && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            ใหม่
                          </span>
                        )}
                      </p>
                      <p className="text-gray-600 mt-1 text-base">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-400 mt-2 flex items-center">
                        {new Date(notification.created_at).toLocaleString('th-TH', { 
                          dateStyle: 'medium', 
                          timeStyle: 'short' 
                        })}
                      </p>
                    </div>
                    
                    <div className="flex flex-col space-y-2 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
                      {!notification.is_read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 rounded-md hover:bg-indigo-50 transition-colors whitespace-nowrap"
                        >
                          ทำเครื่องหมายว่าอ่านแล้ว
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors flex items-center justify-end"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> ลบ
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">ไม่มีการแจ้งเตือน</h3>
            <p className="text-gray-500 mt-1">คุณได้อ่านข้อความแจ้งเตือนทั้งหมดแล้ว</p>
          </div>
        )}
      </div>
    </div>
  );
}
