'use client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Calendar, CheckCircle2, Clock, X, User, Tag, ListChecks, Settings2, Info } from 'lucide-react';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/projects`;
const EMP_API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employees`;
const TYPE_API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/project-types`;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [projectTypes, setProjectTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering
  const [filterOwner, setFilterOwner] = useState('');
  const [filterType, setFilterType] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  
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
  
  // Type Management Form
  const [newTypeName, setNewTypeName] = useState('');
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null);
  const [editTypeName, setEditTypeName] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [projRes, empRes, typeRes] = await Promise.all([
        axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(EMP_API_URL, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(TYPE_API_URL, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setProjects(projRes.data);
      setEmployees(empRes.data);
      setProjectTypes(typeRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const yearOptions = [2, 1, 0, -1, -2].map(offset => {
    const y = new Date().getFullYear() + offset;
    return { value: y, label: y + 543 };
  });

  const filteredProjects = projects.filter(p => {
    const matchOwner = filterOwner ? p.owner_id?.toString() === filterOwner : true;
    const matchType = filterType ? p.type === filterType : true;
    return matchOwner && matchType;
  });

  const handleOpenDetails = (project: any) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
  };

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
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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
        await axios.put(`${API_URL}/${editingId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(API_URL, formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Failed to save project');
    }
  };

  // ---- Project Type Management ----
  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(TYPE_API_URL, { name: newTypeName }, { headers: { Authorization: `Bearer ${token}` } });
      setNewTypeName('');
      fetchData();
    } catch (error) {
      alert('Failed to add type or it already exists');
    }
  };

  const handleUpdateType = async (id: number) => {
    if (!editTypeName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${TYPE_API_URL}/${id}`, { name: editTypeName }, { headers: { Authorization: `Bearer ${token}` } });
      setEditingTypeId(null);
      setEditTypeName('');
      fetchData();
    } catch (error) {
      alert('Failed to update type');
    }
  };

  const handleDeleteType = async (id: number) => {
    if (!confirm('ลบประเภทนี้? โครงการที่ใช้ประเภทนี้จะยังคงแสดงชื่อประเภทเดิมไว้')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${TYPE_API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (error) {
      alert('Failed to delete type');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการโครงการ (Projects)</h1>
          <p className="text-sm text-gray-500">สร้าง ดู และแก้ไขรายการโครงการ พร้อมติดตามความคืบหน้าแบบละเอียด</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsTypeModalOpen(true)} className="flex items-center bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-50 transition shadow-sm font-medium">
            <Settings2 className="w-5 h-5 mr-2 text-gray-500" />
            จัดการประเภท
          </button>
          <button onClick={handleOpenCreate} className="flex items-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg px-4 py-2 hover:scale-105 transition shadow-sm font-medium">
            <Plus className="w-5 h-5 mr-2" />
            เพิ่มโครงการ
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-1/3">
          <label className="block text-xs font-medium text-gray-500 mb-1">กรองตามเจ้าของโครงการ</label>
          <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border bg-gray-50" value={filterOwner} onChange={e => setFilterOwner(e.target.value)}>
            <option value="">-- ดูทั้งหมด --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-1/3">
          <label className="block text-xs font-medium text-gray-500 mb-1">กรองตามประเภทโครงการ</label>
          <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border bg-gray-50" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">-- ดูทั้งหมด --</option>
            {projectTypes.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-1/3 flex items-end">
          <div className="text-sm text-gray-500 w-full text-right p-2">
            พบ {filteredProjects.length} โครงการ
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
          <p className="text-gray-500">ไม่พบโครงการตามเงื่อนไขที่เลือก</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredProjects.map(project => (
            <div key={project.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 pr-4">{project.name}</h3>
                <div className="flex gap-2 shrink-0 ml-2">
                  <button onClick={() => handleOpenDetails(project)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition" title="ดูรายละเอียด"><Info className="w-5 h-5" /></button>
                  <button onClick={() => handleOpenEdit(project)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete(project.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
              
              {project.type && (
                <div className="inline-block bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1.5 rounded-lg mb-4 w-max">
                  {project.type}
                </div>
              )}
              
              <p className="text-base text-gray-600 mb-6 line-clamp-3">{project.description || '-'}</p>
              
              <div className="mt-auto space-y-4 mb-6">
                <div className="flex items-center text-sm text-gray-500 space-x-6">
                  <div className="flex items-center"><User className="w-4 h-4 mr-1.5" /> {project.owner ? `${project.owner.first_name} ${project.owner.last_name}` : 'ไม่ระบุผู้ดูแล'}</div>
                  <div className="flex items-center"><Tag className="w-4 h-4 mr-1.5" /> รอบปี {project.year ? project.year + 543 : '-'}</div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 space-x-6">
                  <div className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" />สิ้นสุด: {project.end_date ? new Date(project.end_date).toLocaleDateString('th-TH') : '-'}</div>
                  <div className="flex items-center">
                    {project.status === 'completed' ? <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" /> : <Clock className="w-4 h-4 mr-1.5 text-orange-500" />}
                    {project.status === 'completed' ? 'เสร็จสิ้น' : project.status === 'in_progress' ? 'กำลังดำเนินการ' : project.status === 'on_hold' ? 'ระงับไว้' : 'ยังไม่เริ่ม'}
                  </div>
                </div>

                {project.checklists && project.checklists.length > 0 && (
                  <div className="text-sm text-gray-500 flex items-center font-medium bg-gray-50 p-2 rounded-lg w-fit">
                    <ListChecks className="w-4 h-4 mr-1.5 text-indigo-500" />
                    เช็คลิสต์: {project.checklists.filter((c: any) => c.is_completed).length} / {project.checklists.length}
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-700">ความคืบหน้า</span>
                  <span className="text-indigo-600 text-base">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-indigo-500 to-violet-600 h-3 rounded-full transition-all duration-1000" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Modal */}
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
                      <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="">-- ไม่ระบุ --</option>
                        {projectTypes.map(t => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
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

      {/* Type Management Modal */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">จัดการประเภทโครงการ</h2>
              <button onClick={() => setIsTypeModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1.5 rounded-full transition"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddType} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  required
                  value={newTypeName} 
                  onChange={e => setNewTypeName(e.target.value)} 
                  placeholder="ชื่อประเภทใหม่..." 
                  className="flex-1 border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" 
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium whitespace-nowrap shadow-sm">เพิ่ม</button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {projectTypes.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-4">ยังไม่มีประเภทโครงการ</p>
                ) : projectTypes.map(t => (
                  <div key={t.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {editingTypeId === t.id ? (
                      <div className="flex gap-2 w-full">
                        <input 
                          type="text" 
                          autoFocus
                          value={editTypeName} 
                          onChange={e => setEditTypeName(e.target.value)} 
                          className="flex-1 border-gray-300 rounded-md shadow-sm sm:text-sm p-1 border" 
                        />
                        <button onClick={() => handleUpdateType(t.id)} className="text-emerald-600 text-sm font-medium hover:bg-emerald-50 px-2 rounded">บันทึก</button>
                        <button onClick={() => setEditingTypeId(null)} className="text-gray-500 text-sm font-medium hover:bg-gray-200 px-2 rounded">ยกเลิก</button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-gray-800">{t.name}</span>
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingTypeId(t.id); setEditTypeName(t.name); }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteType(t.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsDetailsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">รายละเอียดโครงการ</h2>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1.5 rounded-full transition"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedProject.name}</h3>
                {selectedProject.type && (
                  <span className="inline-block bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-lg">
                    {selectedProject.type}
                  </span>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-2">รายละเอียดโครงการ</p>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{selectedProject.description || '-'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-center space-x-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><User className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">ผู้รับผิดชอบ</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProject.owner ? `${selectedProject.owner.first_name} ${selectedProject.owner.last_name}` : 'ไม่ระบุ'}</p>
                  </div>
                </div>

                <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl flex items-center space-x-3">
                  <div className="bg-green-100 text-green-600 p-2 rounded-lg"><Tag className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">รอบปีประเมิน</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProject.year ? selectedProject.year + 543 : '-'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 p-4 rounded-xl flex items-center space-x-3">
                  <div className="bg-gray-100 text-gray-600 p-2 rounded-lg"><Calendar className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">ระยะเวลาดำเนินการ</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString('th-TH') : '-'} ถึง {selectedProject.end_date ? new Date(selectedProject.end_date).toLocaleDateString('th-TH') : '-'}
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 p-4 rounded-xl flex items-center space-x-3">
                  <div className="bg-gray-100 text-gray-600 p-2 rounded-lg"><Clock className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">สถานะโครงการ</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedProject.status === 'not_started' ? 'ยังไม่เริ่ม' : 
                       selectedProject.status === 'in_progress' ? 'กำลังดำเนินการ' : 
                       selectedProject.status === 'completed' ? 'เสร็จสิ้น' : 
                       selectedProject.status === 'cancelled' ? 'ยกเลิก' : selectedProject.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 p-5 rounded-xl">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm font-semibold text-gray-700">ความคืบหน้าโครงการ</p>
                  <p className="text-2xl font-bold text-indigo-600">{selectedProject.progress || 0}%</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div 
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${selectedProject.progress || 0}%` }}
                  ></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
