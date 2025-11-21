'use client';

import { useWindowSize } from '@/hooks/useWindowSize';
import { breakpoints } from '@/themes/breakpoint';
import { Layout } from 'antd';
import React, { useState } from 'react';
import { EmailDetailPanel } from './components/EmailDetailPanel';
import { MobileHeaderBar } from './components/MobileHeaderBar';
import { Sidebar } from './components/SideBar';
import { useInbox } from './hooks/useInbox';
import { DivEmailList, StyledLayout } from './styles/InboxPage.style';
import { EmailListPanel } from './components/EmailListPanel';
import { IEmail } from './interfaces/mailAPI.interface';

const InboxPage: React.FC = () => {
  const [checkedEmails, setCheckedEmails] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMailbox, setSelectedMailbox] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [showEmailList, setShowEmailList] = useState(true);
  const [showEmailDetail, setShowEmailDetail] = useState(false);
  const windowSize = useWindowSize();
  const isMobile = windowSize.width <= Number(breakpoints.md);

  const { mailboxes, emails } = useInbox({
    mailBoxID: selectedMailbox,
    mailID: selectedEmail || '',
  });

  const handleCheckboxChange = (emailId: string, checked: boolean) => {
    const newCheckedEmails = new Set(checkedEmails);
    if (checked) {
      newCheckedEmails.add(emailId);
    } else {
      newCheckedEmails.delete(emailId);
    }
    setCheckedEmails(newCheckedEmails);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setCheckedEmails(
        new Set(filteredEmails?.map((email: IEmail) => email.id)),
      );
    } else {
      setCheckedEmails(new Set());
    }
  };

  const filteredEmails = emails?.filter(
    (email: IEmail) =>
      email.mailboxId === selectedMailbox &&
      (email.subject.toLowerCase().includes(searchText.toLowerCase()) ||
        email.sender.toLowerCase().includes(searchText.toLowerCase()) ||
        email.preview.toLowerCase().includes(searchText.toLowerCase())),
  );

  const selectedEmailData = emails?.find(
    (email: IEmail) => email.id === selectedEmail,
  );

  const handleEmailClick = (emailId: string) => {
    setSelectedEmail(emailId);
    if (isMobile) {
      setShowEmailList(false);
      setShowEmailDetail(true);
    }
  };

  const handleBackToList = () => {
    setShowEmailList(true);
    setShowEmailDetail(false);
  };

  return (
    <StyledLayout>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
        selectedMailbox={selectedMailbox}
        setSelectedMailbox={setSelectedMailbox}
        mailboxes={mailboxes || []}
        emails={emails || []}
        searchText={searchText}
        setSearchText={setSearchText}
      />

      <Layout>
        <MobileHeaderBar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          showEmailList={showEmailList}
          handleBackToList={handleBackToList}
        />

        <DivEmailList>
          <EmailListPanel
            showEmailList={showEmailList}
            checkedEmails={checkedEmails}
            handleSelectAll={handleSelectAll}
            filteredEmails={filteredEmails || []}
            handleCheckboxChange={handleCheckboxChange}
            handleEmailClick={handleEmailClick}
          />

          <EmailDetailPanel
            show={!isMobile || showEmailDetail}
            email={selectedEmailData}
          />
        </DivEmailList>
      </Layout>
    </StyledLayout>
  );
};

export default InboxPage;
