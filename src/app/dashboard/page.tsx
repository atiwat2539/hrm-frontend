'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Target, Clock, X, MapPin, AlignLeft } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import axios from 'axios';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

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
  
  const todayEvents = dashboardData?.todayEvents || [];

  const stats = [
    { name: 'พนักงานทั้งหมด', value: totalEmployees.toString(), icon: Users, change: 'จำนวนปัจจุบัน', changeType: 'positive', color: '#B3C2F2' },
    { name: 'เป้าหมาย KPI ทั้งหมด', value: totalKpis.toString(), icon: Target, change: 'หัวข้อประเมิน', changeType: 'positive', color: '#F4D8D8' },
    { name: 'KPI ที่สำเร็จ', value: kpiCompleted, icon: Target, change: 'อัตราภาพรวม', changeType: 'positive', color: '#D1E8E2' },
  ];

  // Pantone 2026 Cloud Dancer (#F0EEE9) and complementary soft pastels
  const CLOUD_DANCER = '#F0EEE9';
  const PIE_COLORS = ['#A3C4BC', '#E7C8A0', '#E5989B']; // Sage, Warm Sand, Dusty Rose

  return (
    <div className="space-y-6 bg-gradient-to-br from-[#F0EEE9]/50 to-white p-6 rounded-3xl min-h-[calc(100vh-100px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">สวัสดี, {user?.username || 'ผู้ใช้งาน'}</h1>
          <p className="text-sm text-gray-600 mt-1">ภาพรวมการปฏิบัติงาน</p>
        </div>
        <div className="bg-white/80 backdrop-blur px-5 py-2.5 rounded-2xl shadow-sm border border-[#F0EEE9] text-gray-700 font-medium">
          {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-[#F0EEE9] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default">
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 transition-transform duration-500 group-hover:scale-150" style={{ backgroundColor: stat.color }}></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-semibold text-gray-500 truncate">{stat.name}</p>
                  <p className="mt-2 text-4xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="p-4 rounded-2xl transition-all duration-300 shadow-sm" style={{ backgroundColor: stat.color }}>
                  <Icon className="w-7 h-7 text-gray-800 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
              <div className="mt-5 relative z-10">
                <span className="text-sm font-medium text-gray-500 bg-[#F0EEE9] px-3 py-1 rounded-full">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Today's Calendar Events - Highlighted */}
        <div className="lg:col-span-2 relative overflow-hidden bg-white p-8 rounded-3xl shadow-lg border-2 border-[#F0EEE9] hover:shadow-2xl hover:border-[#D1E8E2] transition-all duration-300 flex flex-col min-h-[450px]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F0EEE9]/30 to-transparent pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10 border-b border-[#F0EEE9] pb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">กิจกรรมและประชุมประจำวัน</h3>
              <p className="text-sm text-gray-500 mt-1">อย่าพลาดทุกนัดหมายสำคัญของคุณในวันนี้</p>
            </div>
            <span className="bg-gradient-to-r from-[#A3C4BC] to-[#87B3A8] text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-sm">
              วันนี้
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 relative z-10">
            {!todayEvents || todayEvents.length === 0 ? (
              <div className="flex flex-col h-full items-center justify-center text-gray-400">
                <Clock className="w-12 h-12 mb-3 text-gray-300" />
                <p className="font-medium">ไม่มีกิจกรรมในวันนี้</p>
                <p className="text-sm">คุณมีเวลาว่างสำหรับโฟกัสงานอื่นๆ</p>
              </div>
            ) : (
              todayEvents.map((event: any) => (
                <div 
                  key={event.id} 
                  onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
                  className="flex items-center p-5 rounded-2xl border border-[#F0EEE9] bg-white shadow-sm hover:shadow-md hover:bg-[#F0EEE9]/20 hover:scale-[1.01] transition-all duration-300 group cursor-pointer"
                >
                  <div className="min-w-[90px] text-center border-r-2 border-[#F0EEE9] pr-5 mr-5 flex flex-col justify-center">
                    <span className="text-2xl font-black text-gray-800 group-hover:text-[#87B3A8] transition-colors">{event.time}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors">{event.title}</h4>
                    {event.category && (
                      <div className="mt-2 flex items-center">
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-2 shadow-sm" 
                          style={{ backgroundColor: event.color || '#A3C4BC' }}
                        ></span>
                        <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">{event.category}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* KPI Distribution Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#F0EEE9] hover:shadow-xl transition-all duration-300 flex flex-col min-h-[450px]">
          <h3 className="text-xl font-bold text-gray-800 mb-2">สถานะ KPI ภาพรวม</h3>
          <p className="text-sm text-gray-500 mb-6">สัดส่วนความสำเร็จของพนักงาน</p>
          <div className="flex-1 w-full relative">
            {kpiData.every((d: any) => d.value === 0) ? (
              <div className="flex h-full items-center justify-center text-gray-400 font-medium">
                ไม่มีข้อมูล KPI
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kpiData}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={130}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {kpiData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} className="hover:opacity-90 transition-opacity duration-300 outline-none drop-shadow-sm" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#374151', fontWeight: 600 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Individual Progress Bars */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F0EEE9] hover:shadow-xl transition-all duration-300">
        <h3 className="text-xl font-bold text-gray-800 mb-6">ความก้าวหน้าในการทำงานของบุคลากร</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!dashboardData?.individualKpiData || dashboardData.individualKpiData.length === 0 ? (
            <div className="text-center text-gray-400 py-4 col-span-full">ไม่มีข้อมูลความก้าวหน้าบุคลากร</div>
          ) : (
            dashboardData.individualKpiData.map((emp: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
                  <span>{emp.name}</span>
                  <span>{emp.achievement}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div 
                    className="h-2.5 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${emp.achievement}%`,
                      backgroundColor: emp.achievement >= 80 ? '#A3C4BC' : emp.achievement >= 50 ? '#E7C8A0' : '#E5989B'
                    }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start relative">
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: selectedEvent.color || '#A3C4BC' }}></div>
              <div className="pr-8">
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="text-xs font-bold px-2.5 py-1 rounded-md text-white shadow-sm"
                    style={{ backgroundColor: selectedEvent.color || '#A3C4BC' }}
                  >
                    {selectedEvent.category || 'กิจกรรม'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">เวลา</p>
                  <p className="text-gray-900 font-bold text-lg">
                    {selectedEvent.time} {selectedEvent.end_time ? `- ${selectedEvent.end_time}` : ''}
                  </p>
                </div>
              </div>

              {selectedEvent.location && (
                <div className="flex items-start gap-4">
                  <div className="bg-red-50 p-3 rounded-2xl text-red-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">สถานที่</p>
                    <p className="text-gray-900 font-bold">{selectedEvent.location}</p>
                  </div>
                </div>
              )}

              {selectedEvent.description && (
                <div className="flex items-start gap-4">
                  <div className="bg-gray-50 p-3 rounded-2xl text-gray-600">
                    <AlignLeft className="w-6 h-6" />
                  </div>
                  <div className="w-full">
                    <p className="text-sm text-gray-500 font-medium">รายละเอียด</p>
                    <p className="text-gray-800 mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm">
                      {selectedEvent.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
