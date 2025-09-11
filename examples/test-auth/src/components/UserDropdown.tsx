// app/components/UserDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useUserActions, useUserInfo } from 'itangbao-auth-react';

export function UserDropdown() {
  const { handleLogout, handleProfile } = useUserActions();
  const { isAuthenticated, userInfo } = useUserInfo();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  console.log('userInfo', userInfo);
  if (!isAuthenticated || !userInfo) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 头像按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {userInfo.image ? (
          <img
            src={userInfo.image}
            alt={userInfo.name}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-medium flex items-center justify-center">
            {userInfo.initials}
          </div>
        )}
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
          {/* 用户信息 */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {userInfo.image ? (
                <img
                  src={userInfo.image}
                  alt={userInfo.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-medium flex items-center justify-center">
                   {userInfo.initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {userInfo.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {userInfo.email}
                </div>
              </div>
            </div>
          </div>

          {/* 菜单项 */}
          <div className="py-1">
            <button
              onClick={async () => {
                handleProfile();

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
                handleLogout();
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
