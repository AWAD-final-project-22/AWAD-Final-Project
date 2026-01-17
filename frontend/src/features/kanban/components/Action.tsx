import { ViewToggle } from '@/components/ViewToggle';
import { HeaderActions } from '@/features/inbox/styles/ComposeEmailModal.style';
import { Button, Tooltip } from 'antd';
import {
  LogoutOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';

interface ActionProps {
  setSettingsModalOpen: (open: boolean) => void;
  refreshKanban: () => void;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}
export const Action: React.FC<ActionProps> = ({
  setSettingsModalOpen,
  refreshKanban,
  onLogout,
  isLoggingOut,
}) => {
  return (
    <HeaderActions>
      <Tooltip title='Settings'>
        <Button
          type='text'
          icon={<SettingOutlined />}
          onClick={() => setSettingsModalOpen(true)}
        />
      </Tooltip>
      <Tooltip title='Refresh'>
        <Button
          type='text'
          icon={<ReloadOutlined />}
          onClick={() => refreshKanban()}
        />
      </Tooltip>
      <ViewToggle currentView='kanban' />
      {onLogout && (
        <Tooltip title='Logout'>
          <Button
            type='text'
            danger
            icon={<LogoutOutlined />}
            onClick={onLogout}
            loading={isLoggingOut}
          />
        </Tooltip>
      )}
    </HeaderActions>
  );
};
