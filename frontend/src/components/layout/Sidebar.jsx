import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, FolderGit2, CheckSquare, Calendar, MessageSquare, FileText, BarChart3, LogOut, Hexagon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Sidebar = () => {
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Projects', path: '/projects', icon: <FolderGit2 size={20} /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare size={20} /> },
    { name: 'Calendar', path: '/calendar', icon: <Calendar size={20} /> },
    { name: 'Collaboration', path: '/collaboration', icon: <MessageSquare size={20} /> },
    { name: 'Documents', path: '/documents', icon: <FileText size={20} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="w-64 bg-white/70 backdrop-blur-xl border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-40 transition-all shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-6 flex items-center space-x-3 mb-4">
        <div className="bg-gradient-to-br from-primary to-blue-400 p-2 rounded-xl shadow-lg shadow-blue-500/30">
          <Hexagon size={24} className="text-white fill-white/20" />
        </div>
        <h2 className="text-2xl font-black text-dark tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-dark to-gray-600">BuildFlow</h2>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link key={item.name} to={item.path} className="block relative">
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center space-x-3 p-3 rounded-xl transition-colors relative z-10 ${
                  isActive ? 'text-primary font-bold' : 'text-secondary font-medium hover:text-dark'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-blue-50 border border-blue-100/50 rounded-xl -z-10 shadow-[0_4px_12px_rgba(59,130,246,0.05)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {item.icon}
                <span>{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100/50">
        <motion.button 
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="flex items-center space-x-3 w-full p-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Sidebar;
