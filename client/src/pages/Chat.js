import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import { MessageSquare, Send } from 'lucide-react';

const Chat = () => {
  const { userId } = useParams(); // The other user's ID
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);

  const roomId = [user._id, userId].sort().join('-'); // Unique room for the pair

  useEffect(() => {
    if (socket && user && isConnected) {
      console.log('Socket connected:', socket.connected);
      console.log('Joining room:', roomId);
      
      // Join the chat room
      socket.emit('joinRoom', roomId);

      // Listen for messages
      socket.on('receiveMessage', (message) => {
        console.log('Received message:', message);
        setMessages(prev => [...prev, message]);
      });

      // Listen for typing
      socket.on('userTyping', (data) => {
        if (data.senderId !== user._id) {
          setIsTyping(true);
        }
      });

      socket.on('userStopTyping', (data) => {
        if (data.senderId !== user._id) {
          setIsTyping(false);
        }
      });

      return () => {
        socket.off('receiveMessage');
        socket.off('userTyping');
        socket.off('userStopTyping');
      };
    }
  }, [socket, roomId, user, isConnected]);

  useEffect(() => {
    // Fetch other user's info
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${userId}`);
        setOtherUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket && user && isConnected) {
      const messageData = {
        roomId,
        message: newMessage,
        senderId: user._id,
        senderName: user.name
      };
      console.log('Sending message:', messageData);
      socket.emit('sendMessage', messageData);
      // Don't add to local state here - wait for server to echo back
      setNewMessage('');
      socket.emit('stopTyping', { roomId, senderId: user._id });
    } else {
      console.log('Cannot send message:', { newMessage: !!newMessage.trim(), socket: !!socket, user: !!user });
    }
  };

  const handleTyping = () => {
    if (socket && !isTyping) {
      socket.emit('typing', {
        roomId,
        senderId: user._id,
        senderName: user.name
      });
    }
  };

  const handleStopTyping = () => {
    if (socket) {
      socket.emit('stopTyping', { roomId, senderId: user._id });
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
        <h2 className="text-2xl font-bold">
          💬 Chat with {otherUser?.name || 'User'}
        </h2>
        {!isConnected && (
          <p className="text-sm text-yellow-200 mt-2 flex items-center">
            <span className="animate-pulse">●</span> Connecting to chat...
          </p>
        )}
        {isConnected && (
          <p className="text-sm text-green-200 mt-2 flex items-center">
            <span className="text-green-400">●</span> Connected
          </p>
        )}
      </div>

      <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.senderId === user._id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                msg.senderId === user._id
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.message}</p>
              <p className={`text-xs mt-2 ${
                msg.senderId === user._id ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md border border-gray-200 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200 bg-white">
        <div className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleTyping}
            onKeyUp={handleStopTyping}
            placeholder="Type your message..."
            disabled={!isConnected}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isConnected || !newMessage.trim()}
            className={`px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              isConnected && newMessage.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;