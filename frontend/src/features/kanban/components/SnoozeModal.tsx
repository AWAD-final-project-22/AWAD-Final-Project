'use client';

import React, { useState } from 'react';
import { Modal, DatePicker, Button, Space, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { getSnoozeOptions } from '../constants/kanban.constant';

const { Text } = Typography;

interface SnoozeModalProps {
    open: boolean;
    onClose: () => void;
    onSnooze: (snoozedUntil: Date) => void;
}

export const SnoozeModal: React.FC<SnoozeModalProps> = ({
    open,
    onClose,
    onSnooze,
}) => {
    const [customDate, setCustomDate] = useState<Dayjs | null>(null);
    const snoozeOptions = getSnoozeOptions();

    const handlePresetClick = (date: Date) => {
        onSnooze(date);
    };

    const handleCustomSnooze = () => {
        if (customDate) {
            onSnooze(customDate.toDate());
        }
    };

    const disabledDate = (current: Dayjs) => {
        // Cannot select days before today
        return current && current < dayjs().startOf('day');
    };

    return (
        <Modal
            title={
                <Space>
                    <ClockCircleOutlined />
                    <span>Snooze Email</span>
                </Space>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            width={400}
        >
            <div style={{ padding: '16px 0' }}>
                <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                    Select when you want this email to reappear:
                </Text>

                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {snoozeOptions.map((option) => (
                        <Button
                            key={option.label}
                            block
                            size="large"
                            onClick={() => handlePresetClick(option.value)}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                height: 48,
                            }}
                        >
                            <span>{option.label}</span>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {option.value.toLocaleDateString('vi-VN', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Text>
                        </Button>
                    ))}

                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                        <Text strong style={{ marginBottom: 8, display: 'block' }}>
                            Or pick a custom date & time:
                        </Text>
                        <Space.Compact style={{ width: '100%' }}>
                            <DatePicker
                                showTime
                                format="DD/MM/YYYY HH:mm"
                                placeholder="Select date & time"
                                value={customDate}
                                onChange={setCustomDate}
                                disabledDate={disabledDate}
                                style={{ flex: 1 }}
                            />
                            <Button
                                type="primary"
                                onClick={handleCustomSnooze}
                                disabled={!customDate}
                            >
                                Snooze
                            </Button>
                        </Space.Compact>
                    </div>
                </Space>
            </div>
        </Modal>
    );
};
