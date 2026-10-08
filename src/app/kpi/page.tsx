'use client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import { useState, useEffect, Fragment } from 'react';
import { Target, TrendingUp, AlertTriangle, X, Plus, Edit2, Trash2, History, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/kpi`;
const EMP_API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employees`;

export default function KpiPage() {
  const [kpis, setKpis] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Track currently editing values for inline edit (actual)
  const [addingActual, setAddingActual] = useState<{ id: number, value: string } | null>(null);

  // Edit Workload state
  const [isEditing, setIsEditing] = useState(false);
  const [editingKpiId, setEditingKpiId] = useState<number | null>(null);

  // Monthly Result Modal
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
  const [selectedKpiForMonthly, setSelectedKpiForMonthly] = useState<any | null>(null);
  const [monthlyData, setMonthlyData] = useState({
    month: new Date().getMonth() + 1 + '',
    year: new Date().getFullYear(),
    actual: '',
    note: ''
  });

  // History Modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedKpiHistory, setSelectedKpiHistory] = useState<any | null>(null);

  // View Mode
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');
  const [matrixYear, setMatrixYear] = useState<number>(() => {
    const d = new Date();
    return d.getMonth() + 1 >= 6 ? d.getFullYear() + 1 : d.getFullYear();
  });

  // Filter state
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    employee_id: '',
    title: '',         // ประเภทหัวข้อหลัก
    sub_title: '',     // หัวข้อย่อย
    description: '',   // รายละเอียดภาระงาน
    period: 'monthly',
    target: '',        // เป้าหมาย
    unit: '',          // หน่วยนับ
    weight: '100',     
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const [kpiRes, empRes] = await Promise.all([
        axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(EMP_API_URL, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const sortedKpis = kpiRes.data.sort((a: any, b: any) => a.id - b.id);
      setKpis(sortedKpis);
      setEmployees(empRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModalForCreate = () => {
    setIsEditing(false);
    setEditingKpiId(null);
    setFormData({ employee_id: '', title: '', sub_title: '', description: '', period: 'monthly', target: '', unit: '', weight: '100' });
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (kpi: any) => {
    setIsEditing(true);
    setEditingKpiId(kpi.id);
    setFormData({
      employee_id: kpi.employee_id.toString(),
      title: kpi.title,
      sub_title: kpi.sub_title || '',
      description: kpi.description || '',
      period: kpi.period || 'monthly',
      target: kpi.target.toString(),
      unit: kpi.unit,
      weight: kpi.weight?.toString() || '100',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        ...formData,
        employee_id: Number(formData.employee_id),
        target: Number(formData.target),
        weight: Number(formData.weight)
      };

      if (isEditing && editingKpiId) {
        await axios.put(`${API_URL}/${editingKpiId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(API_URL, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      handleCloseModal();
      fetchData(); // refresh list
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save workload');
    }
  };



  

  const handleDeleteResults = async (id: number) => {
    if (!confirm('ยืนยันการลบข้อมูลการบันทึกทั้งหมดของ KPI นี้? (หากลบแล้วข้อมูลยอดสะสมจะกลายเป็น 0)')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${id}/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to clear results');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบภาระงานนี้? ข้อมูลยอดสะสมจะถูกลบไปด้วย')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete workload');
    }
  };

  const openMonthlyModal = (kpi: any) => {
    setSelectedKpiForMonthly(kpi);
    setMonthlyData({
      month: new Date().getMonth() + 1 + '',
      year: new Date().getFullYear(),
      actual: '',
      note: ''
    });
    setIsMonthlyModalOpen(true);
  };

  const closeMonthlyModal = () => {
    setIsMonthlyModalOpen(false);
    setSelectedKpiForMonthly(null);
  };

  const handleMonthlySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKpiForMonthly) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/${selectedKpiForMonthly.id}/evaluate`, {
        actual: monthlyData.actual,
        month: monthlyData.month,
        year: monthlyData.year,
        note: monthlyData.note
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      closeMonthlyModal();
      fetchData();
    } catch (err: any) {
      alert('Failed to save monthly result');
    }
  };

  const filteredKpis = selectedEmployeeFilter === 'all' 
    ? kpis 
    : kpis.filter(k => k.employee_id.toString() === selectedEmployeeFilter);

  // Stats calculation (based on filtered data)
  const computedKpis = filteredKpis.map(kpi => {
    let fyTotal = 0;
    if (kpi.results) {
      kpi.results.forEach((r: any) => {
        const monthInt = parseInt(r.month);
        if (monthInt >= 6 && monthInt <= 12 && r.year === matrixYear - 1) fyTotal += r.actual;
        else if (monthInt >= 1 && monthInt <= 5 && r.year === matrixYear) fyTotal += r.actual;
      });
    }
    return { ...kpi, _fyTotal: fyTotal };
  });

  const totalKpis = computedKpis.length;
  const achieved = computedKpis.filter(k => k._fyTotal >= k.target).length;
  const inProgress = computedKpis.filter(k => k._fyTotal > 0 && k._fyTotal < k.target).length;
  const belowTarget = computedKpis.filter(k => k._fyTotal === 0).length;

  const finalKpis = computedKpis.filter(k => {
    if (selectedStatusFilter === 'achieved') return k._fyTotal >= k.target;
    if (selectedStatusFilter === 'in_progress') return k._fyTotal > 0 && k._fyTotal < k.target;
    if (selectedStatusFilter === 'below_target') return k._fyTotal === 0;
    return true;
  });

  // Group filtered KPIs by Main Topic
  const groupedKpis = finalKpis.reduce((acc, kpi) => {
    if (!acc[kpi.title]) acc[kpi.title] = [];
    acc[kpi.title].push(kpi);
    return acc;
  }, {} as Record<string, any[]>);

  // Extract unique main topics for the datalist dropdown
  const uniqueMainTopics = Array.from(new Set(kpis.map(k => k.title))).filter(Boolean);


  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workload & KPI Management</h1>
          <p className="text-sm text-gray-500">มอบหมายภาระงานรายบุคคลและอัปเดตตัวเลขแบบสะสมยอด</p>
        </div>
        <Button onClick={handleOpenModalForCreate} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white whitespace-nowrap px-8 py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-95">
          <Target className="w-5 h-5 mr-2" />
          มอบหมายภาระงาน
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div 
          onClick={() => setSelectedStatusFilter('all')}
          className={`p-4 rounded-2xl shadow-sm border cursor-pointer flex items-center space-x-4 transition-all duration-300 group ${selectedStatusFilter === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1'}`}
        >
          <div className="p-3 bg-blue-100 rounded-full text-blue-600 transition-all duration-300 group-hover:scale-110"><Target className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500">ภาระงานทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-900">{totalKpis}</p>
          </div>
        </div>
        
        <div 
          onClick={() => setSelectedStatusFilter('achieved')}
          className={`p-4 rounded-2xl shadow-sm border cursor-pointer flex items-center space-x-4 transition-all duration-300 group ${selectedStatusFilter === 'achieved' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-white hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1'}`}
        >
          <div className="p-3 bg-emerald-100 rounded-full text-emerald-600 transition-all duration-300 group-hover:scale-110"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500">สำเร็จตามเป้า</p>
            <p className="text-2xl font-bold text-gray-900">{achieved}</p>
          </div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter('in_progress')}
          className={`p-4 rounded-2xl shadow-sm border cursor-pointer flex items-center space-x-4 transition-all duration-300 group ${selectedStatusFilter === 'in_progress' ? 'border-amber-500 bg-amber-50' : 'border-gray-100 bg-white hover:shadow-xl hover:shadow-amber-900/5 hover:-translate-y-1'}`}
        >
          <div className="p-3 bg-amber-100 rounded-full text-amber-600 transition-all duration-300 group-hover:scale-110"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500">กำลังดำเนินการ</p>
            <p className="text-2xl font-bold text-gray-900">{inProgress}</p>
          </div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter('below_target')}
          className={`p-4 rounded-2xl shadow-sm border cursor-pointer flex items-center space-x-4 transition-all duration-300 group ${selectedStatusFilter === 'below_target' ? 'border-rose-500 bg-rose-50' : 'border-gray-100 bg-white hover:shadow-xl hover:shadow-rose-900/5 hover:-translate-y-1'}`}
        >
          <div className="p-3 bg-rose-100 rounded-full text-rose-600 transition-all duration-300 group-hover:scale-110"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500">ยังไม่เริ่มดำเนินการ</p>
            <p className="text-2xl font-bold text-gray-900">{belowTarget}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">รายการภาระงานรายบุคคล</h3>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                มุมมองรายการ
              </button>
              <button 
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'matrix' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ตารางรายเดือน
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 mr-2">
                <label className="text-sm font-medium text-gray-700">รอบปี:</label>
                <select 
                  value={matrixYear} 
                  onChange={e => setMatrixYear(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                >
                  {[2, 1, 0, -1, -2].map(offset => {
                    const y = new Date().getFullYear() + offset;
                    return (
                      <option key={y} value={y}>{y + 543}</option>
                    )
                  })}
                </select>
              </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">เลือกบุคลากร:</label>
              <select 
                value={selectedEmployeeFilter} 
                onChange={e => setSelectedEmployeeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[200px] bg-white"
              >
                <option value="all">-- แสดงทั้งหมด --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
             <LoadingSpinner />
          ) : viewMode === 'matrix' ? (
            <table className="w-full text-sm text-left text-gray-600 border-collapse">
              <thead className="text-xs text-gray-800 bg-indigo-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 font-semibold border-r border-gray-200">บุคลากร</th>
                  <th className="px-3 py-3 font-semibold border-r border-gray-200">หัวข้อย่อย (Sub Topic)</th>
                  <th className="px-3 py-3 font-semibold border-r border-gray-200 min-w-[200px]">รายละเอียดภาระงาน</th>
                  <th className="px-2 py-3 font-semibold text-center border-r border-gray-200">มิ.ย.</th>
                  <th className="px-2 py-3 font-semibold text-center border-r border-gray-200">ก.ค.</th>
                  <th className="px-2 py-3 font-semibold text-center border-r border-gray-200">ส.ค.</th>
                  <th className="px-2 py-3 font-semibold text-center border-r border-gray-200">ก.ย.</th>
                  <th className="px-2 py-3 font-semibold text-center border-r border-gray-200">ต.ค.</th>
                  <th className="px-2 py-3 font-semibold text-center border-r border-gray-200">พ.ย.</th>
                  <th className="px-2 py-3 font-semibold text-center border-r border-gray-200">ธ.ค.</th>
                  <th className="px-2 py-3 font-semibold text-center border-r border-gray-200">ม.ค.</th>
                  <th className="px-2 py-3 font-semibold text-center border-r border-gray-200">ก.พ.</th>
                  <th className="px-2 py-3 font-semibold text-center border-r border-gray-200">มี.ค.</th>
                  <th className="px-2 py-3 font-semibold text-center border-r border-gray-200">เม.ย.</th>
                  <th className="px-2 py-3 font-semibold text-center border-r border-gray-200">พ.ค.</th>
                  <th className="px-3 py-3 font-bold text-indigo-700 text-center border-r border-gray-200 bg-indigo-50">รวมทั้งปี</th>
                  <th className="px-3 py-3 font-semibold text-center">เป้าหมายรายปี</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(groupedKpis).length === 0 ? (
                  <tr><td colSpan={17} className="text-center py-4">ไม่มีข้อมูลภาระงาน</td></tr>
                ) : (
                  (Object.entries(groupedKpis) as any).map((entry: any) => {
                    const [mainTopic, topicKpis] = entry;
                    return (
                    <Fragment key={mainTopic}>
                      <tr className="bg-indigo-50 border-b border-indigo-200">
                        <td colSpan={17} className="px-4 py-3 font-bold text-indigo-900 text-[15px]">
                          หัวข้อหลัก: {mainTopic}
                        </td>
                      </tr>
                      {topicKpis.map((kpi: any) => {
                        // Calculate monthly sums for this Fiscal Year (Jun - May)
                        // Index: 0=Jun, 1=Jul, 2=Aug, 3=Sep, 4=Oct, 5=Nov, 6=Dec, 7=Jan, 8=Feb, 9=Mar, 10=Apr, 11=May
                        const monthlySums = Array(12).fill(0);
                        if (kpi.results) {
                          kpi.results.forEach((r: any) => {
                            const monthInt = parseInt(r.month);
                            if (monthInt >= 6 && monthInt <= 12) {
                              if (r.year === matrixYear - 1) {
                                monthlySums[monthInt - 6] += r.actual;
                              }
                            } else if (monthInt >= 1 && monthInt <= 5) {
                              if (r.year === matrixYear) {
                                monthlySums[monthInt + 6] += r.actual;
                              }
                            }
                          });
                        }
                        
                        const fyTotal = monthlySums.reduce((sum, val) => sum + val, 0);

                        return (
                          <tr key={kpi.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-3 py-3 border-r border-gray-100 font-medium text-gray-900 whitespace-nowrap">
                              {kpi.employee ? `${kpi.employee.first_name} ${kpi.employee.last_name}` : `ID: ${kpi.employee_id}`}
                            </td>
                            <td className="px-3 py-3 border-r border-gray-100 font-medium text-gray-800">
                              {kpi.sub_title || '-'}
                            </td>
                            <td className="px-3 py-3 border-r border-gray-100 text-sm text-gray-500 whitespace-pre-wrap min-w-[200px]">
                              {kpi.description}
                            </td>
                            {monthlySums.map((sum, idx) => (
                              <td key={idx} className="px-2 py-3 text-center border-r border-gray-100 text-gray-600">
                                {sum > 0 ? <span className="font-semibold text-emerald-600">{sum}</span> : <span className="text-gray-300">-</span>}
                              </td>
                            ))}
                            <td className="px-3 py-3 text-center font-bold text-indigo-600 border-r border-gray-100 bg-indigo-50/30">
                              {fyTotal}
                            </td>
                            <td className="px-3 py-3 text-center font-semibold text-gray-600">
                              {kpi.target} <span className="text-xs font-normal text-gray-400">{kpi.unit}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  )})
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-base text-left text-gray-600">
              <thead className="text-sm text-gray-800 uppercase bg-indigo-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 font-semibold">บุคลากร</th>
                  <th className="px-4 py-4 font-semibold">หัวข้อย่อย</th>
                  <th className="px-4 py-4 font-semibold">รอบ</th>
                  <th className="px-4 py-4 font-semibold">เป้าหมาย</th>
                  <th className="px-4 py-4 font-bold text-indigo-700">รวมสะสม</th>
                  <th className="px-4 py-4 font-semibold">หน่วย</th>
                  <th className="px-4 py-4 font-semibold">สถานะ</th>
                  <th className="px-4 py-4 font-semibold text-center w-32">บันทึกผล</th>
                  <th className="px-4 py-4 font-semibold text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(groupedKpis).length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-4">ไม่มีข้อมูลภาระงาน</td></tr>
                ) : (
                  (Object.entries(groupedKpis) as any).map((entry: any) => {
                    const [mainTopic, topicKpis] = entry;
                    return (
                    <Fragment key={mainTopic}>
                      <tr className="bg-indigo-50 border-b border-indigo-200">
                        <td colSpan={9} className="px-4 py-3 font-bold text-indigo-900 text-[15px]">
                          หัวข้อหลัก: {mainTopic}
                        </td>
                      </tr>
                      {topicKpis.map((kpi: any) => {
                        let fyTotal = 0;
                        if (kpi.results) {
                          kpi.results.forEach((r: any) => {
                            const monthInt = parseInt(r.month);
                            if (monthInt >= 6 && monthInt <= 12) {
                              if (r.year === matrixYear - 1) fyTotal += r.actual;
                            } else if (monthInt >= 1 && monthInt <= 5) {
                              if (r.year === matrixYear) fyTotal += r.actual;
                            }
                          });
                        }
                        
                        const isAchieved = fyTotal >= kpi.target;
                        const statusLabel = isAchieved ? 'สำเร็จ' : (fyTotal > 0 ? 'กำลังดำเนินการ' : 'ยังไม่เริ่ม/ต่ำกว่าเป้า');
                        const statusClass = isAchieved ? 'bg-green-100 text-green-800' : (fyTotal > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800');

                        const yearResults = (kpi.results || []).filter((r: any) => {
                            const monthInt = parseInt(r.month);
                            return (monthInt >= 6 && monthInt <= 12 && r.year === matrixYear - 1) ||
                                   (monthInt >= 1 && monthInt <= 5 && r.year === matrixYear);
                        });

                        return (
                        <tr key={kpi.id} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-4 py-4 font-medium text-gray-900">
                            {kpi.employee ? `${kpi.employee.first_name} ${kpi.employee.last_name}` : `ID: ${kpi.employee_id}`}
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-semibold text-gray-800">{kpi.sub_title || '-'}</div>
                            <div className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{kpi.description}</div>
                          </td>
                          <td className="px-4 py-4 text-gray-500 text-sm">
                            {kpi.period === 'monthly' ? 'รายเดือน' : 
                             kpi.period === 'quarterly' ? 'รายไตรมาส' : 
                             kpi.period === 'bi_annually' ? 'รายครึ่งปี' : 
                             kpi.period === 'annually' ? 'รายปี' : kpi.period}
                          </td>
                          <td className="px-4 py-4 font-semibold text-gray-600">{kpi.target}</td>
                          
                          {/* Accumulated Total */}
                          <td className="px-4 py-4">
                            <div className="flex flex-col items-start">
                              <span className="font-bold text-indigo-600 text-lg">{fyTotal}</span>
                              
                            </div>
                          </td>
                          
                          <td className="px-4 py-4 text-gray-500">{kpi.unit}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                              {statusLabel}
                            </span>
                          </td>

                          {/* Inline Add Actual Value */}
                          <td className="px-4 py-4 text-center">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                              onClick={() => openMonthlyModal(kpi)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              บันทึกผล
                            </Button>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              

                              {/* History */}
                              <button 
                                onClick={() => { setSelectedKpiHistory({...kpi, results: yearResults}); setIsHistoryModalOpen(true); }}
                                className={`p-1.5 rounded ${yearResults.length > 0 ? 'text-indigo-600 hover:bg-indigo-50' : 'text-gray-300'}`}
                                title="ดูประวัติการบันทึก"
                                disabled={yearResults.length === 0}
                              >
                                <History className="w-4 h-4" />
                              </button>

                              {/* Clear Results */}
                              <button 
                                onClick={() => handleDeleteResults(kpi.id)}
                                className={`p-1.5 rounded ${yearResults.length > 0 ? 'text-orange-500 hover:bg-orange-50' : 'text-gray-300'}`}
                                title="ลบข้อมูลการบันทึกที่ผ่านมา"
                                disabled={yearResults.length === 0}
                              >
                                <Eraser className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleOpenModalForEdit(kpi)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="แก้ไข"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(kpi.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    </Fragment>
                  )})
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{isEditing ? 'แก้ไขภาระงาน' : 'เพิ่มภาระงานรายบุคคล'}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">เลือก User</label>
                <select required value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="">-- กรุณาเลือกบุคลากร --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">ประเภทหัวข้อหลัก (Main Topic)</label>
                <input 
                  list="main-topics" 
                  required 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  type="text" 
                  className="w-full border rounded-md px-3 py-2 text-sm" 
                  placeholder="เลือกจากรายการ หรือ พิมพ์หัวข้อใหม่" 
                />
                <datalist id="main-topics">
                  {uniqueMainTopics.map(topic => (
                    <option key={topic} value={topic} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">หัวข้อย่อย (Sub Topic)</label>
                <input value={formData.sub_title} onChange={e => setFormData({...formData, sub_title: e.target.value})} type="text" className="w-full border rounded-md px-3 py-2 text-sm" placeholder="เช่น สร้างหน้า Login (ระบุหรือไม่ก็ได้)" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">รายละเอียดภาระงาน</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="อธิบายรายละเอียดงานที่ต้องทำ" rows={2} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">รอบการประเมิน (Period)</label>
                <select required value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="monthly">รายเดือน (Monthly)</option>
                  <option value="quarterly">รายไตรมาส (Quarterly)</option>
                  <option value="bi_annually">รายครึ่งปี (Bi-annually)</option>
                  <option value="annually">รายปี (Annually)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">เป้าหมาย (Target)</label>
                  <input required value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})} type="number" className="w-full border rounded-md px-3 py-2 text-sm" placeholder="เช่น 100, 50, 10" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">หน่วยนับ</label>
                  <input required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} type="text" className="w-full border rounded-md px-3 py-2 text-sm" placeholder="ชิ้น, %, เรื่อง..." />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>ยกเลิก</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">บันทึกข้อมูล</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Monthly Result Modal */}
      {isMonthlyModalOpen && selectedKpiForMonthly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div>
                <h2 className="text-xl font-bold">บันทึกผลการปฏิบัติงาน</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedKpiForMonthly.title} - {selectedKpiForMonthly.sub_title}</p>
              </div>
              <button onClick={closeMonthlyModal} className="text-gray-500 hover:text-gray-700 bg-gray-100 p-1.5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleMonthlySubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">เดือน</label>
                  <select required value={monthlyData.month} onChange={e => setMonthlyData({...monthlyData, month: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                    <option value="1">มกราคม (Jan)</option>
                    <option value="2">กุมภาพันธ์ (Feb)</option>
                    <option value="3">มีนาคม (Mar)</option>
                    <option value="4">เมษายน (Apr)</option>
                    <option value="5">พฤษภาคม (May)</option>
                    <option value="6">มิถุนายน (Jun)</option>
                    <option value="7">กรกฎาคม (Jul)</option>
                    <option value="8">สิงหาคม (Aug)</option>
                    <option value="9">กันยายน (Sep)</option>
                    <option value="10">ตุลาคม (Oct)</option>
                    <option value="11">พฤศจิกายน (Nov)</option>
                    <option value="12">ธันวาคม (Dec)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ปี (พ.ศ.)</label>
                  <input required type="number" value={monthlyData.year + 543} onChange={e => setMonthlyData({...monthlyData, year: Number(e.target.value) - 543})} className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  ผลงานที่ทำได้ในเดือนนี้ <span className="text-indigo-600 font-normal">(เป้าหมายทั้งหมด: {selectedKpiForMonthly.target})</span>
                </label>
                <div className="relative">
                  <input required type="number" step="any" value={monthlyData.actual} onChange={e => setMonthlyData({...monthlyData, actual: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="ระบุตัวเลข" />
                  <span className="absolute right-3 top-2 text-gray-400 text-sm">{selectedKpiForMonthly.unit}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">หมายเหตุ / อธิบายเพิ่มเติม (ถ้ามี)</label>
                <textarea value={monthlyData.note} onChange={e => setMonthlyData({...monthlyData, note: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="เช่น ส่งมอบโปรเจกต์ล่าช้า 2 วัน..." rows={2} />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={closeMonthlyModal}>ยกเลิก</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">บันทึกผลงาน</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && selectedKpiHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">ประวัติการบันทึกผลการปฏิบัติงาน</h2>
                <p className="text-sm text-indigo-600 font-medium mt-1">
                  {selectedKpiHistory.title} {selectedKpiHistory.sub_title ? `- ${selectedKpiHistory.sub_title}` : ''}
                </p>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-500 hover:text-gray-700 bg-gray-100 p-1.5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">เดือน/ปี</th>
                    <th className="px-4 py-3">ยอดที่ทำได้</th>
                    <th className="px-4 py-3">หมายเหตุ</th>
                    <th className="px-4 py-3">วันที่บันทึก</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedKpiHistory.results?.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-6 text-gray-500">ไม่มีประวัติการบันทึก</td></tr>
                  ) : (
                    selectedKpiHistory.results?.map((res: any) => {
                      const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
                      const mIdx = parseInt(res.month) - 1;
                      const mName = (mIdx >= 0 && mIdx < 12) ? monthNames[mIdx] : res.month;
                      
                      return (
                        <tr key={res.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{mName} {res.year + 543}</td>
                          <td className="px-4 py-3 font-bold text-indigo-600">+{res.actual} <span className="text-xs font-normal text-gray-500">{selectedKpiHistory.unit}</span></td>
                          <td className="px-4 py-3">{res.note || '-'}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {new Date(res.created_at).toLocaleDateString('th-TH')} {new Date(res.created_at).toLocaleTimeString('th-TH')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-4 border-t flex justify-end">
              <Button variant="outline" onClick={() => setIsHistoryModalOpen(false)}>ปิดหน้าต่าง</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
