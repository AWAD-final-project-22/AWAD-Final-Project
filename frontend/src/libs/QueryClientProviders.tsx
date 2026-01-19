'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, ReactNode } from 'react';
import { clearExpiredCache } from '@/helpers/offlineCache.helper';

interface ProvidersProps {
  children: ReactNode;
}

export default function QueryClientProviders({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
          },
        },
      }),
  );

  useEffect(() => {
    const cleanup = async () => {
      try {
        await clearExpiredCache();
      } catch (error) {
        console.warn('[offline-cache] startup cleanup failed', error);
      }
    };
    cleanup();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
