import { API_PATH } from '@/constants/apis.constant';
import { serializedParamsQuery } from '@/helpers/param.helper';
import axiosClient from '@/services/apis/apiClient';
import { AxiosResponse } from 'axios';
import {
  IEmailDetail,
  IEmailParams,
  IEmailResponse,
  IMailbox,
  IReplyEmailParams,
  ISendMessageParams,
} from '../interfaces/mailAPI.interface';

// Get list mail boxes
export function getListMailBoxes(): Promise<AxiosResponse<IMailbox[]>> {
  return axiosClient.get<IMailbox[]>(
    API_PATH.EMAIL.GET_LIST_MAILBOXES.API_PATH,
  );
}

// Get list emails by mail box id (also works for label id)
export function getListEmailsByMailBoxId(
  params: IEmailParams,
  id: string,
): Promise<AxiosResponse<IEmailResponse>> {
  return axiosClient.get<IEmailResponse>(
    API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_PATH(id),
    {
      params: serializedParamsQuery(params),
    },
  );
}

// Get email detail by email id
export function getEmailDetailById(
  id: string,
): Promise<AxiosResponse<IEmailDetail>> {
  return axiosClient.get<IEmailDetail>(
    API_PATH.EMAIL.GET_DETAIL_MAIL.API_PATH(id),
  );
}

// Reply email by email id
export function replyEmailById(
  id: string,
  params: IReplyEmailParams,
): Promise<AxiosResponse<void>> {
  return axiosClient.post<void>(
    API_PATH.EMAIL.REPLY_EMAIL.API_PATH(id),
    params,
  );
}

// Send email
export function sendEmail(
  params: ISendMessageParams,
): Promise<AxiosResponse<void>> {
  return axiosClient.post<void>(API_PATH.EMAIL.SEND_EMAIL.API_PATH, params);
}

// Modify email by email id
export function modifyEmailById(id: string): Promise<AxiosResponse<void>> {
  return axiosClient.post<void>(API_PATH.EMAIL.MODIFY_EMAIL.API_PATH(id));
}

// Modify email labels (add/remove)
export function modifyEmailLabels(
  id: string,
  addLabelIds?: string[],
  removeLabelIds?: string[],
): Promise<AxiosResponse<void>> {
  return axiosClient.post<void>(API_PATH.EMAIL.MODIFY_EMAIL.API_PATH(id), {
    addLabelIds,
    removeLabelIds,
  });
}

// Stream attachment by attachment id
export function streamAttachmentById(
  messageId: string,
  attachmentId: string,
): Promise<AxiosResponse<Blob>> {
  return axiosClient.get<Blob>(
    API_PATH.EMAIL.ATTACHMENT_DOWNLOAD.API_PATH(messageId, attachmentId),
    {
      responseType: 'blob',
    },
  );
}
