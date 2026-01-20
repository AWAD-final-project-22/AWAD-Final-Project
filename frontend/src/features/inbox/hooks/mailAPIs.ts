import { API_PATH } from '@/constants/apis.constant';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useAppSelector } from '@/redux/hooks';
import { selectCurrentUser } from '@/redux/slices/authSlice';
import {
  EMAIL_LIST_LIMIT,
  generateCacheKey,
  logOfflineCache,
  readCache,
  STORES,
  writeCache,
} from '@/helpers/offlineCache.helper';
import {
  getEmailDetailById,
  getListEmailsByMailBoxId,
  getListMailBoxes,
  modifyEmailById,
  modifyEmailLabels,
  replyEmailById,
  forwardEmailById,
  sendEmail,
  streamAttachmentById,
  deleteEmailById,
} from '../services/mailQueries';
import { UseMutationLoginOptions } from '@/interfaces/query';
import {
  IEmailParams,
  IEmailResponse,
  IReplyEmailParams,
  IForwardEmailParams,
  IEmailDetail,
  IMailbox,
} from '../interfaces/mailAPI.interface';

// Hook to get list of mail boxes
export const useGetMailBoxes = () => {
  const { isOnline } = useNetworkStatus();
  const userId = useAppSelector(selectCurrentUser)?.id || 'anonymous';
  const queryClient = useQueryClient();
  const queryKey = [API_PATH.EMAIL.GET_LIST_MAILBOXES.API_KEY, userId];
  const cacheKey = generateCacheKey(userId);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const cached = await readCache<IMailbox[]>(STORES.mailboxes, cacheKey);
      logOfflineCache('mailboxes cache read', { cacheKey, hit: !!cached });
      if (!isOnline) {
        logOfflineCache('mailboxes offline return', { cacheKey, hit: !!cached });
        return cached || [];
      }

      const fetchAndUpdate = async () => {
        logOfflineCache('mailboxes fetch start', { cacheKey });
        const response = await getListMailBoxes();
        await writeCache(STORES.mailboxes, cacheKey, response.data);
        queryClient.setQueryData(queryKey, response.data);
        logOfflineCache('mailboxes fetch success', {
          cacheKey,
          count: response.data?.length,
        });
        return response.data;
      };

      if (cached) {
        logOfflineCache('mailboxes return cached', { cacheKey });
        setTimeout(() => {
          logOfflineCache('mailboxes background fetch', { cacheKey });
          fetchAndUpdate().catch((error) => {
            console.warn('[offline-cache] mailboxes refresh failed', error);
          });
        }, 0);
        return cached;
      }

      logOfflineCache('mailboxes cache miss', { cacheKey });
      return fetchAndUpdate();
    },
  });
};

// Hook to get list of emails by mail box id
export const useGetEmailsByMailBoxId = (params: IEmailParams, id: string) => {
  const { isOnline } = useNetworkStatus();
  const userId = useAppSelector(selectCurrentUser)?.id || 'anonymous';
  const queryClient = useQueryClient();
  const page = params.page || 1;
  const limit = params.limit || 20;
  const search = params.search || '';
  const filter = params.filter || '';
  const cacheKey = generateCacheKey(userId, id, page, limit, search, filter);
  const queryKey = [
    API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_KEY,
    id,
    userId,
    page,
    limit,
    search,
    filter,
  ];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const cached = await readCache<IEmailResponse>(STORES.emailLists, cacheKey);
      logOfflineCache('emails cache read', {
        cacheKey,
        mailboxId: id,
        page,
        limit,
        search,
        filter,
        hit: !!cached,
      });
      if (!isOnline) {
        logOfflineCache('emails offline return', { cacheKey, mailboxId: id });
        return (
          cached || {
            emails: [],
            page,
            limit,
            total: 0,
          }
        );
      }

      const fetchAndUpdate = async () => {
        logOfflineCache('emails fetch start', { cacheKey, mailboxId: id });
        const response = await getListEmailsByMailBoxId(params, id);
        const limitedEmails = response.data.emails.slice(0, EMAIL_LIST_LIMIT);
        const updated = {
          ...response.data,
          emails: limitedEmails,
        };
        await writeCache(STORES.emailLists, cacheKey, updated);
        queryClient.setQueryData(queryKey, updated);
        logOfflineCache('emails fetch success', {
          cacheKey,
          mailboxId: id,
          count: response.data?.emails?.length,
        });
        return response.data;
      };

      if (cached) {
        logOfflineCache('emails return cached', { cacheKey, mailboxId: id });
        setTimeout(() => {
          logOfflineCache('emails background fetch', { cacheKey, mailboxId: id });
          fetchAndUpdate().catch((error) => {
            console.warn('[offline-cache] email list refresh failed', error);
          });
        }, 0);
        return cached;
      }

      logOfflineCache('emails cache miss', { cacheKey, mailboxId: id });
      return fetchAndUpdate();
    },
    enabled: !!id,
  });
};

// Hook to get email detail by email id
export const useGetEmailDetailById = (id: string) => {
  const { isOnline } = useNetworkStatus();
  const userId = useAppSelector(selectCurrentUser)?.id || 'anonymous';
  const queryClient = useQueryClient();
  const cacheKey = generateCacheKey(userId, id);
  const queryKey = [API_PATH.EMAIL.GET_DETAIL_MAIL.API_KEY, id, userId];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const cached = await readCache<IEmailDetail>(STORES.emailDetails, cacheKey);
      logOfflineCache('email detail cache read', {
        cacheKey,
        emailId: id,
        hit: !!cached,
      });
      if (!isOnline) {
        logOfflineCache('email detail offline return', {
          cacheKey,
          emailId: id,
        });
        return cached;
      }

      const fetchAndUpdate = async () => {
        logOfflineCache('email detail fetch start', { cacheKey, emailId: id });
        const response = await getEmailDetailById(id);
        await writeCache(STORES.emailDetails, cacheKey, response.data);
        queryClient.setQueryData(queryKey, response.data);
        logOfflineCache('email detail fetch success', { cacheKey, emailId: id });
        return response.data;
      };

      if (cached) {
        logOfflineCache('email detail return cached', { cacheKey, emailId: id });
        setTimeout(() => {
          logOfflineCache('email detail background fetch', {
            cacheKey,
            emailId: id,
          });
          fetchAndUpdate().catch((error) => {
            console.warn('[offline-cache] email detail refresh failed', error);
          });
        }, 0);
        return cached;
      }

      logOfflineCache('email detail cache miss', { cacheKey, emailId: id });
      return fetchAndUpdate();
    },
    enabled: !!id,
  });
};

// Send email
export const useMutationSendEmail = ({
  onSuccess,
  onError,
}: UseMutationLoginOptions) => {
  return useMutation({
    mutationKey: [API_PATH.EMAIL.SEND_EMAIL.API_KEY],
    mutationFn: sendEmail,
    onSuccess,
    onError,
  });
};

// Reply email by email id
export const useMutationReplyEmailById = ({
  onSuccess,
  onError,
}: UseMutationLoginOptions) => {
  return useMutation({
    mutationKey: [API_PATH.EMAIL.REPLY_EMAIL.API_KEY],
    mutationFn: ({ id, params }: { id: string; params: IReplyEmailParams }) =>
      replyEmailById(id, params),
    onSuccess,
    onError,
  });
};

// Forward email by email id
export const useMutationForwardEmailById = ({
  onSuccess,
  onError,
}: UseMutationLoginOptions) => {
  return useMutation({
    mutationKey: [API_PATH.EMAIL.FORWARD_EMAIL.API_KEY],
    mutationFn: ({ id, params }: { id: string; params: IForwardEmailParams }) =>
      forwardEmailById(id, params),
    onSuccess,
    onError,
  });
};

// Modify email by email id
export const useMutationModifyEmailById = ({
  onSuccess,
  onError,
}: UseMutationLoginOptions) => {
  return useMutation({
    mutationKey: [API_PATH.EMAIL.MODIFY_EMAIL.API_KEY],
    mutationFn: ({
      id,
      action,
      addLabelIds,
      removeLabelIds,
    }: {
      id: string;
      action?: string;
      addLabelIds?: string[];
      removeLabelIds?: string[];
    }) => modifyEmailById(id, action, addLabelIds, removeLabelIds),
    onSuccess,
    onError,
  });
};

// Modify email labels (add/remove)
export const useMutationModifyEmailLabels = ({
  onSuccess,
  onError,
}: UseMutationLoginOptions) => {
  return useMutation({
    mutationKey: [API_PATH.EMAIL.MODIFY_EMAIL.API_KEY, 'labels'],
    mutationFn: ({
      id,
      addLabelIds,
      removeLabelIds,
      action,
    }: {
      id: string;
      addLabelIds?: string[];
      removeLabelIds?: string[];
      action?: string;
    }) => modifyEmailLabels(id, addLabelIds, removeLabelIds, action),
    onSuccess,
    onError,
  });
};

// Delete email by email id
export const useMutationDeleteEmail = ({
  onSuccess,
  onError,
}: UseMutationLoginOptions) => {
  return useMutation({
    mutationKey: [API_PATH.EMAIL.DELETE_EMAIL.API_KEY],
    mutationFn: (id: string) => deleteEmailById(id),
    onSuccess,
    onError,
  });
};

// Stream attachment
export const useGetAttachmentById = (
  messageId: string,
  attachmentId: string,
) => {
  return useQuery({
    queryKey: [
      API_PATH.EMAIL.ATTACHMENT_DOWNLOAD.API_KEY,
      messageId,
      attachmentId,
    ],
    queryFn: () => streamAttachmentById(messageId, attachmentId),
    select: (response) => response.data,
    enabled: !!messageId && !!attachmentId,
  });
};

export const useMutationDownloadAttachment = ({
  onError,
}: UseMutationLoginOptions) => {
  return useMutation({
    mutationKey: [API_PATH.EMAIL.ATTACHMENT_DOWNLOAD.API_KEY],
    mutationFn: ({
      messageId,
      attachmentId,
    }: {
      messageId: string;
      attachmentId: string;
    }) => streamAttachmentById(messageId, attachmentId),
    onError,
  });
};
