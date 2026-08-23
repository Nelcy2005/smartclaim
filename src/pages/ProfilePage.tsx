import React from 'react';
import { User, Mail, Shield, Calendar, LogOut, Sparkles, CheckCircle2, Lock, Fingerprint, Clock } from 'lucide-react';
import { NavigationPage, UserProfile } from '../types';

interface ProfilePageProps {
  user: UserProfile | null;
  onLogout: () => void;
  onNavigate: (page: NavigationPage) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout, onNavigate }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Account & Profile</h1>
        <p className="text-xs text-gray-500 mt-1">
          Authenticated user account details and Firestore document record (`users/{user?.uid || 'uid'}`).
        </p>
      </div>

      {/* User Information Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-gray-100">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.name || 'User photo'}
              className="h-20 w-20 rounded-2xl object-cover border border-gray-200"
            />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-blue-50 text-blue-700 font-bold text-2xl flex items-center justify-center border border-blue-200">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-bold text-gray-900">{user?.name || user?.displayName || 'Authenticated User'}</h2>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                {user?.role || 'Customer'}
              </span>
            </div>
            <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              <span>{user?.email || 'user@example.com'}</span>
            </p>
            <p className="text-[11px] text-gray-400">
              Account created on {user?.createdAt || 'Today'}
            </p>
          </div>
        </div>

        {/* Real Profile Fields */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Firestore User Record (`users/{user?.uid}`)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100 flex flex-col justify-between gap-1">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Fingerprint className="h-3.5 w-3.5 text-gray-400" /> User UID
              </span>
              <span className="font-mono text-[11px] text-gray-800 break-all">{user?.uid || 'Not signed in'}</span>
            </div>

            <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100 flex flex-col justify-between gap-1">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gray-400" /> Email Address
              </span>
              <span className="font-semibold text-gray-800">{user?.email || 'N/A'}</span>
            </div>

            <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100 flex flex-col justify-between gap-1">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" /> Account Created
              </span>
              <span className="font-semibold text-gray-800">{user?.createdAt || 'Today'}</span>
            </div>

            <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100 flex flex-col justify-between gap-1">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gray-400" /> Last Login
              </span>
              <span className="font-semibold text-gray-800">{user?.lastLogin || user?.createdAt || 'Just now'}</span>
            </div>
          </div>
        </div>

        {/* Security & Auth Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Authentication & Security
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
              <span className="text-gray-500">Sign-in Provider</span>
              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Google Authentication
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
              <span className="text-gray-500">Firestore Access Control</span>
              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-blue-600" /> User UID Filtered
              </span>
            </div>
          </div>
        </div>

        {/* Logout Action */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">Session active &bull; SmartClaim AI</span>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
