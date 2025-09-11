// app/components/UserDropdown.tsx
'use client';

import { useAuth } from 'itangbao-auth-react';
import { useState, useRef, useEffect } from 'react';

export function UserDropdown() {
    const { isAuthenticated, user, logout, getProfileUrl } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    if (!name) {
      return 'U';
    }
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 头像按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-medium flex items-center justify-center">
            {getInitials(user.name || 'User')}
          </div>
        )}
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
          {/* 用户信息 */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-medium flex items-center justify-center">
                   {getInitials(user.name || 'User')}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          {/* 菜单项 */}
          <div className="py-1">
            <button
              onClick={async () => {
                const profileUrl = await getProfileUrl();
                window.location.href = profileUrl || "/profile";

                setIsOpen(false);
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
            >
              <svg className="mr-3 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              用户资料
            </button>

            <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-left text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-150"
            >
              <svg className="mr-3 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
