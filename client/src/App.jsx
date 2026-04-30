import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LeftSidebar from './components/LeftSidebar';
import CursorAnimation from './components/CursorAnimation';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import MatchesPage from './pages/MatchesPage';
import ChatsPage from './pages/ChatsPage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return token ? children : <Navigate to="/login" />;
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <LeftSidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CursorAnimation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<PrivateRoute><AppLayout><DashboardPage /></AppLayout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><AppLayout><ProfilePage /></AppLayout></PrivateRoute>} />
        <Route path="/matches" element={<PrivateRoute><AppLayout><MatchesPage /></AppLayout></PrivateRoute>} />
        <Route path="/chats" element={<PrivateRoute><AppLayout><ChatsPage /></AppLayout></PrivateRoute>} />
        <Route path="/chat/:requestId" element={<PrivateRoute><AppLayout><ChatPage /></AppLayout></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AppLayout><AdminPage /></AppLayout></PrivateRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
