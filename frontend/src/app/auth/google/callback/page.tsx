'use client';

import { AuthCallbackPage } from '@/features/auth-callback/AuthCallbackPage';
import { Suspense } from 'react';

export default function CallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallbackPage />
    </Suspense>
  );
}
