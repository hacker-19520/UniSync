import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, MessageCircle, UserCheck, Mail, Trash2, Shield,
  Search, LayoutDashboard, Award, X, Eye, GraduationCap,
  Building2, BookOpen, Clock, Hash, CreditCard, Sparkles, FileText
} from 'lucide-react';

export default function AdminPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'pending', label: 'Pending Approvals', icon: UserCheck },
    { id: 'requests', label: 'Requests', icon: UserCheck },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
  ];

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: 'Bearer ' + token };
      const [statsRes, usersRes, requestsRes, messagesRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/requests', { headers }),
        fetch('/api/admin/messages', { headers }),
      ]);
      if (!statsRes.ok || !usersRes.ok || !requestsRes.ok || !messagesRes.ok) {
        throw new Error('One or more API requests failed.');
      }
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const requestsData = await requestsRes.json();
      const messagesData = await messagesRes.json();
      setStats(statsData);
      setUsers(usersData.users || []);
      setRequests(requestsData.requests || []);
      setMessages(messagesData.messageSummaries || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const res = await fetch('/api/admin/users/' + userId, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed');
      setUsers(users.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) setSelectedUser(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const verifyUser = async (userId) => {
    try {
      const res = await fetch('/api/admin/users/' + userId + '/verify', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed');
      setUsers(users.map((u) => (u.id === userId ? { ...u, isVerified: 1 } : u)));
    } catch (err) {
      alert(err.message);
    }
  };

  const approveUser = async (userId) => {
    try {
      const res = await fetch('/api/admin/users/' + userId + '/approve', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed');
      setUsers(users.map((u) => (u.id === userId ? { ...u, approvalStatus: 'approved' } : u)));
      if (selectedUser?.id === userId) setSelectedUser(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const rejectUser = async (userId, reason) => {
    try {
      const res = await fetch('/api/admin/users/' + userId + '/reject', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Failed');
      setUsers(users.map((u) => (u.id === userId ? { ...u, approvalStatus: 'rejected', rejectionReason: reason } : u)));
      if (selectedUser?.id === userId) setSelectedUser(null);
      setRejectionReason('');
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchConversationMessages = async (requestId) => {
    try {
      const headers = { Authorization: 'Bearer ' + token };
      const res = await fetch('/api/admin/messages/' + requestId, { headers });
      if (!res.ok) throw new Error('Failed to fetch messages: ' + res.status);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setConversationMessages(data.messages || []);
      setSelectedConversation(requestId);
    } catch (err) {
      alert('Error loading conversation: ' + (err.message || 'Unknown error'));
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.university || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingUsers = users.filter((u) => u.approvalStatus === 'pending' || !u.approvalStatus);

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">Admin privileges required.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-blue-600 font-semibold">Loading...</div>
      </div>
    );
  }

  const StatCard = ({ label, value, color, icon: Icon, onClick }) => {
    const colorMap = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', val: 'text-blue-800', icon: 'text-blue-400' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', val: 'text-green-800', icon: 'text-green-400' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', val: 'text-purple-800', icon: 'text-purple-400' },
      amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', val: 'text-amber-800', icon: 'text-amber-400' },
      red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', val: 'text-red-800', icon: 'text-red-400' },
    };
    const c = colorMap[color];
    return (
      <div className={'bg-white rounded-xl shadow-md p-6 ' + c.bg + ' ' + c.border + ' ' + (onClick ? 'cursor-pointer' : '')} onClick={onClick}>
        <div className="flex items-center justify-between">
          <div>
            <p className={'text-sm ' + c.text + ' font-medium'}>{label}</p>
            <p className={'text-3xl font-bold ' + c.val}>{value}</p>
          </div>
          <Icon className={c.icon} size={32} />
        </div>
      </div>
    );
  };

  const UserDetailModal = ({ user: u, onClose }) => {
    if (!u) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
            <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 rounded-full p-2">
              <X size={20} />
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden bg-white flex-shrink-0">
                {u.image ? (
                  <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{u.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{u.name}</h2>
                <p className="text-blue-200">{u.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + (u.isVerified ? 'bg-green-400 text-green-900' : 'bg-amber-400 text-amber-900')}>
                    {u.isVerified ? 'Verified' : 'Not Verified'}
                  </span>
                  <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + (u.approvalStatus === 'approved' ? 'bg-green-400 text-green-900' : u.approvalStatus === 'rejected' ? 'bg-red-400 text-red-900' : 'bg-amber-400 text-amber-900')}>
                    {u.approvalStatus || 'pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg"><Building2 className="text-blue-600" size={18} /></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">University</p><p className="text-gray-900 font-medium">{u.university || 'N/A'}</p></div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg"><GraduationCap className="text-purple-600" size={18} /></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Department</p><p className="text-gray-900 font-medium">{u.department || 'N/A'}</p></div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-lg"><BookOpen className="text-green-600" size={18} /></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Course</p><p className="text-gray-900 font-medium">{u.course || 'N/A'}</p></div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-amber-100 p-2 rounded-lg"><Hash className="text-amber-600" size={18} /></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Roll Number</p><p className="text-gray-900 font-medium">{u.rollNo || 'N/A'}</p></div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-rose-100 p-2 rounded-lg"><CreditCard className="text-rose-600" size={18} /></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">SAP ID</p><p className="text-gray-900 font-medium">{u.sapId || 'N/A'}</p></div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-cyan-100 p-2 rounded-lg"><Clock className="text-cyan-600" size={18} /></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Shift</p><p className="text-gray-900 font-medium">{u.shift || 'N/A'}</p></div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-100 p-2 rounded-lg"><Sparkles className="text-indigo-600" size={18} /></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Section</p><p className="text-gray-900 font-medium">{u.section || 'N/A'}</p></div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-orange-100 p-2 rounded-lg"><GraduationCap className="text-orange-600" size={18} /></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Semester</p><p className="text-gray-900 font-medium">{u.semester || 'N/A'}</p></div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-pink-100 p-2 rounded-lg"><Award className="text-pink-600" size={18} /></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Qualities</p><p className="text-gray-900 font-medium">{u.qualities || 'N/A'}</p></div>
              </div>
            </div>

            {u.reason && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FileText className="text-gray-500 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Reason for Joining</p>
                    <p className="text-gray-700 mt-1">{u.reason}</p>
                  </div>
                </div>
              </div>
            )}

            {(u.approvalStatus === 'pending' || !u.approvalStatus) && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rejection Reason <span className="text-red-500">*</span></label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection (required)..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows={3}
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => { approveUser(u.id); onClose(); }}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <UserCheck size={18} />
                    <span>Approve User</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!rejectionReason.trim()) {
                        alert('Rejection reason is required.');
                        return;
                      }
                      rejectUser(u.id, rejectionReason.trim());
                      onClose();
                    }}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Trash2 size={18} />
                    <span>Reject User</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const RequestDetailModal = ({ request: req, onClose }) => {
    if (!req) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white sticky top-0 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Connection Request #{req.id}</h2>
              <p className="text-blue-200 text-sm">Status: <span className="font-semibold">{req.status}</span> &bull; Sent: {new Date(req.createdAt).toLocaleDateString()}</p>
            </div>
            <button onClick={onClose} className="bg-white/20 rounded-full p-2">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <p className="text-xs uppercase font-bold text-blue-600 mb-4">Sender (From)</p>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-blue-600 overflow-hidden bg-white flex-shrink-0">
                  {req.senderImage ? (
                    <img src={req.senderImage} alt={req.senderName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{req.senderName?.charAt(0)?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{req.senderName}</h3>
                  <p className="text-gray-600 text-sm">{req.senderEmail}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div><p className="text-xs text-gray-500 uppercase font-semibold">University</p><p className="text-gray-900 font-medium">{req.senderUniversity}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-semibold">Department</p><p className="text-gray-900 font-medium">{req.senderDepartment}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-semibold">Course</p><p className="text-gray-900 font-medium">{req.senderCourse}</p></div>
                {req.senderSemester && <div><p className="text-xs text-gray-500 uppercase font-semibold">Semester</p><p className="text-gray-900 font-medium">{req.senderSemester}</p></div>}
                {req.senderRollNo && <div><p className="text-xs text-gray-500 uppercase font-semibold">Roll No</p><p className="text-gray-900 font-medium">{req.senderRollNo}</p></div>}
                {req.senderQualities && <div><p className="text-xs text-gray-500 uppercase font-semibold">Qualities</p><p className="text-gray-900 font-medium">{req.senderQualities}</p></div>}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <p className="text-xs uppercase font-bold text-green-600 mb-4">Receiver (To)</p>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-green-600 overflow-hidden bg-white flex-shrink-0">
                  {req.receiverImage ? (
                    <img src={req.receiverImage} alt={req.receiverName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{req.receiverName?.charAt(0)?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{req.receiverName}</h3>
                  <p className="text-gray-600 text-sm">{req.receiverEmail}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div><p className="text-xs text-gray-500 uppercase font-semibold">University</p><p className="text-gray-900 font-medium">{req.receiverUniversity}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-semibold">Department</p><p className="text-gray-900 font-medium">{req.receiverDepartment}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-semibold">Course</p><p className="text-gray-900 font-medium">{req.receiverCourse}</p></div>
                {req.receiverSemester && <div><p className="text-xs text-gray-500 uppercase font-semibold">Semester</p><p className="text-gray-900 font-medium">{req.receiverSemester}</p></div>}
                {req.receiverRollNo && <div><p className="text-xs text-gray-500 uppercase font-semibold">Roll No</p><p className="text-gray-900 font-medium">{req.receiverRollNo}</p></div>}
                {req.receiverQualities && <div><p className="text-xs text-gray-500 uppercase font-semibold">Qualities</p><p className="text-gray-900 font-medium">{req.receiverQualities}</p></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const ConversationModal = ({ conversation: conv, messages: msgs, onClose }) => {
    if (!conv) {
      return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-center">
            <p className="text-gray-600">Loading conversation details...</p>
          </div>
        </div>
      );
    }

    const senderName = conv.senderName || 'Unknown Sender';
    const receiverName = conv.receiverName || 'Unknown Receiver';
    const senderImage = conv.senderImage;
    const senderId = conv.senderId;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex items-center justify-between sticky top-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden flex-shrink-0">
                  {senderImage ? (
                    <img src={senderImage} alt={senderName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-400 flex items-center justify-center"><span className="text-sm font-bold">{senderName?.charAt(0)?.toUpperCase()}</span></div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{senderName}</p>
                  <p className="text-xs text-blue-200">with {receiverName}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="bg-white/20 rounded-full p-2 flex-shrink-0 ml-4">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {!msgs || msgs.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No messages in this conversation</p>
            ) : (
              msgs.map((msg) => {
                const isFromSender = msg.senderId === senderId;
                return (
                  <div key={msg.id} className={'flex ' + (isFromSender ? 'justify-start' : 'justify-end')}>
                    <div className={'max-w-xs px-4 py-3 rounded-lg shadow-sm ' + (isFromSender ? 'bg-blue-100 text-gray-900' : 'bg-gray-200 text-gray-900')}>
                      <p className="text-xs font-semibold mb-1 opacity-75">{msg.senderName || 'Unknown'}</p>
                      <p className="text-sm break-words">{msg.content}</p>
                      <p className="text-xs text-gray-500 mt-2 text-right">{new Date(msg.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Shield className="text-blue-600" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage users, requests, and messages</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ' + (activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200')}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {activeTab === 'overview' && stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={stats.totalUsers} color="blue" icon={Users} />
            <StatCard label="Verified Users" value={stats.verifiedUsers} color="green" icon={UserCheck} />
            <StatCard label="Pending Approvals" value={stats.pendingApprovals} color="amber" icon={Award} onClick={() => setActiveTab('pending')} />
            <StatCard label="Total Requests" value={stats.totalRequests} color="purple" icon={MessageCircle} />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700 font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">University</th>
                  <th className="px-4 py-3 text-left">Dept</th>
                  <th className="px-4 py-3 text-left">Sem</th>
                  <th className="px-4 py-3 text-left">Verified</th>
                  <th className="px-4 py-3 text-left">Approval</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">#{u.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.university}</td>
                    <td className="px-4 py-3 text-gray-600">{u.department}</td>
                    <td className="px-4 py-3 text-gray-600">{u.semester || '-'}</td>
                    <td className="px-4 py-3">{u.isVerified ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">{u.approvalStatus || 'pending'}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button onClick={() => setSelectedUser(u)} className="text-blue-600 hover:text-blue-800" title="View Details">
                          <Eye size={16} />
                        </button>
                        {!u.isVerified && (
                          <button onClick={() => verifyUser(u.id)} className="text-green-600 hover:text-green-800" title="Verify Email">
                            <Mail size={16} />
                          </button>
                        )}
                        {(u.approvalStatus === 'pending' || !u.approvalStatus) && (
                          <>
                            <button onClick={() => approveUser(u.id)} className="text-green-600 hover:text-green-800" title="Approve">
                              <UserCheck size={16} />
                            </button>
                            <button onClick={() => rejectUser(u.id, 'Rejected from list')} className="text-red-600 hover:text-red-800" title="Reject">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        <button onClick={() => deleteUser(u.id)} className="text-red-600 hover:text-red-800" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Pending Approvals ({pendingUsers.length})</h2>
            {pendingUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No pending approvals!</div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700 font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">University</th>
                      <th className="px-4 py-3 text-left">Sem</th>
                      <th className="px-4 py-3 text-left">Roll No</th>
                      <th className="px-4 py-3 text-left">SAP ID</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500">#{u.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                        <td className="px-4 py-3 text-gray-600">{u.university}</td>
                        <td className="px-4 py-3 text-gray-600">{u.semester || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{u.rollNo || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{u.sapId || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button onClick={() => setSelectedUser(u)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-semibold hover:bg-blue-200 flex items-center space-x-1">
                              <Eye size={14} />
                              <span>View</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Connection Requests ({requests.length})</h2>
            {requests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No requests yet</div>
            ) : (
              <div className="grid gap-4">
                {requests.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRequest(r)}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold text-gray-500">Request #{r.id}</span>
                      <div className="flex items-center space-x-2">
                        <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + (r.status === 'pending' ? 'bg-amber-100 text-amber-700' : r.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                          {r.status}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-xs uppercase font-bold text-blue-600 mb-3">From</p>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-200 flex-shrink-0">
                            {r.senderImage ? (
                              <img src={r.senderImage} alt={r.senderName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                                <span className="text-sm font-bold text-white">{r.senderName?.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{r.senderName}</p>
                            <p className="text-sm text-gray-600 truncate">{r.senderEmail}</p>
                            <p className="text-xs text-gray-500">{r.senderUniversity}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                        <p className="text-xs uppercase font-bold text-green-600 mb-3">To</p>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-green-200 flex-shrink-0">
                            {r.receiverImage ? (
                              <img src={r.receiverImage} alt={r.receiverName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                <span className="text-sm font-bold text-white">{r.receiverName?.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{r.receiverName}</p>
                            <p className="text-sm text-gray-600 truncate">{r.receiverEmail}</p>
                            <p className="text-xs text-gray-500">{r.receiverUniversity}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-3 text-center">Click to view full details</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Chat Conversations ({messages.length})</h2>
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No messages yet</div>
            ) : (
              <div className="grid gap-4">
                {messages.map((m) => (
                  <div
                    key={m.requestId}
                    onClick={() => fetchConversationMessages(m.requestId)}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-200 flex-shrink-0">
                          {m.senderImage ? (
                            <img src={m.senderImage} alt={m.senderName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{m.senderName?.charAt(0)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1">
                            <p className="font-semibold text-gray-900 truncate">{m.senderName}</p>
                            <span className="text-gray-500">{'->'}</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{m.senderEmail}</p>
                        </div>

                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-green-200 flex-shrink-0">
                            {m.receiverImage ? (
                              <img src={m.receiverImage} alt={m.receiverName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">{m.receiverName?.charAt(0)}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{m.receiverName}</p>
                            <p className="text-sm text-gray-600 truncate">{m.receiverEmail}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
                        <div className="text-right">
                          <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{m.messageCount} {m.messageCount === 1 ? 'msg' : 'msgs'}</span>
                          <p className="text-xs text-gray-500 mt-1">{new Date(m.lastMessageAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {selectedRequest && (
        <RequestDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
      )}

      {selectedConversation && (
        <ConversationModal 
          conversation={messages.find(m => m.requestId === selectedConversation)} 
          messages={conversationMessages} 
          onClose={() => { setSelectedConversation(null); setConversationMessages([]); }}
        />
      )}
    </div>
  );
}
