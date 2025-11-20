# Backend Refactoring Report: Clean & Hexagonal Architecture

## 1. Mục tiêu (Objectives)

Refactor backend hiện tại để tuân thủ nghiêm ngặt **Clean Architecture** và **Hexagonal Architecture (Ports & Adapters)**, nhằm đạt được:

- **Sự tách biệt rõ ràng (Separation of Concerns):** Giữa logic nghiệp vụ (Domain/Application) và hạ tầng kỹ thuật (Infrastructure/Presentation).
- **Khả năng mở rộng (Scalability):** Module hóa code base, dễ dàng thêm feature mới mà không ảnh hưởng code cũ.
- **Khả năng kiểm thử (Testability):** Dependency Injection chuẩn giúp dễ dàng mock dependencies trong Unit Test.
- **Chuẩn hóa code (Standardization):** Áp dụng các best practice của NestJS (Abstract Class DI, Module per Feature, Global Filters).

## 2. Kiến Trúc Mới (Architecture Overview)

Cấu trúc thư mục đã được tổ chức lại theo 4 layer chuẩn:

```
backend/src/
├── domain/                 # Enterprise Business Logic (Pure TS, no NestJS deps)
│   ├── entities/           # Core Entities với logic domain (User, Email)
│   └── repositories/       # Abstract Classes (Ports) định nghĩa contract cho Data Access
│
├── application/            # Application Business Logic
│   ├── use-cases/          # Các Use Case cụ thể (Login, Register, GetEmails...)
│   └── ports/              # Abstract Classes (Ports) cho các service bên ngoài (Hasher, Tokenizer)
│
├── infrastructure/         # Frameworks & Drivers (Adapters)
│   ├── database/           # Prisma Service
│   ├── repositories/       # Implementation của Repositories (Prisma, Mock)
│   ├── services/           # Implementation của Services (Bcrypt, JWT)
│   ├── mappers/            # Chuyển đổi Data Model (DB) <-> Domain Entity
│   └── infrastructure.module.ts # Module gom toàn bộ adapter hạ tầng
│
├── presentation/           # Interface Adapters (HTTP Layer)
│   ├── controllers/        # API Controllers
│   ├── dtos/               # Request/Response DTOs (Validation)
│   ├── guards/             # Auth Guards
│   ├── filters/            # Global Exception Filters
│   └── presentation.module.ts # Module gom toàn bộ HTTP layer
│
└── app.module.ts           # Root Module (Composition Root)
```

## 3. Chi Tiết Thay Đổi (Key Changes)

### 3.1. Dependency Injection (DI) & Ports

- **Trước:** Dùng `Interface` TypeScript + Injection Token dạng `String` (`@Inject('UserRepository')`).
- **Sau:** Chuyển sang dùng **Abstract Class**.
  - **Lợi ích:** Abstract Class đóng vai trò vừa là Type vừa là Token DI. Không cần `@Inject()` thủ công, tận dụng khả năng tự động resolve của NestJS. Code gọn và type-safe hơn.
  - **Naming Convention:** Thêm tiền tố `I` cho các abstract class (VD: `IUserRepository`) để phân biệt với implementation (`UserRepositoryImpl`).

### 3.2. Module Refactoring

- Tách nhỏ `AppModule` khổng lồ thành các module chuyên biệt:
  - **`InfrastructureModule`**: Chứa `Prisma`, `Repositories Impl`, `Services Impl`. Module này **export** các abstract class (Provider) để module khác dùng. Config `JwtModule` tại đây.
  - **`ApplicationModule`**: Gom nhóm các Use Case. Import `InfrastructureModule` để lấy implementations.
  - **`PresentationModule`**: Chứa Controllers. Import `ApplicationModule` để gọi Use Case.
- `AppModule` giờ chỉ đóng vai trò kết nối (Wiring) và cấu hình Global (ConfigModule).

### 3.3. Domain Entity & Mappers

- **Entity:** `User` entity không còn là DTO trơ (anemic) mà đã có logic (Constructor, methods `isGoogleAccount`, `setRefreshToken`).
- **Mapper:** Thêm `UserMapper` trong Infrastructure để chuyển đổi giữa `Prisma Model` (DB) và `Domain Entity`.
  - Giúp Domain layer không bị phụ thuộc vào cấu trúc Database.

### 3.4. DTO & Error Handling

- **DTO Separation:** Tách folder DTO thành `request` (Input) để rõ ràng. Thêm Swagger Decorators (`@ApiProperty`).
- **Global Exception Filter:** Tạo `GlobalExceptionFilter` để bắt các lỗi Domain (`InvalidCredentialsError`...) và map sang HTTP Status Code (401, 409...) một cách tập trung. Controller không còn try-catch rườm rà.

### 3.5. API Documentation

- Tích hợp **Swagger (OpenAPI)**.
- Truy cập tại: `localhost:3000/api`.

## 4. Hướng dẫn Kiểm thử (Verification)

Do kiến trúc thay đổi lớn về DI, cần kiểm tra kỹ các flow chính:

1.  **Authentication Flow:**
    - `POST /auth/register`: Tạo user mới.
    - `POST /auth/login`: Nhận JWT token.
    - `POST /auth/refresh-token`: Lấy token mới từ refresh token.
2.  **Email Flow:**
    - `GET /mail/mailboxes`: Lấy danh sách hòm thư (Mock).
    - `GET /mail/mailboxes/{id}/emails`: Lấy email.

## 5. Kết luận

Project đã sẵn sàng để scale. Việc thêm tính năng mới chỉ cần tạo folder Use Case mới và Controller mới mà không ảnh hưởng tới logic xác thực hay database hiện có.
