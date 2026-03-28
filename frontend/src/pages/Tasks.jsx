import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuthStore } from '../store/authStore';
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Plus, MessageSquare, Paperclip } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';

// Draggable Task Card
const TaskCard = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: task
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 999 : undefined,
    opacity: isDragging ? 0.9 : 1,
    boxShadow: isDragging ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : undefined,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} style={style} {...listeners} {...attributes}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 cursor-grab active:cursor-grabbing mb-3 transition-colors"
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${
          task.priority === 'High' ? 'bg-red-50 text-red-600' : 
          task.priority === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
        }`}>{task.priority}</span>
      </div>
      <h4 className="font-bold text-dark mb-1">{task.title}</h4>
      <p className="text-xs text-secondary line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
      
      <div className="flex justify-between items-center text-xs text-secondary font-medium border-t border-gray-50 pt-3">
        {task.assignee ? (
          <div className="flex items-center space-x-2">
             <div className="w-6 h-6 bg-gradient-to-br from-primary to-blue-300 rounded-full text-white flex items-center justify-center text-[10px] font-bold shadow-sm">{task.assignee.name.charAt(0)}</div>
             <span className="truncate max-w-[80px]">{task.assignee.name.split(' ')[0]}</span>
          </div>
        ) : <span className="italic">Unassigned</span>}
        
        <div className="flex space-x-3 text-gray-400">
           <span className="flex items-center hover:text-primary transition"><MessageSquare size={14} className="mr-1" /> 0</span>
           <span className="flex items-center hover:text-primary transition"><Paperclip size={14} className="mr-1" /> {task.attachments?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};

// Droppable Column
const Column = ({ id, title, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col bg-gray-50/50 rounded-2xl border border-gray-200 p-4 h-full min-h-[500px]">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-extrabold text-dark uppercase tracking-wider text-sm">{title}</h3>
        <span className="bg-white text-dark text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-gray-200">{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className={`flex-1 transition-colors rounded-xl p-1 ${isOver ? 'bg-blue-50 border-2 border-dashed border-blue-200' : ''}`}>
        {tasks.map(task => <TaskCard key={task._id} task={task} />)}
        {tasks.length === 0 && <div className="h-full w-full flex items-center justify-center text-secondary text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl">Drop tasks here</div>}
      </div>
    </div>
  );
};

const Tasks = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]); // NEW
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'Medium', deadline: '', group: '' }); // NEW: Added group
  
  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }));

  useEffect(() => {
    fetchProjects();
    fetchGroups(); // NEW
  }, []);

  useEffect(() => {
    if (selectedProject) fetchTasks();
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
      if (!selectedProject && res.data.length > 0) {
        setSelectedProject(res.data[0]._id);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tasks/project/${selectedProject}`);
      setTasks(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;
    const task = tasks.find(t => t._id === taskId);
    
    if (task && task.status !== newStatus) {
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      try {
        await api.put(`/tasks/${taskId}`, { status: newStatus });
      } catch (e) {
        console.error(e);
        fetchTasks(); // revert on fail
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const taskData = { ...formData, project: selectedProject };
      if (formData.group === '') delete taskData.group; // Don't send empty string
      await api.post('/tasks', taskData);
      setShowModal(false);
      fetchTasks();
      setFormData({ title: '', description: '', priority: 'Medium', deadline: '', group: '' });
    } catch (e) { console.error(e); }
  };

  const columns = ['To Do', 'In Progress', 'Done'];

  return (
    <AnimatedPage className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Tasks & Kanban</h1>
          <p className="text-secondary mt-1 font-medium">Manage project workflow and assignments.</p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select 
            className="w-full md:w-64 p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-primary font-medium shadow-sm transition"
            value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="" disabled>Select Project</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <button 
            disabled={!selectedProject}
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-blue-600 text-white p-2.5 rounded-lg transition shadow-sm disabled:opacity-50"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {!selectedProject ? (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-white shadow-sm"><p className="text-secondary font-semibold text-lg">Please select a project to view tasks.</p></div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100"><p className="text-secondary font-medium animate-pulse text-lg">Loading workflow board...</p></div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 pb-6">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {columns.map(status => (
              <Column key={status} id={status} title={status} tasks={tasks.filter(t => t.status === status)} />
            ))}
          </DndContext>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
               <h2 className="text-xl font-bold text-dark">Create New Task</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-dark mb-1">Task Title</label>
                <input required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-dark mb-1">Description</label>
                <textarea className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-bold text-dark mb-1">Priority</label>
                   <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary transition" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                     <option>Low</option><option>Medium</option><option>High</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-dark mb-1">Assign to Group (Optional)</label>
                   <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary transition" value={formData.group} onChange={e => setFormData({...formData, group: e.target.value})}>
                     <option value="">None</option>
                     {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                   </select>
                 </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-dark mb-1">Deadline (Optional)</label>
                <input type="date" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary transition" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 font-semibold text-secondary hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 font-semibold bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm transition">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};
export default Tasks;
