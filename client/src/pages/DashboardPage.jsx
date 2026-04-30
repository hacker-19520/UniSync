import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Users, MessageCircle, UserCheck, Clock, ArrowRight, Heart } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ matches: 0, sentRequests: 0, receivedRequests: 0 });
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('unisync_token');
      
      const [matchesRes, sentRes, receivedRes] = await Promise.all([
        fetch('/api/match/my-matches', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/match/my-requests', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/match/requests-for-me', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const matchesData = matchesRes.ok ? await matchesRes.json() : { matches: [] };
      const sentData = sentRes.ok ? await sentRes.json() : { requests: [] };
      const receivedData = receivedRes.ok ? await receivedRes.json() : { requests: [] };

      setStats({
        matches: matchesData.matches?.length || 0,
        sentRequests: sentData.requests?.length || 0,
        receivedRequests: receivedData.requests?.length || 0,
      });

      setRecentMatches(matchesData.matches?.slice(0, 3) || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-down">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
        <p className="text-gray-600">Here's what's happening in your UniSync network.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        <div className="card bg-blue-50 border border-blue-100 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">My Matches</p>
              <p className="text-3xl font-bold text-blue-900">{stats.matches}</p>
            </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Heart className="text-blue-600" size={24} />
              </div>

          </div>
        </div>

        <div className="card bg-green-50 border border-green-100 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Requests Sent</p>
              <p className="text-3xl font-bold text-green-900">{stats.sentRequests}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card bg-purple-50 border border-purple-100 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Requests Received</p>
              <p className="text-3xl font-bold text-purple-900">{stats.receivedRequests}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card animate-scale-in">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 gap-4 stagger-children">
          <Link to="/matches" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Find Matches</p>
                <p className="text-sm text-gray-500">Discover students like you</p>
              </div>
            </div>
            <ArrowRight className="text-gray-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" size={18} />
          </Link>

          <Link to="/profile" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-green-50 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                <UserCheck className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Update Profile</p>
                <p className="text-sm text-gray-500">Improve your chances</p>
              </div>
            </div>
            <ArrowRight className="text-gray-400 group-hover:text-green-600 transition-transform group-hover:translate-x-1" size={18} />
          </Link>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="card animate-scale-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Matches</h2>
          <Link to="/matches" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</Link>
        </div>

        {recentMatches.length === 0 ? (
          <div className="text-center py-8 text-gray-500 animate-fade-in">
            <MessageCircle className="mx-auto mb-2 text-gray-300" size={32} />
            <p>No matches yet. Start by finding students!</p>
            <Link to="/matches" className="btn-primary inline-block mt-4">Find Matches</Link>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {recentMatches.map((match) => (
              <Link
                key={match.id}
                to={`/chat/${match.id}`}
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-all duration-300 hover:scale-[1.01]"
              >
                <img
                  src={match.matchImage || 'https://via.placeholder.com/40'}
                  alt={match.matchName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{match.matchName}</p>
                  <p className="text-sm text-gray-500">{match.matchUniversity}</p>
                </div>
                <MessageCircle className="text-blue-600" size={18} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
