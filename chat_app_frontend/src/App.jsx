import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ChatRoom from './components/Chat/ChatRoom';
import UserList from './components/Chat/UserList';
import Navbar from './components/Layout/Navbar';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log('PrivateRoute - User:', user, 'Loading:', loading); // Debug log
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

const ChatLayout = () => {
  console.log('ChatLayout rendered'); // Debug log
  
  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex-shrink-0">
        <UserList />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Routes>
          <Route path=":roomId" element={<ChatRoom />} />
          <Route index element={
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to ChatApp</h3>
                <p className="text-gray-600">Select a user from the sidebar to start chatting</p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
};

// Debug component to show current state
const DebugInfo = () => {
  const { user, loading } = useAuth();
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed top-16 right-4 bg-black text-white p-2 text-xs rounded opacity-75 z-50">
      <div>User: {user ? user.username : 'null'}</div>
      <div>Loading: {loading.toString()}</div>
      <div>Token: {localStorage.getItem('access_token') ? 'exists' : 'null'}</div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
          <Navbar />
          <DebugInfo />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/chat/*" element={
                <PrivateRoute>
                  <ChatLayout />
                </PrivateRoute>
              } />
              <Route path="/" element={<Navigate to="/chat" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;