// packages/react/src/index.ts
// 完整的分层导出

// 第2层：React Hooks (核心)
export { useUserActions } from './hooks/useUserActions';
export { useUserInfo } from './hooks/useUserInfo';
export { useApiClient } from './hooks/useApiClient';

// 第3层：React Components
export { AuthProvider, useAuthContext } from './components/AuthProvider';
export { ProtectedRoute } from './components/ProtectedRoute';
export { LoginButton } from './components/LoginButton';
export { LogoutButton } from './components/LogoutButton';

// 类型重新导出
export type { 
  User, 
  AuthConfig, 
  ServerAuthConfig,
  AuthTokens,
  AuthResult 
} from 'itangbao-auth-types';