import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-read');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="flex items-center flex-1">
         <div className="relative w-full max-w-md hidden md:block">
           <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search projects, tasks, or members..." 
             className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-sm font-medium"
           />
         </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <motion.button 
            onClick={() => setShowNotifications(!showNotifications)}
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }} 
            className="relative text-secondary hover:text-dark transition"
          >
             <Bell size={22} />
             {unreadCount > 0 && (
               <span className="absolute -top-1 -right-1 flex h-4 w-4">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white items-center justify-center text-[8px] text-white font-bold">{unreadCount}</span>
               </span>
             )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden z-50 flex flex-col max-h-96"
              >
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-primary font-medium hover:underline flex items-center">
                      <Check size={12} className="mr-1"/> Mark all read
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification._id} 
                        className={`p-3 rounded-xl transition cursor-pointer flex flex-col ${notification.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                        onClick={() => {
                          if (!notification.read) markAsRead(notification._id);
                          if (notification.actionUrl) {
                            navigate(notification.actionUrl);
                            setShowNotifications(false);
                          }
                        }}
                      >
                        <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-semibold'} line-clamp-2`}>
                          {notification.message}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-1 font-medium">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-gray-200"></div>

        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-dark group-hover:text-primary transition">{user?.name || 'User'}</p>
            <p className="text-[10px] text-secondary uppercase font-bold tracking-widest">{user?.role || 'Guest'}</p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="h-10 w-10 bg-gradient-to-tr from-primary to-blue-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 ring-2 ring-white"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
