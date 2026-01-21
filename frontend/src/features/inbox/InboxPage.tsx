'use client';

import { useWindowSize } from '@/hooks/useWindowSize';
import { useLogout } from '@/hooks/useLogout';
import { breakpoints } from '@/themes/breakpoint';
import { App, Layout } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ComposeEmailModal } from './components/ComposeEmailModal';
import { EmailDetailPanel } from './components/EmailDetailPanel';
import { EmailListPanel } from './components/EmailListPanel';
import { MobileHeaderBar } from './components/MobileHeaderBar';
import { Sidebar } from './components/SideBar';
import { useInbox } from './hooks/useInbox';
import { useInboxKeyboardNav } from './hooks/useInboxKeyboardNav';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { DivEmail, StyledLayout } from './styles/InboxPage.style';
import { PARAMS_URL } from '@/constants/params.constant';
import { API_PATH } from '@/constants/apis.constant';
import { clearExpiredCache } from '@/helpers/offlineCache.helper';

const InboxPage: React.FC = () => {
  const windowSize = useWindowSize();
  const isMobile = windowSize.width <= parseInt(breakpoints.xl);
  const [openComposeModal, setOpenComposeModal] = useState(false);
  const searchParams = useSearchParams();
  const emailIdFromUrl = searchParams.get(PARAMS_URL.EMAIL_ID);
  const { notification } = App.useApp();
  const { isOnline } = useNetworkStatus();
  const prevOnlineRef = useRef(isOnline);
  const queryClient = useQueryClient();

  const { handleLogout, isLoggingOut } = useLogout();

  const {
    mailboxes,
    checkedEmails,
    emailDetail,
    isEmailDetailLoading,
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
    isEmailsLoading,
    selectedEmailData,
    handleSendEmail,
    isSendEmailPending,
    handleReplyEmail,
    isReplyEmailPending,
    handleForwardEmail,
    isForwardEmailPending,
    handleDownloadAttachment,
    handlePageChange,
    handleSearch,
    emails,
    handleToggleStar,
    handleMarkAsRead,
    handleDeleteEmail,
    currentPage,
    pageSize,
  } = useInbox({ isMobile, mailID: emailIdFromUrl || undefined });

  useEffect(() => {
    const wasOnline = prevOnlineRef.current;
    if (wasOnline === isOnline) return;

    if (!isOnline) {
      notification.warning({
        message: 'Offline mode',
        description: 'Showing cached data.',
      });
    } else {
      notification.success({
        message: 'Back online',
        description: 'Data will refresh automatically.',
      });
      (async () => {
        try {
          await clearExpiredCache();
        } catch (error) {
          console.warn('[offline-cache] cleanup failed', error);
        }
        queryClient.invalidateQueries({
          queryKey: [API_PATH.EMAIL.GET_LIST_MAILBOXES.API_KEY],
        });
        queryClient.invalidateQueries({
          queryKey: [API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_KEY],
        });
        queryClient.invalidateQueries({
          queryKey: [API_PATH.EMAIL.GET_DETAIL_MAIL.API_KEY],
        });
      })();
    }

    prevOnlineRef.current = isOnline;
  }, [isOnline, notification, queryClient]);

  useInboxKeyboardNav({
    emails: filteredEmails,
    selectedEmailId: selectedEmail,
    onSelectEmail: handleEmailClick,
    isMobile,
    showEmailDetail,
    onBackToList: handleBackToList,
    searchInputId: 'inbox-search-input',
  });

  return (
    <>
      <StyledLayout>
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobile={isMobile}
          selectedMailbox={selectedMailbox}
          setSelectedMailbox={setSelectedMailbox}
          mailboxes={mailboxes || []}
          searchText={searchText}
          setSearchText={setSearchText}
          setOpenComposeModal={setOpenComposeModal}
          handleSearch={handleSearch}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
          isOnline={isOnline}
        />

        <Layout>
          <MobileHeaderBar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            showEmailList={showEmailList}
            handleBackToList={handleBackToList}
            isMobile={isMobile}
            isOnline={isOnline}
          />

          <DivEmail $isMobile={isMobile}>
            <EmailListPanel
              showEmailList={showEmailList}
              checkedEmails={checkedEmails}
              handleSelectAll={handleSelectAll}
              filteredEmails={filteredEmails}
              handleCheckboxChange={handleCheckboxChange}
              handleEmailClick={handleEmailClick}
              isMobile={isMobile}
              selectedEmail={selectedEmailData}
              isEmailsLoading={isEmailsLoading}
              handlePageChange={handlePageChange}
              currentPage={currentPage}
              pageSize={pageSize}
              emails={emails}
              handleMarkAsRead={handleMarkAsRead}
              handleToggleStar={handleToggleStar}
              handleDeleteEmail={handleDeleteEmail}
            />

            <EmailDetailPanel
              show={!isMobile || showEmailDetail}
              email={emailDetail ?? undefined}
              handleSendReply={handleReplyEmail}
              isReplyEmailPending={isReplyEmailPending}
              handleSendForward={handleForwardEmail}
              isForwardEmailPending={isForwardEmailPending}
              isEmailDetailLoading={isEmailDetailLoading}
              onDownloadAttachment={handleDownloadAttachment}
              handleToggleStar={handleToggleStar}
              handleDeleteEmail={handleDeleteEmail}
            />
          </DivEmail>
        </Layout>
      </StyledLayout>
      <ComposeEmailModal
        open={openComposeModal}
        onClose={() => setOpenComposeModal(false)}
        onSend={handleSendEmail}
        isSendEmailPending={isSendEmailPending}
      />
    </>
  );
};

export default InboxPage;
