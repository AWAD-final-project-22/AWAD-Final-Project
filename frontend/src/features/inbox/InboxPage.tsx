'use client';

import { useWindowSize } from '@/hooks/useWindowSize';
import { breakpoints } from '@/themes/breakpoint';
import { Layout } from 'antd';
import React, { useState } from 'react';
import { ComposeEmailModal } from './components/ComposeEmailModal';
import { EmailDetailPanel } from './components/EmailDetailPanel';
import { EmailListPanel } from './components/EmailListPanel';
import { MobileHeaderBar } from './components/MobileHeaderBar';
import { Sidebar } from './components/SideBar';
import { useInbox } from './hooks/useInbox';
import { DivEmail, StyledLayout } from './styles/InboxPage.style';

const InboxPage: React.FC = () => {
  const windowSize = useWindowSize();
  const isMobile = windowSize.width <= parseInt(breakpoints.xl);
  const [openComposeModal, setOpenComposeModal] = useState(false);
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
  } = useInbox({ isMobile });

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
            />

            <EmailDetailPanel
              show={!isMobile || showEmailDetail}
              email={emailDetail}
              handleSendReply={handleReplyEmail}
              isReplyEmailPending={isReplyEmailPending}
              isEmailDetailLoading={isEmailDetailLoading}
              onDownloadAttachment={handleDownloadAttachment}
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
