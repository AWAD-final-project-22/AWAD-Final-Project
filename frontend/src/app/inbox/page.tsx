import InboxPage from '@/features/inbox/InboxPage';
import { Suspense } from 'react';

export default function Inbox() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InboxPage />
    </Suspense>
  );
}
