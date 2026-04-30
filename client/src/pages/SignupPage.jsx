import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Upload, Eye, EyeOff, GraduationCap, BookOpen, Building, Hash, CreditCard, Clock, Users } from 'lucide-react';
import WarningNote from '../components/WarningNote';

const universities = [
  'Emerson University Multan',
  
];

const departments = [
  'Computing and Emerging Technologies',
  'Business Administration',
  'Engineering',
  'Natural Sciences',
  'Social Sciences',
  'Humanities',
  'Health Sciences',
  'Law',
  'Education',
];

const departmentCourses = {
  'Computing and Emerging Technologies': ['CS', 'SE', 'AI', 'DS', 'Cyber Security', 'IT'],
  'Business Administration': ['BBA', 'MBA', 'BS Accounting', 'BS Finance'],
  'Engineering': ['Mechanical', 'Electrical', 'Civil', 'Chemical'],
  'Natural Sciences': ['Physics', 'Chemistry', 'Biology', 'Mathematics'],
  'Social Sciences': ['Psychology', 'Sociology', 'Political Science', 'Economics'],
  'Humanities': ['English', 'History', 'Philosophy', 'Urdu'],
  'Health Sciences': ['Medicine', 'Nursing', 'Pharmacy', 'DPT'],
  'Law': ['LLB'],
  'Education': ['B.Ed', 'M.Ed'],
};

const shifts = ['Morning', 'Evening'];
const sections = ['A', 'B', 'C', 'D', 'E'];
const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNo: '',
    sapId: '',
    university: '',
    department: '',
    course: '',
    shift: '',
    section: '',
    semester: '',
    image: '',
    reason: 'study duo',
    qualities: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'department') {
      setFormData((prev) => ({ ...prev, department: value, course: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!formData.image) {
      setError('Profile image is required. Please upload your photo.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          rollNo: formData.rollNo,
          sapId: formData.sapId,
          university: formData.university,
          department: formData.department,
          course: formData.course,
          shift: formData.shift,
          section: formData.section,
          semester: formData.semester,
          image: formData.image,
          reason: formData.reason,
          qualities: formData.qualities,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      navigate('/verify-email', { state: { email: formData.email, name: formData.name } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-blue-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Join UniSync</h1>
            <p className="text-gray-600 mt-1">Create your account to find your university duo</p>
          </div>

          <WarningNote />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PERSONAL INFO */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-4">
              <h2 className="text-lg font-bold text-blue-800 flex items-center">
                <Users className="mr-2" size={20} />
                Personal Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="input-field" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="input-field" placeholder="john@university.edu" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name="password" required value={formData.password} onChange={handleChange} className="input-field pr-10" placeholder="password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <input type={showPassword ? 'text' : 'password'} name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="input-field" placeholder="password" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image * <span className="text-red-500 font-bold">(Required)</span></label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${formData.image ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-24 h-24 rounded-full object-cover mb-2 border-4 border-green-200" />
                    ) : (
                      <Upload className="text-red-400 mb-2" size={32} />
                    )}
                    <span className={`text-sm font-medium ${formData.image ? 'text-green-700' : 'text-red-600'}`}>
                      {formData.image ? '✓ Image Uploaded - Click to change' : '⚠ Click to upload your profile picture (Required)'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* UNIVERSITY INFO */}
            <div className="bg-amber-50 rounded-lg p-4 space-y-4">
              <h2 className="text-lg font-bold text-amber-800 flex items-center">
                <Building className="mr-2" size={20} />
                University Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">University *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select name="university" required value={formData.university} onChange={handleChange} className="input-field pl-10">
                      <option value="">Select University</option>
                      {universities.map((u) => (<option key={u} value={u}>{u}</option>))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number *</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" name="rollNo" required value={formData.rollNo} onChange={handleChange} className="input-field pl-10" placeholder="e.g. 2021-CS-001" />
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SAP ID</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" name="sapId" value={formData.sapId} onChange={handleChange} className="input-field pl-10" placeholder="e.g. 12345" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select name="department" required value={formData.department} onChange={handleChange} className="input-field pl-10">
                      <option value="">Select Department</option>
                      {departments.map((d) => (<option key={d} value={d}>{d}</option>))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select name="course" required value={formData.course} onChange={handleChange} className="input-field pl-10" disabled={!formData.department}>
                      <option value="">{formData.department ? 'Select Course' : 'Select Department First'}</option>
                      {formData.department && departmentCourses[formData.department]?.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shift *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select name="shift" required value={formData.shift} onChange={handleChange} className="input-field pl-10">
                      <option value="">Select Shift</option>
                      {shifts.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                  <select name="section" required value={formData.section} onChange={handleChange} className="input-field">
                    <option value="">Select Section</option>
                    {sections.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                  <select name="semester" required value={formData.semester} onChange={handleChange} className="input-field">
                    <option value="">Select Semester</option>
                    {semesters.map((s) => (<option key={s} value={s}>Semester {s}</option>))}
                  </select>
                </div>
              </div>
            </div>

            {/* ADDITIONAL INFO */}
            <div className="bg-purple-50 rounded-lg p-4 space-y-4">
              <h2 className="text-lg font-bold text-purple-800 flex items-center">
                <GraduationCap className="mr-2" size={20} />
                Additional Information
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason to Join *</label>
                <select name="reason" required value={formData.reason} onChange={handleChange} className="input-field">
                  <option value="study duo">Find a Study Duo</option>
                  <option value="friends">Make Friends</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Qualities & Niche</label>
                <textarea name="qualities" rows={3} value={formData.qualities} onChange={handleChange} className="input-field" placeholder="Describe your qualities, skills, interests..." />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center space-x-2 disabled:opacity-50 text-lg">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
