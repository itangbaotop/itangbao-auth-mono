// src/app/profile/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useClientContext } from "@/hooks/useClientContext";
import { ProfileContent } from "@/components/ProfileContent";
import { ProfileContentProps } from "@/types/next-auth";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { getClientHomeUrl, hasClientContext } = useClientContext();
  const [userAccounts, setUserAccounts] = useState<ProfileContentProps['userAccounts']>([]);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const redirectHandled = useRef(false);
  const accountsFetched = useRef(false);

  // 处理认证重定向 - 只执行一次
  useEffect(() => {
    if (status === "loading" || redirectHandled.current || isRedirecting) return;
    
    if (!session?.user) {
      redirectHandled.current = true;
      setIsRedirecting(true);
      
      const homeUrl = getClientHomeUrl();
      if (hasClientContext && homeUrl !== '/') {
        window.location.href = homeUrl;
      } else {
        router.push("/auth/signin");
      }
    }
  }, [session, status]); // 移除可能变化的依赖项

  // 获取账户信息 - 只执行一次
  useEffect(() => {
    if (!session?.user?.id || accountsFetched.current) return;

    accountsFetched.current = true;
    
    const fetchUserAccounts = async () => {
      try {
        const response = await fetch(`/api/user/${session.user.id}/accounts`);
        if (response.ok) {
          const accounts = await response.json() as ProfileContentProps['userAccounts'];
          setUserAccounts(accounts);
        }
      } catch (error) {
        console.error("Error fetching user accounts:", error);
      }
    };

    fetchUserAccounts();
  }, [session?.user?.id]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session?.user || isRedirecting) {
    return null;
  }

  return <ProfileContent user={session.user} userAccounts={userAccounts} />;
}
