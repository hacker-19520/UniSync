import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState({});
  const [mockOtp, setMockOtp] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStep1 = async (e) => {
    e.preventDefault();
    setError('');
    setErrorDetails({});
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.approvalStatus === 'pending') {
          throw new Error('pending_approval');
        }
        if (data.approvalStatus === 'rejected') {
          setErrorDetails({ 
            status: 'rejected', 
            reason: data.rejectionReason 
          });
          throw new Error('account_rejected');
        }
        throw new Error(data.error || 'Login failed');
      }

      if (data.mockOtp) setMockOtp(data.mockOtp);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: formData.otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="card max-w-md w-full animate-scale-in">
        <div className="text-center mb-6 animate-slide-down">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
            <LogIn className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-1">Login to your UniSync account</p>
        </div>

        {error && error === 'pending_approval' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg mb-4 p-4 animate-shake">
            <div className="flex items-start space-x-3">
              <Clock className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-amber-800 font-semibold">Waiting for Approval</p>
                <p className="text-amber-700 text-sm mt-1">
                  Your account is currently under review. Our team will accept or reject your request within <strong>24 hours</strong>.
                </p>
                <p className="text-amber-600 text-xs mt-2">
                  Please check back later or contact support if you have any questions.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && error === 'account_rejected' && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg mb-4 p-4 animate-shake">
            <div className="flex items-start space-x-3">
              <div className="text-red-600 flex-shrink-0 mt-0.5 font-bold text-xl">✕</div>
              <div className="w-full">
                <p className="text-red-800 font-bold text-base">Account Rejected</p>
                <div className="bg-red-100 rounded p-3 mt-2 mb-3 border-l-4 border-red-600">
                  <p className="text-red-700 text-sm font-semibold">Reason:</p>
                  <p className="text-red-600 text-sm mt-1">{errorDetails.reason || 'No reason provided'}</p>
                </div>
                <p className="text-red-700 text-sm mb-2">
                  ⚠️ <strong>Please correct the issues mentioned above and sign up again with accurate information.</strong>
                </p>
                <Link 
                  to="/signup" 
                  className="inline-block mt-3 text-red-600 hover:text-red-700 font-semibold text-sm underline"
                >
                  ← Go back to Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}

        {error && error !== 'pending_approval' && error !== 'account_rejected' && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-shake">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1} className="space-y-4 stagger-children">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="input-field pl-10" placeholder="john@university.edu" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="input-field pl-10" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center space-x-2 disabled:opacity-50">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2} className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <CheckCircle className="text-blue-600 mx-auto mb-2" size={32} />
              <p className="text-blue-800 font-medium">Check your email!</p>
              <p className="text-blue-600 text-sm">We sent a 6-digit code to {formData.email}</p>
            </div>

            {mockOtp && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Demo Mode:</span> Your OTP is <span className="font-bold text-lg">{mockOtp}</span>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
              <input
                type="text"
                name="otp"
                maxLength={6}
                value={formData.otp}
                onChange={handleChange}
                className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="______"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center space-x-2 disabled:opacity-50">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify & Login</span>
                  <LogIn size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-gray-500 hover:text-gray-700 text-sm py-2"
            >
              Back to login
            </button>
          </form>
        )}

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

