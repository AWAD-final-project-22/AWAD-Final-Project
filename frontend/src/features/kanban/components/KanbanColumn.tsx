'use client';

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { IKanbanEmail, KanbanStatus } from '../interfaces/kanban.interface';
import {
    ColumnContainer,
    ColumnHeader,
    ColumnTitle,
    ColumnCount,
    ColumnContent,
} from '../styles/KanbanPage.style';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
    id: KanbanStatus;
    title: string;
    emails: IKanbanEmail[];
    onSnooze: (emailId: string) => void;
    onUnsnooze: (emailId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
    id,
    title,
    emails,
    onSnooze,
    onUnsnooze,
}) => {
    return (
        <Droppable droppableId={id}>
            {(provided, snapshot) => (
                <ColumnContainer $isDraggingOver={snapshot.isDraggingOver}>
                    <ColumnHeader $status={id}>
                        <ColumnTitle>{title}</ColumnTitle>
                        <ColumnCount>{emails.length}</ColumnCount>
                    </ColumnHeader>
                    <ColumnContent
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {emails.map((email, index) => (
                            <Draggable key={email.id} draggableId={email.id} index={index}>
                                {(dragProvided, dragSnapshot) => (
                                    <div
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        {...dragProvided.dragHandleProps}
                                    >
                                        <KanbanCard
                                            email={email}
                                            isDragging={dragSnapshot.isDragging}
                                            onSnooze={() => onSnooze(email.id)}
                                            onUnsnooze={() => onUnsnooze(email.id)}
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </ColumnContent>
                </ColumnContainer>
            )}
        </Droppable>
    );
};
