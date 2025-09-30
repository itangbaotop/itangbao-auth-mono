// src/lib/auth/config.ts
import NextAuth, { User } from "next-auth";
import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "../db";
import { accounts, refreshTokens, users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { D1Adapter } from "@auth/d1-adapter";
import { nanoid } from "nanoid";
import { hashPassword } from "../utils/password";
import { JWT } from "next-auth/jwt";


// 读取 Cloudflare Env，计算哪些能力启用
function getAuthFlags(env: Record<string, unknown>) {
  return {
    enableMagicLink: (env.ENABLE_MAGIC_LINK as string | undefined) !== "false",
    enableGoogleLogin: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    enableGithubLogin: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
  } as const;
}

type AuthConfigWithoutProviders = Omit<NextAuthConfig, 'providers'>;

// 基础配置（不在顶层访问 env），providers 将在工厂函数中动态生成
export const authConfig: AuthConfigWithoutProviders = {
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request", // 魔法链接发送后的页面
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as User).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as User).id = token.sub!;
        (session.user as User).role = token.role as string;
      }
      return session;
    },
    // ❌ 移除这个 - NextAuth v5 中不支持 signOut callback
    // async signOut({ token }) {
    //   // ...
    // },
    async signIn({ user, account }) {
      if (
        account?.provider === "admin-credentials" ||
        account?.provider === "google-one-tap-credentials"
      ) {
        return true;
      }

      const { env } = await getCloudflareContext();
      const db = getDb((env).DB);
      const flags = getAuthFlags(env as unknown as Record<string, unknown>);

      // 检查用户是否已存在
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, (user as User).email!))
        .limit(1);

      if (existingUser[0]) {
        // 用户存在，检查账户链接
        console.log("User exists, checking account link");

        if (account?.provider === "google" || account?.provider === "github") {
          // 检查是否已经有该 provider 的账户链接
          const existingAccount = await db
            .select()
            .from(accounts)
            .where(
              and(
                eq(accounts.userId, existingUser[0].id),
                eq(accounts.provider, account.provider),
                eq(accounts.providerAccountId, account.providerAccountId)
              )
            )
            .limit(1);

          console.log(
            "Existing account link:",
            existingAccount.length > 0 ? "Found" : "Not found"
          );

          if (!existingAccount[0]) {
            console.log("Account link will be created by adapter");
          }
        }

        // 设置用户角色
        (user as User).role = existingUser[0].role as string;
        (user as User).id = existingUser[0].id; // 重要：设置用户ID

        if (account?.provider === "email" && !existingUser[0].emailVerified) {
          await db
            .update(users)
            .set({ emailVerified: new Date() })
            .where(eq(users.id, existingUser[0].id));
        }

        return true;
      } else {
        // 用户不存在，创建新用户
        console.log("User does not exist, will be created");

        if (account?.provider === "github" || account?.provider === "google") {
          (user as User).role = "user";
          // 让 NextAuth adapter 来创建用户和账户链接
          return true;
        } else if (account?.provider === "email" && flags.enableMagicLink) {
          try {
            await db
              .insert(users)
              .values({
                id: (user as User).id || nanoid(),
                name:
                  (user as User).name ||
                  (user as User).email?.split("@")[0] ||
                  "新用户",
                email: (user as User).email!,
                image: (user as User).image,
                role: "user",
                emailVerified:
                  account?.provider === "email" ? new Date() : null,
              })
              .returning();
            (user as User).role = "user";
            return true;
          } catch (error) {
            console.error("自动注册失败:", error);
            return false;
          }
        }
      }
      return true;
    },
  },
  // ✅ 添加 events 来处理 signOut
  events: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signOut(message: { session?: any } | { token?: any }) {
      console.log('User signed out');
      
      // 安全地获取用户ID
      let userId: string | undefined;
      
      if ('token' in message && message.token?.sub) {
        userId = message.token.sub;
      } else if ('session' in message && message.session?.user?.id) {
        userId = message.session.user.id;
      }
      
      
      if (userId) {
        try {
          const { env } = await getCloudflareContext();
          const db = getDb(env.DB);

          // 撤销该用户的所有未撤销的 refresh tokens
          await db
            .update(refreshTokens)
            .set({ isRevoked: true, updatedAt: new Date() })
            .where(
              and(
                eq(refreshTokens.userId, userId),
                eq(refreshTokens.isRevoked, false)
              )
            );
          
          console.log('Refresh tokens revoked for user:', userId);
        } catch (error) {
          console.error('Failed to revoke refresh tokens:', error);
        }
      }
    },
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', user.email);
    },
  },
  session: { strategy: "jwt" },
  trustHost: true,
};

// 导出 auth 函数（在这里动态读取 env 并组装 providers 与 adapter）
export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const context = await getCloudflareContext();
  const env: CloudflareEnv = context.env;
  const flags = getAuthFlags(env as unknown as Record<string, unknown>);
  const db = getDb(env.DB);

  const providers: NextAuthConfig["providers"] = [
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 查找管理员用户
        const user = await db
          .select()
          .from(users)
          .where(
            and(
              eq(users.email, credentials.email as string),
              eq(users.role, "admin")
            )
          )
          .limit(1);

        if (!user[0] || !user[0].password) return null;

        // 验证密码
        const hashedPassword = await hashPassword(
          credentials.password as string
        );
        if (hashedPassword !== user[0].password) return null;

        return {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          image: user[0].image,
          role: user[0].role,
        } as User;
      },
    }),
  ];

  if (flags.enableGoogleLogin) {
    providers.push(
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID as string,
        clientSecret: env.GOOGLE_CLIENT_SECRET as string,
      })
    );
  }
  if (flags.enableGithubLogin) {
    providers.push(
      GitHubProvider({
        clientId: env.GITHUB_CLIENT_ID as string,
        clientSecret: env.GITHUB_CLIENT_SECRET as string,
      })
    );
  }

  return {
    ...authConfig,
    providers,
    adapter: D1Adapter(env.DB),
  };
});

export { getAuthFlags };
