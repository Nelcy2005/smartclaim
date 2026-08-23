import React from 'react';
import { Menu, Shield, UserCheck, Scale, Sparkles } from 'lucide-react';
import { NavigationPage, UserProfile } from '../../types';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  currentPage: NavigationPage;
  onOpenMobileMenu: () => void;
  user: UserProfile | null;
  onToggleRole: () => void;
  onNavigate: (page: NavigationPage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onOpenMobileMenu,
  user,
  onToggleRole,
  onNavigate,
}) => {
  const getPageTitle = (page: NavigationPage) => {
    switch (page) {
      case 'home':
        return 'Dashboard';
      case 'orders':
        return 'My Orders';
      case 'submit-claim':
        return 'Submit Claim';
      case 'my-claims':
        return 'My Claims';
      case 'refunds':
        return 'Refunds';
      case 'ai-analysis':
        return 'AI Analysis';
      case 'profile':
        return 'Profile';
      case 'admin':
        return 'Admin & Reviewer Console';
      case 'claim-result':
        return 'Claim Assessment';
      default:
        return 'SmartClaim AI';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-8">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          id="mobile-menu-trigger"
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-600 hidden sm:inline">
            SmartClaim AI
          </span>
          <span className="text-gray-300 hidden sm:inline">/</span>
          <div id="breadcrumb" className="text-xs sm:text-sm font-medium text-gray-500">
            {getPageTitle(currentPage)}
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Role toggle switcher for testing and evaluator demonstration */}
        {user && (
          <button
            id="role-switch-btn"
            type="button"
            onClick={onToggleRole}
            title="Click to cycle role between Customer, Reviewer, and Admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer shadow-2xs"
          >
            {user.role === 'admin' ? (
              <>
                <Shield className="h-3.5 w-3.5 text-red-600" />
                <span>Role: <strong className="text-red-700">Admin</strong></span>
              </>
            ) : user.role === 'reviewer' ? (
              <>
                <Scale className="h-3.5 w-3.5 text-blue-600" />
                <span>Role: <strong className="text-blue-700">Reviewer</strong></span>
              </>
            ) : (
              <>
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Role: <strong className="text-emerald-700">Customer</strong></span>
              </>
            )}
          </button>
        )}

        {/* Live Firestore Notifications Dropdown */}
        <NotificationDropdown
          userId={user?.uid || null}
          onNavigate={onNavigate}
        />

        {/* User profile avatar link */}
        {user && (
          <button
            id="navbar-profile-avatar-btn"
            type="button"
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-lg border border-gray-200 hover:border-gray-300 bg-white transition-all cursor-pointer shadow-2xs"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-gray-100 text-gray-700 font-semibold text-[10px] flex items-center justify-center">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <span className="hidden md:inline-block text-xs font-medium text-gray-700 max-w-[100px] truncate">
              {user.name || 'User'}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
export default Navbar;
