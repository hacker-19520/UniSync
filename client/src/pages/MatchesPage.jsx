import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Send, CheckCircle, XCircle, MessageCircle, Search, UserPlus, Clock } from 'lucide-react';

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState('find');
  const [users, setUsers] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [requestsForMe, setRequestsForMe] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'find', label: 'Find Matches', icon: Search },
    { id: 'sent', label: 'My Requests', icon: Send },
    { id: 'received', label: 'Requests for Me', icon: UserPlus },
    { id: 'matches', label: 'My Matches', icon: MessageCircle },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('unisync_token');

    try {
      if (activeTab === 'find') {
        const res = await fetch('/api/profile/users', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setUsers(data.users || []);
      } else if (activeTab === 'sent') {
        const res = await fetch('/api/match/my-requests', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setMyRequests(data.requests || []);
      } else if (activeTab === 'received') {
        const res = await fetch('/api/match/requests-for-me', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setRequestsForMe(data.requests || []);
      } else if (activeTab === 'matches') {
        const res = await fetch('/api/match/my-matches', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setMyMatches(data.matches || []);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (userId) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('unisync_token');
      const res = await fetch('/api/match/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
      }
    } catch (err) {
      console.error('Failed to send request:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequest = async (requestId, action) => {
    setActionLoading(requestId);
    try {
      const token = localStorage.getItem('unisync_token');
      const res = await fetch(`/api/match/${action}/${requestId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to handle request:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.shift && user.shift.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.section && user.section.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.semester && user.semester.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const reasonLabels = {
    'study duo': 'Study Duo',
    'friends': 'Friends',
    'others': 'Others',
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 animate-slide-down">Matches & Requests</h1>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-1 bg-gray-100 p-1 rounded-lg stagger-children">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'find' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, university, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="mx-auto mb-2 text-gray-300" size={32} />
                  <p>No students found.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="card match-card">
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={user.image || 'https://via.placeholder.com/48'}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover match-image"
                        />
                        <div>
                          <h3 className="font-bold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.university}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <p><span className="font-medium">Department:</span> {user.department}</p>
                        <p><span className="font-medium">Course:</span> {user.course}</p>
                        <p><span className="font-medium">Shift:</span> {user.shift || 'N/A'} • <span className="font-medium">Section:</span> {user.section || 'N/A'} • <span className="font-medium">Semester:</span> {user.semester || 'N/A'}</p>
                        <p><span className="font-medium">Looking for:</span> {reasonLabels[user.reason] || user.reason}</p>
                      </div>
                      {user.qualities && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          <span className="font-medium">Qualities:</span> {user.qualities}
                        </p>
                      )}
                      <button
                        onClick={() => sendRequest(user.id)}
                        disabled={actionLoading === user.id}
                        className="w-full btn-primary py-2 flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {actionLoading === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Send size={16} />
                            <span>Send Request</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div className="space-y-3 stagger-children">
              {myRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500 animate-fade-in">
                  <Send className="mx-auto mb-2 text-gray-300" size={32} />
                  <p>No requests sent yet.</p>
                </div>
              ) : (
                myRequests.map((req) => (
                  <div key={req.id} className="card flex items-center justify-between animate-slide-up hover:scale-[1.01] transition-transform">
                    <div className="flex items-center space-x-3">
                      <img
                        src={req.image || 'https://via.placeholder.com/40'}
                        alt={req.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{req.name}</p>
                        <p className="text-sm text-gray-500">{req.university}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      req.status === 'accepted'
                        ? 'bg-green-100 text-green-700'
                        : req.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {req.status === 'pending' && <Clock size={12} className="inline mr-1" />}
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'received' && (
            <div className="space-y-3 stagger-children">
              {requestsForMe.length === 0 ? (
                <div className="text-center py-12 text-gray-500 animate-fade-in">
                  <UserPlus className="mx-auto mb-2 text-gray-300" size={32} />
                  <p>No pending requests.</p>
                </div>
              ) : (
                requestsForMe.map((req) => (
                  <div key={req.id} className="card animate-slide-up hover:scale-[1.01] transition-transform">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={req.image || 'https://via.placeholder.com/40'}
                        alt={req.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{req.name}</p>
                        <p className="text-sm text-gray-500">{req.university} • {req.department}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRequest(req.id, 'accept')}
                        disabled={actionLoading === req.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        <CheckCircle size={16} />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRequest(req.id, 'reject')}
                        disabled={actionLoading === req.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="space-y-3 stagger-children">
              {myMatches.length === 0 ? (
                <div className="text-center py-12 text-gray-500 animate-fade-in">
                  <MessageCircle className="mx-auto mb-2 text-gray-300" size={32} />
                  <p>No matches yet. Send requests to connect!</p>
                </div>
              ) : (
                myMatches.map((match) => (
                  <Link
                    key={match.id}
                    to={`/chat/${match.id}`}
                    className="card flex items-center justify-between match-card"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={match.matchImage || 'https://via.placeholder.com/40'}
                        alt={match.matchName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{match.matchName}</p>
                        <p className="text-sm text-gray-500">{match.matchUniversity} • {match.matchDepartment} • {match.matchCourse}</p>
                        <p className="text-xs text-gray-400">{match.matchShift} Shift • Section {match.matchSection} • Semester {match.matchSemester}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      <MessageCircle size={18} />
                      <span className="text-sm font-medium">Chat</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
