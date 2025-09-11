export interface ItangbaoAuthConfig {
  authUrl: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes?: string[];
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface UserInfoResponse {
  sub: string;
  name?: string;
  email?: string;
  image?: string;
  email_verified?: boolean;
  role?: string;
  created_at?: string;
}
