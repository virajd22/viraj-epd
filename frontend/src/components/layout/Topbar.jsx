import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { Search, Bell, Menu } from 'lucide-react';

const Topbar = () => {
  const { user } = useAuthStore();

  return (
    <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="flex items-center flex-1">
         {/* Mobile menu button could go here */}
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
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="relative text-secondary hover:text-dark transition">
           <Bell size={22} />
           <span className="absolute -top-1 -right-1 flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
           </span>
        </motion.button>

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
