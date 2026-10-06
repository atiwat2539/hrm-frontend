'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { FileText, Download, TrendingUp, Users } from 'lucide-react';

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

export default function ReportsPage() {
  const [data, setData] = useState({
    deptDistribution: [],
    typeDistribution: [],
    kpiByDept: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleExport = () => {
    alert('ระบบ Export เป็น PDF/Excel กำลังอยู่ในช่วงพัฒนาครับ');
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-500">กำลังโหลดข้อมูลรายงาน...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-indigo-600" />
            รายงานและสถิติ (Reports Center)
          </h1>
          <p className="text-gray-500 mt-1">สรุปข้อมูลภาพรวมของบุคลากรและประสิทธิภาพการทำงาน</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center font-medium shadow-sm transition-colors"
        >
          <Download className="w-4 h-4 mr-2" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-6 border-b pb-4">
            <div className="bg-indigo-50 p-2 rounded-lg mr-3">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">สัดส่วนพนักงานตามแผนก</h2>
          </div>
          <div className="h-[300px]">
            {data.deptDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.deptDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {data.deptDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} คน`, 'จำนวนพนักงาน']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">ไม่มีข้อมูล</div>
            )}
          </div>
        </div>

        {/* Employment Type Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-6 border-b pb-4">
            <div className="bg-sky-50 p-2 rounded-lg mr-3">
              <Users className="w-5 h-5 text-sky-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">สัดส่วนประเภทการจ้างงาน</h2>
          </div>
          <div className="h-[300px]">
            {data.typeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name === 'full_time' ? 'Full Time' : name === 'contract' ? 'Contract' : name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {data.typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} คน`, 'จำนวน']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">ไม่มีข้อมูล</div>
            )}
          </div>
        </div>

        {/* Average KPI Score by Department */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center mb-6 border-b pb-4">
            <div className="bg-emerald-50 p-2 rounded-lg mr-3">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">คะแนนเฉลี่ย KPI ตามแผนก</h2>
          </div>
          <div className="h-[350px]">
            {data.kpiByDept.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.kpiByDept} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value) => [`${value} คะแนน`, 'คะแนนเฉลี่ย']}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Legend />
                  <Bar dataKey="avgScore" name="คะแนนเฉลี่ย" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">ยังไม่มีข้อมูลการประเมิน KPI</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
