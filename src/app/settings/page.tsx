'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, User, Lock, Bell, Shield, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile State
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setProfileData({
          ...profileData,
          username: user.username || '',
          email: user.email || ''
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน โปรดยืนยันใหม่อีกครั้ง');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        username: profileData.username,
        email: profileData.email,
        password: profileData.password ? profileData.password : undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.setItem('user', JSON.stringify(res.data.user));
      setMessage('บันทึกข้อมูลเรียบร้อยแล้ว');
      
      // Clear password fields
      setProfileData({ ...profileData, password: '', confirmPassword: '' });
      
      // Force reload to update Topbar (or could use context, but reload is robust for simple apps)
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="w-6 h-6 mr-2 text-indigo-600" />
            การตั้งค่าระบบและผู้ใช้งาน (Settings)
          </h1>
          <p className="text-gray-500 mt-1">จัดการข้อมูลส่วนตัวและตั้งค่าการทำงานของระบบ</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit flex-shrink-0">
          <ul className="divide-y divide-gray-100">
            <li>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-5 py-4 text-left transition-all duration-300 group ${activeTab === 'profile' ? 'bg-indigo-50 border-l-4 border-indigo-600 text-indigo-700 font-medium' : 'hover:bg-gray-50 text-gray-700 border-l-4 border-transparent hover:pl-6'}`}
              >
                <User className={`w-5 h-5 mr-3 transition-transform duration-300 ${activeTab === 'profile' ? 'text-indigo-600 scale-110' : 'text-gray-400 group-hover:scale-110'}`} />
                ข้อมูลผู้ใช้งาน (Profile)
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center px-5 py-4 text-left transition-all duration-300 group ${activeTab === 'notifications' ? 'bg-indigo-50 border-l-4 border-indigo-600 text-indigo-700 font-medium' : 'hover:bg-gray-50 text-gray-700 border-l-4 border-transparent hover:pl-6'}`}
              >
                <Bell className={`w-5 h-5 mr-3 transition-transform duration-300 ${activeTab === 'notifications' ? 'text-indigo-600 scale-110' : 'text-gray-400 group-hover:scale-110'}`} />
                การแจ้งเตือน (Notifications)
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center px-5 py-4 text-left transition-all duration-300 group ${activeTab === 'security' ? 'bg-indigo-50 border-l-4 border-indigo-600 text-indigo-700 font-medium' : 'hover:bg-gray-50 text-gray-700 border-l-4 border-transparent hover:pl-6'}`}
              >
                <Shield className={`w-5 h-5 mr-3 transition-transform duration-300 ${activeTab === 'security' ? 'text-indigo-600 scale-110' : 'text-gray-400 group-hover:scale-110'}`} />
                ความปลอดภัยระบบ (Security)
              </button>
            </li>
          </ul>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">ตั้งค่าข้อมูลบัญชีผู้ใช้</h2>
              
              {message && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {message}
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อผู้ใช้ (Username)</label>
                  <input 
                    required 
                    type="text" 
                    value={profileData.username}
                    onChange={e => setProfileData({...profileData, username: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">อีเมล (Email)</label>
                  <input 
                    required 
                    type="email" 
                    value={profileData.email}
                    onChange={e => setProfileData({...profileData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                  />
                </div>
                
                <div className="pt-4 border-t mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                    <Lock className="w-5 h-5 mr-2 text-gray-500" />
                    เปลี่ยนรหัสผ่าน
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">ปล่อยว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">รหัสผ่านใหม่ (New Password)</label>
                      <input 
                        type="password" 
                        value={profileData.password}
                        onChange={e => setProfileData({...profileData, password: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">ยืนยันรหัสผ่าน (Confirm Password)</label>
                      <input 
                        type="password" 
                        value={profileData.confirmPassword}
                        onChange={e => setProfileData({...profileData, confirmPassword: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button type="submit" disabled={loading} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-95 px-8 py-2.5 text-base">
                    <Save className="w-5 h-5 mr-2" />
                    {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">การตั้งค่าการแจ้งเตือน</h2>
              <p className="text-gray-500">ส่วนนี้ยังอยู่ในระหว่างการพัฒนา จะพร้อมให้ตั้งค่าการเปิด/ปิดแจ้งเตือนทางอีเมลในเวอร์ชันถัดไป</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">ความปลอดภัยและสิทธิ์การเข้าถึง</h2>
              <p className="text-gray-500">ส่วนนี้ยังอยู่ในระหว่างการพัฒนา สำหรับจัดการสิทธิ์ (Role) และประวัติการเข้าสู่ระบบ</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Just a quick icon for success message
function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
