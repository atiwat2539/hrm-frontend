'use client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Target, Clock, X, MapPin, AlignLeft, RefreshCw, Wind, ShieldAlert, Sun, Calendar } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isAqiModalOpen, setIsAqiModalOpen] = useState(false);
  const [isRefreshingAqi, setIsRefreshingAqi] = useState(false);

  const fetchWeather = async (showSpinner = false) => {
    try {
      if (showSpinner) setIsRefreshingAqi(true);
      const lat = 18.7883;
      const lon = 98.9853;
      const [weatherRes, aqiRes] = await Promise.all([
        axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia/Bangkok`),
        axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,uv_index&hourly=us_aqi,pm2_5&timezone=Asia/Bangkok&forecast_days=1`)
      ]);
      
      const code = weatherRes.data.current_weather.weathercode;
      const temp = weatherRes.data.current_weather.temperature;
      const currentAqi = aqiRes.data.current || {};
      const aqi = currentAqi.us_aqi ?? 0;
      
      const getWeatherIconAndText = (code: number) => {
        if (code >= 1 && code <= 3) return { icon: '⛅', text: 'มีเมฆบางส่วน' };
        if (code >= 45 && code <= 48) return { icon: '🌫️', text: 'มีหมอก' };
        if (code >= 51 && code <= 67) return { icon: '🌧️', text: 'มีฝนตก' };
        if (code >= 80 && code <= 82) return { icon: '🌦️', text: 'ฝนตกปรอยๆ' };
        if (code >= 95) return { icon: '⛈️', text: 'ฝนฟ้าคะนอง' };
        return { icon: '☀️', text: 'แจ่มใส' };
      };

      const current = getWeatherIconAndText(code);
      
      const daily = weatherRes.data.daily.time.map((t: string, i: number) => {
        const wt = getWeatherIconAndText(weatherRes.data.daily.weathercode[i]);
        return {
          date: t,
          max: weatherRes.data.daily.temperature_2m_max[i],
          min: weatherRes.data.daily.temperature_2m_min[i],
          icon: wt.icon,
          text: wt.text
        };
      });

      const hourlyAqi = (aqiRes.data.hourly?.time || []).map((t: string, idx: number) => ({
        time: t.split('T')[1]?.substring(0, 5) || '',
        aqi: aqiRes.data.hourly?.us_aqi?.[idx] ?? 0,
        pm2_5: aqiRes.data.hourly?.pm2_5?.[idx] ?? 0,
      })).filter((_: any, idx: number) => idx % 3 === 0);

      const now = new Date();
      const updatedAt = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
      
      setWeather({
        temp,
        text: current.text,
        icon: current.icon,
        aqi,
        pm2_5: currentAqi.pm2_5 ?? 0,
        pm10: currentAqi.pm10 ?? 0,
        co: currentAqi.carbon_monoxide ?? 0,
        no2: currentAqi.nitrogen_dioxide ?? 0,
        so2: currentAqi.sulphur_dioxide ?? 0,
        o3: currentAqi.ozone ?? 0,
        uv: currentAqi.uv_index ?? 0,
        updatedAt,
        hourlyAqi,
        daily
      });
    } catch (e) {
      console.error('Weather fetch error', e);
    } finally {
      if (showSpinner) setIsRefreshingAqi(false);
    }
  };

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

  useEffect(() => {
    fetchWeather();
    fetchDashboardStats();
    const aqiInterval = setInterval(() => fetchWeather(false), 60 * 60 * 1000);
    return () => clearInterval(aqiInterval);
  }, []);

  if (loading) {
    return (
      <LoadingSpinner />
    );
  }

  // Actual Evaluation Round (Fiscal Year) from database/system
  const currentYear = dashboardData?.currentYear || (new Date().getMonth() + 1 >= 6 ? new Date().getFullYear() + 1 : new Date().getFullYear());

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
    { 
      name: 'บุคลากรทั้งหมด', 
      value: totalEmployees.toString(), 
      icon: Users, 
      change: 'จำนวนปัจจุบัน', 
      changeType: 'positive', 
      color: '#B3C2F2' 
    },
    { 
      name: `เป้าหมาย KPI (พ.ศ. ${currentYear + 543})`, 
      value: totalKpis.toString(), 
      icon: Target, 
      change: `รอบปี พ.ศ. ${currentYear + 543}`, 
      changeType: 'positive', 
      color: '#F4D8D8' 
    },
    { 
      name: `KPI ที่สำเร็จ (พ.ศ. ${currentYear + 543})`, 
      value: kpiCompleted, 
      icon: Target, 
      change: `คะแนนเฉลี่ย ${averageKpiScore}`, 
      changeType: 'positive', 
      color: '#D1E8E2' 
    },
  ];

  // Pantone 2026 Cloud Dancer (#F0EEE9) and complementary soft pastels
  const CLOUD_DANCER = '#F0EEE9';
  const PIE_COLORS = ['#A3C4BC', '#E7C8A0', '#E5989B']; // Sage, Warm Sand, Dusty Rose

  return (
    <div className="space-y-6 bg-gradient-to-br from-[#F0EEE9]/50 to-white p-6 rounded-3xl min-h-[calc(100vh-100px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">สวัสดี, {user?.username || 'ผู้ใช้งาน'}</h1>
          <p className="text-sm text-gray-600 mt-1">ภาพรวมการปฏิบัติงานและตัวชี้วัด</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {weather && (
            <>
              <div 
                onClick={() => setIsWeatherModalOpen(true)}
                className="bg-white/80 backdrop-blur px-5 py-2.5 rounded-2xl shadow-sm border border-[#F0EEE9] text-gray-700 font-medium flex items-center gap-2 transition-all hover:scale-105 cursor-pointer hover:shadow-md hover:border-indigo-200" title="คลิกเพื่อดูพยากรณ์อากาศล่วงหน้า 7 วัน">
                <span className="text-xl drop-shadow-sm">{weather.icon}</span>
                <span>{weather.temp}°C <span className="text-sm text-gray-500 ml-1">เชียงใหม่ ({weather.text})</span></span>
              </div>
              <div 
                onClick={() => setIsAqiModalOpen(true)}
                className={`bg-white/80 backdrop-blur px-5 py-2.5 rounded-2xl shadow-sm border border-[#F0EEE9] font-medium flex items-center gap-2.5 transition-all hover:scale-105 cursor-pointer hover:shadow-md hover:border-emerald-200
                ${weather.aqi <= 50 ? 'text-emerald-700' : 
                  weather.aqi <= 100 ? 'text-yellow-600' : 
                  weather.aqi <= 150 ? 'text-orange-600' : 
                  weather.aqi <= 200 ? 'text-red-600' : 'text-purple-600'}`}
                title="คลิกเพื่อดูรายละเอียดคุณภาพอากาศแบบเรียลไทม์"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    weather.aqi <= 50 ? 'bg-emerald-500' : 
                    weather.aqi <= 100 ? 'bg-yellow-500' : 
                    weather.aqi <= 150 ? 'bg-orange-500' : 
                    weather.aqi <= 200 ? 'bg-red-500' : 'bg-purple-500'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    weather.aqi <= 50 ? 'bg-emerald-500' : 
                    weather.aqi <= 100 ? 'bg-yellow-500' : 
                    weather.aqi <= 150 ? 'bg-orange-500' : 
                    weather.aqi <= 200 ? 'bg-red-500' : 'bg-purple-500'
                  }`}></span>
                </span>
                <span className="text-xl drop-shadow-sm">😷</span>
                <span>AQI: {weather.aqi} <span className="text-sm opacity-80 ml-1">
                  ({weather.aqi <= 50 ? 'ดีมาก' : 
                    weather.aqi <= 100 ? 'ปานกลาง' : 
                    weather.aqi <= 150 ? 'เริ่มมีผลกระทบ' : 
                    weather.aqi <= 200 ? 'มีผลกระทบ' : 'อันตราย'})
                </span></span>
              </div>
            </>
          )}
          <div className="bg-white/80 backdrop-blur px-5 py-2.5 rounded-2xl shadow-sm border border-[#F0EEE9] text-gray-700 font-medium flex items-center">
            {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
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
          <h3 className="text-xl font-bold text-gray-800 mb-1">สถานะ KPI ภาพรวม</h3>
          <p className="text-sm text-gray-500 mb-6">รอบปีการประเมิน พ.ศ. {currentYear + 543}</p>
          <div className="flex-1 w-full relative">
            {totalKpis === 0 || kpiData.every((d: any) => d.value === 0) ? (
              <div className="flex flex-col h-full items-center justify-center text-gray-400 font-medium text-center p-4">
                <Target className="w-10 h-10 mb-2 text-gray-300" />
                <p>ยังไม่มีข้อมูล KPI ในรอบปี พ.ศ. {currentYear + 543}</p>
                <Link href="/kpi" className="mt-2 text-xs text-indigo-600 font-semibold hover:underline">
                  ไปที่หน้าจัดการภาระงาน (KPI) →
                </Link>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div>
            <h3 className="text-xl font-bold text-gray-800">ความก้าวหน้าในการทำงานของบุคลากร</h3>
            <p className="text-sm text-gray-500 mt-0.5">ผลสัมฤทธิ์ตามภาระงานรอบปี พ.ศ. {currentYear + 543}</p>
          </div>
          <Link href="/kpi" className="text-xs text-indigo-600 font-semibold hover:underline">
            ดูตารางคะแนนทั้งหมด →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!dashboardData?.individualKpiData || dashboardData.individualKpiData.length === 0 ? (
            <div className="text-center text-gray-400 py-6 col-span-full">
              <p>ไม่มีข้อมูลความก้าวหน้าบุคลากรในรอบปี พ.ศ. {currentYear + 543}</p>
              <Link href="/kpi" className="mt-2 inline-block text-xs text-indigo-600 font-semibold hover:underline">
                ไปที่หน้าจัดการภาระงาน (KPI) →
              </Link>
            </div>
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

      {/* Project Progress Bars */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F0EEE9] hover:shadow-xl transition-all duration-300">
        <h3 className="text-xl font-bold text-gray-800 mb-6">ความก้าวหน้าของโครงการ (Projects)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!dashboardData?.projects || dashboardData.projects.length === 0 ? (
            <div className="text-center text-gray-400 py-4 col-span-full">ไม่มีข้อมูลโครงการ</div>
          ) : (
            dashboardData.projects.map((proj: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
                  <span className="truncate pr-4">{proj.name}</span>
                  <span className="text-indigo-600">{proj.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div 
                    className="h-2.5 rounded-full transition-all duration-1000 bg-indigo-500"
                    style={{ width: `${proj.progress}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header / Accent */}
            <div 
              className="h-32 w-full relative shrink-0"
              style={{ backgroundColor: selectedEvent.color || '#A3C4BC' }}
            >
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-6 right-6 text-white hover:bg-white/20 bg-black/10 backdrop-blur-md rounded-full p-2 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 md:px-10 pb-10 pt-0 -mt-12 relative z-10 flex flex-col">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl shadow-black/5 border border-gray-100 flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span 
                      className="text-xs font-extrabold px-3 py-1.5 rounded-md text-white shadow-sm uppercase tracking-wider"
                      style={{ backgroundColor: selectedEvent.color || '#A3C4BC' }}
                    >
                      {selectedEvent.category || 'กิจกรรม'}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">{selectedEvent.title}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#F0EEE9]/40 border border-[#F0EEE9] hover:bg-[#F0EEE9]/70 transition-colors">
                  <div className="bg-white p-3 rounded-2xl text-indigo-500 shadow-sm shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">เวลา</p>
                    <p className="text-gray-900 font-extrabold text-lg">
                      {selectedEvent.time} {selectedEvent.end_time ? `- ${selectedEvent.end_time}` : ''}
                    </p>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-rose-50/60 border border-rose-100 hover:bg-rose-50 transition-colors">
                    <div className="bg-white p-3 rounded-2xl text-rose-500 shadow-sm shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">สถานที่</p>
                      <p className="text-gray-900 font-extrabold text-lg">{selectedEvent.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <div className="mt-4 md:mt-6 flex items-start gap-4 p-6 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <div className="bg-white p-3 rounded-2xl text-blue-500 shadow-sm shrink-0">
                    <AlignLeft className="w-6 h-6" />
                  </div>
                  <div className="w-full">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">รายละเอียด</p>
                    <div className="text-gray-800 whitespace-pre-wrap text-base leading-relaxed">
                      {selectedEvent.description}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Weather Forecast Modal */}
      {isWeatherModalOpen && weather && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-6 md:p-8 flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#F0EEE9]">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{weather.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">พยากรณ์อากาศล่วงหน้า 7 วัน</h3>
                  <p className="text-sm text-gray-500">จังหวัดเชียงใหม่</p>
                </div>
              </div>
              <button 
                onClick={() => setIsWeatherModalOpen(false)} 
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {weather.daily.map((day: any, idx: number) => {
                const dateObj = new Date(day.date);
                const isToday = idx === 0;
                return (
                  <div key={idx} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${isToday ? 'bg-[#F0EEE9]/50 border-indigo-200' : 'border-[#F0EEE9] hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{day.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {isToday ? 'วันนี้' : dateObj.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-xs text-gray-500">{day.text}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-800">{Math.round(day.max)}°</span>
                      <span className="text-xs text-gray-400 ml-1.5 font-medium">{Math.round(day.min)}°</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Real-time AQI Modal */}
      {isAqiModalOpen && weather && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl p-6 md:p-8 flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#F0EEE9]">
              <div className="flex items-center gap-3">
                <span className="text-3xl">😷</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">ดัชนีคุณภาพอากาศ (Air Quality Index)</h3>
                  <p className="text-sm text-gray-500">จังหวัดเชียงใหม่ • อัปเดตล่าสุด: {weather.updatedAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchWeather(true)}
                  disabled={isRefreshingAqi}
                  className="text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                  title="รีเฟรชข้อมูล AQI"
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshingAqi ? 'animate-spin text-indigo-600' : ''}`} />
                </button>
                <button 
                  onClick={() => setIsAqiModalOpen(false)} 
                  className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* AQI Overview Card */}
            <div className={`p-6 rounded-3xl mb-6 text-center shadow-inner ${
              weather.aqi <= 50 ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 
              weather.aqi <= 100 ? 'bg-yellow-50 text-yellow-900 border border-yellow-200' : 
              weather.aqi <= 150 ? 'bg-orange-50 text-orange-900 border border-orange-200' : 
              weather.aqi <= 200 ? 'bg-red-50 text-red-900 border border-red-200' : 'bg-purple-50 text-purple-900 border border-purple-200'
            }`}>
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/70 shadow-sm">
                US AQI
              </span>
              <p className="text-5xl font-extrabold mt-3 tracking-tight">{weather.aqi}</p>
              <p className="text-lg font-bold mt-1">
                {weather.aqi <= 50 ? 'คุณภาพอากาศดีมาก (Good)' : 
                 weather.aqi <= 100 ? 'คุณภาพอากาศปานกลาง (Moderate)' : 
                 weather.aqi <= 150 ? 'เริ่มมีผลกระทบต่อสุขภาพ (Unhealthy for Sensitive Groups)' : 
                 weather.aqi <= 200 ? 'มีผลกระทบต่อสุขภาพ (Unhealthy)' : 'มีผลกระทบต่อสุขภาพอย่างยิ่ง (Very Unhealthy)'}
              </p>
              <p className="text-xs mt-2 opacity-80 max-w-md mx-auto">
                {weather.aqi <= 50 ? 'สามารถทำกิจกรรมกลางแจ้งและเปิดหน้าต่างระบายอากาศได้ตามปกติ' : 
                 weather.aqi <= 100 ? 'ผู้มีโรคประจำตัวระบบทางเดินหายใจควรหลีกเลี่ยงการออกกำลังกายกลางแจ้งเป็นเวลานาน' : 
                 weather.aqi <= 150 ? 'กลุ่มเสี่ยงควรสวมหน้ากากป้องกันฝุ่นเมื่อออกนอกอาคาร' : 
                 'ควรสวมหน้ากาก N95 เมื่อออกนอกอาคาร และใช้เครื่องฟอกอากาศภายในอาคาร'}
              </p>
            </div>

            {/* Pollutants Breakdown */}
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-indigo-500" /> ระดับสารมลพิษในอากาศ
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                <span className="text-xs text-gray-500 font-semibold">PM2.5</span>
                <p className="text-lg font-extrabold text-gray-800">{Math.round(weather.pm2_5)} <span className="text-xs font-normal text-gray-400">µg/m³</span></p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                <span className="text-xs text-gray-500 font-semibold">PM10</span>
                <p className="text-lg font-extrabold text-gray-800">{Math.round(weather.pm10)} <span className="text-xs font-normal text-gray-400">µg/m³</span></p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                <span className="text-xs text-gray-500 font-semibold">UV Index</span>
                <p className="text-lg font-extrabold text-gray-800">{weather.uv} <span className="text-xs font-normal text-gray-400">/ 11</span></p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                <span className="text-xs text-gray-500 font-semibold">Ozone (O₃)</span>
                <p className="text-lg font-extrabold text-gray-800">{Math.round(weather.o3)} <span className="text-xs font-normal text-gray-400">µg/m³</span></p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                <span className="text-xs text-gray-500 font-semibold">NO₂</span>
                <p className="text-lg font-extrabold text-gray-800">{Math.round(weather.no2)} <span className="text-xs font-normal text-gray-400">µg/m³</span></p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                <span className="text-xs text-gray-500 font-semibold">SO₂</span>
                <p className="text-lg font-extrabold text-gray-800">{Math.round(weather.so2)} <span className="text-xs font-normal text-gray-400">µg/m³</span></p>
              </div>
            </div>

            {/* Hourly AQI Mini-chart */}
            {weather.hourlyAqi && weather.hourlyAqi.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" /> แนวโน้มค่า AQI รายชั่วโมงวันนี้
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-2 pt-1">
                  {weather.hourlyAqi.map((h: any, idx: number) => (
                    <div key={idx} className="flex flex-col items-center p-2 rounded-xl bg-gray-50 border border-gray-100 min-w-[58px] shrink-0 text-center">
                      <span className="text-[11px] text-gray-500">{h.time}</span>
                      <span className={`text-xs font-bold mt-1 px-1.5 py-0.5 rounded-md ${
                        h.aqi <= 50 ? 'bg-emerald-100 text-emerald-800' : 
                        h.aqi <= 100 ? 'bg-yellow-100 text-yellow-800' : 
                        h.aqi <= 150 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                      }`}>{h.aqi}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
