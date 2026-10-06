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
  const kpiCompleted = dashboardData?.kpiCompleted || '0%';
  const averageKpiScore = dashboardData?.averageKpiScore || '0%';
  const totalKpis = dashboardData?.totalKpis || 0;

  const translateKpiStatus = (status: string) => {
    switch (status) {
      case 'Achieved': return 'บรรลุเป้าหมาย';
      case 'In Progress': return 'กำลังดำเนินการ';
      case 'Below Target': return 'ต่ำกว่าเป้าหมาย';
      default: return status;
    }
  };

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
  const kpiDepartmentData = dashboardData?.kpiDepartmentData || [];
  const todayEvents = dashboardData?.todayEvents || [];

  const stats = [
    { name: 'พนักงานทั้งหมด', value: totalEmployees.toString(), icon: Users, change: 'จำนวนปัจจุบัน', changeType: 'positive' },
    { name: 'เป้าหมาย KPI ทั้งหมด', value: totalKpis.toString(), icon: Target, change: 'หัวข้อประเมิน', changeType: 'positive' },
    { name: 'KPI ที่สำเร็จ', value: kpiCompleted, icon: Target, change: 'อัตราภาพรวม', changeType: 'positive' },
    { name: 'คะแนน KPI เฉลี่ย', value: averageKpiScore, icon: Target, change: 'คะแนนเฉลี่ยองค์กร', changeType: 'positive' },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
  const DEPT_COLORS = ['#4f46e5', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b', '#3b82f6'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ภาพรวมระบบ (Dashboard)</h1>
        <p className="text-sm text-gray-500">ยินดีต้อนรับกลับ! นี่คือภาพรวมข้อมูลทั้งหมดขององค์กรคุณ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-900/5 hover:-translate-y-1 transition-all duration-300 group cursor-default">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-full group-hover:bg-indigo-600 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300">
                  <Icon className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300 group-hover:scale-110" />
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
        {/* Department KPI Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 min-h-[400px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">คะแนน KPI เฉลี่ยแยกตามแผนก</h3>
          <div className="h-[320px] w-full">
            {!kpiDepartmentData || kpiDepartmentData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-400">ไม่มีข้อมูลแผนก</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpiDepartmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    formatter={(value) => [`${value}%`, 'คะแนนเฉลี่ย']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="average" radius={[4, 4, 0, 0]}>
                    {kpiDepartmentData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* KPI Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 min-h-[400px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">สถานะการประเมิน KPI ภาพรวม</h3>
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity duration-300 outline-none" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Individual KPI Achievement Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 min-h-[400px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 10 พนักงานผลประเมินสูงสุด</h3>
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

        {/* Today's Calendar Events */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">กิจกรรมและประชุมประจำวัน</h3>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">วันนี้</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {!todayEvents || todayEvents.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-400">
                ไม่มีกิจกรรมในวันนี้
              </div>
            ) : (
              todayEvents.map((event: any) => (
                <div key={event.id} className="flex items-start p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-300 group">
                  <div className="min-w-[70px] text-center border-r-2 border-gray-200 pr-4 mr-4 flex flex-col justify-center h-full">
                    <span className="text-lg font-bold text-gray-800">{event.time}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                    {event.category && (
                      <div className="mt-2 flex items-center">
                        <span 
                          className="inline-block w-2.5 h-2.5 rounded-full mr-2" 
                          style={{ backgroundColor: event.color || '#4f46e5' }}
                        ></span>
                        <span className="text-xs font-medium text-gray-600">{event.category}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
