'use client';
import { useAuthInitialization } from '@/hooks/useAuthInitialization';
import { LoadingSpin } from '@/components/LoadingSpin';

export default function Home() {
  const { isInitializing } = useAuthInitialization();

  if (isInitializing) {
    return <LoadingSpin />;
  }

  return null;
}
