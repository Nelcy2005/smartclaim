import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  FileCheck2,
  Receipt,
  Cpu,
  User,
  Shield,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { NavigationPage, UserProfile } from '../../types';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  user: UserProfile | null;
  onLogout: () => void;
  activeClaimsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  user,
  onLogout,
  activeClaimsCount = 0,
}) => {
  const isReviewerOrAdmin = user?.role === 'admin' || user?.role === 'reviewer';

  const navItems: { id: NavigationPage; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'submit-claim', label: 'Submit Claim', icon: PlusCircle },
    { id: 'my-claims', label: 'My Claims', icon: FileCheck2, badge: activeClaimsCount },
    { id: 'refunds', label: 'Refunds', icon: Receipt },
    { id: 'ai-analysis', label: 'AI Analysis', icon: Cpu },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (isReviewerOrAdmin) {
    navItems.push({
      id: 'admin',
      label: user?.role === 'admin' ? 'Admin Console' : 'Reviewer Queue',
      icon: Shield,
    });
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-gray-200 bg-white min-h-screen select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-left group focus:outline-none cursor-pointer"
        >
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white transition-colors">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight leading-none">
              SmartClaim <span className="text-gray-400 font-normal">AI</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide mt-1">
              Verify. Resolve. Refund.
            </p>
          </div>
        </button>
      </div>

      {/* Quick Action CTA */}
      <div className="p-4">
        <button
          id="sidebar-new-claim-btn"
          type="button"
          onClick={() => onNavigate('submit-claim')}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Submit a Claim</span>
        </button>
      </div>

      {/* Main Nav Links */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        <div className="px-3 pb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const isAdmin = item.id === 'admin';
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : isAdmin
                  ? 'text-indigo-600 hover:bg-indigo-50 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-blue-600' : isAdmin ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile & Logout footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
        {user ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200">
            <div
              className="flex items-center gap-2.5 min-w-0 cursor-pointer"
              onClick={() => onNavigate('profile')}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 font-semibold text-xs flex items-center justify-center border border-gray-200">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 truncate">{user.name || 'User'}</p>
                <p className="text-[11px] text-gray-400 truncate capitalize">{user.role}</p>
              </div>
            </div>
            <button
              id="sidebar-logout-btn"
              type="button"
              onClick={onLogout}
              title="Logout"
              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="w-full py-2 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Sign In with Google
          </button>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
