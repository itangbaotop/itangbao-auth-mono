// lib/auth-service.ts
interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  user: any;
}

export class AuthService {
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL!;
    this.clientId = process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!;
    this.clientSecret = process.env.AUTH_CLIENT_SECRET!;
  }

  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<AuthTokens> {
    const response = await fetch(`${this.baseUrl}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'unknown_error' }));
      throw new Error(`Token exchange failed: ${error.error || response.statusText}`);
    }

    return response.json();
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const response = await fetch(`${this.baseUrl}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'unknown_error' }));
      throw new Error(`Token refresh failed: ${error.error || response.statusText}`);
    }

    return response.json();
  }

  async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/user/info`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  async verifyToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/verify`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async logout(accessToken: string, refreshToken?: string, userId?: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: this.clientId,
          client_id: this.clientId,
        }),
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    }
  }
}
