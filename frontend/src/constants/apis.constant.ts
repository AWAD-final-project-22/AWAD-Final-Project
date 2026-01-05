export const API_PATH = {
  AUTHENTICATE: {
    REGISTER: {
      API_PATH: '/auth/register',
      API_KEY: 'register',
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
    REPLY_EMAIL: {
      API_PATH: (id: string) => `/mail/emails/${id}/reply`,
      API_KEY: 'replyEmail',
    },
    SEND_EMAIL: {
      API_PATH: '/mail/emails/send',
      API_KEY: 'sendEmail',
    },
    MODIFY_EMAIL: {
      API_PATH: (id: string) => `/mail/emails/${id}/modify`,
      API_KEY: 'modifyEmail',
    },
    ATTACHMENT_DOWNLOAD: {
      API_PATH: (messageId: string, attachmentId: string) =>
        `/mail/attachments/${messageId}/${attachmentId}`,
      API_KEY: 'attachmentDownload',
    },
  },
  WORKFLOW: {
    GET_WORKFLOWS: {
      API_PATH: '/workflows',
      API_KEY: 'getWorkflows',
    },
    SEARCH_WORKFLOWS: {
      API_PATH: '/workflows/search',
      API_KEY: 'searchWorkflows',
    },
    SUGGESTIONS: {
      API_PATH: '/workflows/search/suggestions',
      API_KEY: 'searchSuggestions',
    },
    UPDATE_STATUS: {
      API_PATH: (id: string) => `/workflows/${id}/status`,
      API_KEY: 'updateWorkflowStatus',
    },
    UPDATE_SNOOZE: {
      API_PATH: (id: string) => `/workflows/${id}/snooze`,
      API_KEY: 'updateWorkflowSnooze',
    },
  },
  KANBAN: {
    GET_COLUMNS: {
      API_PATH: '/kanban/columns',
      API_KEY: 'getKanbanColumns',
    },
    CREATE_COLUMN: {
      API_PATH: '/kanban/columns',
      API_KEY: 'createKanbanColumn',
    },
    UPDATE_COLUMN: {
      API_PATH: (id: string) => `/kanban/columns/${id}`,
      API_KEY: 'updateKanbanColumn',
    },
    DELETE_COLUMN: {
      API_PATH: (id: string) => `/kanban/columns/${id}`,
      API_KEY: 'deleteKanbanColumn',
    },
    MOVE_CARD: {
      API_PATH: (cardId: string) => `/kanban/cards/${cardId}/move`,
      API_KEY: 'moveKanbanCard',
    },
  },
};
