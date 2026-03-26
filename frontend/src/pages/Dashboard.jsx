import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axiosConfig';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Presentation, CheckCircle, Clock, Zap, ArrowRight } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, projRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/projects')
        ]);
        setStats(statsRes.data);
        setRecentProjects(projRes.data.slice(0, 3)); 
      } catch (error) {
        console.error('Failed to load dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <AnimatedPage className="p-8 flex items-center justify-center text-secondary h-[80vh]"><div className="animate-pulse flex items-center text-xl font-bold"><Zap size={28} className="text-primary mr-3 animate-bounce"/> Loading your workspace...</div></AnimatedPage>;

  const COLORS = {
    'To Do': '#94a3b8',
    'In Progress': '#3b82f6',
    'Done': '#22c55e'
  };

  const chartData = stats?.statusCounts?.map(item => ({
    name: item._id,
    count: item.count
  })) || [];

  return (
    <AnimatedPage className="space-y-8 max-w-7xl mx-auto pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-black text-dark tracking-tight mb-2">Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">{user?.name?.split(' ')[0] || 'User'}</span></h1>
          <p className="text-secondary font-medium text-lg">Here's a detailed breakdown of your collaborative engineering workspace.</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex items-center space-x-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 relative overflow-hidden group hover:border-blue-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all"></div>
          <div className="p-5 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-500">
            <Presentation size={32} />
          </div>
          <div>
            <p className="text-sm text-secondary font-bold uppercase tracking-wider mb-1">Total Tasks</p>
            <h3 className="text-4xl font-black text-dark">{stats?.totalTasks || 0}</h3>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex items-center space-x-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 relative overflow-hidden group hover:border-green-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-green-500/20 transition-all"></div>
          <div className="p-5 bg-gradient-to-br from-green-100 to-green-50 text-green-600 rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-500">
            <CheckCircle size={32} />
          </div>
          <div>
            <p className="text-sm text-secondary font-bold uppercase tracking-wider mb-1">Completed</p>
            <h3 className="text-4xl font-black text-dark">{stats?.completedTasks || 0}</h3>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex items-center space-x-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 relative overflow-hidden group hover:border-red-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-red-500/20 transition-all"></div>
          <div className="p-5 bg-gradient-to-br from-red-100 to-red-50 text-red-600 rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-500">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-sm text-secondary font-bold uppercase tracking-wider mb-1">Overdue</p>
            <h3 className="text-4xl font-black text-red-600">{stats?.overdueTasks || 0}</h3>
          </div>
        </div>
      </div>

      {/* Charts and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-dark">Status Distribution</h3>
            <span className="px-4 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-black uppercase tracking-widest shadow-inner border border-gray-200">Global</span>
          </div>
          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 700}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 700}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc', radius: 10}} contentStyle={{borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '14px', fontWeight: 700, color: '#0f172a'}} />
                  <Bar dataKey="count" radius={[10, 10, 10, 10]} barSize={48}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-secondary bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 font-bold">No tasks available</div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex-1 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-colors"></div>
            <h3 className="text-lg font-bold text-dark mb-6 self-start w-full bg-white/50 rounded-xl p-2 inline-block backdrop-blur-sm shadow-sm border border-gray-100 text-center">Completion Rate</h3>
            <div className="relative h-48 w-48 rounded-full flex items-center justify-center shadow-xl border-4 border-gray-50 ring-4 ring-white" style={{ background: `conic-gradient(#22c55e ${stats?.progress || 0}%, #f1f5f9 0)` }}>
               <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col shadow-inner">
                  <span className="text-5xl font-black text-dark tracking-tighter">{stats?.progress || 0}<span className="text-2xl text-secondary">%</span></span>
               </div>
            </div>
            <p className="mt-8 text-secondary text-xs font-black uppercase tracking-widest bg-gray-50 px-5 py-2.5 rounded-full border border-gray-200 shadow-sm">Across all assigned tasks</p>
          </div>
        </div>
      </div>

      {/* Activity Feed / Recent Projects */}
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
         <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-dark flex items-center"><Zap size={20} className="text-orange-400 mr-2"/> Recent Active Projects</h3>
            <Link to="/projects" className="text-primary font-bold text-sm hover:text-blue-600 flex items-center bg-blue-50 px-4 py-2 rounded-xl transition-colors shadow-inner border border-blue-100">
              View All <ArrowRight size={16} className="ml-1.5" />
            </Link>
         </div>
         {recentProjects.length === 0 ? (
            <div className="py-12 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-secondary font-bold text-lg">No recent projects found. Let's start building!</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentProjects.map(project => (
                <Link to={`/projects/${project._id}`} key={project._id} className="block p-6 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-extrabold text-dark text-lg group-hover:text-primary transition-colors pr-4">{project.name}</h4>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
                  </div>
                  <p className="text-sm text-secondary mb-5 line-clamp-2 leading-relaxed">{project.description}</p>
                  <div className="text-xs font-black text-gray-400 uppercase tracking-widest pt-4 border-t border-gray-50 flex items-center">
                    <Clock size={14} className="mr-1.5 text-orange-400"/> Due: {new Date(project.deadline).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
         )}
      </div>
    </AnimatedPage>
  );
};
export default Dashboard;
