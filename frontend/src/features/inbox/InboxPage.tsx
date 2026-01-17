'use client';

import { useWindowSize } from '@/hooks/useWindowSize';
import { useLogoutSync } from '@/hooks/useLogoutSync';
import { useMutationLogout } from '@/hooks/apis/authenAPIs';
import { useAppDispatch } from '@/redux/hooks';
import { setAccessToken } from '@/redux/slices/authSlice';
import { breakpoints } from '@/themes/breakpoint';
import { App, Layout } from 'antd';
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ComposeEmailModal } from './components/ComposeEmailModal';
import { EmailDetailPanel } from './components/EmailDetailPanel';
import { EmailListPanel } from './components/EmailListPanel';
import { MobileHeaderBar } from './components/MobileHeaderBar';
import { Sidebar } from './components/SideBar';
import { useInbox } from './hooks/useInbox';
import { DivEmail, StyledLayout } from './styles/InboxPage.style';
import { PARAMS_URL } from '@/constants/params.constant';

const InboxPage: React.FC = () => {
  const windowSize = useWindowSize();
  const isMobile = windowSize.width <= parseInt(breakpoints.xl);
  const [openComposeModal, setOpenComposeModal] = useState(false);
  const searchParams = useSearchParams();
  const emailIdFromUrl = searchParams.get(PARAMS_URL.EMAIL_ID);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { notification } = App.useApp();

  const { broadcastLogout } = useLogoutSync();

  const { mutate: logout, isPending: isLoggingOut } = useMutationLogout({
    onSuccess: () => {
      notification.success({ message: 'Logged out successfully' });
      dispatch(setAccessToken(null));
      document.cookie =
        'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
      broadcastLogout();
      router.push('/login');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      notification.error({ message: 'Logout failed' });
    },
  });

  const handleLogout = () => {
    logout();
  };

  const {
    mailboxes,
    checkedEmails,
    emailDetail,
    isEmailDetailLoading,
    collapsed,
    setCollapsed,
    selectedMailbox,
    setSelectedMailbox,
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
    handleDownloadAttachment,
    handlePageChange,
    handleSearch,
    emails,
    handleDeleteEmail,
  } = useInbox({ isMobile, mailID: emailIdFromUrl || undefined });

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
        />

        <Layout>
          <MobileHeaderBar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            showEmailList={showEmailList}
            handleBackToList={handleBackToList}
            isMobile={isMobile}
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
              emails={emails}
              handleDeleteEmail={handleDeleteEmail}
            />

            <EmailDetailPanel
              show={!isMobile || showEmailDetail}
              email={emailDetail}
              handleSendReply={handleReplyEmail}
              isReplyEmailPending={isReplyEmailPending}
              isEmailDetailLoading={isEmailDetailLoading}
              onDownloadAttachment={handleDownloadAttachment}
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
