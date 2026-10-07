'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Calendar, Clock, MapPin, Users, Plus, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Training {
  id: number;
  training_code: string;
  title: string;
  category: string;
  trainer: string;
  start_date: string;
  end_date: string;
  location: string;
  hours: number;
  budget: number | null;
  employee_trainings?: any[];
}

export default function TrainingPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Training>>({
    category: 'Workshop'
  });

  const fetchTrainings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/training`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrainings(res.data);
    } catch (err) {
      console.error('Failed to fetch trainings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/training`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      setFormData({ category: 'Workshop' });
      fetchTrainings();
    } catch (err) {
      alert('Failed to save training course');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันการลบหลักสูตรอบรมนี้? (ข้อมูลการลงทะเบียนจะถูกลบไปด้วย)')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/training/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTrainings();
    } catch (err) {
      alert('Failed to delete training course');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-indigo-600" />
            Training Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">จัดการหลักสูตรอบรมและพัฒนาทักษะบุคลากร</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-95 text-base py-2.5">
          <Plus className="w-5 h-5 mr-2" />
          เพิ่มหลักสูตรใหม่
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-gray-500">กำลังโหลดข้อมูลหลักสูตร...</div>
      ) : trainings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((course) => {
            const startDateStr = new Date(course.start_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
            const startTimeStr = new Date(course.start_date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            const enrolled = course.employee_trainings ? course.employee_trainings.length : 0;
            
            return (
              <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-900/5 hover:-translate-y-1 transition-all duration-300 relative group">
                
                <button 
                  onClick={() => handleDelete(course.id)} 
                  className="absolute top-4 right-4 p-2.5 bg-white text-red-500 hover:bg-red-50 hover:text-red-700 hover:scale-110 active:scale-95 rounded-full shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                  title="ลบหลักสูตร"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className={`h-2 ${course.category === 'Online' ? 'bg-sky-500' : course.category === 'Workshop' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      course.category === 'Online' ? 'bg-sky-100 text-sky-700' : 
                      course.category === 'Workshop' ? 'bg-amber-100 text-amber-700' : 
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {course.category}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{course.training_code}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[3.5rem]">{course.title}</h3>
                  <p className="text-sm font-medium text-indigo-600 mt-1">ผู้สอน: {course.trainer || '-'}</p>
                  
                  <div className="mt-5 space-y-2.5">
                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <Calendar className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                      <span className="font-medium">{startDateStr}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <Clock className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                      <span>{startTimeStr} ({course.hours} ชั่วโมง)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <MapPin className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{course.location || '-'}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center text-sm font-medium text-gray-700">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-2">
                        <Users className="w-4 h-4 text-indigo-600" />
                      </div>
                      {enrolled} คนลงทะเบียน
                    </div>
                    
                    <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => alert('ฟีเจอร์ลงทะเบียนกำลังพัฒนา')}>
                      ลงทะเบียน
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">ยังไม่มีหลักสูตรอบรม</h3>
          <p className="text-gray-500">กดปุ่มเพิ่มหลักสูตรใหม่ด้านบนเพื่อเริ่มต้นจัดการการอบรม</p>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">เพิ่มหลักสูตรอบรมใหม่</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="trainingForm" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">รหัสหลักสูตร <span className="text-red-500">*</span></label>
                    <input required value={formData.training_code || ''} onChange={e => setFormData({...formData, training_code: e.target.value})} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2.5" placeholder="TR-001" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อหลักสูตร <span className="text-red-500">*</span></label>
                    <input required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">ประเภทการอบรม <span className="text-red-500">*</span></label>
                    <select required value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white">
                      <option value="Workshop">Workshop (ปฏิบัติการ)</option>
                      <option value="Online">Online (ออนไลน์)</option>
                      <option value="Seminar">Seminar (สัมมนา)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">ผู้สอน / วิทยากร <span className="text-red-500">*</span></label>
                    <input required value={formData.trainer || ''} onChange={e => setFormData({...formData, trainer: e.target.value})} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">วัน-เวลา เริ่มต้น <span className="text-red-500">*</span></label>
                    <input required value={formData.start_date || ''} onChange={e => setFormData({...formData, start_date: e.target.value})} type="datetime-local" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">วัน-เวลา สิ้นสุด <span className="text-red-500">*</span></label>
                    <input required value={formData.end_date || ''} onChange={e => setFormData({...formData, end_date: e.target.value})} type="datetime-local" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">สถานที่ <span className="text-red-500">*</span></label>
                  <input required value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2.5" placeholder="เช่น ห้องประชุม A, Zoom Link" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">จำนวนชั่วโมง (ชั่วโมง) <span className="text-red-500">*</span></label>
                    <input required value={formData.hours || ''} onChange={e => setFormData({...formData, hours: Number(e.target.value)})} type="number" min="0.5" step="0.5" className="w-full border border-gray-300 rounded-lg px-3 py-2.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">งบประมาณ (บาท)</label>
                    <input value={formData.budget || ''} onChange={e => setFormData({...formData, budget: Number(e.target.value)})} type="number" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2.5" />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5">ยกเลิก</Button>
              <Button type="submit" form="trainingForm" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-2.5 text-base shadow-sm">บันทึกหลักสูตร</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
