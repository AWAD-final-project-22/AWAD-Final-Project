import { API_PATH } from "@/constants/apis.constant";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getEmailDetailById,
  getListEmailsByMailBoxId,
  getListMailBoxes,
  modifyEmailById,
  replyEmailById,
  sendEmail,
  streamAttachmentById,
} from "../services/mailQueries";
import { UseMutationLoginOptions } from "@/interfaces/query";
import {
  IEmailParams,
  IReplyEmailParams,
} from "../interfaces/mailAPI.interface";

// Hook to get list of mail boxes
export const useGetMailBoxes = () => {
  return useQuery({
    queryKey: [API_PATH.EMAIL.GET_LIST_MAILBOXES.API_KEY],
    queryFn: getListMailBoxes,
    select: (response) => response.data,
  });
};

// Hook to get list of emails by mail box id
export const useGetEmailsByMailBoxId = (params: IEmailParams, id: string) => {
  return useQuery({
    queryKey: [API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_KEY, id],
    queryFn: () => getListEmailsByMailBoxId(params, id),
    select: (response) => response.data,
    enabled: !!id,
  });
};

// Hook to get email detail by email id
export const useGetEmailDetailById = (id: string) => {
  return useQuery({
    queryKey: [API_PATH.EMAIL.GET_DETAIL_MAIL.API_KEY, id],
    queryFn: () => getEmailDetailById(id),
    select: (response) => response.data,
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

// Modify email by email id
export const useMutationModifyEmailById = ({
  onSuccess,
  onError,
}: UseMutationLoginOptions) => {
  return useMutation({
    mutationKey: [API_PATH.EMAIL.MODIFY_EMAIL.API_KEY],
    mutationFn: (id: string) => modifyEmailById(id),
    onSuccess,
    onError,
  });
};

// Stream attachment
export const useGetAttachmentById = (
  messageId: string,
  attachmentId: string
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
