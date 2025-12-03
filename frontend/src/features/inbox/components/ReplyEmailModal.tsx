'use client';

import {
  BoldOutlined,
  CloseOutlined,
  DeleteOutlined,
  ExpandOutlined,
  ItalicOutlined,
  MinusOutlined,
  PaperClipOutlined,
  SendOutlined,
  UnderlineOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { Button, Form, Input, Select, Tooltip, Upload, message } from 'antd';
import { useState, useEffect } from 'react';
import { FONT_FAMILY, FONT_SIZE } from '../constants/emails.constant';
import {
  IEmailAttachment,
  ISendMessageParams,
  IReplyEmailParams,
} from '../interfaces/mailAPI.interface';
import {
  ActionButton,
  CcBccToggle,
  EditorArea,
  FooterActions,
  FormContainer,
  FormRow,
  HeaderActions,
  HeaderTitle,
  InputArea,
  Label,
  ModalHeader,
  SendButton,
  StyledModal,
  ToolbarButton,
} from '../styles/ComposeEmailModal.style';
import { Toolbar } from '../styles/InboxPage.style';
import { RichTextInput } from './RichTextInput';
import { isValidEmail } from '@/helpers/common.helper';

interface ReplyEmailModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (payload: ISendMessageParams) => void;
  replyParams?: IReplyEmailParams;
  originalSubject?: string;
  isReplyEmailPending: boolean;
}

export const ReplyEmailModal: React.FC<ReplyEmailModalProps> = ({
  open,
  onClose,
  onSend,
  replyParams,
  originalSubject,
  isReplyEmailPending = false,
}) => {
  const [form] = Form.useForm();
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [fontFamily, setFontFamily] = useState('Sans-serif');
  const [fontSize, setFontSize] = useState('14px');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  useEffect(() => {
    if (open && replyParams) {
      form.setFieldsValue({
        to: replyParams.to || [],
        cc: replyParams.cc || [],
        bcc: replyParams.bcc || [],
        subject: originalSubject ? `Re: ${originalSubject}` : '',
        body: replyParams.includeOriginal ? `\n\n---\n${replyParams.body}` : '',
      });

      // if (replyParams.cc && replyParams.cc.length > 0) {
      //   setShowCc(true);
      // }
      // if (replyParams.bcc && replyParams.bcc.length > 0) {
      //   setShowBcc(true);
      // }
    }
  }, [open, replyParams, originalSubject, form]);

  const handleFileChange: UploadProps['onChange'] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const checkFormatState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));

    let fontName = document.queryCommandValue('fontName');
    if (fontName) {
      fontName = fontName.replace(/['"]/g, '');
      if (fontName.toLowerCase().includes('arial')) {
        fontName = 'Arial';
      } else if (fontName.toLowerCase().includes('georgia')) {
        fontName = 'Georgia';
      } else if (fontName.toLowerCase().includes('times new roman')) {
        fontName = "'Times New Roman'";
      } else if (fontName.toLowerCase().includes('courier')) {
        fontName = "'Courier New'";
      } else {
        fontName = 'Sans-serif';
      }
    } else {
      fontName = 'Sans-serif';
    }
    setFontFamily(fontName);
  };

  const handleBold = () => {
    applyFormat('bold');
    setIsBold(!isBold);
  };

  const handleItalic = () => {
    applyFormat('italic');
    setIsItalic(!isItalic);
  };

  const handleUnderline = () => {
    applyFormat('underline');
    setIsUnderline(!isUnderline);
  };

  const handleFontChange = (value: string) => {
    setFontFamily(value);
    applyFormat('fontName', value);
  };

  const handleFontSizeChange = (value: string) => {
    setFontSize(value);
  };

  const handleSend = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form Values:', values);

      const allEmails = [
        ...(values.to || []),
        ...(values.cc || []),
        ...(values.bcc || []),
      ];

      for (const email of allEmails) {
        if (email && !isValidEmail(email)) {
          message.error(`Invalid email address: ${email}`);
          return;
        }
      }

      const attachments: IEmailAttachment[] = [];
      for (const file of fileList) {
        if (file.originFileObj) {
          try {
            const base64Content = await fileToBase64(file.originFileObj);
            attachments.push({
              filename: file.name,
              content: base64Content,
              mimeType: file.type || 'application/octet-stream',
            });
          } catch (error) {
            message.error(`Cannot read file ${file.name}`);
            console.error('Error converting file to base64:', error);
          }
        }
      }

      const payload: ISendMessageParams = {
        to: values.to || [],
        subject: values.subject || '',
        body: values.body || '',
        cc: values.cc && values.cc.length > 0 ? values.cc : undefined,
        bcc: values.bcc && values.bcc.length > 0 ? values.bcc : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      onSend(payload);
      form.resetFields();
      setShowCc(false);
      setShowBcc(false);
      setFileList([]);
      onClose();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setShowCc(false);
    setShowBcc(false);
    setFileList([]);
    onClose();
  };

  return (
    <StyledModal
      open={open}
      onCancel={handleClose}
      width={600}
      closeIcon={null}
      title={null}
      footer={null}
    >
      <ModalHeader>
        <HeaderTitle>Reply Email</HeaderTitle>
        <HeaderActions>
          <Tooltip title={isMinimized ? 'Minimize' : 'Maximize'}>
            <Button
              type='text'
              size='small'
              icon={<MinusOutlined />}
              onClick={() => setIsMinimized(!isMinimized)}
            />
          </Tooltip>
          <Tooltip title='Expand'>
            <Button type='text' size='small' icon={<ExpandOutlined />} />
          </Tooltip>
          <Tooltip title='Close'>
            <Button
              type='text'
              size='small'
              icon={<CloseOutlined />}
              onClick={handleClose}
            />
          </Tooltip>
        </HeaderActions>
      </ModalHeader>

      <Form form={form} layout='vertical'>
        <FormContainer>
          <FormRow>
            <Label>To</Label>
            <InputArea>
              <Form.Item
                name='to'
                style={{ margin: 0, flex: 1 }}
                rules={[
                  {
                    required: true,
                    message: 'Please enter at least one recipient',
                  },
                ]}
              >
                <Select
                  mode='tags'
                  style={{ width: '100%' }}
                  placeholder='Enter email addresses'
                  tokenSeparators={[',', ' ', ';']}
                  notFoundContent={null}
                  open={false}
                />
              </Form.Item>
              {!showCc && !showBcc && (
                <CcBccToggle
                  onClick={() => {
                    setShowCc(true);
                    setShowBcc(true);
                  }}
                >
                  Cc Bcc
                </CcBccToggle>
              )}
            </InputArea>
          </FormRow>

          {showCc && (
            <FormRow>
              <Label>
                Cc
                <CloseOutlined
                  style={{
                    marginLeft: 8,
                    fontSize: 10,
                    cursor: 'pointer',
                    color: '#999',
                  }}
                  onClick={() => {
                    setShowCc(false);
                    form.setFieldsValue({ cc: undefined });
                  }}
                />
              </Label>
              <InputArea>
                <Form.Item name='cc' style={{ margin: 0, flex: 1 }}>
                  <Select
                    mode='tags'
                    style={{ width: '100%' }}
                    placeholder='Cc email addresses'
                    tokenSeparators={[',', ' ', ';']}
                    notFoundContent={null}
                    open={false}
                  />
                </Form.Item>
              </InputArea>
            </FormRow>
          )}

          {showBcc && (
            <FormRow>
              <Label>
                Bcc
                <CloseOutlined
                  style={{
                    marginLeft: 8,
                    fontSize: 10,
                    cursor: 'pointer',
                    color: '#999',
                  }}
                  onClick={() => {
                    setShowBcc(false);
                    form.setFieldsValue({ bcc: undefined });
                  }}
                />
              </Label>
              <InputArea>
                <Form.Item name='bcc' style={{ margin: 0, flex: 1 }}>
                  <Select
                    mode='tags'
                    style={{ width: '100%' }}
                    placeholder='Bcc email addresses'
                    tokenSeparators={[',', ' ', ';']}
                    notFoundContent={null}
                    open={false}
                  />
                </Form.Item>
              </InputArea>
            </FormRow>
          )}

          <FormRow>
            <Label>Subject</Label>
            <InputArea>
              <Form.Item name='subject' style={{ margin: 0, flex: 1 }}>
                <Input placeholder='Subject' />
              </Form.Item>
            </InputArea>
          </FormRow>
        </FormContainer>

        <Toolbar>
          <Select
            style={{ width: 120 }}
            bordered={false}
            size='small'
            onChange={handleFontChange}
            value={fontFamily}
          >
            {FONT_FAMILY.map((font) => (
              <Select.Option key={font.value} value={font.value}>
                <Tooltip title={font.label}>{font.label}</Tooltip>
              </Select.Option>
            ))}
          </Select>

          <Select
            defaultValue='14px'
            style={{ width: 80 }}
            bordered={false}
            size='small'
            onChange={handleFontSizeChange}
            value={fontSize}
          >
            {FONT_SIZE.map((size) => (
              <Select.Option key={size.value} value={`${size.value}px`}>
                {size.label}
              </Select.Option>
            ))}
          </Select>

          <ToolbarButton
            icon={<BoldOutlined />}
            size='small'
            onClick={handleBold}
            onMouseDown={(e) => e.preventDefault()}
            $active={isBold}
          />
          <ToolbarButton
            icon={<ItalicOutlined />}
            size='small'
            onClick={handleItalic}
            onMouseDown={(e) => e.preventDefault()}
            $active={isItalic}
          />
          <ToolbarButton
            icon={<UnderlineOutlined />}
            size='small'
            onClick={handleUnderline}
            onMouseDown={(e) => e.preventDefault()}
            $active={isUnderline}
          />
        </Toolbar>

        <EditorArea>
          <Form.Item
            name='body'
            rules={[
              { required: true, message: 'Please enter the email content' },
            ]}
            style={{ margin: 0, height: '100%' }}
          >
            <RichTextInput
              fontFamily={fontFamily}
              fontSize={fontSize}
              onFormatStateChange={checkFormatState}
            />
          </Form.Item>
        </EditorArea>

        <FooterActions>
          <SendButton
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={isReplyEmailPending}
          >
            Send
          </SendButton>
          <Form.Item name='attachments' style={{ margin: 0 }}>
            <Upload
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={() => false}
              multiple
            >
              <Tooltip title='Attach file'>
                <ActionButton icon={<PaperClipOutlined />} />
              </Tooltip>
            </Upload>
          </Form.Item>
          <div style={{ flex: 1 }} />
          <Tooltip title='Delete draft'>
            <ActionButton icon={<DeleteOutlined />} onClick={handleClose} />
          </Tooltip>
        </FooterActions>
      </Form>
    </StyledModal>
  );
};
