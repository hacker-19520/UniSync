import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, RefreshCw, ArrowRight, Eye } from 'lucide-react';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const name = location.state?.name || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mockOtp, setMockOtp] = useState('');
  const [autoSent, setAutoSent] = useState(false);

  const sendOtp = async (isAuto = false) => {
    if (!email) return;
    if (isAuto) setAutoSent(true);
    else setResendLoading(true);
    setError('');
    setMockOtp('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setSuccess(isAuto ? 'OTP sent! Check below.' : 'OTP resent successfully!');
      if (data.mockOtp) {
        setMockOtp(data.mockOtp);
        console.log(`[Demo OTP] Code for ${email}: ${data.mockOtp}`);
      }

      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      if (isAuto) setAutoSent(false);
      else setResendLoading(false);
    }
  };

  // Auto-send OTP when page loads
  useEffect(() => {
    if (email) {
      sendOtp(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const handleResend = () => sendOtp(false);

  const handleSkipVerify = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/skip-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Skip verification failed');
      setSuccess('Email verified (demo mode)! Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      setSuccess('Email verified successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="card text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Access</h2>
          <p className="text-gray-600 mb-4">Please sign up first to verify your email.</p>
          <button onClick={() => navigate('/signup')} className="btn-primary">
            Go to Signup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="card max-w-md w-full animate-scale-in">
        <div className="text-center mb-6 animate-slide-down">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
            <Mail className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-600 mt-1">
            We sent a 6-digit code to <span className="font-semibold">{email}</span>
          </p>
        </div>

        {/* Demo Mode Banner */}
        {mockOtp && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-4 mb-4 text-center shadow-sm animate-bounce-in">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Eye className="text-amber-600" size={18} />
              <p className="text-sm font-bold text-amber-800 uppercase tracking-wide">Demo Mode</p>
            </div>
            <p className="text-gray-700 text-sm mb-2">No real email is being sent.</p>
            <div className="bg-white rounded-lg py-2 px-4 inline-block">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Your OTP Code</p>
              <p className="text-3xl font-bold text-amber-600 tracking-[0.3em] font-mono">{mockOtp}</p>
            </div>
          </div>
        )}

        {autoSent && !mockOtp && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 inline-block mr-2"></div>
            <span className="text-blue-700 text-sm">Sending OTP...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-shake">
            <p className="font-medium">Error: {error}</p>
            <p className="text-sm mt-1">Make sure the backend server is running on port 3001.</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2 animate-bounce-in">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4 stagger-children">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
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
                <span>Verify Email</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center space-y-3 animate-slide-up">
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center space-x-1 mx-auto disabled:opacity-50 transition-all duration-200 hover:scale-105"
          >
            <RefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
            <span>{resendLoading ? 'Sending...' : 'Resend OTP'}</span>
          </button>

          {/* Skip Verification for Demo */}
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={handleSkipVerify}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 text-xs font-medium flex items-center justify-center space-x-1 mx-auto disabled:opacity-50 transition-all duration-200 hover:scale-105"
            >
              <span>Skip for Demo (auto-verify)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
