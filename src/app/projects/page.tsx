'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Calendar, CheckCircle2, Clock, X } from 'lucide-react';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/projects`;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'not_started',
    progress: '0'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: '', description: '', start_date: '', end_date: '', status: 'not_started', progress: '0' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: any) => {
    setIsEditing(true);
    setEditingId(project.id);
    setFormData({
      name: project.name,
      description: project.description || '',
      start_date: project.start_date ? project.start_date.split('T')[0] : '',
      end_date: project.end_date ? project.end_date.split('T')[0] : '',
      status: project.status,
      progress: project.progress.toString()
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโครงการนี้?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert('Failed to delete project');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (isEditing && editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(API_URL, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Failed to save project');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการโครงการ (Projects)</h1>
          <p className="text-sm text-gray-500">สร้าง ดู และแก้ไขรายการโครงการ พร้อมติดตามความคืบหน้า</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg px-4 py-2 hover:scale-105 transition">
          <Plus className="w-5 h-5 mr-2" />
          เพิ่มโครงการ
        </button>
      </div>

      {loading ? (
        <p className="text-center py-10 text-gray-500">กำลังโหลด...</p>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
          <p className="text-gray-500">ยังไม่มีโครงการในระบบ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{project.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenEdit(project)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(project.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">{project.description || '-'}</p>
              
              <div className="flex items-center text-xs text-gray-500 mb-4 space-x-4">
                <div className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {project.end_date ? new Date(project.end_date).toLocaleDateString('th-TH') : 'ไม่ระบุ'}</div>
                <div className="flex items-center">
                  {project.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 mr-1 text-orange-500" />}
                  {project.status === 'completed' ? 'เสร็จสิ้น' : project.status === 'in_progress' ? 'กำลังดำเนินการ' : project.status === 'on_hold' ? 'ระงับไว้' : 'ยังไม่เริ่ม'}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-gray-700">ความคืบหน้า</span>
                  <span className="text-indigo-600">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'แก้ไขโครงการ' : 'เพิ่มโครงการใหม่'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อโครงการ *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="เช่น โครงการพัฒนาระบบ..." className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                <textarea rows={3} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="รายละเอียดของโครงการ..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่ม</label>
                  <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
                  <input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="not_started">ยังไม่เริ่ม</option>
                    <option value="in_progress">กำลังดำเนินการ</option>
                    <option value="on_hold">ระงับไว้</option>
                    <option value="completed">เสร็จสิ้น</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ความคืบหน้า (%)</label>
                  <input className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" type="number" min="0" max="100" value={formData.progress} onChange={e => setFormData({...formData, progress: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" onClick={() => setIsModalOpen(false)}>ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
