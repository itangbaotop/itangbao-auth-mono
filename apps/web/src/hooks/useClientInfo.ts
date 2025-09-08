// src/hooks/useClientInfo.ts
import { useState, useEffect } from 'react';

interface ClientInfo {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
}

export function useClientInfo(clientId: string | null) {
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      setClientInfo(null);
      return;
    }

    const fetchClientInfo = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/auth/clients/${clientId}`);
        
        if (response.ok) {
          const data = await response.json();
          setClientInfo(data as ClientInfo);
        } else if (response.status === 404) {
          setError('客户端不存在');
        } else {
          setError('获取客户端信息失败');
        }
      } catch (err) {
        console.error('Failed to fetch client info:', err);
        setError('网络错误');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientInfo();
  }, [clientId]);

  return { clientInfo, isLoading, error };
}
