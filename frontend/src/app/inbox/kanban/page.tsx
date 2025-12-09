import KanbanPage from '@/features/kanban/KanbanPage';
import { Suspense } from 'react';

export default function Kanban() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <KanbanPage />
        </Suspense>
    );
}
