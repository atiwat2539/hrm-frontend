'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Target, Clock } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import axios from 'axios';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading Dashboard...</p>
      </div>
    );
  }

  // Fallbacks if data fails to load
  const totalEmployees = dashboardData?.totalEmployees || 0;
  const newEmployees = dashboardData?.newEmployees || 0;
  const kpiCompleted = dashboardData?.kpiCompleted || '0%';
  const trainingHours = dashboardData?.trainingHours || '0';
  const translateKpiStatus = (status: string) => {
    switch (status) {
      case 'Achieved': return 'บรรลุเป้าหมาย';
      case 'In Progress': return 'กำลังดำเนินการ';
      case 'Below Target': return 'ต่ำกว่าเป้าหมาย';
      default: return status;
    }
  };

  const translateMonth = (monthStr: string) => {
    const monthMap: Record<string, string> = {
      'Jan': 'ม.ค.', 'Feb': 'ก.พ.', 'Mar': 'มี.ค.', 'Apr': 'เม.ย.', 'May': 'พ.ค.', 'Jun': 'มิ.ย.',
      'Jul': 'ก.ค.', 'Aug': 'ส.ค.', 'Sep': 'ก.ย.', 'Oct': 'ต.ค.', 'Nov': 'พ.ย.', 'Dec': 'ธ.ค.'
    };
    return monthMap[monthStr] || monthStr;
  };

  const growthData = (dashboardData?.growthData || []).map((d: any) => ({
    ...d,
    name: translateMonth(d.name)
  }));

  const rawKpiData = dashboardData?.kpiData || [
    { name: 'Achieved', value: 0 },
    { name: 'In Progress', value: 0 },
    { name: 'Below Target', value: 0 },
  ];
  
  const kpiData = rawKpiData.map((d: any) => ({
    ...d,
    name: translateKpiStatus(d.name)
  }));
  
  const individualKpiData = dashboardData?.individualKpiData || [];

  const stats = [
    { name: 'พนักงานทั้งหมด', value: totalEmployees.toString(), icon: Users, change: 'จำนวนปัจจุบัน', changeType: 'positive' },
    { name: 'พนักงานใหม่', value: newEmployees.toString(), icon: UserPlus, change: '30 วันที่ผ่านมา', changeType: 'positive' },
    { name: 'KPI ที่สำเร็จ', value: kpiCompleted, icon: Target, change: 'อัตราภาพรวม', changeType: 'positive' },
    { name: 'ชั่วโมงอบรม', value: trainingHours, icon: Clock, change: 'บันทึกรวมทั้งหมด', changeType: 'positive' },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ภาพรวมระบบ (Dashboard)</h1>
        <p className="text-sm text-gray-500">ยินดีต้อนรับกลับ! นี่คือภาพรวมข้อมูลทั้งหมดขององค์กรคุณ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-full">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personnel Growth Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[400px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">การเติบโตของจำนวนพนักงาน (6 เดือนที่ผ่านมา)</h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="employees" 
                  name="พนักงานทั้งหมด"
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[400px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">สัดส่วนสถานะ KPI</h3>
          <div className="h-[320px] w-full">
            {kpiData.every((d: any) => d.value === 0) ? (
              <div className="flex h-full items-center justify-center text-gray-400">
                ไม่มีข้อมูล KPI
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kpiData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {kpiData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#374151' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Individual KPI Achievement Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[400px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">ความสำเร็จ KPI รายบุคคล (10 อันดับแรก)</h3>
          <div className="h-[320px] w-full">
            {!individualKpiData || individualKpiData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-400">
                ไม่มีข้อมูล KPI รายบุคคล
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={individualKpiData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'ความสำเร็จ']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="achievement" fill="#10b981" barSize={20} radius={[0, 4, 4, 0]} name="ความสำเร็จ %" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
