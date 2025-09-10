// @itangbao-auth/react/src/UserDropdown.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthProvider';

interface UserDropdownItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  divider?: boolean; // 是否在此项后显示分割线
}

interface UserDropdownProps {
  className?: string;
  avatarClassName?: string;
  dropdownClassName?: string;
  placement?: 'bottom-left' | 'bottom-right';
  items?: UserDropdownItem[]; // 自定义菜单项
  showDefaultItems?: boolean; // 是否显示默认的用户资料和退出登录
  onProfileClick?: () => void;
  onLogoutClick?: () => void;
  fallbackAvatar?: React.ReactNode;
}

export function UserDropdown({
  className = '',
  avatarClassName = '',
  dropdownClassName = '',
  placement = 'bottom-right',
  items = [],
  showDefaultItems = true,
  onProfileClick,
  onLogoutClick,
  fallbackAvatar
}: UserDropdownProps) {
  const { user, logout, isAuthenticated, getProfileUrl } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 如果用户未登录，不显示下拉菜单
  if (!isAuthenticated || !user) {
    return null;
  }

  // 获取用户名首字母
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  // 默认菜单项
  const defaultItems: UserDropdownItem[] = [
    {
      key: 'profile',
      label: '用户资料',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      onClick: onProfileClick || (async () => {
        // 默认跳转到用户资料页面
        const profileUrl = await getProfileUrl() || "/profile";
        window.location.href = profileUrl;
      })
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      onClick: onLogoutClick || logout,
      className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
      divider: true
    }
  ];

  // 合并自定义菜单项和默认菜单项
  const allItems = showDefaultItems 
    ? [...items, ...(items.length > 0 ? [{ key: 'divider-before-default', label: '', divider: true } as UserDropdownItem] : []), ...defaultItems]
    : items;

  const handleItemClick = (item: UserDropdownItem) => {
    if (!item.disabled && item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 用户头像按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 
          transition-colors duration-200 focus:outline-none focus:ring-2 
          focus:ring-blue-500 focus:ring-offset-2 ${avatarClassName}
        `}
      >
        {/* 头像 */}
        <div className="relative">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : fallbackAvatar ? (
            fallbackAvatar
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              {getInitials(user.name || 'User')}
            </div>
          )}
          
          {/* 在线状态指示器 */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
        </div>

        {/* 用户名（可选） */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">
            {user.name || 'User'}
          </div>
          <div className="text-xs text-gray-500 truncate max-w-32">
            {user.email}
          </div>
        </div>

        {/* 下拉箭头 */}
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className={`
          absolute z-50 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 
          py-2 ${placement === 'bottom-left' ? 'left-0' : 'right-0'} 
          animate-in fade-in slide-in-from-top-2 duration-200 ${dropdownClassName}
        `}>
          {/* 用户信息头部 */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {getInitials(user.name || 'User')}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.name || 'User'}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          {/* 菜单项 */}
          <div className="py-1">
            {allItems.map((item, index) => {
              if (item.divider && !item.label) {
                return <div key={item.key || index} className="my-1 border-t border-gray-100" />;
              }

              return (
                <React.Fragment key={item.key || index}>
                  <button
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    className={`
                      w-full flex items-center px-4 py-2 text-sm text-left
                      hover:bg-gray-50 transition-colors duration-150
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${item.className || 'text-gray-700 hover:text-gray-900'}
                    `}
                  >
                    {item.icon && (
                      <span className="mr-3 flex-shrink-0">
                        {item.icon}
                      </span>
                    )}
                    <span className="flex-1">{item.label}</span>
                  </button>
                  {item.divider && <div className="my-1 border-t border-gray-100" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
