'use client';
import { Flex, Spin } from 'antd';

export const LoadingSpin: React.FC = () => {
  return (
    <Flex
      style={{ padding: 16, height: '100%', width: '100%' }}
      align='center'
      justify='center'
    >
      <Spin />
    </Flex>
  );
};
