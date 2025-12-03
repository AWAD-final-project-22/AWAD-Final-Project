import { Button, Modal } from 'antd';
import styled from 'styled-components';

export const StyledModal = styled(Modal)`
  top: 10px !important;

  .ant-modal-content {
    padding: 0;
    border-radius: 8px;
    overflow: hidden;
  }

  .ant-modal-header {
    padding: 12px 16px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
    margin: 0;
  }

  .ant-modal-body {
    padding: 0;
  }

  .ant-modal-footer {
    display: none;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
`;

export const HeaderTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #202124;
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 8px;

  .ant-btn {
    border: none;
    background: transparent;
    box-shadow: none;
    padding: 4px;
    height: auto;
    color: #5f6368;

    &:hover {
      background: #e8e8e8;
      color: #202124;
    }
  }
`;

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FormRow = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
`;

export const Label = styled.div`
  min-width: 60px;
  color: #5f6368;
  font-size: 14px;
`;

export const InputArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;

  .ant-input,
  .ant-select {
    border: none;
    box-shadow: none;
    padding: 0;

    &:focus {
      box-shadow: none;
    }
  }

  .ant-select-selector {
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }
`;

export const CcBccToggle = styled.a`
  color: #1a73e8;
  font-size: 14px;
  margin-left: auto;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const EditorArea = styled.div`
  padding: 16px;
  min-height: 300px;

  .ant-input {
    border: none;
    resize: none;
    font-size: 14px;
    padding: 0;

    &:focus {
      box-shadow: none;
    }
  }
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #fff;
`;

export const ToolbarButton = styled(Button)<{ $active?: boolean }>`
  border: none;
  background: ${({ $active }) => ($active ? '#e8f0fe' : 'transparent')};
  box-shadow: none;
  padding: 6px;
  height: auto;
  color: ${({ $active }) => ($active ? '#1a73e8' : '#5f6368')};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ $active }) => ($active ? '#d2e3fc' : '#f1f3f4')};
    color: ${({ $active }) => ($active ? '#1557b0' : '#202124')};
  }
`;

export const RichTextEditor = styled.div<{
  fontFamily: string;
  fontSize: string;
}>`
  min-height: 250px;
  border: none;
  outline: none;
  font-family: ${({ fontFamily }) => fontFamily};
  font-size: ${({ fontSize }) => fontSize};
  color: #202124;
  line-height: 1.5;

  &:focus {
    outline: none;
  }

  &:empty:before {
    content: attr(data-placeholder);
    color: #5f6368;
  }
`;

export const FooterActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
`;

export const SendButton = styled(Button)`
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 24px;
  font-weight: 500;
  height: auto;

  &:hover {
    background: #1557b0;
    color: white;
  }

  &:disabled {
    background: #e8eaed;
    color: #80868b;
  }
`;

export const ActionButton = styled(Button)`
  border: none;
  background: transparent;
  box-shadow: none;
  padding: 8px;
  height: auto;
  color: #5f6368;

  &:hover {
    background: #f1f3f4;
    color: #202124;
  }
`;
