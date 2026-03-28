import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, User as UserIcon, Search } from 'lucide-react';
import api from '../api/axiosConfig';
import { useAuthStore } from '../store/authStore';
import io from 'socket.io-client';

const PrivateChat = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchUsers();

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    });
    setSocket(newSocket);

    // Join personal room for private messages
    if (user?._id) {
      newSocket.emit('join_personal', user._id);
    }

    newSocket.on('receive_private_message', (message) => {
      // Only append if it's from the currently selected user or to them
      setMessages((prev) => {
        // We only want to add it to the view if the sender is the selected user, 
        // OR if we sent it (though we already optimistic-update when we send)
        const isRelated = message.sender._id === selectedUser?._id || message.receiver._id === selectedUser?._id;
        if (isRelated) {
          // Check if message already exists to avoid duplicates
          if (!prev.find(m => m._id === message._id)) {
            return [...prev, message];
          }
        }
        return prev;
      });
    });

    return () => newSocket.close();
  }, [user?._id, selectedUser]); // Re-bind socket listener if selected user changes

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      // If student, filter out other students? Or just allow everyone. 
      // Admin sees everyone. Prompt says Admin can chat privately with individuals. 
      const filtered = user?.role === 'Admin' ? data : data.filter(u => u.role === 'Admin');
      setUsers(filtered);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const { data } = await api.get(`/chat/${userId}`);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const { data } = await api.post('/chat/send', {
        receiverId: selectedUser._id,
        text: newMessage,
      });
      // Optimistically add message
      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6">
      {/* Sidebar: User List */}
      <div className="w-full md:w-80 bg-white rounded-3xl p-4 border border-gray-100 flex flex-col shadow-sm">
        <h2 className="text-xl font-bold mb-4 px-2">Messages</h2>
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
          {filteredUsers.map(u => (
            <button
              key={u._id}
              onClick={() => setSelectedUser(u)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                selectedUser?._id === u._id ? 'bg-blue-50 border-blue-100' : 'hover:bg-gray-50 border-transparent'
              } border`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold shrink-0">
                {u.name.charAt(0)}
              </div>
              <div className="text-left flex-1 overflow-hidden">
                <p className="font-semibold text-dark truncate">{u.name}</p>
                <p className="text-xs text-secondary truncate">{u.role}</p>
              </div>
            </button>
          ))}
          {filteredUsers.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">No users found.</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 flex flex-col shadow-sm overflow-hidden">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-400 text-white flex items-center justify-center font-bold">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-dark">{selectedUser.name}</h3>
                <p className="text-xs text-secondary">{selectedUser.role}</p>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
              {messages.map((msg, idx) => {
                const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg._id || idx}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`px-4 py-3 rounded-2xl max-w-[75%] shadow-sm ${
                      isMine 
                        ? 'bg-gradient-to-r from-primary to-blue-600 text-white rounded-tr-sm shadow-blue-500/20' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    }`}>
                      <p className="text-sm shadow-none">{msg.text}</p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-gray-50 border-none rounded-xl pl-4 pr-12 py-3.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400 text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-all shadow-md shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-gray-300" />
            </div>
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateChat;
