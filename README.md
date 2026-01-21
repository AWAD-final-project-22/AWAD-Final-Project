# AWAD Final Project

## 📋 Project Overview

This is the final project for the Advanced Web Application Development (AWAD) seminar. It consists of a **NestJS Backend** and a **Next.js Frontend**, providing a complete web application with authentication and business logic.

## 📂 Repository Structure

- **[backend/](backend/README.md)**: NestJS application (API, Database, Auth).
- **[frontend/](frontend/README.md)**: Next.js application (UI, Client-side logic).

## 🚀 Quick Start

### Option 1: Docker (Recommended) 🐳

**Prerequisites:**
- Đã có file `backend/.env` (với Neon Cloud DB + Redis Cloud)
- Đã có file `frontend/.env.local`
- Docker Compose sẽ **tự động đọc** từ các file này

**One command to run everything:**

```bash
# Start services (Backend + Frontend)
# Backend sẽ connect tới cloud services từ .env
docker-compose up -d

# View logs
docker-compose logs -f
```

**Access the application:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Database: Neon Cloud (from .env)
- Redis: Redis Cloud (from .env)

📚 **Full Docker guide**: [README.DOCKER.md](README.DOCKER.md)

---

### Option 2: Manual Setup

#### Backend

1.  Navigate to `backend/`.
2.  Follow the instructions in [backend/README.md](backend/README.md) to setup and run the server.

#### Frontend

1.  Navigate to `frontend/`.
2.  Follow the instructions in [frontend/README.md](frontend/README.md) to setup and run the client.

## ☁️ Deployment

### Live Demo

- **Frontend**: [Update URL here]
- **Backend**: [https://awad-final-project.vercel.app](https://awad-final-project.vercel.app)

For detailed deployment instructions and reproduction steps, please refer to:

- [Backend Deployment](backend/README.md#deployment)
- [Frontend Deployment](frontend/README.md#deployment)

## 🔐 Security & Tokens

Details about token storage (JWT, Cookies, localStorage) and security considerations are documented in:

- [Backend Security](backend/README.md#token-storage--security)
- [Frontend Security](frontend/README.md#token-storage--security)

## 🔌 Third-Party Services

- **Google OAuth**: For authentication.
- **PostgreSQL**: Database.
- **Ant Design**: UI Library.

---

**Authors**: AWAD Seminar Team
