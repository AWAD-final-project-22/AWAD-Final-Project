import { LIMIT_DEFAULT, PAGE_DEFAULT } from '@/constants/common.constant';
import { PARAMS_URL } from '@/constants/params.constant';
import { useControlParams } from '@/hooks/useControlParams';
import { App } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  IEmail,
  IReplyEmailParams,
  IForwardEmailParams,
  ISendMessageParams,
} from '../interfaces/mailAPI.interface';
import {
  useGetEmailDetailById,
  useGetEmailsByMailBoxId,
  useGetMailBoxes,
  useMutationModifyEmailById,
  useMutationReplyEmailById,
  useMutationForwardEmailById,
  useMutationSendEmail,
  useMutationDownloadAttachment,
  useMutationDeleteEmail,
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
  const currentPage = Number(pPage) || PAGE_DEFAULT;
  const pageSize = Number(LIMIT_DEFAULT);
  const pSearchQuery = searchParams.get(PARAMS_URL.SEARCH_EMAIL) || '';

  // Sync searchText with URL query param
  useEffect(() => {
    setSearchText(pSearchQuery);
  }, [pSearchQuery]);

  const { data: mailboxes, isLoading: isMailboxesLoading } = useGetMailBoxes();

  const { data: emails, isLoading: isEmailsLoading } = useGetEmailsByMailBoxId(
    { page: currentPage, limit: pageSize },
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

  const { mutateAsync: forwardEmail, isPending: isForwardEmailPending } =
    useMutationForwardEmailById({
      onSuccess: () => {
        notification.success({
          message: 'Forward Email Success',
          description: 'Your email has been forwarded successfully.',
        });
      },
      onError: (error) => {
        console.error('Forward Email Failed:', error);
      },
    });

  const { mutateAsync: modifyEmail, isPending: isModifyEmailPending } =
    useMutationModifyEmailById({
      onSuccess: () => {
        // Invalidate queries to refetch updated data
        queryClient.invalidateQueries({
          queryKey: [
            API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_KEY,
            selectedMailbox,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [API_PATH.EMAIL.GET_DETAIL_MAIL.API_KEY],
        });
      },
      onError: (error) => {
        console.error('Modify Email Failed:', error);
      },
    });

  const { mutateAsync: deleteEmail, isPending: isDeleteEmailPending } =
    useMutationDeleteEmail({
      onSuccess: () => {
        notification.success({
          message: 'Delete Email Success',
          description: 'Email has been moved to trash successfully.',
        });
        queryClient.invalidateQueries({
          queryKey: [
            API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_KEY,
            selectedMailbox,
          ],
        });
      },
      onError: (error) => {
        console.error('Delete Email Failed:', error);
        notification.error({
          message: 'Delete Email Failed',
          description: 'Could not delete the email. Please try again.',
        });
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
      if (!emails?.emails) return;
      const email = emails.emails.find((e: IEmail) => e.id === emailId);
      if (email && email.isRead === false) {
        queryClient.setQueryData(
          [API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_KEY, selectedMailbox],
          (oldData: { emails: IEmail[] } | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              emails: oldData.emails.map((e: IEmail) =>
                e.id === emailId ? { ...e, isRead: true } : e,
              ),
            };
          },
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
            queryKey: [
              API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_KEY,
              selectedMailbox,
            ],
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

  const handleForwardEmail = async (params: IForwardEmailParams) => {
    try {
      if (!selectedEmail) {
        notification.error({ message: 'No email selected to forward' });
        return;
      }
      await forwardEmail({ id: selectedEmail, params });
    } catch (error) {
      console.error('Forward Email Failed:', error);
    }
  };

  const handlePageChange = (value: number) => {
    updateSearchQuery({ [PARAMS_URL.PAGE]: value }, true);
  };

  const handleSearch = (query: string) => {
    updateSearchQuery({ [PARAMS_URL.SEARCH_EMAIL]: query });
  };

  const handleToggleStar = async (emailId: string, isStarred: boolean) => {
    try {
      const action = isStarred ? 'unstar' : 'star';
      await modifyEmail({
        id: emailId,
        action: action,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: [API_PATH.EMAIL.GET_DETAIL_MAIL.API_KEY, emailId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_KEY,
          selectedMailbox,
        ],
      });
      
      notification.success({
        message: isStarred ? 'Unstarred' : 'Starred',
        description: `Email ${isStarred ? 'unstarred' : 'starred'} successfully`,
      });
    } catch (error) {
      console.error('Toggle star failed:', error);
      notification.error({
        message: 'Failed to toggle star',
      });
    }
  };

  const handleMarkAsRead = async (emailIds: string[]) => {
    try {
      // Mark all selected emails as read in parallel
      await Promise.all(
        emailIds.map((emailId) =>
          modifyEmail({
            id: emailId,
            action: 'mark_read',
          })
        )
      );
      
      // Clear checked emails
      setCheckedEmails(new Set());
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: [
          API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_KEY,
          selectedMailbox,
        ],
      });
      
      notification.success({
        message: 'Marked as read',
        description: `${emailIds.length} email(s) marked as read`,
      });
    } catch (error) {
      console.error('Mark as read failed:', error);
      notification.error({
        message: 'Failed to mark emails as read',
        description: 'Please try again',
      });
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    try {
      await deleteEmail(emailId);
      if (selectedEmail === emailId) {
        setSelectedEmail(null);
      }
      setCheckedEmails((prev) => {
        const newChecked = new Set(prev);
        newChecked.delete(emailId);
        return newChecked;
      });
    } catch (error) {
      console.error('Delete Email Failed:', error);
    }
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

    handleForwardEmail,
    isForwardEmailPending,

    modifyEmail,
    isModifyEmailPending,

    handleToggleStar,
    handleMarkAsRead,
    handleDeleteEmail,
    isDeleteEmailPending,

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
    currentPage,
    pageSize,
  };
};
