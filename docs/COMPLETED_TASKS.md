# Completed Tasks - Gmail Email Client

## Overview

Đánh dấu các task đã hoàn thành dựa trên codebase hiện tại.

---

## Phase 0: Foundation (DONE)

### Backend - Authentication

- [x] Basic login/register with email+password
- [x] JWT token generation (access token + refresh token)
- [x] Refresh token endpoint `/auth/refresh-token`
- [x] Google Sign-In endpoint `/auth/google` (ID Token implicit flow)
- [x] Password hashing with bcrypt
- [x] User entity with Prisma schema
- [x] Swagger documentation setup

### Backend - Email (Mock)

- [x] Mock mailboxes endpoint `GET /mail/mailboxes`
- [x] Mock emails by mailbox `GET /mail/mailboxes/:id/emails`
- [x] Mock email detail `GET /mail/emails/:id`
- [x] Mock data files (mailboxes.json, emails.json, email-details.json)

### Frontend - Authentication

- [x] Login page with email/password form
- [x] Register page
- [x] Google Sign-In button (using @react-oauth/google)
- [x] Redux store for access token
- [x] Middleware for protected routes
- [x] API client with axios interceptor

### Frontend - Inbox UI

- [x] 3-column responsive layout (Sidebar, EmailList, EmailDetail)
- [x] Sidebar with mailbox menu
- [x] Email list with checkboxes
- [x] Search functionality
- [x] Basic email detail panel
- [x] Mobile responsive with collapse
- [x] Empty state component

---

## Remaining Tasks (NOT DONE)

### Phase 1: Google OAuth2 + HttpOnly Cookies

- [x] 1.1 [BE] Database Schema Update - Add Google token fields
- [x] 1.2 [BE] Install googleapis, crypto-js, cookie-parser
- [x] 1.3 [BE] Create Encryption Service
- [x] 1.4 [BE] Create Google OAuth2 Use Case
- [x] 1.5 [BE] Update Auth Controller with HttpOnly Cookies
- [x] 1.6 [BE] Update Refresh Token Endpoint (read from cookie)
- [x] 1.7 [FE] Create OAuth Callback Page
- [x] 1.8 [FE] Update Login Page (redirect flow)

### Phase 2: Gmail API Integration

- [x] 2.1 [BE] Create Gmail Service
- [x] 2.2 [BE] Create Email Parser Utility (Implemented basic mapping)
- [x] 2.3 [BE] Create Gmail Repository (Using UseCase + GmailService instead)
- [x] 2.4 [BE] Update Email Controller (send, reply, modify, attachments) - _Done GET methods_
- [x] 2.5 [BE] Update Module Wiring

### Phase 3: Token Refresh Concurrency Guard

- [x] 3.1 [FE] Update API Client (refresh lock, queue, credentials: include)
- [x] 3.2 [FE] Update Auth State (access token in memory only)

### Phase 4: UI Enhancements

- [ ] 4.1 [FE] Update Email Detail Panel (real content, attachments)
- [ ] 4.2 [FE] Create Compose Modal
- [ ] 4.3 [FE] Wire Email Actions (star, read, delete, reply)
- [ ] 4.4 [FE] Implement Keyboard Navigation
- [ ] 4.5 [FE] Implement Pagination

### Phase 5: Stretch Goals

- [ ] 5.1 [BE+FE] Gmail Push Notifications
- [ ] 5.2 [FE] Multi-tab Logout Sync
- [ ] 5.3 [FE] Offline Caching

---

## Summary

| Category         | Done        | Remaining |
| ---------------- | ----------- | --------- |
| Backend Auth     | 6/6         | 0         |
| Backend Email    | 3/3 (Mock)  | 0 (Base)  |
| Frontend Auth    | 6/6         | 0         |
| Frontend UI      | 7/7 (Basic) | 5         |
| Token Management | 1/1 (Basic) | 0         |
| Stretch          | 0/3         | 3         |
