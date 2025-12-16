'use client';

import React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { IKanbanColumn } from '../interfaces/kanban.interface';
import { BoardContainer } from '../styles/KanbanPage.style';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
    columns: IKanbanColumn[];
    onDragEnd: (result: DropResult) => void;
    onSnooze: (emailId: string) => void;
    onUnsnooze: (emailId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
    columns,
    onDragEnd,
    onSnooze,
    onUnsnooze,
}) => {
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <BoardContainer>
                {columns.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        emails={column.emails}
                        onSnooze={onSnooze}
                        onUnsnooze={onUnsnooze}
                    />
                ))}
            </BoardContainer>
        </DragDropContext>
    );
};
