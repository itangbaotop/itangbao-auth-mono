// packages/react/src/components/ServiceWorkerRegistrar.tsx
"use client";

import { useEffect } from 'react';

interface ServiceWorkerRegistrarProps {
  /**
   * The path to the service worker script.
   * @default '/sw.js'
   */
  scriptUrl?: string;
}

/**
 * A client component that handles the registration of a service worker.
 * It should be placed in the root layout of the application.
 */
export function ServiceWorkerRegistrar({ scriptUrl = '/sw.js' }: ServiceWorkerRegistrarProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register(scriptUrl)
          .then((registration) => {
            console.log(`[itangbao-auth-sdk] Service Worker registered with scope: ${registration.scope}`);
          })
          .catch((error) => {
            console.error(`[itangbao-auth-sdk] Service Worker registration failed:`, error);
          });
      });
    }
  }, [scriptUrl]);

  return null; // This component renders nothing.
}