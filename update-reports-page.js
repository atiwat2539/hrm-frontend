const fs = require('fs');

const code = `'use client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Printer, RefreshCw, FileText } from 'lucide-react';

const KPI_API_URL = \`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/kpis\`;

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterQuarter, setFilterQuarter] = useState('Q1'); // Q1, Q2, Q3, Q4, All

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(KPI_API_URL, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      setKpis(res.data);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getQuarterMonths = (q: string) => {
    if (q === 'Q1') return [6, 7, 8];
    if (q === 'Q2') return [9, 10, 11];
    if (q === 'Q3') return [12, 1, 2];
    if (q === 'Q4') return [3, 4, 5];
    return [1,2,3,4,5,6,7,8,9,10,11,12]; // All
  };

  // Process data
  const reportData = kpis.map(kpi => {
    let actual = 0;
    const months = getQuarterMonths(filterQuarter);
    
    if (kpi.results) {
      kpi.results.forEach((r: any) => {
        const m = parseInt(r.month);
        const y = r.year;
        // Check if this result falls into the selected Year & Quarter
        if (filterQuarter === 'All') {
          if (m >= 6 && m <= 12 && y === filterYear - 1) actual += r.actual;
          else if (m >= 1 && m <= 5 && y === filterYear) actual += r.actual;
        } else {
          if (months.includes(m)) {
            // Determine expected year for the month in this fiscal year
            const expectedYear = (m >= 6 && m <= 12) ? filterYear - 1 : filterYear;
            if (y === expectedYear) {
              actual += r.actual;
            }
          }
        }
      });
    }

    const target = kpi.target;
    let achievement = target > 0 ? (actual / target) * 100 : 0;
    
    let status = 'Pending';
    if (actual > 0) {
      if (actual >= target) status = 'Achieved';
      else status = 'Warning';
    } else {
      status = 'Pending';
    }

    return {
      id: \`KPI-\${kpi.id.toString().padStart(3, '0')}\`,
      title: kpi.title + (kpi.sub_title ? \` - \${kpi.sub_title}\` : ''),
      department: kpi.employee?.department || 'ไม่ระบุ',
      target: target,
      unit: kpi.unit || '',
      actual: actual,
      achievement: achievement,
      weight: kpi.weight || 0,
      status: status
    };
  });

  const handleExportCSV = () => {
    const headers = ['รหัส', 'ชื่อตัวชี้วัด', 'แผนก', 'เป้าหมาย', 'ผลงานจริง', 'บรรลุ (%)', 'น้ำหนัก (%)', 'สถานะ'];
    const rows = reportData.map(r => [
      r.id,
      \`"\${r.title.replace(/"/g, '""')}"\`,
      \`"\${r.department}"\`,
      \`"\${r.target} \${r.unit}"\`,
      r.actual,
      \`"\${r.achievement.toFixed(2)}%"\`,
      \`"\${r.weight}%"\`,
      r.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8,\\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", \`KPI_Report_\${filterYear + 543}_\${filterQuarter}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const getQuarterLabel = (q: string) => {
    if (q === 'Q1') return 'Q1 (ไตรมาส 1)';
    if (q === 'Q2') return 'Q2 (ไตรมาส 2)';
    if (q === 'Q3') return 'Q3 (ไตรมาส 3)';
    if (q === 'Q4') return 'Q4 (ไตรมาส 4)';
    return 'ทั้งปีงบประมาณ';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Top Header / Filters (Hide when printing) */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-900">รายงานสรุปผลการประเมิน KPI</h1>
          <p className="text-sm text-gray-500">ปีงบประมาณ {filterYear + 543} | รอบประเมิน {filterQuarter}</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 font-medium"
          >
            {[2, 1, 0, -1, -2].map(offset => {
              const y = currentYear + offset;
              return <option key={y} value={y}>ปีงบประมาณ {y + 543}</option>
            })}
          </select>
          <select 
            value={filterQuarter} 
            onChange={(e) => setFilterQuarter(e.target.value)}
            className="border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 font-medium"
          >
            <option value="Q1">Q1 (ไตรมาส 1)</option>
            <option value="Q2">Q2 (ไตรมาส 2)</option>
            <option value="Q3">Q3 (ไตรมาส 3)</option>
            <option value="Q4">Q4 (ไตรมาส 4)</option>
            <option value="All">ทั้งปีงบประมาณ</option>
          </select>
          <button onClick={fetchData} className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Action Toolbar (Hide when printing) */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-gray-100 gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-gray-900">รายงานสรุปผลการประเมิน KPI สำหรับผู้บริหาร</h2>
          <p className="text-sm text-gray-500 mt-1">จัดทำเอกสารทางการ Export CSV หรือสั่งพิมพ์รายงาน PDF</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg flex items-center font-medium shadow-sm transition-colors text-sm"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
          <button 
            onClick={handlePrintPDF}
            className="bg-[#1e293b] hover:bg-[#0f172a] text-white px-5 py-2.5 rounded-lg flex items-center font-medium shadow-sm transition-colors text-sm"
          >
            <Printer className="w-4 h-4 mr-2" /> พิมพ์รายงาน / PDF
          </button>
        </div>
      </div>

      {/* Printable Report Paper Area */}
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0">
        
        {/* Report Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">รายงานสรุปผลการปฏิบัติงานตามตัวชี้วัด (KPI PERFORMANCE REPORT)</h2>
          <p className="text-gray-600 font-medium">ประจำปีงบประมาณ {filterYear + 543} | รอบการประเมิน {filterQuarter}</p>
          <p className="text-sm text-gray-400 mt-1">ออกรายงาน ณ วันที่ {new Date().toLocaleDateString('th-TH')}</p>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200">
                <th className="py-4 px-4 text-sm font-bold text-gray-800 border-x border-gray-200 text-center w-24">รหัส</th>
                <th className="py-4 px-4 text-sm font-bold text-gray-800 border-x border-gray-200">ชื่อตัวชี้วัด</th>
                <th className="py-4 px-4 text-sm font-bold text-gray-800 border-x border-gray-200 text-center w-32">แผนก</th>
                <th className="py-4 px-4 text-sm font-bold text-gray-800 border-x border-gray-200 text-center w-32">เป้าหมาย</th>
                <th className="py-4 px-4 text-sm font-bold text-gray-800 border-x border-gray-200 text-center w-32">ผลงานจริง</th>
                <th className="py-4 px-4 text-sm font-bold text-gray-800 border-x border-gray-200 text-center w-28">บรรลุ (%)</th>
                <th className="py-4 px-4 text-sm font-bold text-gray-800 border-x border-gray-200 text-center w-24">น้ำหนัก</th>
                <th className="py-4 px-4 text-sm font-bold text-gray-800 border-x border-gray-200 text-center w-32">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length > 0 ? (
                reportData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-sm text-gray-600 border-x border-gray-200 text-center font-medium">{row.id}</td>
                    <td className="py-4 px-4 text-sm text-gray-800 border-x border-gray-200">{row.title}</td>
                    <td className="py-4 px-4 text-sm text-gray-600 border-x border-gray-200 text-center">{row.department}</td>
                    <td className="py-4 px-4 text-sm text-gray-600 border-x border-gray-200 text-center">{row.target} {row.unit}</td>
                    <td className="py-4 px-4 text-sm text-gray-900 font-medium border-x border-gray-200 text-center">
                      {row.actual > 0 ? row.actual : '-'}
                    </td>
                    <td className="py-4 px-4 text-sm font-bold border-x border-gray-200 text-center">
                      {row.achievement.toFixed(2)}%
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 border-x border-gray-200 text-center">{row.weight}%</td>
                    <td className="py-4 px-4 text-sm border-x border-gray-200 text-center font-bold">
                      <span className={
                        row.status === 'Achieved' ? 'text-emerald-700' :
                        row.status === 'Warning' ? 'text-orange-600' : 'text-gray-500'
                      }>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500 border-x border-b border-gray-200">
                    ไม่มีข้อมูลสำหรับรอบการประเมินนี้
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
`;

fs.writeFileSync('src/app/reports/page.tsx', code, 'utf8');
console.log('Reports page updated successfully!');
