# Backend - AWAD Final Project

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Setup and Run Instructions](#setup-and-run-instructions)
4. [Environment Variables](#environment-variables)
5. [Deployment](#deployment)
6. [Token Storage & Security](#token-storage--security)
7. [Third-Party Services](#third-party-services)

---

## 🎯 Project Overview

This is the backend for the AWAD Final Project, built with **NestJS**. It provides RESTful APIs for authentication and business logic, following a clean architecture approach.

## 🛠 Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: Passport.js, JWT (Access & Refresh Tokens), Google OAuth
- **Validation**: class-validator, class-transformer

---

## 🚀 Setup and Run Instructions

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- PostgreSQL database

### 1. Clone the repository

```bash
git clone <repository-url>
cd backend
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

### 4. Run Database Migrations (Prisma)

```bash
npx prisma generate
npx prisma migrate dev

```

### 5. Run the Application

**Development Mode:**

```bash
npm run start:dev
```

**Production Mode:**

```bash
npm run build
npm run start:prod
```

---

## 🌿 Environment Variables

Create a `.env` file in the `backend` root directory.

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

# JWT Secrets
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# CORS
FRONTEND_URL="http://localhost:3000,http://localhost:3001"
```

---

## ☁️ Deployment

### Public Hosting URL

**[awad-final-project.vercel.app](https://awad-final-project.vercel.app)**

### How to Reproduce Deployment Locally

1.  Ensure PostgreSQL is running.
2.  Set up `.env` with production credentials.
3.  Build the project: `npm run build`.
4.  Start the production server: `npm run start:prod`.
5.  (Optional) Use Docker:
    - Create a `Dockerfile`.
    - Build image: `docker build -t backend-app .`.
    - Run container: `docker run -p 3000:3000 --env-file .env backend-app`.

---

## 🔐 Token Storage & Security

### Token Strategy

- **Access Token**: Short-lived JWT used for authorizing API requests.
- **Refresh Token**: Long-lived JWT used to obtain new access tokens.

### Security Considerations

- **Hashing**: Passwords are hashed using `bcrypt` before storage.
- **Validation**: All inputs are validated using DTOs and `class-validator`.
- **CORS**: Configured to allow requests only from trusted frontend origins (specified in `FRONTEND_URL`).
- **OAuth**: Google OAuth tokens are verified using `google-auth-library`.

---

## 🔌 Third-Party Services

1.  **Google OAuth**: Used for "Sign in with Google".
    - Library: `google-auth-library`
    - Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
2.  **PostgreSQL**: Relational database for storing user data.
    - ORM: `Prisma`
