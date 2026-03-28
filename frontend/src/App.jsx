import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Tasks from './pages/Tasks';
import CalendarView from './pages/CalendarView';
import Collaboration from './pages/Collaboration';
import Documents from './pages/Documents';
import Reports from './pages/Reports';

// NEW PAGES
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import PrivateChat from './pages/PrivateChat';

// Placeholder Pages
const Unauthorized = () => <div className="p-8 text-center text-2xl text-red-500">Unauthorized</div>;

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:id" element={<GroupDetails />} />
            <Route path="/collaboration" element={<Collaboration />} />
            <Route path="/chat" element={<PrivateChat />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/reports" element={<Reports />} />
            {/* We will nest other authenticated routes here later */}
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
