import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../../services/api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [roomInfo, setRoomInfo] = useState(null);

  console.log('=== ChatRoom Debug ===');
  console.log('roomId:', roomId);
  console.log('location.state:', location.state);
  console.log('current state:', { loading, messages: messages.length, connectionStatus });
  console.log('roomInfo:', roomInfo);

  useEffect(() => {
    if (roomId) {
      // Check if we have room data from navigation
      if (location.state?.roomData) {
        console.log('Using room data from navigation:', location.state.roomData);
        setRoomInfo(location.state.roomData);
        setMessages(location.state.initialMessages || []);
        setLoading(false);
      } else {
        // Fallback to loading messages via API
        loadMessages();
      }
      connectWebSocket();
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [roomId]);

  const loadMessages = async () => {
    try {
      const response = await api.get(`/chat/messages/${roomId}/`);
      console.log('Messages loaded:', response.data); // Debug log
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      console.error('Error details:', error.response?.data);
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    setConnectionStatus('connecting');
    const token = localStorage.getItem('access_token');
    const wsUrl = `ws://localhost:8000/ws/chat/${roomId}/?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setSocket(ws);
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data); // Debug log
      
      // Check if this message is from the current user to avoid duplicates
      const currentUser = JSON.parse(localStorage.getItem('user_data'));
      
      setMessages(prev => {
        // Avoid duplicate messages by checking if message already exists
        const messageExists = prev.some(msg => 
          msg.content === data.message && 
          msg.sender.id === data.sender_id &&
          Math.abs(new Date(msg.timestamp) - new Date(data.timestamp)) < 1000 // Within 1 second
        );
        
        if (messageExists) {
          console.log('Duplicate message detected, skipping');
          return prev;
        }
        
        return [...prev, {
          id: Date.now() + Math.random(), // More unique ID
          content: data.message,
          sender: { username: data.sender, id: data.sender_id },
          timestamp: data.timestamp,
          is_read: false
        }];
      });
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setConnectionStatus('disconnected');
      // Disable auto-reconnect for now to avoid spam
      // setTimeout(() => {
      //   if (roomId) {
      //     connectWebSocket();
      //   }
      // }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };
  };

  const sendMessage = (content) => {
    if (socket && content.trim() && connectionStatus === 'connected') {
      socket.send(JSON.stringify({
        message: content
      }));
    }
  };

  // Simple test render first
  if (!roomId) {
    return <div className="flex-1 p-4 bg-da-100">No room ID found</div>;
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat for room {roomId}...</p>
          <p className="text-xs text-gray-500 mt-2">Check console for debug info</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-blue-50 h-full overflow-hidden border-2 border-slate-800">
      {/* Debug info */}
      <div className="p-2 bg-yellow-100 text-xs">
        Room ID: {roomId} | Messages: {messages.length} | Status: {connectionStatus}
      </div>
      
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-black flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {roomInfo ? (
                roomInfo.participants?.length > 1 ? 
                `Chat with ${roomInfo.participants.find(p => p.id !== JSON.parse(localStorage.getItem('user_data'))?.id)?.username || 'User'}` :
                roomInfo.name
              ) : `Chat Room ${roomId}`}
            </h3>
            {messages.length > 0 && (
              <p className="text-xs text-gray-500">
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400' :
              connectionStatus === 'connecting' ? 'bg-yellow-400' :
              'bg-red-400'
            }`}></div>
            <span className="text-xs text-gray-500 capitalize">
              {connectionStatus}
            </span>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-hidden bg-green-50">
        <MessageList messages={messages} />
      </div>
      
      {/* Message Input - Fixed at bottom */}
      <div className="flex-shrink-0 bg-red-50">
        <MessageInput 
          onSendMessage={sendMessage} 
          disabled={connectionStatus !== 'connected'} 
        />
      </div>
    </div>
  );
};

export default ChatRoom;