'use client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, AlertCircle, Plus, X, Calendar as CalendarIcon, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
}

interface Task {
  id: number;
  task_name: string;
  status: string;
  due_date?: string;
  responsible_person?: string;
}

interface OnboardingProcess {
  id: number;
  employee_id: number;
  progress: number;
  status: string;
  employee: Employee;
  tasks: Task[];
}

const DEFAULT_TASKS = [
  'Setup workstation & equipment',
  'IT Security & Policy Training',
  'Meet the team & Intro',
  'Review company policies',
  'Set up email and software accounts'
];

export default function OnboardingPage() {
  const [processes, setProcesses] = useState<OnboardingProcess[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [startDate, setStartDate] = useState('');

  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [activeOnboardingId, setActiveOnboardingId] = useState<number | null>(null);
  const [taskForm, setTaskForm] = useState({
    task_name: '',
    due_date: '',
    responsible_person: ''
  });
  
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const [processRes, empRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/onboarding`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employees`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setProcesses(processRes.data);
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

  const handleTaskStatusChange = async (taskId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/onboarding/tasks/${taskId}`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh the data to get updated progress
      fetchData();
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const handleCreateOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !startDate) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/onboarding`, {
        employee_id: parseInt(selectedEmpId),
        start_date: startDate,
        tasks: DEFAULT_TASKS.map(name => ({ task_name: name }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsModalOpen(false);
      setSelectedEmpId('');
      setStartDate('');
      fetchData();
    } catch (err) {
      alert('Failed to create onboarding process');
    }
  };

  const openTaskModal = (onboardingId: number, task: any = null) => {
    setActiveOnboardingId(onboardingId);
    if (task) {
      setEditingTask(task);
      setTaskForm({
        task_name: task.task_name || '',
        due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
        responsible_person: task.responsible_person || ''
      });
    } else {
      setEditingTask(null);
      setTaskForm({ task_name: '', due_date: '', responsible_person: '' });
    }
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.task_name) return;
    
    try {
      const token = localStorage.getItem('token');
      if (editingTask) {
        // Edit Task
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/onboarding/tasks/${editingTask.id}`, taskForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (activeOnboardingId) {
        // Create Task
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/onboarding/${activeOnboardingId}/tasks`, taskForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsTaskModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to save task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('ยืนยันการลบรายการนี้?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/onboarding/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  // Filter employees who don't already have an onboarding process
  const availableEmployees = employees.filter(emp => !processes.find(p => p.employee_id === emp.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Onboarding</h1>
          <p className="text-sm text-gray-500 mt-1">ติดตามและจัดการความคืบหน้าการเริ่มงานของบุคลากรใหม่</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-95 text-base py-2.5">
          <Plus className="w-5 h-5 mr-2" />
          สร้างแผนปฐมนิเทศใหม่
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : processes.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {processes.map((process) => (
            <div key={process.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-900/5 hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{process.employee.first_name} {process.employee.last_name}</h3>
                  <p className="text-sm font-medium text-indigo-600">{process.employee.position}</p>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-bold ${process.progress === 100 ? 'text-emerald-500' : 'text-indigo-600'}`}>
                    {process.progress}%
                  </span>
                  <p className="text-xs text-gray-500">เสร็จสิ้น</p>
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ${process.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                  style={{ width: `${process.progress}%` }}
                ></div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">รายการที่ต้องทำ (Checklist)</h4>
                  <button onClick={() => openTaskModal(process.id)} className="text-xs font-medium text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-3 py-1.5 rounded-lg flex items-center transition-all duration-300 hover:shadow-md">
                    <Plus className="w-3 h-3 mr-1" /> เพิ่มรายการ
                  </button>
                </div>
                {process.tasks.map((task) => (
                  <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50/50 rounded-xl border border-gray-100 transition-all duration-300 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm gap-3 group">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        {task.status === 'completed' && <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                        {task.status === 'in_progress' && <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />}
                        {task.status === 'not_started' && <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-medium transition-colors ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800 group-hover:text-indigo-900'}`}>
                          {task.task_name}
                        </span>
                        {(task.due_date || task.responsible_person) && (
                          <div className="flex flex-wrap items-center mt-1.5 gap-3 text-xs text-gray-500">
                            {task.due_date && (
                              <div className="flex items-center">
                                <CalendarIcon className="w-3 h-3 mr-1" />
                                {new Date(task.due_date).toLocaleDateString('th-TH')} {new Date(task.due_date).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            )}
                            {task.responsible_person && (
                              <div className="flex items-center bg-gray-200 px-1.5 py-0.5 rounded">
                                ผู้รับผิดชอบ: {task.responsible_person}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center sm:ml-4 space-x-2 shrink-0">
                      <select 
                        className="text-sm font-medium border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-1.5 pl-3 pr-8 bg-white cursor-pointer"
                        value={task.status}
                        onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                      >
                        <option value="not_started">ยังไม่เริ่ม</option>
                        <option value="in_progress">กำลังดำเนินการ</option>
                        <option value="completed">เสร็จสมบูรณ์</option>
                      </select>
                      <button onClick={() => openTaskModal(process.id, task)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md bg-white border border-gray-200 shadow-sm" title="แก้ไข">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md bg-white border border-gray-200 shadow-sm" title="ลบ">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-indigo-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">ยังไม่มีแผนปฐมนิเทศ</h3>
          <p className="text-gray-500">กดปุ่มสร้างแผนปฐมนิเทศใหม่เพื่อเริ่มติดตามความคืบหน้าของบุคลากร</p>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">สร้างแผนปฐมนิเทศใหม่</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateOnboarding} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">เลือกบุคลากร (ที่ยังไม่มีแผน)</label>
                  <select 
                    required 
                    value={selectedEmpId} 
                    onChange={e => setSelectedEmpId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white"
                  >
                    <option value="" disabled>-- เลือกบุคลากร --</option>
                    {availableEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.position})</option>
                    ))}
                  </select>
                  {availableEmployees.length === 0 && (
                    <p className="text-xs text-amber-600 mt-2">บุคลากรทุกคนมีแผนปฐมนิเทศแล้ว กรุณาเพิ่มบุคลากรใหม่ในระบบก่อน</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">วันที่เริ่มแผน (Start Date)</label>
                  <input 
                    required 
                    type="date" 
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white"
                  />
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mt-2">
                  <h4 className="text-sm font-bold text-indigo-900 mb-2">Checklist มาตรฐานที่จะถูกสร้าง:</h4>
                  <ul className="list-disc pl-5 text-sm text-indigo-800 space-y-1">
                    {DEFAULT_TASKS.map((t, idx) => <li key={idx}>{t}</li>)}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
                <Button type="submit" disabled={!selectedEmpId} className="bg-indigo-600 hover:bg-indigo-700">สร้างแผนทันที</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{editingTask ? 'แก้ไขรายการที่ต้องทำ' : 'เพิ่มรายการที่ต้องทำใหม่'}</h2>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อรายการ <span className="text-red-500">*</span></label>
                <input 
                  required 
                  type="text" 
                  value={taskForm.task_name}
                  onChange={e => setTaskForm({...taskForm, task_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                  placeholder="เช่น เตรียมโต๊ะทำงาน, นัดประชุม..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">วัน/เวลา ที่กำหนด (Due Date)</label>
                <input 
                  type="datetime-local" 
                  value={taskForm.due_date}
                  onChange={e => setTaskForm({...taskForm, due_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ผู้รับผิดชอบ (Optional)</label>
                <input 
                  type="text" 
                  value={taskForm.responsible_person}
                  onChange={e => setTaskForm({...taskForm, responsible_person: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                  placeholder="เช่น IT Dept, HR, พี่เลี้ยง..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setIsTaskModalOpen(false)}>ยกเลิก</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">บันทึก</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
