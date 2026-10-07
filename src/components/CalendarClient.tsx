'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { X, Settings, Edit2, Trash2, Plus, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CalendarClient() {
  const [events, setEvents] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // Filter
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    start_time: '09:00',
    end_date: '',
    end_time: '10:00',
    category: '',
    location: '',
    color: '#4f46e5',
    employee_ids: [] as number[]
  });

  const [categoryForm, setCategoryForm] = useState({ id: null as number | null, label: '', color: '#4f46e5' });

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/calendar/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/calendar?category=${filterCategory}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    }
  };

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
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [filterCategory]);

  const [editEventId, setEditEventId] = useState<string | null>(null);

  const handleDateClick = (arg: any) => {
    setEditEventId(null);
    setFormData({
      ...formData,
      title: '',
      description: '',
      start_date: arg.dateStr,
      end_date: arg.dateStr,
      start_time: '09:00',
      end_time: '10:00',
      location: '',
      employee_ids: [],
      category: categories.length > 0 ? categories[0].label : '',
      color: categories.length > 0 ? categories[0].color : '#4f46e5'
    });
    setIsAddModalOpen(true);
  };

  const handleEventClick = (arg: any) => {
    setSelectedEvent(arg.event);
    setIsDetailModalOpen(true);
  };

  const openEditEventModal = () => {
    if (!selectedEvent) return;
    
    // Parse dates
    const startDate = new Date(selectedEvent.start);
    const endDate = selectedEvent.end ? new Date(selectedEvent.end) : startDate;

    const toLocalYYYYMMDD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const toLocalHHMM = (d: Date) => {
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${mins}`;
    };
    
    setEditEventId(selectedEvent.id);
    setFormData({
      title: selectedEvent.title,
      description: selectedEvent.extendedProps.description || '',
      start_date: toLocalYYYYMMDD(startDate),
      start_time: toLocalHHMM(startDate),
      end_date: toLocalYYYYMMDD(endDate),
      end_time: toLocalHHMM(endDate),
      category: selectedEvent.extendedProps.category || '',
      location: selectedEvent.extendedProps.location || '',
      color: selectedEvent.backgroundColor || '#4f46e5',
      employee_ids: selectedEvent.extendedProps.participants?.map((p:any) => p.id) || []
    });
    
    setIsDetailModalOpen(false);
    setIsAddModalOpen(true);
  };

  const handleSelectEmployee = (id: number) => {
    const current = formData.employee_ids;
    if (current.includes(id)) {
      setFormData({ ...formData, employee_ids: current.filter((empId: number) => empId !== id) });
    } else {
      setFormData({ ...formData, employee_ids: [...current, id] });
    }
  };

  const handleCategoryChange = (catName: string) => {
    const cat = categories.find(c => c.label === catName);
    setFormData({ ...formData, category: catName, color: cat ? cat.color : '#4f46e5' });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // สร้าง Date object จากเวลาท้องถิ่น (Local time)
      const startDateLocal = new Date(`${formData.start_date}T${formData.start_time}:00`);
      const endDateLocal = new Date(`${formData.end_date}T${formData.end_time}:00`);
      
      // ส่งค่าเป็น ISO string ซึ่งจะมี 'Z' ต่อท้าย (UTC time) เพื่อให้ฝั่ง backend ที่รันบน Vercel (UTC) เข้าใจตรงกัน
      const payload = {
        title: formData.title,
        description: formData.description,
        start_datetime: startDateLocal.toISOString(),
        end_datetime: endDateLocal.toISOString(),
        category: formData.category,
        color: formData.color,
        location: formData.location,
        employee_ids: formData.employee_ids
      };

      if (editEventId) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/calendar/${editEventId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/calendar`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setIsAddModalOpen(false);
      fetchEvents();
      setFormData({ ...formData, title: '', description: '', location: '', employee_ids: [] });
      setEditEventId(null);
    } catch (err) {
      alert('Failed to save event');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/calendar/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDetailModalOpen(false);
      fetchEvents();
    } catch (err) {
      alert('Failed to delete event');
    }
  };

  // --- Category Management ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (categoryForm.id) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/calendar/categories/${categoryForm.id}`, categoryForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/calendar/categories`, categoryForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setCategoryForm({ id: null, label: '', color: '#4f46e5' });
      fetchCategories();
    } catch (err) {
      alert('Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/calendar/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <label className="text-base font-semibold text-gray-800 whitespace-nowrap">หมวดหมู่:</label>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border-2 border-indigo-200 rounded-lg px-4 py-2.5 text-base font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[220px] bg-white shadow-sm transition-all"
          >
            <option value="all">-- แสดงทั้งหมด --</option>
            {categories.map(c => (
              <option key={c.id} value={c.label}>{c.label}</option>
            ))}
          </select>
          <Button 
            variant="outline"
            onClick={() => setIsCategoryModalOpen(true)}
            className="p-2.5 h-auto text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 border-2"
            title="จัดการหมวดหมู่"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button 
            variant="outline"
            onClick={async () => {
              try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cron/daily-calendar`);
                alert(res.data.message || 'ส่งแจ้งเตือนเรียบร้อยแล้ว');
              } catch (err: any) {
                alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
              }
            }}
            className="p-2.5 h-auto text-green-600 hover:text-green-700 hover:bg-green-50 border-2 border-green-200"
            title="ทดสอบแจ้งเตือน LINE"
          >
            <BellRing className="w-5 h-5 mr-2" />
            ทดสอบแจ้งเตือน LINE
          </Button>
        </div>
        
        <Button 
          onClick={() => {
            setFormData({
              ...formData,
              start_date: new Date().toISOString().split('T')[0],
              end_date: new Date().toISOString().split('T')[0],
              category: categories.length > 0 ? categories[0].label : '',
              color: categories.length > 0 ? categories[0].color : '#4f46e5'
            });
            setIsAddModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-base px-6 py-5 h-auto shadow-md w-full md:w-auto font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          เพิ่มกิจกรรม
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          height={750}
        />
      </div>

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">จัดการหมวดหมู่กิจกรรม</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-1 shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleSaveCategory} className="flex gap-3 mb-6 bg-gray-50 p-4 rounded-lg border">
                <div className="flex-1">
                  <input 
                    required 
                    value={categoryForm.label} 
                    onChange={e => setCategoryForm({...categoryForm, label: e.target.value})} 
                    type="text" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2" 
                    placeholder="ชื่อหมวดหมู่ใหม่" 
                  />
                </div>
                <div className="w-16">
                  <input 
                    type="color" 
                    value={categoryForm.color} 
                    onChange={e => setCategoryForm({...categoryForm, color: e.target.value})} 
                    className="w-full h-10 p-1 border border-gray-300 rounded-md cursor-pointer" 
                  />
                </div>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 h-10">
                  {categoryForm.id ? 'อัปเดต' : 'เพิ่ม'}
                </Button>
                {categoryForm.id && (
                  <Button type="button" variant="outline" onClick={() => setCategoryForm({ id: null, label: '', color: '#4f46e5'})} className="h-10 px-2">
                    ยกเลิก
                  </Button>
                )}
              </form>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm">หมวดหมู่ปัจจุบัน</h3>
                {categories.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-indigo-300 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full shadow-inner border border-gray-200" style={{ backgroundColor: c.color }}></div>
                      <span className="font-medium text-gray-800">{c.label}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => setCategoryForm({ id: c.id, label: c.label, color: c.color })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteCategory(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-center text-gray-500 py-4 italic">ยังไม่มีหมวดหมู่</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editEventId ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรม / ประชุม'}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1.5">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">ชื่อกิจกรรม</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} type="text" className="w-full border-2 rounded-md px-3 py-2 text-base focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="ระบุชื่อกิจกรรม" />
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">วันที่เริ่มต้น</label>
                  <input required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} type="date" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">เวลาเริ่มต้น</label>
                  <input required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} type="time" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">วันที่สิ้นสุด</label>
                  <input required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} type="date" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">เวลาสิ้นสุด</label>
                  <input required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} type="time" className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">หมวดหมู่</label>
                  <select required value={formData.category} onChange={e => handleCategoryChange(e.target.value)} className="w-full border-2 rounded-md px-3 py-2.5 text-sm focus:border-indigo-500">
                    <option value="" disabled>-- เลือกหมวดหมู่ --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.label}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">สถานที่</label>
                  <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} type="text" className="w-full border-2 rounded-md px-3 py-2.5 text-sm focus:border-indigo-500" placeholder="ระบุสถานที่ (ถ้ามี)" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">รายละเอียดกิจกรรม</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-2 rounded-md px-3 py-2 text-sm focus:border-indigo-500" placeholder="อธิบายรายละเอียดกิจกรรม" rows={3} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">บุคลากรที่เกี่ยวข้อง (เลือกได้หลายคน)</label>
                <div className="h-48 overflow-y-auto border-2 rounded-md p-2 space-y-1 bg-white">
                  {employees.map(emp => (
                    <label key={emp.id} className="flex items-center space-x-3 hover:bg-indigo-50 p-2 rounded-md cursor-pointer transition-colors border border-transparent hover:border-indigo-100">
                      <input 
                        type="checkbox" 
                        checked={formData.employee_ids.includes(emp.id)}
                        onChange={() => handleSelectEmployee(emp.id)}
                        className="rounded w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="text-base text-gray-800 font-medium">{emp.first_name} {emp.last_name} <span className="text-gray-500 text-sm font-normal">({emp.employee_code})</span></span>
                    </label>
                  ))}
                  {employees.length === 0 && <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีข้อมูลบุคลากร</p>}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-5 border-t">
                <Button type="button" variant="outline" onClick={() => { setIsAddModalOpen(false); setEditEventId(null); }} className="px-6 py-2.5">ยกเลิก</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-base font-medium shadow-sm">
                  {editEventId ? 'บันทึกการแก้ไข' : 'บันทึกกิจกรรม'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-7 max-h-[90vh] overflow-y-auto relative">
            
            <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1.5 transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 pr-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: selectedEvent.backgroundColor }}>
                {selectedEvent.extendedProps.category || 'General'}
              </span>
            </div>
            
            <div className="space-y-5 text-base text-gray-800">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <span className="font-semibold text-gray-500">เริ่มต้น:</span>
                  <span className="col-span-3 font-medium">
                    {new Date(selectedEvent.start).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}
                  </span>
                </div>
                {selectedEvent.end && (
                  <div className="grid grid-cols-4 gap-2">
                    <span className="font-semibold text-gray-500">สิ้นสุด:</span>
                    <span className="col-span-3 font-medium">
                      {new Date(selectedEvent.end).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}
                    </span>
                  </div>
                )}
              </div>
              
              {selectedEvent.extendedProps.location && (
                <div className="grid grid-cols-4 gap-2 px-1">
                  <span className="font-semibold text-gray-500">สถานที่:</span>
                  <span className="col-span-3">{selectedEvent.extendedProps.location}</span>
                </div>
              )}

              <div className="grid grid-cols-4 gap-2 px-1">
                <span className="font-semibold text-gray-500">รายละเอียด:</span>
                <span className="col-span-3 whitespace-pre-line text-gray-700">{selectedEvent.extendedProps.description || '-'}</span>
              </div>

              <div className="pt-2">
                <span className="font-semibold text-gray-800 block mb-3 text-lg border-b pb-2">บุคลากรที่เกี่ยวข้อง ({selectedEvent.extendedProps.participants?.length || 0})</span>
                {selectedEvent.extendedProps.participants?.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedEvent.extendedProps.participants.map((p: any) => (
                      <li key={p.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.employee_code}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic bg-gray-50 p-4 rounded-lg text-center">ไม่มีบุคลากรที่เกี่ยวข้อง</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t space-x-3">
              <Button type="button" variant="outline" onClick={openEditEventModal} className="px-6 py-2.5 font-medium shadow-sm flex items-center">
                <Edit2 className="w-4 h-4 mr-2" /> แก้ไข
              </Button>
              <Button type="button" variant="destructive" onClick={() => handleDeleteEvent(selectedEvent.id)} className="px-6 py-2.5 font-medium shadow-sm flex items-center">
                <Trash2 className="w-4 h-4 mr-2" /> ลบกิจกรรม
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
