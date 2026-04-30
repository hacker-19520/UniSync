import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, MessageCircle, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LeftSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/matches', label: 'Find Matches', icon: Users },
    { path: '/chats', label: 'My Chats', icon: MessageCircle },
    { path: '/profile', label: 'My Profile', icon: User },
    ...(user?.isAdmin ? [{ path: '/admin', label: 'Admin Panel', icon: Shield }] : []),
  ];

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-1">Pro Tip</h4>
            <p className="text-xs text-blue-600">
              Complete your profile with your qualities to get better matches!
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
