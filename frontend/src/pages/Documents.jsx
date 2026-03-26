import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuthStore } from '../store/authStore';
import { Upload, FileText, Download, Trash2, File, Presentation } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';

const Documents = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get('project');

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(initialProjectId || '');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('Report');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedProject) fetchDocuments();
  }, [selectedProject]);

  const fetchInitialData = async () => {
    try {
      const projRes = await api.get('/projects');
      setProjects(projRes.data);
      if (!selectedProject && projRes.data.length > 0) {
        setSelectedProject(projRes.data[0]._id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/documents?projectId=${selectedProject}`);
      setDocuments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedProject) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', selectedProject);
    formData.append('type', docType);

    try {
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFile(null);
      // Reset file input
      document.getElementById('file-upload').value = '';
      fetchDocuments();
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments();
    } catch (error) {
      console.error(error);
    }
  };

  const getFileIcon = (type) => {
    if (type === 'SRS') return <FileText size={24} className="text-blue-500" />;
    if (type === 'PPT') return <Presentation size={24} className="text-orange-500" />;
    if (type === 'Report') return <File size={24} className="text-green-500" />;
    return <File size={24} className="text-gray-500" />;
  };

  if (loading) return <div className="p-8 text-center text-secondary font-medium animate-pulse">Loading documents...</div>;

  return (
    <AnimatedPage className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Document Center</h1>
          <p className="text-secondary mt-1 font-medium">Manage SRS, PPT, and Report files.</p>
        </div>
        <select 
          className="w-full md:w-64 p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-primary font-medium shadow-sm transition"
          value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="" disabled>Select Project</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
        {/* Upload Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-dark mb-4 border-b border-gray-100 pb-3">Upload File</h3>
          <form onSubmit={handleUpload} className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-bold text-dark mb-1.5">Document Type</label>
              <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary transition" value={docType} onChange={(e) => setDocType(e.target.value)}>
                <option value="SRS">SRS</option>
                <option value="PPT">PPT</option>
                <option value="Report">Report</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-bold text-dark mb-1.5">Select File</label>
              <div className="border-2 border-dashed border-primary/30 bg-blue-50/50 rounded-xl p-6 text-center hover:bg-blue-50 transition cursor-pointer relative">
                <input id="file-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files[0])} required />
                <Upload size={24} className="mx-auto text-primary mb-2" />
                <p className="text-sm font-bold text-dark max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{file ? file.name : 'Click or drop file'}</p>
                <p className="text-[10px] text-secondary mt-1 uppercase font-bold tracking-wide">Max 10MB</p>
              </div>
            </div>

            <button disabled={!file || uploading || !selectedProject} type="submit" className="w-full mt-6 bg-primary text-white p-3 rounded-xl hover:bg-blue-600 transition disabled:opacity-50 font-bold shadow-sm">
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <h3 className="text-lg font-bold text-dark mb-4 border-b border-gray-100 pb-3">Project Documents</h3>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {!selectedProject ? (
              <div className="h-full flex items-center justify-center text-secondary font-medium">Select a project to view files.</div>
            ) : documents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-secondary font-medium">
                <FileText size={48} className="text-gray-200 mb-3" />
                <p>No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div key={doc._id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-blue-100 transition-all group overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2.5 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition">
                        {getFileIcon(doc.type)}
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wide bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{doc.type}</span>
                    </div>
                    
                    <h4 className="font-bold text-dark text-sm mb-1 truncate" title={doc.name}>{doc.name}</h4>
                    <p className="text-xs text-secondary mb-4 font-medium">Uploaded by {doc.uploadedBy?.name}</p>
                    
                    <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                      <p className="text-[10px] text-gray-400 font-bold">{new Date(doc.createdAt).toLocaleDateString()}</p>
                      <div className="flex space-x-1">
                        <a 
                          href={`http://localhost:5000${doc.fileUrl}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition"
                          title="Download"
                        >
                          <Download size={16} />
                        </a>
                        {(user?.role === 'Admin' || user?._id === doc.uploadedBy?._id) && (
                          <button 
                            onClick={() => handleDelete(doc._id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition opacity-0 group-hover:opacity-100"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};
export default Documents;
