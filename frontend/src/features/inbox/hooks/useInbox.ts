import { LIMIT_DEFAULT, PAGE_DEFAULT } from '@/constants/common.constant';
import { PARAMS_URL } from '@/constants/params.constant';
import { useControlParams } from '@/hooks/useControlParams';
import { App } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  IEmail,
  IReplyEmailParams,
  ISendMessageParams,
} from '../interfaces/mailAPI.interface';
import {
  useGetEmailDetailById,
  useGetEmailsByMailBoxId,
  useGetMailBoxes,
  useMutationModifyEmailById,
  useMutationReplyEmailById,
  useMutationSendEmail,
  useMutationDownloadAttachment,
} from './mailAPIs';
import { MAILBOX_DEFAULT_NAMES } from '../constants/emails.constant';

interface InBoxProps {
  mailBoxID?: string;
  mailID?: string;
  isMobile: boolean;
}

export const useInbox = ({ mailBoxID, mailID, isMobile }: InBoxProps) => {
  const { searchParams, updateSearchQuery } = useControlParams();
  const { notification } = App.useApp();

  const [checkedEmails, setCheckedEmails] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMailbox, setSelectedMailbox] = useState(
    mailBoxID || MAILBOX_DEFAULT_NAMES,
  );
  const [selectedEmail, setSelectedEmail] = useState<string | null>(
    mailID || null,
  );
  const [searchText, setSearchText] = useState('');
  const [showEmailList, setShowEmailList] = useState(true);
  const [showEmailDetail, setShowEmailDetail] = useState(false);

  const pPage = searchParams.get(PARAMS_URL.PAGE) || PAGE_DEFAULT;
  const pLimit = searchParams.get(PARAMS_URL.LIMIT) || LIMIT_DEFAULT;

  const { data: mailboxes, isLoading: isMailboxesLoading } = useGetMailBoxes();

  const { data: emails, isLoading: isEmailsLoading } = useGetEmailsByMailBoxId(
    { page: Number(pPage), limit: Number(pLimit) },
    selectedMailbox,
  );

  const { data: emailDetail, isLoading: isEmailDetailLoading } =
    useGetEmailDetailById(selectedEmail || '');

  const { mutateAsync: sendEmail, isPending: isSendEmailPending } =
    useMutationSendEmail({
      onSuccess: () => {
        notification.success({
          message: 'Send Email Success',
          description: 'Your email has been sent successfully.',
        });
      },
      onError: (error) => {
        console.error('Send Email Failed:', error);
      },
    });

  const { mutateAsync: replyEmail, isPending: isReplyEmailPending } =
    useMutationReplyEmailById({
      onSuccess: () => {
        notification.success({
          message: 'Reply Email Success',
          description: 'Your reply has been sent successfully.',
        });
      },
      onError: (error) => {
        console.error('Reply Email Failed:', error);
      },
    });

  const { mutateAsync: modifyEmail, isPending: isModifyEmailPending } =
    useMutationModifyEmailById({
      onSuccess: () => {
        notification.success({
          message: 'Modify Email Success',
          description: 'The email has been modified successfully.',
        });
      },
      onError: (error) => {
        console.error('Modify Email Failed:', error);
      },
    });

  const { mutateAsync: downloadAttachmentMutate } =
    useMutationDownloadAttachment({
      onError: (error) => {
        console.error('Download Attachment Failed:', error);
        notification.error({
          message: 'Download Failed',
          description: 'Could not download the attachment.',
        });
      },
    });

  const handleDownloadAttachment = async (
    messageId: string,
    attachmentId: string,
    filename: string,
  ) => {
    try {
      const response = await downloadAttachmentMutate({
        messageId,
        attachmentId,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {}
  };

  const handleCheckboxChange = useCallback(
    (emailId: string, checked: boolean) => {
      setCheckedEmails((prevCheckedEmails) => {
        const newCheckedEmails = new Set(prevCheckedEmails);
        if (checked) {
          newCheckedEmails.add(emailId);
        } else {
          newCheckedEmails.delete(emailId);
        }
        return newCheckedEmails;
      });
    },
    [],
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked && emails) {
        const filteredEmailIds = emails?.emails
          ?.filter(
            (email: IEmail) =>
              email.mailboxId === selectedMailbox &&
              (email.subject.toLowerCase().includes(searchText.toLowerCase()) ||
                email.sender.toLowerCase().includes(searchText.toLowerCase()) ||
                email.preview.toLowerCase().includes(searchText.toLowerCase())),
          )
          .map((email: IEmail) => email.id);
        setCheckedEmails(new Set(filteredEmailIds));
      } else {
        setCheckedEmails(new Set());
      }
    },
    [emails, selectedMailbox, searchText],
  );

  const handleEmailClick = useCallback(
    (emailId: string) => {
      setSelectedEmail(emailId);
      if (isMobile) {
        setShowEmailList(false);
        setShowEmailDetail(true);
      }
    },
    [isMobile],
  );

  const handleBackToList = useCallback(() => {
    setShowEmailList(true);
    setShowEmailDetail(false);
  }, []);

  const filteredEmails = useMemo(() => {
    if (!emails) return [];
    return emails?.emails?.filter(
      (email: IEmail) =>
        email.mailboxId === selectedMailbox &&
        (email.subject.toLowerCase().includes(searchText.toLowerCase()) ||
          email.sender.toLowerCase().includes(searchText.toLowerCase()) ||
          email.preview.toLowerCase().includes(searchText.toLowerCase())),
    );
  }, [emails, selectedMailbox, searchText]);

  const selectedEmailData = useMemo(() => {
    if (!emails || !selectedEmail) return undefined;
    return emails?.emails?.find((email: IEmail) => email.id === selectedEmail);
  }, [emails, selectedEmail]);

  const handleSendEmail = async (payload: ISendMessageParams) => {
    try {
      await sendEmail(payload);
    } catch (error) {
      console.error('Send Email Failed:', error);
    }
  };

  const handleReplyEmail = async (params: IReplyEmailParams) => {
    try {
      if (!selectedEmail) {
        notification.error({ message: 'No email selected to reply' });
        return;
      }
      await replyEmail({ id: selectedEmail, params });
    } catch (error) {
      console.error('Reply Email Failed:', error);
    }
  };

  const handlePageChange = (value: number) => {
    updateSearchQuery({ [PARAMS_URL.PAGE]: value }, true);
  };

  useEffect(() => {
    if (!isMobile && collapsed) {
      setCollapsed(false);
    }
    if (isMobile && !collapsed) {
      setCollapsed(true);
    }
  }, [isMobile]);

  return {
    mailboxes,
    isMailboxesLoading,
    emails,
    isEmailsLoading,
    emailDetail,
    isEmailDetailLoading,
    // streamAttachment,
    // isStreamAttachmentLoading,

    handleDownloadAttachment,

    handleSendEmail,
    isSendEmailPending,

    handleReplyEmail,
    isReplyEmailPending,

    modifyEmail,
    isModifyEmailPending,

    checkedEmails,
    collapsed,
    setCollapsed,
    selectedMailbox,
    setSelectedMailbox,
    selectedEmail,
    searchText,
    setSearchText,
    showEmailList,
    showEmailDetail,

    handleCheckboxChange,
    handleSelectAll,
    handleEmailClick,
    handleBackToList,

    filteredEmails,
    selectedEmailData,

    handlePageChange,
  };
};
