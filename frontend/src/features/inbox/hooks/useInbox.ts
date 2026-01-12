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
import { useQueryClient } from '@tanstack/react-query';
import { API_PATH } from '@/constants/apis.constant';

interface InBoxProps {
  mailBoxID?: string;
  mailID?: string;
  isMobile: boolean;
}

export const useInbox = ({ mailBoxID, mailID, isMobile }: InBoxProps) => {
  const { searchParams, updateSearchQuery } = useControlParams();
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

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
  const pSearchQuery = searchParams.get(PARAMS_URL.SEARCH_EMAIL) || '';

  // Sync searchText with URL query param
  useEffect(() => {
    setSearchText(pSearchQuery);
  }, [pSearchQuery]);

  const { data: mailboxes, isLoading: isMailboxesLoading } = useGetMailBoxes();

  const { data: emails, isLoading: isEmailsLoading } = useGetEmailsByMailBoxId(
    { page: Number(pPage), limit: Number(LIMIT_DEFAULT) },
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
        // Invalidate queries to refetch updated data
        queryClient.invalidateQueries({
          queryKey: [API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_KEY, selectedMailbox],
        });
        queryClient.invalidateQueries({
          queryKey: [API_PATH.EMAIL.GET_DETAIL_MAIL.API_KEY],
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
    async (emailId: string) => {
      setSelectedEmail(emailId);
      if (isMobile) {
        setShowEmailList(false);
        setShowEmailDetail(true);
      }

      // Find the email to check if it's unread
      const email = emails?.emails?.find((e: IEmail) => e.id === emailId);
      if (email && email.isRead === false) {
        // Optimistically update the cache
        queryClient.setQueryData(
          [API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_KEY, selectedMailbox],
          (oldData: { emails: IEmail[] } | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              emails: oldData.emails.map((e: IEmail) =>
                e.id === emailId ? { ...e, isRead: true } : e
              ),
            };
          }
        );

        // Call API to mark as read
        try {
          await modifyEmail({
            id: emailId,
            action: 'mark_read',
          });
        } catch (error) {
          console.error('Failed to mark email as read:', error);
          // Revert optimistic update on error
          queryClient.invalidateQueries({
            queryKey: [API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_KEY, selectedMailbox],
          });
        }
      }
    },
    [isMobile, emails, queryClient, selectedMailbox, modifyEmail],
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

  const handleSearch = (query: string) => {
    updateSearchQuery({ [PARAMS_URL.SEARCH_EMAIL]: query });
  };

  // Show email detail when mailID is provided from URL (for Kanban navigation)
  useEffect(() => {
    if (mailID) {
      setSelectedEmail(mailID);
      if (isMobile) {
        setShowEmailList(false);
        setShowEmailDetail(true);
      }
    }
  }, [mailID, isMobile]);

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
    handleSearch,
  };
};
