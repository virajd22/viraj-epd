import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-light">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 overflow-y-auto max-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark mb-2">BuildFlow PRO++</h1>
          <p className="text-secondary">Create a new account</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Full Name</label>
            <input 
              name="name" type="text" required
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary outline-none transition"
              value={formData.name} onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">Email</label>
            <input 
              name="email" type="email" required
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary outline-none transition"
              value={formData.email} onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Password</label>
            <input 
              name="password" type="password" required
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary outline-none transition"
              value={formData.password} onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">Role</label>
            <select
              name="role"
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary outline-none transition bg-white"
              value={formData.role} onChange={handleChange}
            >
              <option value="Student">Student</option>
              <option value="Team Leader">Team Leader</option>
              <option value="Admin">Admin (Faculty)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white p-2 rounded hover:bg-blue-600 transition disabled:opacity-50 mt-4"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
