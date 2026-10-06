'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Shield, Users, Save, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          if (userObj.role !== 'admin') {
            router.push('/dashboard');
            return;
          }
          setIsAdmin(true);
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
          router.push('/dashboard');
        }
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [router]);

  const handleRoleChange = async (id: number, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await axios.put(`${API_URL}/api/users/${id}`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await axios.put(`${API_URL}/api/users/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้นี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await axios.delete(`${API_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">กำลังโหลดข้อมูล...</div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-red-600" />
            การจัดการสิทธิ์และผู้ใช้งาน (Admin Panel)
          </h1>
          <p className="text-gray-500 mt-1">จัดการบทบาท (Role) และสถานะบัญชีของบุคลากรในระบบ</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center">
          <Users className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">รายชื่อบัญชีผู้ใช้งานระบบ</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-800 text-xs uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">ID / Username</th>
                <th className="px-6 py-4 font-semibold">อีเมล</th>
                <th className="px-6 py-4 font-semibold">บทบาท (Role)</th>
                <th className="px-6 py-4 font-semibold">สถานะบัญชี</th>
                <th className="px-6 py-4 font-semibold">วันที่สร้าง</th>
                <th className="px-6 py-4 font-semibold text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-indigo-50/50 hover:shadow-sm transition-all duration-300 group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">{user.username}</div>
                    <div className="text-xs text-gray-500">ID: {user.id}</div>
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`border text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 cursor-pointer ${
                        user.role === 'admin' ? 'bg-red-50 border-red-200 text-red-700 font-medium hover:bg-red-100' :
                        user.role === 'hr' ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' :
                        'bg-gray-50 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      <option value="employee">Employee (พนักงาน)</option>
                      <option value="hr">HR (ฝ่ายบุคคล)</option>
                      <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className={`border text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 cursor-pointer ${
                        user.status === 'active' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' :
                        'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      <option value="active">Active (ใช้งานได้)</option>
                      <option value="suspended">Suspended (ระงับบัญชี)</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
                      title="ลบบัญชีผู้ใช้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลผู้ใช้งาน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
