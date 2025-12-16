'use client';

import React from 'react';
import { Segmented } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { ToggleWrapper } from './styles/ViewToggle.style';

type ViewMode = 'list' | 'kanban';

interface ViewToggleProps {
    currentView?: ViewMode;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ currentView }) => {
    const router = useRouter();
    const pathname = usePathname();

    // Determine current view based on pathname if not provided
    const activeView: ViewMode = currentView || (pathname?.includes('/kanban') ? 'kanban' : 'list');

    const handleViewChange = (value: ViewMode) => {
        if (value === 'kanban') {
            router.push('/inbox/kanban');
        } else {
            router.push('/inbox');
        }
    };

    return (
        <ToggleWrapper>
            <Segmented
                value={activeView}
                onChange={(value) => handleViewChange(value as ViewMode)}
                options={[
                    {
                        value: 'list',
                        label: (
                            <>
                                <UnorderedListOutlined />
                                <span>List</span>
                            </>
                        ),
                    },
                    {
                        value: 'kanban',
                        label: (
                            <>
                                <AppstoreOutlined />
                                <span>Kanban</span>
                            </>
                        ),
                    },
                ]}
            />
        </ToggleWrapper>
    );
};
