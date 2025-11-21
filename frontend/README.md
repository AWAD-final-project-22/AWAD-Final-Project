# Frontend - AWAD Final Project

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Setup and Run Instructions](#setup-and-run-instructions)
4. [Environment Variables](#environment-variables)
5. [Deployment](#deployment)
6. [Token Storage & Security](#token-storage--security)
7. [Third-Party Services](#third-party-services)
8. [Project Structure](#project-structure)

---

## 🎯 Project Overview

This is the frontend for the AWAD Final Project, built with **Next.js 16**, **React 18**, and **TypeScript**. It provides a modern, responsive UI for interacting with the backend APIs.

## 🛠 Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Library**: React 18
- **Language**: TypeScript
- **Styling**: Styled-components, Ant Design
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios

---

## 🚀 Setup and Run Instructions

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Backend API running

### 1. Clone the repository

```bash
git clone <repository-url>
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

See [Environment Variables](#environment-variables) for details.

### 4. Run the Application

**Development Mode:**

```bash
npx next dev -p 3001
```

Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

**Production Mode:**

```bash
npm run build
set PORT=3001
npm run start
```

---

## 🌿 Environment Variables

| Variable                       | Description                 | Example                 |
| :----------------------------- | :-------------------------- | :---------------------- |
| `NEXT_PUBLIC_API_END_POINT`    | Base URL of the backend API | `http://localhost:3000` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID      | `your-google-client-id` |

---

## ☁️ Deployment

### Public Hosting URL

**https://awad-final.vercel.app/**

### How to Reproduce Deployment Locally

1.  Build the project: `npm run build`.
2.  Start the production server: `npm run start`.
3.  Ensure `NEXT_PUBLIC_API_END_POINT` points to the production backend URL.

---

## 🔐 Token Storage & Security

### Storage Strategy

- **Access Token**: Stored in **localStorage**.
  - _Reason_: Easy to access for adding to Authorization headers in API requests.
  - _Security Note_: Vulnerable to XSS. Ensure strict Content Security Policy (CSP) and sanitize user inputs.
- **Refresh Token**: Stored in **HTTP-only Cookie** (handled by backend) or **localStorage** (if backend returns it in body).
  - _Current Implementation_: The `useLogin` hook saves `refreshToken` to `localStorage` and also sets a cookie.
  - _Recommendation_: Prefer HTTP-only cookies for refresh tokens to prevent XSS attacks.

### Authentication Flow

1.  User logs in.
2.  Backend returns `accessToken` and `refreshToken`.
3.  Frontend saves tokens.
4.  Axios interceptor attaches `accessToken` to every request.
5.  If `accessToken` expires (401), interceptor uses `refreshToken` to get a new `accessToken`.

---

## 🔌 Third-Party Services

1.  **Google OAuth**: Used for "Sign in with Google".
    - Library: `@react-oauth/google`
    - Requires a Google Cloud Console project with OAuth 2.0 Client ID.
2.  **Ant Design**: UI Component Library.
    - Used for layout, forms, notifications, and general UI elements.

---

## 📂 Project Structure

```
src/
├── app/                 # Next.js App Router pages & layouts
├── features/            # Feature-based modules (Login, Home, etc.)
├── services/            # Shared API services (Axios client)
├── constants/           # App constants (API paths, routes)
├── libs/                # Library configurations (AntD, React Query)
└── interfaces/          # TypeScript interfaces
```
