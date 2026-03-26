import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuthStore } from '../store/authStore';
import { Download, FileSpreadsheet, FileBarChart } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';

const Reports = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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

  const generateProjectCSV = async (projectId, projectName) => {
    setDownloading(true);
    try {
      const res = await api.get(`/tasks/project/${projectId}`);
      const tasks = res.data;

      if (tasks.length === 0) {
        alert('No tasks in this project to export.');
        setDownloading(false);
        return;
      }

      const headers = ['Task Title', 'Status', 'Priority', 'Assignee', 'Deadline', 'Time Logged (hrs)', 'Created At'];
      const rows = tasks.map(t => [
        `"${t.title.replace(/"/g, '""')}"`,
        t.status,
        t.priority,
        t.assignee ? `"${t.assignee.name}"` : 'Unassigned',
        t.deadline ? new Date(t.deadline).toLocaleDateString() : 'N/A',
        t.timeLogged || 0,
        new Date(t.createdAt).toLocaleDateString()
      ]);

      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${projectName}_Tasks_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error(error);
      alert('Failed to generate report');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-secondary font-medium mt-10 animate-pulse">Loading reports module...</div>;

  return (
    <AnimatedPage className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold text-dark">Reports & Analytics</h1>
          <p className="text-secondary mt-1 font-medium">Generate data exports for your projects.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-100">
            <div className="p-3.5 bg-green-50 text-green-600 rounded-xl border border-green-100"><FileSpreadsheet size={28} /></div>
            <div>
              <h2 className="text-xl font-bold text-dark">Data Export</h2>
              <p className="text-sm text-secondary font-medium mt-0.5">Download project workflow into CSV</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
             {projects.length === 0 ? (
               <div className="h-full flex items-center justify-center text-secondary font-medium italic border-2 border-dashed border-gray-200 rounded-xl">No active projects available for export.</div>
             ) : (
               projects.map(proj => (
                 <div key={proj._id} className="flex items-center justify-between p-5 bg-gray-50 border border-gray-100 rounded-xl hover:bg-green-50/40 hover:border-green-100 transition-all group shadow-sm">
                   <div>
                     <h3 className="font-bold text-dark text-lg group-hover:text-green-700 transition">{proj.name}</h3>
                     <p className="text-xs text-secondary font-bold uppercase tracking-wide mt-1.5 bg-gray-200 inline-block px-2 py-0.5 rounded text-gray-600">{proj.members?.length || 0} Members</p>
                   </div>
                   <button 
                     onClick={() => generateProjectCSV(proj._id, proj.name)}
                     disabled={downloading}
                     className="flex items-center space-x-2 bg-white border border-gray-200 text-dark px-4 py-2.5 rounded-lg hover:border-green-500 hover:text-green-600 hover:shadow-md transition shadow-sm font-bold text-sm disabled:opacity-50"
                   >
                     <Download size={18} />
                     <span>CSV Data</span>
                   </button>
                 </div>
               ))
             )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-dark text-white rounded-2xl shadow-xl border border-gray-800 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden h-full">
           <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
           <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
           
           <div className="relative z-10 flex flex-col items-center">
             <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 mb-6">
               <FileBarChart size={48} className="text-blue-300" />
             </div>
             <h2 className="text-3xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">PDF Reports (Pro Feature)</h2>
             <p className="text-gray-300 mb-10 max-w-md leading-relaxed text-lg">
               Upgrade to BuildFlow PRO++ Enterprise to unlock automatically generated, richly formatted PDF reports and analytics dash-panels.
             </p>
             <button className="bg-gradient-to-r from-primary to-blue-500 hover:from-blue-600 hover:to-primary text-white font-bold py-3.5 px-10 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] focus:ring-4 focus:ring-blue-500/50">
               Upgrade Plan
             </button>
           </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Reports;
