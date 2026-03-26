import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../api/axiosConfig';
import AnimatedPage from '../components/AnimatedPage';
import { BookOpen, Clock, Tag } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const YEAR_COLORS = {
  '1st Year': '#a855f7', // Purple
  '2nd Year': '#ec4899', // Pink
  '3rd Year': '#f97316', // Orange
  '4th Year': '#eab308'  // Yellow
};

const CalendarView = () => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  
  const [newSubject, setNewSubject] = useState({
    title: '', year: '1st Year', date: '', startTime: '09:00', endTime: '10:00'
  });

  useEffect(() => {
    // Load local subjects
    const saved = localStorage.getItem('college-subjects');
    const localSubjects = saved ? JSON.parse(saved) : [];
    setSubjects(localSubjects);

    const fetchAllTasks = async () => {
      try {
        const res = await api.get('/projects'); 
        const projectIds = res.data.map(p => p._id);
        
        let allTasks = [];
        for (const pid of projectIds) {
           const taskRes = await api.get(`/tasks/project/${pid}`);
           allTasks = [...allTasks, ...taskRes.data];
        }

        const taskEvents = allTasks.map(task => ({
          id: task._id,
          title: `Task: ${task.title}`,
          start: new Date(task.deadline || task.createdAt),
          end: new Date(task.deadline || task.createdAt),
          allDay: true,
          type: 'task',
          resource: task
        }));

        const subjectEvents = localSubjects.map(sub => {
          const startDateTime = new Date(`${sub.date}T${sub.startTime}`);
          const endDateTime = new Date(`${sub.date}T${sub.endTime}`);
          return {
            id: sub.id,
            title: `[${sub.year}] ${sub.title}`,
            start: startDateTime,
            end: endDateTime,
            allDay: false,
            type: 'subject',
            resource: sub
          };
        });

        setEvents([...taskEvents, ...subjectEvents]);
      } catch (error) {
        console.error('Failed to load tasks for calendar', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTasks();
  }, [subjects.length]); // Re-run if a subject is added, or just append it manually. Appending manually is faster.

  const handleAddSubject = (e) => {
    e.preventDefault();
    const newSub = { ...newSubject, id: Date.now().toString() };
    const updatedSubjects = [...subjects, newSub];
    
    setSubjects(updatedSubjects);
    localStorage.setItem('college-subjects', JSON.stringify(updatedSubjects));

    const startDateTime = new Date(`${newSub.date}T${newSub.startTime}`);
    const endDateTime = new Date(`${newSub.date}T${newSub.endTime}`);
    
    const newEvent = {
        id: newSub.id,
        title: `[${newSub.year}] ${newSub.title}`,
        start: startDateTime,
        end: endDateTime,
        allDay: false,
        type: 'subject',
        resource: newSub
    };

    setEvents(prev => [...prev, newEvent]);
    setShowSubjectModal(false);
    setNewSubject({ title: '', year: '1st Year', date: '', startTime: '09:00', endTime: '10:00' });
  };

  const getEventStyle = (event) => {
    if (event.type === 'subject') {
      return {
        backgroundColor: YEAR_COLORS[event.resource.year] || '#8b5cf6',
        borderRadius: '8px',
        border: 'none',
        color: 'white'
      };
    }
    // Task Event
    return {
      backgroundColor: event.resource.status === 'Done' ? '#22c55e' : event.resource.status === 'In Progress' ? '#3b82f6' : '#94a3b8',
      borderRadius: '8px',
      border: 'none',
    };
  };

  return (
    <AnimatedPage className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-dark flex items-center"><BookOpen size={28} className="mr-3 text-primary"/> Schedule & Timetable</h1>
          <p className="text-secondary mt-1 font-medium">Manage project deadlines and college subjects by academic year.</p>
        </div>
        
        {user?.role === 'Admin' && (
          <button 
             onClick={() => setShowSubjectModal(true)}
             className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-lg shadow-blue-500/30 font-bold"
          >
            <BookOpen size={20} />
            <span>Add College Subject</span>
          </button>
        )}
      </div>

      <div className="flex-1 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 calendar-container overflow-hidden flex flex-col">
        <div className="flex gap-4 mb-5 flex-wrap text-xs font-black uppercase tracking-wider text-gray-500 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
           <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#94a3b8] mr-2 shadow-sm"></span> To Do Task</span>
           <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#3b82f6] mr-2 shadow-sm"></span> In Progress</span>
           <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#22c55e] mr-2 shadow-sm"></span> Done</span>
           <span className="w-px h-4 bg-gray-300 mx-2 hidden sm:block"></span>
           <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#a855f7] mr-2 shadow-sm"></span> 1st Year</span>
           <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#ec4899] mr-2 shadow-sm"></span> 2nd Year</span>
           <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#f97316] mr-2 shadow-sm"></span> 3rd Year</span>
           <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#eab308] mr-2 shadow-sm"></span> 4th Year</span>
        </div>
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-secondary animate-pulse font-bold text-lg bg-white/80 z-10 rounded-2xl backdrop-blur-sm">Loading curriculum schedule...</div>
          ) : null}
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%', fontFamily: 'inherit' }}
            views={['month', 'week', 'day', 'agenda']}
            popup
            eventPropGetter={(event) => ({
              className: 'shadow-sm font-bold text-[11px] px-1.5 py-0.5 transition-transform hover:scale-[1.02]',
              style: getEventStyle(event)
            })}
          />
        </div>
      </div>
      
      {showSubjectModal && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
               <h2 className="text-xl font-black text-dark flex items-center"><BookOpen size={20} className="mr-2 text-primary"/> Schedule Academic Subject</h2>
            </div>
            <form onSubmit={handleAddSubject} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-dark mb-1.5">Subject Title</label>
                <div className="relative">
                  <Tag size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input required type="text" placeholder="e.g. Data Structures & Algorithms" className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium shadow-sm" 
                    value={newSubject.title} onChange={e => setNewSubject({...newSubject, title: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-dark mb-1.5">Academic Year</label>
                <select className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium text-dark shadow-sm"
                  value={newSubject.year} onChange={e => setNewSubject({...newSubject, year: e.target.value})}>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-dark mb-1.5">Date</label>
                <input required type="date" className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium shadow-sm"
                  value={newSubject.date} onChange={e => setNewSubject({...newSubject, date: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-dark mb-1.5">Start Time</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input required type="time" className="w-full pl-9 pr-2 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium shadow-sm"
                      value={newSubject.startTime} onChange={e => setNewSubject({...newSubject, startTime: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-dark mb-1.5">End Time</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input required type="time" className="w-full pl-9 pr-2 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium shadow-sm"
                      value={newSubject.endTime} onChange={e => setNewSubject({...newSubject, endTime: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-5 border-t border-gray-100">
                <button type="button" onClick={() => setShowSubjectModal(false)} className="px-5 py-2.5 font-bold text-secondary hover:bg-gray-100 rounded-xl transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 font-bold bg-primary text-white rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition">Add to Timetable</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .rbc-btn-group button { color: #64748b; border-color: #e2e8f0; font-weight: 700; padding: 6px 16px; transition: all 0.2s; border-radius: 8px !important; margin-right: 4px; }
        .rbc-btn-group button:hover { background-color: #f8fafc; color: #0f172a; }
        .rbc-btn-group button.rbc-active { background-color: #3b82f6; color: white; box-shadow: 0 4px 12px rgba(59,130,246,0.25); border-color: #3b82f6; }
        .rbc-toggle-all-day { font-weight: 700; color: #475569; }
        .rbc-today { background-color: #f0f9ff !important; }
        .rbc-header { padding: 12px 8px; font-weight: 800; color: #475569; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.75rem; }
        .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .rbc-event { padding: 4px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-radius: 6px !important; }
        .rbc-off-range-bg { background-color: #f8fafc; }
        .rbc-day-bg + .rbc-day-bg { border-left: 1px dashed #e2e8f0; }
        .rbc-month-row + .rbc-month-row { border-top: 1px dashed #e2e8f0; }
      `}} />
    </AnimatedPage>
  );
};

export default CalendarView;
