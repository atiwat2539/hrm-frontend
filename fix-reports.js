const fs = require('fs');

const code = `'use client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Printer, RefreshCw } from 'lucide-react';

// Use correct API endpoint for KPI
const KPI_API_URL = \`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/kpi\`;

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterYear, setFilterYear] = useState(currentYear);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(KPI_API_URL, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      // Sort by ID to keep it consistent
      const sortedKpis = res.data.sort((a: any, b: any) => a.id - b.id);
      setKpis(sortedKpis);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Process data for the table based on user's column request
  const reportData = kpis.map(kpi => {
    let actual = 0;
    
    if (kpi.results) {
      kpi.results.forEach((r: any) => {
        const m = parseInt(r.month);
        const y = r.year;
        // Fiscal Year (June to May)
        if (m >= 6 && m <= 12 && y === filterYear - 1) actual += r.actual;
        else if (m >= 1 && m <= 5 && y === filterYear) actual += r.actual;
      });
    }

    return {
      employeeName: kpi.employee ? \`\${kpi.employee.first_name} \${kpi.employee.last_name}\` : 'ไม่ระบุ',
      title: kpi.title || '-',
      subTitle: kpi.sub_title || '-',
      description: kpi.description || '-',
      target: \`\${kpi.target} \${kpi.unit || ''}\`.trim(),
      actual: \`\${actual > 0 ? actual : 0} \${kpi.unit || ''}\`.trim(),
    };
  });

  const handleExportCSV = () => {
    const headers = ['บุคลากร', 'หัวข้อหลัก', 'หัวข้อย่อย', 'รายละเอียดภาระงาน', 'เป้าหมาย', 'ผลรวมที่ทำได้'];
    const rows = reportData.map(r => [
      \`"\${r.employeeName}"\`,
      \`"\${r.title.replace(/"/g, '""')}"\`,
      \`"\${r.subTitle.replace(/"/g, '""')}"\`,
      \`"\${r.description.replace(/"/g, '""')}"\`,
      \`"\${r.target}"\`,
      \`"\${r.actual}"\`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8,\\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", \`KPI_Report_\${filterYear + 543}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      
      {/* Top Header / Filters (Hide when printing) */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-900">รายงานสรุปผลการประเมิน KPI</h1>
          <p className="text-sm text-gray-500">ปีงบประมาณ {filterYear + 543}</p>
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
          <p className="text-gray-600 font-medium">ประจำปีงบประมาณ {filterYear + 543}</p>
          <p className="text-sm text-gray-400 mt-1">ออกรายงาน ณ วันที่ {new Date().toLocaleDateString('th-TH')}</p>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200">
                <th className="py-4 px-4 text-sm font-bold text-gray-800 border-x border-gray-200 w-[15%]">บุคลากร</th>
                <th className="py-4 px-4 text-sm font-bold text-gray-800 border-x border-gray-200 w-[20%]">หัวข้อหลัก</th>
                <th className="py-4 px-4 text-sm font-bold text-gray-800 border-x border-gray-200 w-[20%]">หัวข้อย่อย</th>
                <th className="py-4 px-4 text-sm font-bold text-gray-800 border-x border-gray-200 w-[25%]">รายละเอียดภาระงาน</th>
                <th className="py-4 px-4 text-sm font-bold text-gray-800 border-x border-gray-200 text-center w-[10%]">เป้าหมาย</th>
                <th className="py-4 px-4 text-sm font-bold text-gray-800 border-x border-gray-200 text-center w-[10%]">ผลรวมที่ทำได้</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length > 0 ? (
                reportData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-sm text-gray-800 border-x border-gray-200 font-medium">{row.employeeName}</td>
                    <td className="py-4 px-4 text-sm text-gray-800 border-x border-gray-200">{row.title}</td>
                    <td className="py-4 px-4 text-sm text-gray-600 border-x border-gray-200">{row.subTitle}</td>
                    <td className="py-4 px-4 text-sm text-gray-600 border-x border-gray-200 whitespace-pre-wrap">{row.description}</td>
                    <td className="py-4 px-4 text-sm text-gray-800 border-x border-gray-200 text-center font-medium bg-gray-50/30">{row.target}</td>
                    <td className="py-4 px-4 text-sm text-indigo-700 font-bold border-x border-gray-200 text-center bg-indigo-50/30">
                      {row.actual}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 border-x border-b border-gray-200">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-3" />
                      <p>ไม่มีข้อมูลสำหรับปีงบประมาณนี้</p>
                    </div>
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
console.log('Fixed API and table layout.');
