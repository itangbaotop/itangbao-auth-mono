### userdropDown 
#### 基础使用
```jsx
// 在认证服务的header中使用
import { UserDropdown } from '@itangbao-auth/react';

function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左侧 Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">认证中心</h1>
          </div>

          {/* 右侧用户下拉菜单 */}
          <div className="flex items-center space-x-4">
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
```

#### 自定义菜单项
```jsx
import { UserDropdown } from '@itangbao-auth/react';

function Header() {
  const customItems = [
    {
      key: 'settings',
      label: '系统设置',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      onClick: () => {
        window.location.href = '/admin/settings';
      }
    },
    {
      key: 'help',
      label: '帮助中心',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: () => {
        window.open('https://docs.example.com', '_blank');
      },
      divider: true // 在此项后显示分割线
    }
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">认证中心</h1>
          </div>

          <div className="flex items-center space-x-4">
            <UserDropdown 
              items={customItems}
              onProfileClick={() => {
                window.location.href = '/profile';
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
```
#### 只显示自定义菜单项
```jsx
<UserDropdown 
  items={customItems}
  showDefaultItems={false} // 不显示默认的用户资料和退出登录
/>

```
#### 自定义样式
```jsx
<UserDropdown 
  className="ml-4"
  avatarClassName="hover:bg-blue-50"
  dropdownClassName="border-blue-200"
  placement="bottom-left"
  fallbackAvatar={
    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">
      A
    </div>
  }
/>
```

