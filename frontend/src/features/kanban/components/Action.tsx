import { ViewToggle } from '@/components/ViewToggle';
import { HeaderActions } from '@/features/inbox/styles/ComposeEmailModal.style';
import { Button, Tooltip } from 'antd';
import {
  LogoutOutlined,
  ReloadOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

type SearchType = 'fuzzy' | 'semantic';

interface ActionProps {
  setSettingsModalOpen: (open: boolean) => void;
  refreshKanban: () => void;
  onLogout?: () => void;
  isLoggingOut?: boolean;
  searchType: SearchType;
  onSearchTypeToggle: () => void;
}

export const Action: React.FC<ActionProps> = ({
  setSettingsModalOpen,
  refreshKanban,
  onLogout,
  isLoggingOut,
  searchType,
  onSearchTypeToggle,
}) => {
  const isSemanticActive = searchType === 'semantic';

  return (
    <HeaderActions>
      <Tooltip title='Settings'>
        <Button
          type='text'
          icon={<SettingOutlined />}
          onClick={() => setSettingsModalOpen(true)}
        />
      </Tooltip>
      <Tooltip title={isSemanticActive ? 'Semantic Search (Active)' : 'Switch to Semantic Search'}>
        <Button
          type={isSemanticActive ? 'primary' : 'text'}
          icon={
            <ThunderboltOutlined 
              style={{ 
                color: isSemanticActive ? '#fff' : '#8c8c8c',
                fontSize: '16px'
              }} 
            />
          }
          onClick={onSearchTypeToggle}
          style={{
            backgroundColor: isSemanticActive ? '#1890ff' : 'transparent',
          }}
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
