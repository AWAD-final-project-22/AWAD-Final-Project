import { API_PATH } from '@/constants/apis.constant';
import axiosClient from '@/services/api/apiClient';
import { AxiosResponse } from 'axios';
import { IEmail, IMailbox } from '../interfaces/mailAPI.interface';

// Get list mail boxes
export function getListMailBoxes(): Promise<AxiosResponse<IMailbox[]>> {
  return axiosClient.get<IMailbox[]>(
    API_PATH.EMAIL.GET_LIST_MAILBOXES.API_PATH,
  );
}

// Get list emails by mail box id
export function getListEmailsByMailBoxId(
  id: string,
): Promise<AxiosResponse<IEmail[]>> {
  return axiosClient.get<IEmail[]>(
    API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_PATH(id),
  );
}

// Get email detail by email id
export function getEmailDetailById(id: string): Promise<AxiosResponse<IEmail>> {
  return axiosClient.get<IEmail>(API_PATH.EMAIL.GET_DETAIL_MAIL.API_PATH(id));
}
