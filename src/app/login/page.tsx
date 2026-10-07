'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { ShaderBackground } from '@/components/ui/manu';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const router = useRouter();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await axios.post(\\/api/auth/login\, {
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'การเข้าสู่ระบบล้มเหลว โปรดตรวจสอบข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await axios.post(\\/api/auth/reset-password\, {
        email
      });
      setSuccess(response.data.message);
      setIsForgotPassword(false);
      setPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด โปรดลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden bg-slate-900">
      <ShaderBackground className="absolute inset-0 z-0 opacity-80" />
      
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-white/90 p-4 rounded-3xl shadow-xl backdrop-blur-sm">
            <Image src="/logo.png" alt="DigiDashboard Logo" width={160} height={60} className="object-contain" priority />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white drop-shadow-md">
          เข้าสู่ระบบ DigiDashboard
        </h2>
      </div>
      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success && (
            <div className="mb-6 text-green-700 text-sm font-medium text-center bg-green-50 p-4 rounded-lg border border-green-200">
              {success}
            </div>
          )}
          
          {!isForgotPassword ? (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
                  <button 
                    type="button" 
                    onClick={() => { setIsForgotPassword(true); setError(''); setSuccess(''); }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
                <div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              {error && (
                <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              <div>
                <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                  {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
                </Button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">ลืมรหัสผ่าน</h3>
                <p className="text-sm text-gray-500 mt-1">กรอกอีเมลของคุณเพื่อรีเซ็ตรหัสผ่านใหม่</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              {error && (
                <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                  {loading ? 'กำลังดำเนินการ...' : 'รีเซ็ตรหัสผ่าน'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsForgotPassword(false); setError(''); }} className="w-full">
                  กลับไปหน้าเข้าสู่ระบบ
                </Button>
              </div>
            </form>
          )}

          {!isForgotPassword && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ยังไม่มีบัญชีผู้ใช้?{' '}
                <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                  สร้างบัญชีใหม่
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
