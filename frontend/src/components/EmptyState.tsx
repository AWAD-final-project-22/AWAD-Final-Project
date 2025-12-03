import { Empty } from 'antd';

interface EmptyStateProps {
  message: string;
}
export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return <Empty description={message} style={{ marginTop: 200 }} />;
};
