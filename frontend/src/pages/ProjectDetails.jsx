import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { ArrowLeft, Users, Calendar, CheckCircle, GraduationCap, Award, Star, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import AnimatedPage from '../components/AnimatedPage';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [project, setProject] = useState(null);
  const [groupProgress, setGroupProgress] = useState([]); // NEW
  const [loading, setLoading] = useState(true);
  
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [evalData, setEvalData] = useState({ grade: 'Pending', facultyFeedback: '' });

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      if (res.data.grade) setEvalData({ grade: res.data.grade, facultyFeedback: res.data.facultyFeedback || '' });

      // Fetch group progress
      const progressRes = await api.get(`/projects/${id}/progress`);
      setGroupProgress(progressRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${id}`, evalData);
      setShowEvaluationModal(false);
      fetchProject();
    } catch (error) {
      console.error('Evaluation failed', error);
    }
  };

  if (loading) return <AnimatedPage className="p-12 text-center text-secondary font-bold text-lg animate-pulse">Loading workspace...</AnimatedPage>;
  if (!project) return <AnimatedPage className="p-12 text-center text-red-500 font-bold">Project not found</AnimatedPage>;

  const getGradeColor = (g) => {
    if (g === 'A+' || g === 'A') return 'text-green-600 bg-green-50 border-green-200';
    if (g === 'B+' || g === 'B') return 'text-blue-600 bg-blue-50 border-blue-200';
    if (g === 'C') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (g === 'D' || g === 'F') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-500 bg-gray-50 border-gray-200';
  };

  return (
    <AnimatedPage className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-120px)] overflow-y-auto pb-12 custom-scrollbar pr-2">
      <Link to="/projects" className="inline-flex items-center text-secondary hover:text-primary transition font-bold mb-2">
        <ArrowLeft size={20} className="mr-2" /> Back to Projects Directory
      </Link>

      {/* Main Header Card */}
      <div className="bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-blue-400 to-indigo-400"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/10 transition-colors"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h1 className="text-4xl font-black text-dark tracking-tight mb-3">{project.name}</h1>
            <p className="text-secondary font-medium text-lg leading-relaxed max-w-3xl">{project.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-5 py-2 bg-green-50 text-green-700 rounded-full text-sm font-black tracking-widest uppercase border border-green-200 shadow-sm whitespace-nowrap">
              {project.status}
            </span>
            {user?.role === 'Admin' && (
              <button 
                onClick={() => setShowEvaluationModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 whitespace-nowrap scale-100 hover:scale-105"
              >
                <Award size={18} /> Evaluate Project
              </button>
            )}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100 pt-8 relative z-10">
           <div className="flex items-center space-x-5">
             <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 text-primary rounded-2xl border border-blue-200/50 shadow-inner"><Calendar size={28} /></div>
             <div>
               <p className="text-xs text-secondary font-black uppercase tracking-widest mb-1">Global Deadline</p>
               <p className="font-extrabold text-dark text-xl">{new Date(project.deadline).toLocaleDateString()}</p>
             </div>
           </div>
           
           <div className="flex items-center space-x-5">
             <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-500 rounded-2xl border border-indigo-200/50 shadow-inner"><CheckCircle size={28} /></div>
             <div>
               <p className="text-xs text-secondary font-black uppercase tracking-widest mb-1">Supervising Faculty</p>
               <p className="font-extrabold text-dark text-xl">{project.createdBy?.name || 'Admin'}</p>
             </div>
           </div>

           <div className="flex items-center space-x-5">
             <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-500 rounded-2xl border border-purple-200/50 shadow-inner"><Users size={28} /></div>
             <div>
               <p className="text-xs text-secondary font-black uppercase tracking-widest mb-1">Engineering Team</p>
               <p className="font-extrabold text-dark text-xl">{project.members?.length || 0} Members</p>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">

          {/* Group Progress Tracking Section */}
          {groupProgress.length > 0 && (
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <h2 className="text-2xl font-black text-dark mb-6 flex items-center border-b border-gray-100 pb-4">
                <Star size={28} className="mr-3 text-orange-500"/> Group Progress Tracking
              </h2>
              <div className="space-y-6">
                {groupProgress.map((gp, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-lg text-dark">{gp.group.name}</h3>
                      <span className="font-black text-primary text-xl">{gp.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3 shrink-0 overflow-hidden">
                      <div className="bg-gradient-to-r from-primary to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${gp.progress}%` }}></div>
                    </div>
                    <p className="text-secondary text-sm font-medium">
                      Completed {gp.completedTasks} out of {gp.totalTasks} assigned tasks
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Academic Evaluation Section */}
          <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative group hover:shadow-lg transition-all">
            <h2 className="text-2xl font-black text-dark mb-6 flex items-center border-b border-gray-100 pb-4">
               <GraduationCap size={28} className="mr-3 text-indigo-500"/> Academic Evaluation Record
            </h2>
            
            {(project.grade && project.grade !== 'Pending') || project.facultyFeedback ? (
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="md:col-span-1 flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-100 p-6">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Final Grade</p>
                    <div className={`h-24 w-24 rounded-full flex items-center justify-center text-4xl font-black shadow-lg border-4 ring-4 ring-white ${getGradeColor(project.grade)}`}>
                       {project.grade || 'N/A'}
                    </div>
                 </div>
                 <div className="md:col-span-3 bg-indigo-50/30 rounded-2xl p-6 border border-indigo-100/40 relative">
                    <Star size={40} className="absolute right-4 top-4 text-indigo-500/10"/>
                    <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3">Faculty Remarks & Feedback</p>
                    <p className="text-dark font-medium leading-relaxed italic text-lg">"{project.facultyFeedback || 'No additional remarks provided.'}"</p>
                 </div>
               </div>
            ) : (
               <div className="py-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <GraduationCap size={40} className="mx-auto text-gray-300 mb-4"/>
                  <p className="text-secondary font-bold text-lg">Project evaluation is currently pending.</p>
                  <p className="text-gray-400 font-medium mt-1">Faculty will assign a final grade upon completion.</p>
               </div>
            )}
          </div>

          <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
             <h2 className="text-2xl font-black text-dark mb-6 flex items-center border-b border-gray-100 pb-4">
               <Zap size={28} className="mr-3 text-primary"/> Integrated Modules
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
               <Link to={`/tasks?project=${project._id}`} className="block p-6 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all group">
                 <h3 className="text-xl font-bold text-dark group-hover:text-primary transition mb-2">Kanban Sprints</h3>
                 <p className="text-sm text-secondary font-medium leading-relaxed">Manage workflow tasks, assign tickets, and track time.</p>
               </Link>
               <Link to={`/collaboration?project=${project._id}`} className="block p-6 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-purple-300 hover:shadow-xl hover:-translate-y-1 transition-all group">
                 <h3 className="text-xl font-bold text-dark group-hover:text-purple-600 transition mb-2">Communication Hub</h3>
                 <p className="text-sm text-secondary font-medium leading-relaxed">Access the project's real-time discussion channels.</p>
               </Link>
             </div>
          </div>
        </div>

        {/* Team Members / Assigned Groups */}
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-fit sticky top-6">
           <h2 className="text-2xl font-black text-dark mb-6 flex items-center border-b border-gray-100 pb-4">
             <Users size={28} className="mr-3 text-orange-400"/> Engineering Entities
           </h2>

           {project.assignedGroups && project.assignedGroups.length > 0 && (
             <div className="mb-6">
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Assigned Groups</p>
               <ul className="space-y-3">
                 {project.assignedGroups.map(g => (
                   <li key={g._id} className="flex flex-col p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                     <span className="font-bold text-dark">{g.name}</span>
                     {user?.role === 'Admin' && <span className="text-xs text-primary font-mono mt-1">ID: {g._id.toString().substring(18)}</span>}
                   </li>
                 ))}
               </ul>
             </div>
           )}

           <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Individual Members</p>
           {project.members?.length === 0 ? (
             <div className="py-8 text-center bg-orange-50/50 rounded-2xl border border-orange-100">
               <p className="text-orange-600/80 font-bold">No engineers assigned.</p>
             </div>
           ) : (
             <ul className="space-y-4">
               {project.members.map((m, index) => (
                 <li key={m._id} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-2xl transition border border-transparent hover:border-gray-100 shadow-sm">
                   <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-black shadow-md ${index % 2 === 0 ? 'bg-gradient-to-tr from-primary to-blue-400' : 'bg-gradient-to-tr from-orange-400 to-red-400'}`}>
                     {m.name.charAt(0)}
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="font-bold text-dark text-base truncate">{m.name}</p>
                     <p className="text-xs text-secondary font-semibold truncate">{m.email}</p>
                   </div>
                 </li>
               ))}
             </ul>
           )}
        </div>
      </div>

      {showEvaluationModal && (
        <div className="fixed inset-0 bg-dark/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white flex justify-between items-center">
               <h2 className="text-2xl font-black text-dark flex items-center"><Award size={24} className="mr-3 text-indigo-500"/> Evaluate Project</h2>
            </div>
            <form onSubmit={handleEvaluate} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-black text-dark mb-2 uppercase tracking-widest text-indigo-500">Official Grade</label>
                <select className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition font-black text-dark shadow-sm text-lg"
                  value={evalData.grade} onChange={e => setEvalData({...evalData, grade: e.target.value})}>
                  <option value="Pending">Pending (No Grade)</option>
                  <option value="A+">A+ (Outstanding)</option>
                  <option value="A">A (Excellent)</option>
                  <option value="B+">B+ (Very Good)</option>
                  <option value="B">B (Good)</option>
                  <option value="C">C (Average)</option>
                  <option value="D">D (Pass)</option>
                  <option value="F">F (Fail)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-dark mb-2 uppercase tracking-widest text-indigo-500">Faculty Remarks</label>
                <textarea className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition font-medium shadow-sm resize-none" rows="4" placeholder="Enter detailed feedback and evaluation notes..."
                  value={evalData.facultyFeedback} onChange={e => setEvalData({...evalData, facultyFeedback: e.target.value})}></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowEvaluationModal(false)} className="px-6 py-3 font-bold text-secondary hover:bg-gray-100 rounded-xl transition">Cancel</button>
                <button type="submit" className="px-6 py-3 font-black bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/30 transition">Submit Final Evaluation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};
export default ProjectDetails;
