import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Users, Clock } from 'lucide-react';

export default function ChatsPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastMessages, setLastMessages] = useState({});
  const token = localStorage.getItem('unisync_token');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/match/my-matches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const matchesList = data.matches || [];
      setMatches(matchesList);

      // Fetch last message for each match
      const msgMap = {};
      for (const match of matchesList) {
        try {
          const msgRes = await fetch(`/api/messages/${match.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (msgRes.ok) {
            const msgData = await msgRes.json();
            const msgs = msgData.messages || [];
            if (msgs.length > 0) {
              msgMap[match.id] = msgs[msgs.length - 1];
            }
          }
        } catch (e) {
          // ignore
        }
      }
      setLastMessages(msgMap);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserId = () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return null;
    }
  };
  const currentUserId = getCurrentUserId();

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Yesterday';
    if (days < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2 animate-slide-down">
        <MessageCircle size={28} className="text-blue-600" />
        <span>My Chats</span>
      </h1>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : matches.length === 0 ? (
        <div className="card text-center py-16 animate-scale-in">
          <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">No chats yet</h2>
          <p className="text-gray-500 mb-6">
            You need to match with someone before you can chat.
          </p>
          <Link
            to="/matches"
            className="inline-flex items-center space-x-2 btn-primary px-6 py-2 hover:scale-105 transition-transform"
          >
            <Users size={18} />
            <span>Find Matches</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-2 stagger-children">
          {matches.map((match) => {
            const lastMsg = lastMessages[match.id];
            const isMe = lastMsg?.senderId === currentUserId;

            return (
              <Link
                key={match.id}
                to={`/chat/${match.id}`}
                className="card flex items-center space-x-4 hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={match.matchImage || 'https://via.placeholder.com/48'}
                    alt={match.matchName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {match.matchName}
                    </h3>
                    {lastMsg && (
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {formatDate(lastMsg.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {match.matchUniversity} • {match.matchDepartment}
                  </p>
                  {lastMsg ? (
                    <div className="flex items-start space-x-1 mt-0.5">
                      <p className={`text-sm truncate ${isMe ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>
                        <span className="text-xs text-gray-500">
                          {isMe ? 'You' : lastMsg.senderName}:
                        </span>{' '}
                        {lastMsg.content}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 truncate mt-0.5 flex items-center">
                      <Clock size={12} className="mr-1" />
                      No messages yet. Say hello!
                    </p>
                  )}
                </div>

                <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full text-blue-600">
                  <MessageCircle size={18} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

