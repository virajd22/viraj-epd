import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuthStore } from '../store/authStore';
import { Send, Megaphone, MessageSquare, Zap } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
  autoConnect: false,
});

const Collaboration = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get('project');

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(initialProjectId || '');
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Mount Websocket Listener
    socket.connect();
    
    socket.on('receive_message', (message) => {
      // Append the incoming message automatically for all users (including sender)
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receive_message');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchMessages();
      socket.emit('join_project', selectedProject);
    }
  }, [selectedProject]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchInitialData = async () => {
    try {
      const [projRes, annRes] = await Promise.all([
        api.get('/projects'),
        api.get('/collaboration/announcements')
      ]);
      setProjects(projRes.data);
      setAnnouncements(annRes.data);
      if (!selectedProject && projRes.data.length > 0) {
        setSelectedProject(projRes.data[0]._id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/collaboration/comments?projectId=${selectedProject}`);
      setMessages(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProject) return;
    try {
      // We don't fetch or manually append because our Socket listener will pick it up
      await api.post('/collaboration/comments', { projectId: selectedProject, text: newMessage });
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    try {
      await api.post('/collaboration/announcements', newAnnouncement);
      setNewAnnouncement({ title: '', content: '' });
      fetchInitialData(); // refetch announcements
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <AnimatedPage className="p-12 text-center text-secondary font-bold text-lg animate-pulse">Loading collaboration hub...</AnimatedPage>;

  return (
    <AnimatedPage className="h-[calc(100vh-120px)] flex flex-col space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-4xl font-black text-dark tracking-tight mb-2">Collaboration Hub</h1>
          <p className="text-secondary mt-1 font-medium text-lg">Real-time team chat and global engineering announcements.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Chat Section */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex flex-col overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>
          
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white flex justify-between items-center relative z-10">
            <h2 className="font-extrabold text-dark flex items-center text-lg"><MessageSquare size={22} className="mr-3 text-primary"/> Project General Chat</h2>
            <select 
              className="p-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold shadow-sm transition min-w-[200px] text-dark cursor-pointer hover:border-blue-300"
              value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="" disabled>Select Project to Chat</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-50/30 space-y-5 relative z-10">
            {!selectedProject ? (
               <div className="h-full flex items-center justify-center text-secondary font-bold">Select a project to view chat</div>
            ) : messages.length === 0 ? (
               <div className="h-full flex items-center justify-center flex-col text-center">
                 <MessageSquare size={48} className="text-gray-300 mb-4" />
                 <p className="text-secondary font-bold text-lg">Silence...</p>
                 <p className="text-gray-400 font-medium">Start the conversation with your team.</p>
               </div>
            ) : (
               messages.map(msg => (
                 <div key={msg._id} className={`flex flex-col animate-in slide-in-from-bottom-2 fade-in duration-300 ${msg.user._id === user._id ? 'items-end' : 'items-start'}`}>
                   <span className="text-[10px] text-gray-400 mb-1 px-1 font-black uppercase tracking-widest">{msg.user.name} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   <div className={`px-5 py-3.5 rounded-3xl max-w-[80%] shadow-sm text-[15px] font-medium leading-relaxed ${msg.user._id === user._id ? 'bg-gradient-to-r from-blue-600 to-primary text-white rounded-br-sm shadow-blue-500/20' : 'bg-white border border-gray-100 text-dark rounded-bl-sm'}`}>
                     {msg.text}
                   </div>
                 </div>
               ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-5 bg-white border-t border-gray-100 relative z-10">
            <form onSubmit={handleSendMessage} className="flex space-x-3 items-center">
              <input 
                type="text" 
                disabled={!selectedProject}
                className="flex-1 p-4 bg-gray-50/50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition font-medium text-dark shadow-sm disabled:opacity-50"
                placeholder="Type your message to the team..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button disabled={!selectedProject || !newMessage.trim()} type="submit" className="bg-primary text-white p-4 rounded-2xl hover:bg-blue-600 transition disabled:opacity-40 disabled:hover:bg-primary shadow-lg shadow-blue-500/30 flex items-center justify-center transform active:scale-95 disabled:active:scale-100">
                <Send size={20} className="ml-1" />
              </button>
            </form>
          </div>
        </div>

        {/* Announcements Section */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex flex-col overflow-hidden relative group h-full">
           <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -ml-10 -mt-10 group-hover:bg-orange-500/10 transition-colors pointer-events-none"></div>

           <div className="p-6 border-b border-orange-100/50 bg-gradient-to-r from-orange-50/50 to-white flex justify-between items-center relative z-10">
             <h2 className="font-extrabold text-dark flex items-center text-lg"><Megaphone size={22} className="mr-3 text-orange-500"/> Global Feed</h2>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5 bg-slate-50/30 relative z-10">
             {announcements.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center mt-10">
                   <Megaphone size={40} className="text-orange-200 mb-3" />
                   <p className="text-secondary text-center font-bold">No global alerts right now.</p>
               </div>
             ) : (
               announcements.map(ann => (
                 <div key={ann._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-orange-200 hover:-translate-y-1">
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-t from-orange-400 to-yellow-400"></div>
                   <h3 className="font-extrabold text-dark mb-2 text-lg pr-4">{ann.title}</h3>
                   <p className="text-secondary mb-4 leading-relaxed font-medium text-sm">{ann.content}</p>
                   <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 inline-block px-3 py-1.5 rounded-lg border border-gray-100">
                     Posted by {ann.author?.name} • {new Date(ann.createdAt).toLocaleDateString()}
                   </div>
                 </div>
               ))
             )}
           </div>

           {user?.role === 'Admin' && (
             <div className="p-6 border-t border-orange-100/50 bg-white relative z-10">
               <h3 className="font-black text-[11px] text-orange-500 uppercase tracking-widest mb-4 flex items-center"><Zap size={14} className="mr-1.5"/> Blast Announcement</h3>
               <form onSubmit={handlePostAnnouncement} className="space-y-4">
                 <input className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-orange-500 transition focus:ring-4 focus:ring-orange-500/10 font-bold text-dark shadow-sm" placeholder="Alert Subject" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} required/>
                 <textarea className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-orange-500 transition focus:ring-4 focus:ring-orange-500/10 min-h-[100px] font-medium text-dark shadow-sm resize-none" placeholder="Alert Message Details..." value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} required></textarea>
                 <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-black py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition tracking-widest uppercase text-xs shadow-lg shadow-orange-500/30 transform active:scale-95">Broadcast</button>
               </form>
             </div>
           )}
        </div>
      </div>
    </AnimatedPage>
  );
};
export default Collaboration;
