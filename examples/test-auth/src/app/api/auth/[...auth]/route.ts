// app/api/auth/[...auth]/route.ts
import { createNextJSAuthHandler, createAuthConfig } from 'itangbao-auth-react/server';

const handler = createNextJSAuthHandler(
  createAuthConfig({
    authServiceUrl: process.env.AUTH_SERVICE_URL!,
    clientId: process.env.AUTH_CLIENT_ID!,
    clientSecret: process.env.AUTH_CLIENT_SECRET!,
    appUrl: process.env.APP_URL!,
  })
);

export { handler as GET, handler as POST };
