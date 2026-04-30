import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Building, GraduationCap, BookOpen, Heart, Sparkles, Edit2, Save, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('unisync_token');
      const res = await fetch('/api/profile/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setFormData(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('unisync_token');
      const res = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage('Profile updated successfully!');
        setProfile(formData);
        setEditMode(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) return null;

  const reasonLabels = {
    'study duo': 'Find a Study Duo',
    'friends': 'Make Friends',
    'others': 'Others',
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="card animate-scale-in">
        <div className="flex items-center justify-between mb-6 animate-slide-down">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={() => editMode ? handleSave() : setEditMode(true)}
            disabled={saving}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
              editMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {editMode ? (
              <>
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </>
            ) : (
              <>
                <Edit2 size={16} />
                <span>Edit</span>
              </>
            )}
          </button>
        </div>

        {message && (
          <div className={`px-4 py-3 rounded-lg mb-4 animate-bounce-in ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Profile Image */}
        <div className="flex justify-center mb-6 animate-scale-in">
          <div className="relative group">
            <img
              src={profile.image || 'https://via.placeholder.com/120'}
              alt={profile.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-100 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
            />
            {editMode && (
              <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-all duration-200 hover:scale-110">
                <Camera size={16} />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 stagger-children">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
              {editMode ? (
                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="input-field" />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <User size={16} className="text-gray-400" />
                  <span className="font-medium">{profile.name}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <div className="flex items-center space-x-2 text-gray-900">
                <Mail size={16} className="text-gray-400" />
                <span>{profile.email}</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">University</label>
              {editMode ? (
                <input type="text" name="university" value={formData.university || ''} onChange={handleChange} className="input-field" />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <Building size={16} className="text-gray-400" />
                  <span>{profile.university}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
              {editMode ? (
                <input type="text" name="department" value={formData.department || ''} onChange={handleChange} className="input-field" />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <GraduationCap size={16} className="text-gray-400" />
                  <span>{profile.department}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Roll Number</label>
              {editMode ? (
                <input type="text" name="rollNo" value={formData.rollNo || ''} onChange={handleChange} className="input-field" />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <span className="text-gray-400 font-mono text-xs">#</span>
                  <span>{profile.rollNo || 'N/A'}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">SAP ID</label>
              {editMode ? (
                <input type="text" name="sapId" value={formData.sapId || ''} onChange={handleChange} className="input-field" />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <span className="text-gray-400 font-mono text-xs">ID</span>
                  <span>{profile.sapId || 'N/A'}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Course/Program</label>
              {editMode ? (
                <input type="text" name="course" value={formData.course || ''} onChange={handleChange} className="input-field" />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <BookOpen size={16} className="text-gray-400" />
                  <span>{profile.course}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Shift</label>
              {editMode ? (
                <input type="text" name="shift" value={formData.shift || ''} onChange={handleChange} className="input-field" />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <span className="text-gray-400 text-xs">◷</span>
                  <span>{profile.shift || 'N/A'}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Section</label>
              {editMode ? (
                <input type="text" name="section" value={formData.section || ''} onChange={handleChange} className="input-field" />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <span className="text-gray-400 text-xs">§</span>
                  <span>{profile.section || 'N/A'}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Semester</label>
              {editMode ? (
                <input type="text" name="semester" value={formData.semester || ''} onChange={handleChange} className="input-field" />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <span className="text-gray-400 text-xs">◈</span>
                  <span>{profile.semester || 'N/A'}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Reason to Join</label>
            {editMode ? (
              <select name="reason" value={formData.reason || ''} onChange={handleChange} className="input-field">
                <option value="study duo">Find a Study Duo</option>
                <option value="friends">Make Friends</option>
                <option value="others">Others</option>
              </select>
            ) : (
              <div className="flex items-center space-x-2 text-gray-900">
                <Heart size={16} className="text-rose-400" />
                <span>{reasonLabels[profile.reason] || profile.reason}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Qualities & Niche</label>
            {editMode ? (
              <textarea name="qualities" rows={3} value={formData.qualities || ''} onChange={handleChange} className="input-field" />
            ) : (
              <div className="flex items-start space-x-2 text-gray-900">
                <Sparkles size={16} className="text-amber-400 mt-1" />
                <p>{profile.qualities || 'No qualities added yet.'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
