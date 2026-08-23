import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Clock, FileCheck2, AlertCircle, Info, Sparkles, X } from 'lucide-react';
import { InAppNotification, NavigationPage } from '../../types';
import {
  subscribeUserNotifications,
  markNotificationRead,
} from '../../services/firestoreService';

interface NotificationDropdownProps {
  userId: string | null;
  onNavigate: (page: NavigationPage) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  userId,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    const unsubscribe = subscribeUserNotifications(userId, (notifs) => {
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [userId]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notif: InAppNotification) => {
    if (!notif.read && notif.id) {
      await markNotificationRead(notif.id);
    }
    setIsOpen(false);
    if (notif.title.toLowerCase().includes('refund')) {
      onNavigate('refunds');
    } else {
      onNavigate('my-claims');
    }
  };

  const handleMarkAllRead = async () => {
    for (const notif of notifications) {
      if (!notif.read && notif.id) {
        await markNotificationRead(notif.id);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="navbar-notifications-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">No notifications yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Updates on claim verdicts and refunds will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-gray-50/80 transition-colors cursor-pointer ${
                    !notif.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {notif.type === 'success' ? (
                      <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    ) : notif.type === 'warning' ? (
                      <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                        <AlertCircle className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Info className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onNavigate('my-claims');
              }}
              className="text-[11px] font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              View all claim activities &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
