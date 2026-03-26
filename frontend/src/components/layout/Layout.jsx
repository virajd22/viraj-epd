import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-light overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen ml-64">
        <Topbar />
        <main className="flex-1 p-8 overflow-y-auto relative bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
