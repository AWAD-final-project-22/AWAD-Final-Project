import { App } from 'antd';
import {
  useGetAttachmentById,
  useGetEmailDetailById,
  useGetEmailsByMailBoxId,
  useGetMailBoxes,
  useMutationModifyEmailById,
  useMutationReplyEmailById,
} from './mailAPIs';
import { useControlParams } from '@/hooks/useControlParams';
import { PARAMS_URL } from '@/constants/params.constant';
import { LIMIT_DEFAULT, PAGE_DEFAULT } from '@/constants/common.constant';

interface InBoxProps {
  mailBoxID: string;
  mailID: string;
}

export const useInbox = ({ mailBoxID, mailID }: InBoxProps) => {
  const { searchParams } = useControlParams();
  const { notification } = App.useApp();

  const pPage = searchParams.get(PARAMS_URL.PAGE) || PAGE_DEFAULT;
  const pLimit = searchParams.get(PARAMS_URL.LIMIT) || LIMIT_DEFAULT;

  const { data: mailboxes, isLoading: isMailboxesLoading } = useGetMailBoxes();

  const { data: emails, isLoading: isEmailsLoading } = useGetEmailsByMailBoxId(
    { page: Number(pPage), limit: Number(pLimit) },
    mailBoxID,
  );

  const { data: emailDetail, isLoading: isEmailDetailLoading } =
    useGetEmailDetailById(mailID);

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

  const { data: streamAttachment, isLoading: isStreamAttachmentLoading } =
    useGetAttachmentById(mailID);

  return {
    mailboxes,
    isMailboxesLoading,
    emails,
    isEmailsLoading,
    emailDetail,
    isEmailDetailLoading,
    replyEmail,
    isReplyEmailPending,
    modifyEmail,
    isModifyEmailPending,
    streamAttachment,
    isStreamAttachmentLoading,
  };
};
