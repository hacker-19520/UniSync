import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Send, ArrowLeft, MessageSquare, User } from 'lucide-react';

export default function ChatPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [matchInfo, setMatchInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('unisync_token');

  // Get current user from token
  const getCurrentUserId = () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return null;
    }
  };
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    if (!token || !requestId) return;

// Connect to socket (auto-detects host, works with Vite proxy and production)
    const newSocket = io();
    setSocket(newSocket);

    newSocket.emit('join', { userId: currentUserId, requestId: parseInt(requestId) });

    newSocket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Fetch existing messages
    fetchMessages();
    fetchMatchInfo();

    return () => {
      newSocket.disconnect();
    };
  }, [requestId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchInfo = async () => {
    try {
      const res = await fetch('/api/match/my-matches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const match = data.matches?.find((m) => m.id === parseInt(requestId));
        if (match) {
          setMatchInfo({
            name: match.matchName,
            image: match.matchImage,
            university: match.matchUniversity,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch match info:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      requestId: parseInt(requestId),
      senderId: currentUserId,
      content: newMessage.trim(),
    };

    // Send via socket for real-time
    socket.emit('send_message', messageData);

    // Also send via API for persistence
    fetch(`/api/messages/${requestId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: newMessage.trim() }),
    }).catch((err) => console.error('Failed to send message:', err));

    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Chat Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 animate-slide-down">
        <button
          onClick={() => navigate('/matches')}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
        >
          <ArrowLeft size={20} />
        </button>
        {matchInfo ? (
          <>
            <img
              src={matchInfo.image || 'https://via.placeholder.com/40'}
              alt={matchInfo.name}
              className="w-10 h-10 rounded-full object-cover animate-scale-in"
            />
            <div>
              <h2 className="font-bold text-gray-900">{matchInfo.name}</h2>
              <p className="text-sm text-gray-500">{matchInfo.university}</p>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-2 text-gray-500">
            <User size={20} />
            <span>Loading...</span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-fade-in">
            <MessageSquare size={48} className="mb-2" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end space-x-2 message-bubble`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {!isMe && msg.senderImage && (
                  <img
                    src={msg.senderImage}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div
                  className={`max-w-[70%] transition-all duration-200 hover:scale-[1.02] ${
                    isMe ? 'text-right' : ''
                  }`}
                >
                  {!isMe && (
                    <p className="text-xs text-gray-500 font-medium mb-1 px-1">
                      {msg.senderName}
                    </p>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-500'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="pt-4 border-t border-gray-200 animate-slide-up">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 input-field"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn-primary px-4 disabled:opacity-50 transition-all duration-200 hover:scale-105"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
