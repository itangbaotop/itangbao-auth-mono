import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string
  }
}

interface handleTokenParams {
  grant_type: string
  code?: string
  redirect_uri?: string
  client_id?: string
  client_secret?: string
  code_verifier?: string
  refresh_token?: string
  scope?: string
}

interface ProfileContentProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
  };
  userAccounts: Array<{
    provider: string;
    type: string;
    providerAccountId: string | null;
  }>;
}


interface SignOutMessage {
  token?: {
    sub?: string;
  };
  session?: {
    user?: {
      id?: string;
    };
  };
}