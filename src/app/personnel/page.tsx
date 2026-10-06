'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Search, Mail, Phone, Briefcase, User as UserIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Employee {
  id: number;
  employee_code: string;
  title: string;
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  employment_type: string;
  start_date: string;
  status: string;
  email: string;
  phone: string;
  profile_image: string | null;
}

export default function PersonnelPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openAddModal = () => {
    setCurrentEmployee({
      title: 'นาย',
      status: 'active',
      employment_type: 'full_time',
      start_date: new Date().toISOString().split('T')[0]
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setCurrentEmployee({
      ...emp,
      start_date: emp.start_date ? new Date(emp.start_date).toISOString().split('T')[0] : ''
    });
    setSelectedFile(null);
    const imageUrl = emp.profile_image?.startsWith('http') 
      ? emp.profile_image 
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${emp.profile_image}`;
      
    setPreviewUrl(emp.profile_image ? imageUrl : null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      Object.keys(currentEmployee).forEach(key => {
        if (currentEmployee[key as keyof Employee] !== undefined && currentEmployee[key as keyof Employee] !== null) {
          formData.append(key, currentEmployee[key as keyof Employee] as string);
        }
      });
      
      if (selectedFile) {
        formData.append('profile_image', selectedFile);
      }

      if (currentEmployee.id) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employees/${currentEmployee.id}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employees`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save employee');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEmployees();
    } catch (err) {
      alert('Failed to delete employee');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.first_name} ${emp.last_name} ${emp.employee_code} ${emp.department}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personnel Management</h1>
          <p className="text-gray-500 mt-1">จัดการข้อมูลพนักงานทั้งหมดในระบบ</p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ, รหัส, แผนก..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap px-4 py-2">
            <Plus className="w-5 h-5 mr-2" />
            เพิ่มพนักงาน
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-gray-500">กำลังโหลดข้อมูล...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEmployees.map(emp => (
            <div key={emp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative group">
              <div className="absolute top-4 right-4 flex space-x-2">
                <button onClick={() => openEditModal(emp)} className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-full shadow-sm border border-gray-200" title="แก้ไขข้อมูล">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(emp.id)} className="p-2 bg-white text-red-600 hover:bg-red-50 rounded-full shadow-sm border border-gray-200" title="ลบข้อมูล">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6 mt-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {emp.profile_image ? (
                      <img 
                        src={emp.profile_image.startsWith('http') ? emp.profile_image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${emp.profile_image}`} 
                        alt={emp.first_name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <UserIcon className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{emp.title}{emp.first_name} {emp.last_name}</h3>
                    <p className="text-sm font-medium text-indigo-600">{emp.position}</p>
                    <p className="text-xs text-gray-500 mt-1">รหัส: {emp.employee_code}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mt-6 border-t pt-4">
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="font-medium text-gray-900">{emp.department}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{emp.phone || '-'}</span>
                  </div>
                </div>
              </div>
              
              <div className={`px-6 py-3 text-xs font-semibold text-center border-t
                ${emp.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                  emp.status === 'inactive' ? 'bg-red-50 text-red-700 border-red-100' : 
                  'bg-amber-50 text-amber-700 border-amber-100'}
              `}>
                {emp.status === 'active' ? 'ทำงานปกติ' : emp.status === 'inactive' ? 'พ้นสภาพ' : 'ทดลองงาน'}
              </div>
            </div>
          ))}
          {filteredEmployees.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">
              ไม่พบข้อมูลพนักงาน
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{currentEmployee.id ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="empForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md overflow-hidden mb-3 relative flex items-center justify-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-12 h-12 text-gray-300" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    <span>อัปโหลดรูปภาพ</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">JPG, PNG ขนาดไม่เกิน 5MB</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">รหัสพนักงาน <span className="text-red-500">*</span></label>
                    <input required value={currentEmployee.employee_code || ''} onChange={e => setCurrentEmployee({...currentEmployee, employee_code: e.target.value})} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2.5" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">อีเมล <span className="text-red-500">*</span></label>
                    <input required value={currentEmployee.email || ''} onChange={e => setCurrentEmployee({...currentEmployee, email: e.target.value})} type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2.5" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">คำนำหน้า <span className="text-red-500">*</span></label>
                    <select required value={currentEmployee.title || ''} onChange={e => setCurrentEmployee({...currentEmployee, title: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white">
                      <option value="นาย">นาย</option>
                      <option value="นาง">นาง</option>
                      <option value="นางสาว">นางสาว</option>
                    </select>
                  </div>
                  <div className="col-span-3 grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อ <span className="text-red-500">*</span></label>
                      <input required value={currentEmployee.first_name || ''} onChange={e => setCurrentEmployee({...currentEmployee, first_name: e.target.value})} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2.5" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">นามสกุล <span className="text-red-500">*</span></label>
                      <input required value={currentEmployee.last_name || ''} onChange={e => setCurrentEmployee({...currentEmployee, last_name: e.target.value})} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2.5" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">ตำแหน่ง <span className="text-red-500">*</span></label>
                    <input required value={currentEmployee.position || ''} onChange={e => setCurrentEmployee({...currentEmployee, position: e.target.value})} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">แผนก <span className="text-red-500">*</span></label>
                    <input required value={currentEmployee.department || ''} onChange={e => setCurrentEmployee({...currentEmployee, department: e.target.value})} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2.5" placeholder="ระบุแผนก" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">เบอร์โทรศัพท์</label>
                    <input value={currentEmployee.phone || ''} onChange={e => setCurrentEmployee({...currentEmployee, phone: e.target.value})} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">ประเภทการจ้าง <span className="text-red-500">*</span></label>
                    <select required value={currentEmployee.employment_type || ''} onChange={e => setCurrentEmployee({...currentEmployee, employment_type: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white">
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">สถานะ <span className="text-red-500">*</span></label>
                    <select required value={currentEmployee.status || ''} onChange={e => setCurrentEmployee({...currentEmployee, status: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white">
                      <option value="active">ทำงานปกติ (Active)</option>
                      <option value="inactive">พ้นสภาพ (Inactive)</option>
                      <option value="probation">ทดลองงาน (Probation)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">วันที่เริ่มงาน <span className="text-red-500">*</span></label>
                  <input required value={currentEmployee.start_date || ''} onChange={e => setCurrentEmployee({...currentEmployee, start_date: e.target.value})} type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2.5" />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="px-6">ยกเลิก</Button>
              <Button type="submit" form="empForm" className="bg-indigo-600 hover:bg-indigo-700 px-8">บันทึก</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
