import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, CheckSquare, MessageSquare, Send, Calendar as CalendarIcon, Clock } from 'lucide-react';
import api from '../api/axiosConfig';
import { useAuthStore } from '../store/authStore';
import io from 'socket.io-client';

const GroupDetails = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [group, setGroup] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchGroupDetails();
    fetchTasks();
    fetchComments();

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.emit('join_project', id); // Use same room logic for group chat

    newSocket.on('receive_message', (message) => {
      setComments((prev) => [...prev, message]);
    });

    return () => newSocket.close();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const fetchGroupDetails = async () => {
    try {
      const { data } = await api.get(`/groups/${id}`);
      setGroup(data);
    } catch (error) {
      console.error('Failed to fetch group details', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data } = await api.get(`/tasks/group/${id}`);
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/collaboration/comments?projectId=${id}`); // Reusing project chat for group chat
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post('/collaboration/comments', {
        projectId: id, // GroupID acts as ProjectID in comments
        text: newMessage,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  if (!group) return <div className="p-8 text-center text-gray-500">Loading details...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-dark tracking-tight">{group.name}</h1>
          <p className="text-secondary mt-1">Managed by {group.admin?.name}</p>
        </div>
        {user?.role === 'Admin' && (
          <div className="bg-white/70 px-4 py-2 rounded-xl text-primary font-mono shadow-sm border border-blue-100">
            Join Code: <span className="font-bold">{group.joinCode}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Members & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users className="text-blue-500"/> Members ({group.members.length})</h2>
             <div className="flex flex-wrap gap-3">
               {group.members.map(member => (
                 <div key={member._id} className="bg-gray-50 px-4 py-2 rounded-full text-sm font-medium text-gray-700 flex items-center gap-2 border border-gray-100">
                   <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-primary text-white flex items-center justify-center text-xs">
                     {member.name.charAt(0)}
                   </div>
                   {member.name}
                 </div>
               ))}
             </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckSquare className="text-green-500"/> Group Tasks</h2>
             {tasks.length === 0 ? (
               <p className="text-secondary text-sm">No tasks assigned to this group yet.</p>
             ) : (
               <div className="space-y-3">
                 {tasks.map(task => (
                   <div key={task._id} className="p-4 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors flex justify-between items-center group">
                     <div>
                       <h3 className="font-bold text-dark">{task.title}</h3>
                       <div className="flex items-center gap-3 text-xs text-secondary mt-2">
                         <span className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                           task.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' :
                           task.status === 'Done' ? 'bg-green-100 text-green-800' :
                           task.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                           'bg-blue-50 text-blue-800'
                         }`}><Clock size={12}/> {task.status}</span>
                         <span className="flex items-center gap-1 bg-gray-50 text-gray-600 px-2 py-1 rounded-md"><CalendarIcon size={12}/> {new Date(task.deadline).toLocaleDateString()}</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </motion.div>
        </div>

        {/* Right Column: Chat */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-[600px]">
           <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><MessageSquare className="text-purple-500"/> Group Chat</h2>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 space-y-4 pr-2">
            {comments.map((msg, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx}
                className={`flex flex-col ${msg.user?._id === user?._id || msg.user === user?._id ? 'items-end' : 'items-start'}`}
              >
                <span className="text-xs text-gray-400 mb-1 ml-1">{msg.user?.name || 'User'}</span>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] ${
                  msg.user?._id === user?._id || msg.user === user?._id 
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white rounded-tr-sm shadow-md shadow-blue-500/20' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="relative mt-auto">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-gray-50 border-none rounded-2xl pl-5 pr-12 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400 text-sm"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl hover:bg-blue-600 transition-all shadow-md shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none"
            >
              <Send size={18} />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default GroupDetails;
