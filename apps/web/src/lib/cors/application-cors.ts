// apps/web/src/lib/cors/application-cors.ts
import { getDb } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// 缓存活跃应用的域名
let cachedDomains: string[] = [];
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

async function getActiveApplicationDomains(): Promise<string[]> {
  const now = Date.now();
  
  // 如果缓存还有效，直接
  if (cachedDomains.length > 0 && now - lastCacheTime < CACHE_DURATION) {
    return cachedDomains;
  }

  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);
    
    // 获取所有活跃应用的域名
    const activeApps = await db.select({ 
      domain: applications.domain,
      redirectUris: applications.redirectUris 
    })
    .from(applications)
    .where(eq(applications.isActive, true));
    
    const domains = new Set<string>();
    
    activeApps.forEach(app => {
      // 添加主域名
      domains.add(app.domain);
      
      // 解析并添加 redirectUris 中的域名
      try {
        const redirectUris = JSON.parse(app.redirectUris) as string[];
        redirectUris.forEach(uri => {
          try {
            const url = new URL(uri);
            domains.add(`${url.protocol}//${url.host}`);
          } catch (e) {
            console.warn(`Invalid redirect URI: ${uri}`);
          }
        });
      } catch (e) {
        console.warn('Failed to parse redirect URIs:', app.redirectUris);
      }
    });
    
    cachedDomains = Array.from(domains);
    lastCacheTime = now;
    
    // 开发环境添加默认的 localhost 域名
    if (process.env.NODE_ENV === 'development') {
      const devDomains = [
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:8900',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:8900',
      ];
      cachedDomains = [...new Set([...cachedDomains, ...devDomains])];
    }
    
    console.log('Active application domains:', cachedDomains);
    return cachedDomains;
    
  } catch (error) {
    console.error('Failed to get active application domains:', error);
    
    // 失败时返回默认的开发环境域名
    if (process.env.NODE_ENV === 'development') {
      return [
        'http://localhost:3001',
        'http://localhost:3002', 
        'http://localhost:8900',
      ];
    }
    
    return [];
  }
}

export async function checkApplicationOrigin(origin: string | null): Promise<boolean> {
  if (!origin) return false;
  
  const allowedDomains = await getActiveApplicationDomains();
  return allowedDomains.includes(origin);
}

// 清除缓存的函数，供应用管理接口调用
export function clearApplicationDomainsCache() {
  cachedDomains = [];
  lastCacheTime = 0;
}

// 根据 clientId 检查应用是否有权限
export async function checkApplicationPermission(clientId: string, origin: string): Promise<boolean> {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);
    
    const app = await db.select({
      domain: applications.domain,
      redirectUris: applications.redirectUris,
      isActive: applications.isActive
    })
    .from(applications)
    .where(eq(applications.clientId, clientId))
    .limit(1);
    
    if (!app[0] || !app[0].isActive) {
      return false;
    }
    
    // 检查 origin 是否匹配应用的域名或 redirectUris
    if (app[0].domain === origin) {
      return true;
    }
    
    try {
      const redirectUris = JSON.parse(app[0].redirectUris) as string[];
      return redirectUris.some(uri => {
        try {
          const url = new URL(uri);
          return `${url.protocol}//${url.host}` === origin;
        } catch (e) {
          return false;
        }
      });
    } catch (e) {
      return false;
    }
    
  } catch (error) {
    console.error('Failed to check application permission:', error);
    return false;
  }
}
