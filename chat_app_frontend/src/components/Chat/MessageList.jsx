import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const MessageList = ({ messages }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    // Only auto-scroll if user is already at the bottom
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  // Check if user is at the bottom of the scroll container
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const threshold = 100; // pixels from bottom
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - threshold);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  let lastDate = null;

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-neutral-900 scroll-smooth" 
        onScroll={handleScroll}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E0 #F7FAFC',
          minHeight: 0 // Ensures proper flex shrinking
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg">No messages yet</p>
            <p className="text-sm">Start a conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const messageDate = formatDate(message.timestamp);
            const showDateDivider = messageDate !== lastDate;
            lastDate = messageDate;
            
            const isOwnMessage = message.sender.id === user?.id;
            
            return (
              <React.Fragment key={message.id}>
                {showDateDivider && (
                  <div className="flex justify-center my-4">
                    <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 border">
                      {messageDate}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isOwnMessage 
                      ? 'bg-green-800 text-white' 
                      : 'bg-white text-gray-900 border'
                  }`}>
                    {!isOwnMessage && (
                      <div className="text-xs font-medium mb-1 text-primary-600">
                        {message.sender.username}
                      </div>
                    )}
                    <div className="text-sm leading-relaxed break-words">
                      {message.content}
                    </div>
                    <div className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Scroll to bottom button - shows when user scrolls up */}
      {!isAtBottom && messages.length > 0 && (
        <div className="absolute bottom-20 right-6">
          <button
            onClick={scrollToBottom}
            className="bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full shadow-lg transition-colors"
            aria-label="Scroll to bottom"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageList;