'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Calendar, CheckCircle2, Clock, X, User, Tag, ListChecks } from 'lucide-react';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/projects`;
const EMP_API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employees`;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    year: new Date().getFullYear(),
    owner_id: '',
    start_date: '',
    end_date: '',
    status: 'not_started',
    progress: '0',
    checklists: [] as { id?: number; task_name: string; is_completed: boolean }[]
  });

  const [newTaskName, setNewTaskName] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [projRes, empRes] = await Promise.all([
        axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(EMP_API_URL, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setProjects(projRes.data);
      setEmployees(empRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Use Thai Year logic matching KPI page [2, 1, 0, -1, -2] mapping to year + 543
  const yearOptions = [2, 1, 0, -1, -2].map(offset => {
    const y = new Date().getFullYear() + offset;
    return { value: y, label: y + 543 };
  });

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ 
      name: '', description: '', type: '', year: new Date().getFullYear(), owner_id: '',
      start_date: '', end_date: '', status: 'not_started', progress: '0', checklists: [] 
    });
    setNewTaskName('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: any) => {
    setIsEditing(true);
    setEditingId(project.id);
    setFormData({
      name: project.name,
      description: project.description || '',
      type: project.type || '',
      year: project.year || new Date().getFullYear(),
      owner_id: project.owner_id ? project.owner_id.toString() : '',
      start_date: project.start_date ? project.start_date.split('T')[0] : '',
      end_date: project.end_date ? project.end_date.split('T')[0] : '',
      status: project.status,
      progress: project.progress.toString(),
      checklists: project.checklists || []
    });
    setNewTaskName('');
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

  const calculateProgress = (checklists: any[], manualProgress: string) => {
    if (!checklists || checklists.length === 0) return manualProgress;
    const completed = checklists.filter((c: any) => c.is_completed).length;
    return Math.round((completed / checklists.length) * 100).toString();
  };

  const addChecklist = () => {
    if (!newTaskName.trim()) return;
    const newChecklists = [...formData.checklists, { task_name: newTaskName, is_completed: false }];
    setFormData({ 
      ...formData, 
      checklists: newChecklists,
      progress: calculateProgress(newChecklists, formData.progress)
    });
    setNewTaskName('');
  };

  const toggleChecklist = (index: number) => {
    const updated = [...formData.checklists];
    updated[index].is_completed = !updated[index].is_completed;
    setFormData({ 
      ...formData, 
      checklists: updated,
      progress: calculateProgress(updated, formData.progress)
    });
  };

  const removeChecklist = (index: number) => {
    const updated = formData.checklists.filter((_, i) => i !== index);
    setFormData({ 
      ...formData, 
      checklists: updated,
      progress: calculateProgress(updated, formData.progress)
    });
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
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการโครงการ (Projects)</h1>
          <p className="text-sm text-gray-500">สร้าง ดู และแก้ไขรายการโครงการ พร้อมติดตามความคืบหน้าแบบละเอียด</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg px-4 py-2 hover:scale-105 transition shadow-sm font-medium">
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
            <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{project.name}</h3>
                <div className="flex gap-2 shrink-0 ml-2">
                  <button onClick={() => handleOpenEdit(project)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(project.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              {project.type && (
                <div className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-md mb-3 w-max">
                  {project.type}
                </div>
              )}
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description || '-'}</p>
              
              <div className="mt-auto space-y-3 mb-4">
                <div className="flex items-center text-xs text-gray-500 space-x-4">
                  <div className="flex items-center"><User className="w-3.5 h-3.5 mr-1" /> {project.owner ? `${project.owner.first_name} ${project.owner.last_name}` : 'ไม่ระบุผู้ดูแล'}</div>
                  <div className="flex items-center"><Tag className="w-3.5 h-3.5 mr-1" /> รอบปี {project.year ? project.year + 543 : '-'}</div>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 space-x-4">
                  <div className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" />สิ้นสุด: {project.end_date ? new Date(project.end_date).toLocaleDateString('th-TH') : '-'}</div>
                  <div className="flex items-center">
                    {project.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 mr-1 text-orange-500" />}
                    {project.status === 'completed' ? 'เสร็จสิ้น' : project.status === 'in_progress' ? 'กำลังดำเนินการ' : project.status === 'on_hold' ? 'ระงับไว้' : 'ยังไม่เริ่ม'}
                  </div>
                </div>

                {project.checklists && project.checklists.length > 0 && (
                  <div className="text-xs text-gray-500 flex items-center">
                    <ListChecks className="w-3.5 h-3.5 mr-1" />
                    เช็คลิสต์: {project.checklists.filter((c: any) => c.is_completed).length} / {project.checklists.length}
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-gray-700">ความคืบหน้า</span>
                  <span className="text-indigo-600">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'แก้ไขโครงการ' : 'เพิ่มโครงการใหม่'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1.5 rounded-full transition"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1">
              <form id="project-form" onSubmit={handleSubmit} className="p-6 space-y-5">
                
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 border-b pb-2">ข้อมูลทั่วไป</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อโครงการ *</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="เช่น โครงการพัฒนาระบบ..." className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                      <textarea rows={2} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="รายละเอียดของโครงการ..."></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทโครงการ</label>
                      <input type="text" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="เช่น ไอที, การตลาด, วิจัย..." className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">รอบปีโครงการ</label>
                      <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})}>
                        {yearOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">บุคลากรเจ้าของโครงการ</label>
                      <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" value={formData.owner_id} onChange={e => setFormData({...formData, owner_id: e.target.value})}>
                        <option value="">-- ไม่ระบุ --</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.department})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dates & Status */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 border-b pb-2">ระยะเวลาและสถานะ</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่ม</label>
                      <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
                      <input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                      <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option value="not_started">ยังไม่เริ่ม</option>
                        <option value="in_progress">กำลังดำเนินการ</option>
                        <option value="on_hold">ระงับไว้</option>
                        <option value="completed">เสร็จสิ้น</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ความคืบหน้า (%) {formData.checklists.length > 0 && <span className="text-indigo-500 text-xs">(คำนวณจากเช็คลิสต์)</span>}</label>
                      <input 
                        className={`w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border ${formData.checklists.length > 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
                        type="number" min="0" max="100" 
                        value={formData.progress} 
                        onChange={e => setFormData({...formData, progress: e.target.value})} 
                        readOnly={formData.checklists.length > 0}
                      />
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 border-b pb-2">เช็คลิสต์งาน (Checklist)</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newTaskName} 
                      onChange={e => setNewTaskName(e.target.value)} 
                      onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addChecklist())}
                      placeholder="เพิ่มงานย่อย..." 
                      className="flex-1 border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" 
                    />
                    <button type="button" onClick={addChecklist} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 font-medium whitespace-nowrap">เพิ่ม</button>
                  </div>
                  
                  {formData.checklists.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                      {formData.checklists.map((chk, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-md border border-gray-100 shadow-sm">
                          <label className="flex items-center space-x-3 cursor-pointer flex-1">
                            <input 
                              type="checkbox" 
                              checked={chk.is_completed} 
                              onChange={() => toggleChecklist(idx)} 
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className={`text-sm ${chk.is_completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{chk.task_name}</span>
                          </label>
                          <button type="button" onClick={() => removeChecklist(idx)} className="text-red-400 hover:text-red-600 p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 shrink-0">
              <button type="button" className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition" onClick={() => setIsModalOpen(false)}>ยกเลิก</button>
              <button type="submit" form="project-form" className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg text-white hover:shadow-lg hover:scale-105 transition font-medium">บันทึกโครงการ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
