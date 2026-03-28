import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Key, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axiosConfig';

const Groups = () => {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups', error);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName) return;
    try {
      setIsCreating(true);
      await api.post('/groups', { name: newGroupName });
      setNewGroupName('');
      fetchGroups();
    } catch (error) {
      console.error('Failed to create group', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!joinCodeInput) return;
    try {
      setIsJoining(true);
      await api.post('/groups/join', { joinCode: joinCodeInput });
      setJoinCodeInput('');
      fetchGroups();
    } catch (error) {
      console.error('Failed to join group', error);
      alert('Invalid Group Code or Already Joined');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-dark tracking-tight">Groups & Surveillance</h1>
          <p className="text-secondary mt-1">Manage and collaborate with your incubated teams.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {user?.role === 'Admin' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus className="text-primary"/> Create New Group</h2>
             <form onSubmit={handleCreateGroup} className="flex gap-2">
               <input 
                 type="text" 
                 placeholder="Group Name" 
                 value={newGroupName}
                 onChange={(e) => setNewGroupName(e.target.value)}
                 className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
               />
               <button 
                 type="submit" 
                 disabled={isCreating}
                 className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-blue-500/25"
               >
                 Create
               </button>
             </form>
          </motion.div>
        )}

        {user?.role !== 'Admin' && (
          <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
             className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Key className="text-orange-500"/> Join a Group</h2>
             <form onSubmit={handleJoinGroup} className="flex gap-2">
               <input 
                 type="text" 
                 placeholder="Enter 6-digit Join Code" 
                 value={joinCodeInput}
                 onChange={(e) => setJoinCodeInput(e.target.value)}
                 className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all uppercase"
                 maxLength={6}
               />
               <button 
                 type="submit" 
                 disabled={isJoining}
                 className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25"
               >
                 Join
               </button>
             </form>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group, idx) => (
          <motion.div
            key={group._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-3 rounded-2xl text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <Users size={24} />
              </div>
              {user?.role === 'Admin' && (
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-mono font-medium text-gray-600 selection:bg-primary selection:text-white">
                    Code: {group.joinCode}
                  </div>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-dark mb-2">{group.name}</h3>
            <p className="text-sm text-secondary mb-6 border-b border-gray-50 pb-4">
              {group.members.length} member(s)
            </p>

            <Link 
              to={`/groups/${group._id}`}
              className="flex items-center justify-between w-full text-primary font-medium group-hover:text-blue-600 transition-colors"
            >
              <span>View Group Details</span>
              <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        ))}

        {groups.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400">
            No groups found. {user?.role === 'Admin' ? 'Create one above!' : 'Join one using a code!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
