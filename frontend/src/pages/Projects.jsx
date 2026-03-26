import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuthStore } from '../store/authStore';
import { Plus, Users, Calendar, MoreVertical } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';

const Projects = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', deadline: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', formData);
      setShowModal(false);
      fetchProjects();
      setFormData({ name: '', description: '', deadline: '' });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <AnimatedPage className="p-8 text-center text-secondary font-bold text-lg animate-pulse">Loading amazing projects...</AnimatedPage>;

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-dark">Projects</h1>
          <p className="text-secondary mt-1 font-medium">Manage and view all your active projects.</p>
        </div>
        {user?.role === 'Admin' && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition shadow-sm font-semibold"
          >
            <Plus size={20} />
            <span>New Project</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border-2 border-dashed border-gray-200 shadow-sm">
            <p className="text-secondary font-semibold text-lg">No projects found. Create one to get started.</p>
          </div>
        ) : projects.map((project) => (
          <Link to={`/projects/${project._id}`} key={project._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all group block relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-dark group-hover:text-primary transition">{project.name}</h3>
              <button className="text-gray-400 hover:text-dark">
                <MoreVertical size={20} />
              </button>
            </div>
            <p className="text-secondary text-sm mb-6 line-clamp-2 leading-relaxed">{project.description || 'No description provided.'}</p>
            
            <div className="flex items-center justify-between text-sm text-secondary font-semibold border-t border-gray-100 pt-4 mt-auto">
              <div className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded-md">
                <Users size={16} className="text-primary" />
                <span>{project.members?.length || 0} Members</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded-md">
                <Calendar size={16} className="text-orange-500" />
                <span>{new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
               <h2 className="text-xl font-bold text-dark">Create New Project</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-dark mb-1">Project Name</label>
                <input required type="text" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-dark mb-1">Description</label>
                <textarea className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" rows="3"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-dark mb-1">Deadline</label>
                <input required type="date" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                  value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 font-semibold text-secondary hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 font-semibold bg-primary text-white rounded-lg hover:bg-blue-600 shadow-md transition">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default Projects;
