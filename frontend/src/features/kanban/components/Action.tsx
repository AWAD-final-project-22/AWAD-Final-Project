import { ViewToggle } from '@/components/ViewToggle';
import { HeaderActions } from '@/features/inbox/styles/ComposeEmailModal.style';
import { Button, Tooltip } from 'antd';
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';

interface ActionProps {
  setSettingsModalOpen: (open: boolean) => void;
  refreshKanban: () => void;
}
export const Action: React.FC<ActionProps> = ({
  setSettingsModalOpen,
  refreshKanban,
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
    </HeaderActions>
  );
};
