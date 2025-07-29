import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setError(null);
      const response = await api.get('/chat/users/');
      setUsers(response.data);
      setLoading(false);
      console.log('Users loaded:', response.data); // Debug log
    } catch (error) {
      console.error('Error loading users:', error);
      setError(error.response?.data?.detail || 'Failed to load users');
      setLoading(false);
    }
  };

  const startChat = async (userId) => {
    try {
      setError(null);
      console.log('Creating chat with user:', userId);
      const response = await api.post('/chat/room/', { user_id: userId });
      console.log('Chat room created:', response.data);
      console.log('Navigating to:', `/chat/${response.data.id}`);
      
      // Pass room data to the ChatRoom component via navigation state
      navigate(`/chat/${response.data.id}`, { 
        state: { 
          roomData: response.data,
          initialMessages: response.data.messages || []
        }
      });
    } catch (error) {
      console.error('Error creating chat room:', error);
      setError(error.response?.data?.error || error.response?.data?.detail || 'Failed to create chat room');
    }
  };

  const retryLoadUsers = () => {
    setLoading(true);
    setError(null);
    loadUsers();
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="px-4 py-3 ">
          <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="px-4 py-3 ">
          <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-32 text-gray-500 px-4">
          <svg className="w-12 h-12 mb-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-center mb-2">{error}</p>
          <button 
            onClick={retryLoadUsers}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-neutral-900">
      <div className="p-4 border border-gray-50">
        <h2 className="text-lg font-semibold text-white">Messages</h2>
        <p className="text-xs text-gray-500 mt-1">{users.length} users available</p>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p className="text-sm">No users found</p>
            <button 
              onClick={retryLoadUsers}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 ">
            {users.map(user => (
              <div
                key={user.id}
                onClick={() => startChat(user.id)}
                className="group flex items-center px-4 py-3 hover:bg-white  cursor-pointer transition duration-150 ease-in-out "
              >
                <div className="flex-shrink-0 mr-3 ">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center relative ">
                    <span className="text-white group-hover:text-black text-sm font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                    {user.is_online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-1 border-white rounded-full"></div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white group-hover:text-black truncate ">
                      {user.username}
                    </p>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.is_online 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.is_online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;