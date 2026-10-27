'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Save, 
  BellRing, 
  AlertCircle, 
  RefreshCw, 
  Send,
  Search,
  Filter,
  Activity,
  LogIn,
  PlusCircle,
  Edit3,
  Trash2,
  UserCheck,
  Clock,
  Layers,
  ChevronRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuditLogItem {
  id: number;
  user_id: number;
  action: string;
  module: string;
  record_id: number;
  description: string;
  created_at: string;
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  
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

  // LINE Notification Test State
  const [testingLine, setTestingLine] = useState(false);
  const [lineStatus, setLineStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security / Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterModule, setFilterModule] = useState('all');

  const handleTestLineNotify = async () => {
    setTestingLine(true);
    setLineStatus(null);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cron/daily-calendar`);
      setLineStatus({
        type: 'success',
        text: res.data.message || 'ส่งข้อความแจ้งเตือนผ่าน LINE สำเร็จเรียบร้อยแล้ว'
      });
    } catch (err: any) {
      setLineStatus({
        type: 'error',
        text: 'เกิดข้อผิดพลาดในการส่งแจ้งเตือน: ' + (err.response?.data?.message || err.message)
      });
    } finally {
      setTestingLine(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserRole(user.role || '');
        setProfileData(prev => ({
          ...prev,
          username: user.username || '',
          email: user.email || ''
        }));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchAuditLogs = async () => {
    setLogsLoading(true);
    setLogsError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          action: filterAction !== 'all' ? filterAction : undefined,
          module: filterModule !== 'all' ? filterModule : undefined,
          limit: 100
        }
      });
      setAuditLogs(res.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setLogsError('เฉพาะผู้ดูแลระบบ (Admin) หรือฝ่ายบุคคล (HR) เท่านั้นที่มีสิทธิ์เข้าถึงประวัติความปลอดภัยระบบ');
      } else {
        setLogsError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลประวัติความปลอดภัยได้');
      }
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'security') {
      fetchAuditLogs();
    }
  }, [activeTab, filterAction, filterModule]);

  // Client-side search filtering
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return auditLogs;
    const q = searchQuery.toLowerCase().trim();
    return auditLogs.filter(log => 
      log.description?.toLowerCase().includes(q) ||
      log.module?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q) ||
      log.user?.username?.toLowerCase().includes(q) ||
      log.user?.email?.toLowerCase().includes(q)
    );
  }, [auditLogs, searchQuery]);

  // Unique modules list for filter dropdown
  const moduleOptions = useMemo(() => {
    const modules = new Set<string>();
    auditLogs.forEach(log => {
      if (log.module) modules.add(log.module);
    });
    return Array.from(modules);
  }, [auditLogs]);

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
      setProfileData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const formatThaiDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }) + ' น.';
  };

  const renderActionBadge = (action: string) => {
    switch (action.toUpperCase()) {
      case 'LOGIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <LogIn className="w-3.5 h-3.5" />
            เข้าสู่ระบบ (Login)
          </span>
        );
      case 'POST':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PlusCircle className="w-3.5 h-3.5" />
            สร้างข้อมูล (POST)
          </span>
        );
      case 'PUT':
      case 'PATCH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Edit3 className="w-3.5 h-3.5" />
            แก้ไขข้อมูล (PUT)
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Trash2 className="w-3.5 h-3.5" />
            ลบข้อมูล (DELETE)
          </span>
        );
      case 'UPDATE_PROFILE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
            <UserCheck className="w-3.5 h-3.5" />
            เปลี่ยนโปรไฟล์
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            <Activity className="w-3.5 h-3.5" />
            {action}
          </span>
        );
    }
  };

  const renderRoleBadge = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-700 border border-purple-200">Admin</span>;
      case 'hr':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">HR</span>;
      case 'manager':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">Manager</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">Employee</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="w-6 h-6 mr-2 text-indigo-600" />
            การตั้งค่าระบบและผู้ใช้งาน (Settings)
          </h1>
          <p className="text-gray-500 mt-1">จัดการข้อมูลส่วนตัว การแจ้งเตือน และตรวจสอบประวัติความปลอดภัยระบบ</p>
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
                    onChange={e => setProfileData(prev => ({...prev, username: e.target.value}))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">อีเมล (Email)</label>
                  <input 
                    required 
                    type="email" 
                    value={profileData.email}
                    onChange={e => setProfileData(prev => ({...prev, email: e.target.value}))}
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
                        onChange={e => setProfileData(prev => ({...prev, password: e.target.value}))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">ยืนยันรหัสผ่าน (Confirm Password)</label>
                      <input 
                        type="password" 
                        value={profileData.confirmPassword}
                        onChange={e => setProfileData(prev => ({...prev, confirmPassword: e.target.value}))}
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
              <div className="border-b pb-4">
                <h2 className="text-xl font-bold text-gray-900">การตั้งค่าการแจ้งเตือน (Notifications)</h2>
                <p className="text-sm text-gray-500 mt-1">จัดการระบบแจ้งเตือนภายนอกและการส่งข้อมูลสรุปประจำวัน</p>
              </div>

              {/* LINE Notification Card */}
              <div className="bg-gradient-to-br from-emerald-50/70 to-white rounded-2xl border border-emerald-200 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#06C755] flex items-center justify-center text-white shadow-md shrink-0">
                      <BellRing className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">การแจ้งเตือนผ่าน LINE (LINE Notification)</h3>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          พร้อมใช้งาน
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        ระบบจะส่งข้อความสรุปกิจกรรมและนัดหมายในปฏิทินประจำวันไปยังกลุ่มหรือบัญชี LINE โดยอัตโนมัติ
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleTestLineNotify}
                    disabled={testingLine}
                    className="bg-[#06C755] hover:bg-[#05b04c] text-white font-medium px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all shrink-0 flex items-center justify-center gap-2 self-start md:self-auto"
                  >
                    {testingLine ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        กำลังส่งแจ้งเตือน...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        ทดสอบส่งแจ้งเตือน LINE
                      </>
                    )}
                  </Button>
                </div>

                {lineStatus && (
                  <div
                    className={`mt-4 p-4 rounded-xl text-sm flex items-start gap-2.5 animate-in fade-in duration-200 ${
                      lineStatus.type === 'success'
                        ? 'bg-emerald-100/70 text-emerald-900 border border-emerald-300'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {lineStatus.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-700 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{lineStatus.type === 'success' ? 'สำเร็จ' : 'แจ้งเตือนผิดพลาด'}</p>
                      <p className="mt-0.5">{lineStatus.text}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Other Notifications info */}
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
                <h4 className="text-base font-semibold text-gray-800 mb-1">การแจ้งเตือนทางอีเมล (Email Notifications)</h4>
                <p className="text-sm text-gray-500">
                  ส่วนนี้ยังอยู่ในระหว่างการพัฒนา จะพร้อมให้ตั้งค่าการเปิด/ปิดแจ้งเตือนทางอีเมลในเวอร์ชันถัดไป
                </p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-indigo-600" />
                    ประวัติความปลอดภัยและการใช้งานระบบ (Audit Logs)
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    บันทึกประวัติการเข้าใช้งาน การเพิ่ม แก้ไข และลบข้อมูลของบุคลากรในระบบแบบเรียลไทม์
                  </p>
                </div>
                <Button 
                  onClick={fetchAuditLogs} 
                  disabled={logsLoading} 
                  variant="outline" 
                  size="sm"
                  className="rounded-xl border-gray-200 hover:bg-gray-50 shrink-0 flex items-center gap-2 self-start sm:self-auto text-gray-700"
                >
                  <RefreshCw className={`w-4 h-4 ${logsLoading ? 'animate-spin text-indigo-600' : 'text-gray-500'}`} />
                  {logsLoading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}
                </Button>
              </div>

              {/* Permission Error */}
              {logsError ? (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">การเข้าถึงถูกจำกัด</h4>
                    <p className="text-sm mt-0.5 text-amber-700">{logsError}</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Filters & Search Toolbar */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200/80">
                    {/* Search */}
                    <div className="sm:col-span-6 relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="ค้นหาข้อความ, ชื่อผู้ใช้, โมดูล..."
                        className="w-full pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    {/* Action Filter */}
                    <div className="sm:col-span-3">
                      <select
                        value={filterAction}
                        onChange={e => setFilterAction(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                      >
                        <option value="all">กิจกรรมทั้งหมด</option>
                        <option value="LOGIN">เข้าสู่ระบบ (LOGIN)</option>
                        <option value="POST">สร้างข้อมูล (POST)</option>
                        <option value="PUT">แก้ไขข้อมูล (PUT)</option>
                        <option value="DELETE">ลบข้อมูล (DELETE)</option>
                        <option value="UPDATE_PROFILE">เปลี่ยนโปรไฟล์</option>
                      </select>
                    </div>

                    {/* Module Filter */}
                    <div className="sm:col-span-3">
                      <select
                        value={filterModule}
                        onChange={e => setFilterModule(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                      >
                        <option value="all">โมดูลทั้งหมด</option>
                        {moduleOptions.map(mod => (
                          <option key={mod} value={mod}>{mod}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                    <span>
                      พบทั้งหมด <strong className="text-gray-800 font-semibold">{filteredLogs.length}</strong> รายการ
                      {searchQuery && ` (กรองจากผลการค้นหา)`}
                    </span>
                    <span className="text-gray-400">แสดงผลเรียงตามเวลาล่าสุด</span>
                  </div>

                  {/* Logs Table / Cards */}
                  {logsLoading && auditLogs.length === 0 ? (
                    <div className="py-16 text-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">กำลังดึงข้อมูลประวัติความปลอดภัย...</p>
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                      <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-base font-semibold text-gray-700">ไม่พบบันทึกประวัติการใช้งาน</h4>
                      <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
                        ยังไม่มีกิจกรรมที่ตรงตามเงื่อนไขการค้นหา หรือยังไม่มีรายการบันทึกในระบบ
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                      <table className="w-full text-left text-sm text-gray-600 divide-y divide-gray-200">
                        <thead className="bg-gray-50/80 text-gray-700 text-xs font-semibold uppercase tracking-wider">
                          <tr>
                            <th scope="col" className="px-4 py-3 whitespace-nowrap">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                วันที่-เวลา
                              </span>
                            </th>
                            <th scope="col" className="px-4 py-3 whitespace-nowrap">
                              <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                ผู้ใช้งาน
                              </span>
                            </th>
                            <th scope="col" className="px-4 py-3 whitespace-nowrap">
                              กิจกรรม (Action)
                            </th>
                            <th scope="col" className="px-4 py-3 whitespace-nowrap">
                              <span className="flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-gray-400" />
                                โมดูล
                              </span>
                            </th>
                            <th scope="col" className="px-4 py-3">
                              รายละเอียด (Description)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100 font-normal">
                          {filteredLogs.map(log => (
                            <tr key={log.id} className="hover:bg-indigo-50/30 transition-colors">
                              {/* Date Time */}
                              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-gray-600 font-mono">
                                {formatThaiDateTime(log.created_at)}
                              </td>

                              {/* User */}
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                    {(log.user?.username || 'U')[0].toUpperCase()}
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-medium text-gray-900 text-xs">
                                        {log.user?.username || `ID #${log.user_id}`}
                                      </span>
                                      {renderRoleBadge(log.user?.role)}
                                    </div>
                                    {log.user?.email && (
                                      <span className="text-[11px] text-gray-400">{log.user.email}</span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Action */}
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                {renderActionBadge(log.action)}
                              </td>

                              {/* Module */}
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                                  {log.module || '-'}
                                </span>
                              </td>

                              {/* Description */}
                              <td className="px-4 py-3.5 text-xs text-gray-700">
                                <p className="max-w-md line-clamp-2" title={log.description}>
                                  {log.description}
                                </p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
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
