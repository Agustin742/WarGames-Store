# WarGames Store — Backend API

REST API built with **NestJS**, **Prisma** and **PostgreSQL** for a board games e-commerce store. Includes authentication with email verification, product/category management, image uploads and WhatsApp order generation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS |
| ORM | Prisma (PostgreSQL adapter) |
| Database | PostgreSQL |
| Auth | JWT + Passport |
| Image storage | Cloudinary |
| Email | Resend |
| Validation | class-validator / class-transformer |
| Scheduler | @nestjs/schedule |

---

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account
- Resend account (for transactional emails)

---

## Environment Variables

Create a `.env` file at the project root with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Auth
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# Orders
PHONE_NUMBER=5491112345678   # WhatsApp number (with country code, no +)

# Server
PORT=3000
```

---

## Installation

```bash
npm install
```

## Database Setup

```bash
# Run all migrations
npx prisma migrate deploy

# Or for development (creates migration from schema changes)
npx prisma migrate dev
```

## Running the App

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

## API Reference

All endpoints are prefixed with the base URL of the server (default `http://localhost:3000`).

### Auth — `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user. Sends a 6-digit verification code by email. Body: `{ "user": { "userName", "email", "password" } }` |
| POST | `/auth/verify-email` | Public | Verify email with the received code. Body: `{ "email", "code" }` |
| POST | `/auth/resend-verification` | Public | Resend verification code (only if the previous one has expired). Body: `{ "user": { "email" } }` |
| POST | `/auth/login` | Public | Login and receive a JWT token. Body: `{ "user": { "email", "password" } }` |

### User — `/user`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/user/me` | JWT | Get the authenticated user's profile |
| PATCH | `/user/me` | JWT | Update username. Body: `{ "userName" }` |
| PATCH | `/user/me/password` | JWT | Change password. Body: `{ "currentPassword", "newPassword" }` |

### Categories — `/category`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/category` | Admin | Create a category. Body: `{ "name", "parentId?" }` |
| GET | `/category` | Public | List all categories (flat) |
| GET | `/category/tree` | Public | Category tree (2 levels deep) |
| GET | `/category/tree-recursive` | Public | Full recursive category tree |
| PATCH | `/category/:id` | Admin | Update category name |
| DELETE | `/category/:id` | Admin | Delete a category (must have no children or products) |

### Products — `/product`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/product` | Admin | Create a product. `multipart/form-data` with fields: `name`, `categoryId`, `description?`, `imageUrl?` and optional image `file` (max 2 MB, jpg/png/webp) |
| GET | `/product` | Public | List products with filters, pagination and sorting |
| GET | `/product/:id` | Public | Get a single product |
| PATCH | `/product/:id` | Admin | Update a product (same fields as create, all optional) |
| DELETE | `/product/:id` | Admin | Delete a product (also removes image from Cloudinary) |

**Query params for `GET /product`:**

| Param | Type | Description |
|---|---|---|
| `name` | string | Case-insensitive name search |
| `categoryId` | number | Filters by category and all its descendants |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page, max 50 (default: 10) |
| `sort` | enum | `name_asc`, `name_desc`, `createdAt_asc`, `createdAt_desc` |

### Orders — `/order`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/order/whatsapp-preview` | Optional JWT | Generate a pre-filled WhatsApp message with the selected products |

Body:
```json
{
  "items": [{ "productId": 1, "quantity": 2 }],
  "customerName": "Juan",
  "notes": "Sin envío"
}
```

Returns `message` (plain text) and `whatsappUrl` (ready-to-open `wa.me` link). If the user is authenticated, their username is used automatically instead of `customerName`.

### Uploads — `/uploads`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/uploads/image` | Admin | Upload an image to Cloudinary. `multipart/form-data` with `file` field (max 2 MB) |

---

## Authentication

Protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained from `POST /auth/login` and expire after **1 day**.

Admin-only routes additionally require the user to have `isAdmin: true` in the database.

---

## Email Verification Flow

1. User registers → receives a **6-digit code** valid for **10 minutes**.
2. User submits the code to `/auth/verify-email`.
3. If the code expires, the user can request a new one via `/auth/resend-verification` (only if the current code is already expired).
4. Unverified accounts older than **24 hours** are automatically deleted by a scheduled job that runs every hour.

---

## Project Structure

```
src/
├── auth/           # JWT auth, guards, strategies, DTOs
├── category/       # Category CRUD with recursive tree support
├── email/          # Resend email service
├── job/            # Scheduled tasks (cleanup unverified users)
├── order/          # WhatsApp order message generator
├── prisma/         # PrismaService (global module)
├── product/        # Product CRUD with image upload
├── uploads/        # Cloudinary upload/delete service
└── user/           # User profile and password management
prisma/
├── schema.prisma   # Data models
└── migrations/     # SQL migration history
```

---

## Data Models

### User
Fields: `id`, `userName` (unique), `email` (unique), `password` (hashed), `isAdmin`, `isVerified`, `verificationCode`, `verificationCodeExpires`, `createdAt`, `updatedAt`

### Category
Fields: `id`, `name`, `parentId` (self-referencing for subcategories), `createdAt`

### Product
Fields: `id`, `name`, `description`, `imageUrl`, `imagePublicId`, `categoryId`, `createdAt`, `updatedAt`

---

## Notes

- Passwords are hashed with **bcrypt** (10 rounds).
- Images are stored in Cloudinary under the `wargames/` folder. When a product image is replaced or the product is deleted, the old image is removed from Cloudinary automatically.
- The `ValidationPipe` is configured globally with `whitelist: true` and `forbidNonWhitelisted: true`, so any extra fields in request bodies will be rejected.
