export const API_PATH = {
  AUTHENTICATE: {
    REGISTER: {
      API_PATH: '/users/register',
      API_KEY: 'resgister',
    },
    LOGIN: {
      API_PATH: '/auth/login',
      API_KEY: 'login',
    },
    GOOGLE_LOGIN: {
      API_PATH: '/auth/google',
      API_KEY: 'googleLogin',
    },
    LOGOUT: {
      API_PATH: '/auth/logout',
      API_KEY: 'logout',
    },
    REFRESH_TOKEN: {
      API_PATH: '/auth/refresh-token',
      API_KEY: 'refreshToken',
    },
  },

  USER: {
    PROFILE: {
      API_PATH: '/auth/profile',
      API_KEY: 'userProfile',
    },
  },
  EMAIL: {
    GET_LIST_MAILBOXES: {
      API_PATH: '/mail/mailboxes',
      API_KEY: 'getListMailboxes',
    },
    GET_LIST_EMAILS_MAILBOX: {
      API_PATH: (id: string) => `/mail/mailboxes/${id}/emails`,
      API_KEY: 'getListEmailsMailbox',
    },
    GET_DETAIL_MAIL: {
      API_PATH: (id: string) => `/mail/emails/${id}`,
      API_KEY: 'getDetailMail',
    },
  },
};
