<p align="center">
  <img src="https://img.shields.io/badge/🍱-NutriTiffin-E0234E?style=for-the-badge&labelColor=1a1a2e" alt="NutriTiffin" />
</p>

<h1 align="center">NutriTiffin Backend</h1>

<p align="center">
  <strong>Connecting Home Kitchens with Healthy Eaters through Robust Technology.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/AWS%20S3-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS S3" />
  <img src="https://img.shields.io/badge/BullMQ-%23CF4647.svg?style=for-the-badge&logo=bull&logoColor=white" alt="BullMQ" />
</p>

<p align="center">
  <a href="#-features"><strong>Features</strong></a> ·
  <a href="#%EF%B8%8F-architecture"><strong>Architecture</strong></a> ·
  <a href="#-getting-started"><strong>Quick Start</strong></a> ·
  <a href="#-api-reference"><strong>API</strong></a> ·
  <a href="#-documentation"><strong>Docs</strong></a>
</p>

---

## 🚀 The Mission

**NutriTiffin** is a comprehensive food delivery platform designed to bridge the gap between talented home chefs and individuals seeking authentic, healthy, home-cooked meals.

Unlike generic food delivery apps, NutriTiffin focuses on **specific dietary needs**, **scheduled meal subscriptions**, and **empowering small-scale kitchen owners** with professional management tools.

| Stakeholder | Value Proposition |
| :--- | :--- |
| 🍽️ **Clients** | Access to verified home-cooked meals, subscription plans, and transparent nutritional info. |
| 👨‍🍳 **Kitchen Owners** | A "business-in-a-box" solution for managing menus, orders, and earnings. |
| 🚚 **Delivery Drivers** | Efficient, gig-economy friendly driver dispatch system with credit-based payouts. |
| 🛡️ **Admins** | Full oversight — user management, credit allocation, and transaction auditing. |

---

## ✨ Features

<table>
  <tr>
    <td width="50%">

### 💳 Secure Credit System
Integer-based Rupee credit wallets backed by **TypeORM transaction blocks** with **pessimistic row-level locking** — guaranteeing safe balance operations under high concurrency.

</td>
    <td width="50%">

### 📒 Transaction Ledger
Every single credit movement is recorded — admin add/deduct, delivery payouts, order payments — with human-readable short IDs (`TXN-A1B2C3`) and full audit trails.

</td>
  </tr>
  <tr>
    <td>

### 🔐 Role-Based Access Control
Four distinct roles — `CLIENT`, `KITCHEN_OWNER`, `DELIVERY_DRIVER`, `ADMIN` — enforced at the Guard & Decorator level, providing secure separation of duties across the entire API.

</td>
    <td>

### 📦 Order State Machine
Orders follow a strict finite state machine:

```
PENDING → ACCEPTED → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
                 ↘ REJECTED
```

</td>
  </tr>
  <tr>
    <td>

### 💰 Three-Tier Fee System
Configurable fee breakdown per order:
- **Platform Fees** — charged to the platform
- **Kitchen Fees** — deducted from kitchen earnings
- **Delivery Fees** — allocated to delivery drivers

</td>
    <td>

### 📅 Smart Menu Availability
Menus automatically respect daily order limits and per-day availability schedules (`monday`, `friday`, etc.), ensuring kitchens never get overwhelmed.

</td>
  </tr>
  <tr>
    <td>

### ✉️ Email Verification Flow
Full email verification lifecycle — register → verify token → login. Powered by **Brevo (Sendinblue)**, with resend support and rate limiting.

</td>
    <td>

### 🖼️ Media Uploads via S3
Seamless image uploads (avatars, food photos) to **AWS S3**, with presigned URLs and 5MB file-size validation.

</td>
  </tr>
</table>

---

## 🛡️ Security Practices

We take the security of our platform, our users, and their transactions very seriously. Here are the core practices and mechanisms we employ to protect NutriTiffin:

### 1. Robust Authentication & Authorization
- **JWT-Based Authentication**: Stateless, secure sessions using JSON Web Tokens.
- **Role-Based Access Control (RBAC)**: Strict role definitions (`CLIENT`, `KITCHEN_OWNER`, `DELIVERY_DRIVER`, `ADMIN`) enforced via `@Roles()` decorators and `RolesGuard`.
- **Admin Access Protection**: Elevated role registration requires a secure, secret `ADMIN_ACCESS_PASS` managed via environment variables.

### 2. Multi-Factor Verification (MFA)
- **Email Verification**: User registration triggers a Brevo-powered email validation loop to verify identity.
- **SMS OTP Verification**: Critical actions and login enablement in production environments require Phone-level OTP verification, integrated through MessageCentral. Re-login is blocked until both Email and Phone verified tags are true.

### 3. Data Integrity & Concurrency Guard
- **Pessimistic Row-Level Locking**: Credit and wallet systems in PostgreSQL use `lock: { mode: 'pessimistic_write' }` in TypeORM. This absolutely prevents race conditions and double-spending when deducting or adding credits.
- **Transaction Blocks**: Any complex movement of credits or data spanning multiple tables is wrapped in `.transaction()` blocks to guarantee ACID compliance.

### 4. API Resilience & Rate Limiting
- **Throttler Module**: NestJS `@nestjs/throttler` is actively used on sensitive endpoints (like `/auth/forgot-password`, `/auth/check-email-verified`) to prevent brute-force and DDoS attacks.
- **Global Validation Pipes**: `class-validator` and `class-transformer` intercept bad payloads and ensure that our DTOs are strictly matched, sanitizing inputs by default.

### 5. Separation of Environments
- **Environment Targeting**: We safely decouple DEV and PRODUCTION setups using `PRODUCTION=true|false`. The system natively skips sending live emails/OTPs during local testing while strictly enforcing them in production.
- **Secure File Storage**: User-uploaded media goes directly to AWS S3 utilizing scoped IAM keys, rather than congesting local or DB storage.

---

## 🏗️ Architecture

The backend is built as a **modular monolith** using [NestJS](https://nestjs.com/), ensuring strict separation of concerns and end-to-end type safety.

### High-Level Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      Client / Mobile Apps                       │
└────────────────────────────┬─────────────────────────────────────┘
                             │  RESTful JSON
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                   NestJS API Gateway (Port 3000)                │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────────┐   │
│  │  JWT Auth   │  │  Rate Limit  │  │  RBAC Guards          │   │
│  │  (Passport) │  │  (Throttler) │  │  (Roles Decorator)    │   │
│  └────────────┘  └──────────────┘  └───────────────────────┘   │
└────────────────────────────┬─────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────────┐
          ▼                  ▼                       ▼
┌──────────────┐   ┌─────────────────┐   ┌───────────────────┐
│  PostgreSQL  │   │     Redis       │   │     AWS S3        │
│  (TypeORM)   │   │ (Cache + Queues)│   │  (Media Storage)  │
│              │   │                 │   │                   │
│ • Users      │   │ • BullMQ Jobs   │   │ • Food Images     │
│ • Kitchens   │   │ • Session Cache │   │ • User Avatars    │
│ • Orders     │   │                 │   │                   │
│ • Food Items │   └─────────────────┘   └───────────────────┘
│ • Transactions│
└──────────────┘
```

### Module Dependency Graph

```
AppModule
├── AuthModule ─────────── JWT strategy, Guards, Login/Register
├── UsersModule ────────── User CRUD, Credit management, Admin tools
├── KitchensModule ─────── Kitchen profiles, Operating hours
├── FoodItemsModule ────── Menu items, Availability, Daily limits
├── OrdersModule ───────── Order placement, State transitions, Fee calc
├── DeliveriesModule ───── Driver dispatch, Pickup → Delivery flow
├── TransactionsModule ─── Credit ledger, Audit trail
├── UploadModule ───────── S3 image upload
├── QueueModule ────────── BullMQ queue registration
├── JobsModule ─────────── Background job processors
├── RedisModule ────────── Redis connection factory
└── CommonModule ───────── Shared filters, DTOs, S3 client, Utilities
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
| :--- | :--- | :--- |
| **Runtime** | [Node.js 20](https://nodejs.org/) | LTS runtime with excellent async I/O |
| **Framework** | [NestJS 11](https://nestjs.com/) | Opinionated architecture, DI, first-class TypeScript |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | End-to-end type safety, superior DX |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | ACID-compliant, JSONB support, robust relational queries |
| **ORM** | [TypeORM](https://typeorm.io/) | Decorators-based entity mapping, migrations, query builder |
| **Cache / Queues** | [Redis](https://redis.io/) + [BullMQ](https://docs.bullmq.io/) | High-speed caching and reliable background job processing |
| **Auth** | [Passport.js](http://www.passportjs.org/) + JWT | Industry-standard authentication with token-based sessions |
| **Storage** | [AWS S3](https://aws.amazon.com/s3/) | Scalable object storage with presigned URL support |
| **Email** | [Brevo (Sendinblue)](https://www.brevo.com/) | Transactional email for verification flows |
| **Validation** | [class-validator](https://github.com/typestack/class-validator) + [class-transformer](https://github.com/typestack/class-transformer) | Declarative DTO validation and serialization |
| **Containerization** | [Docker](https://www.docker.com/) | Multi-stage builds, consistent dev-to-prod environments |

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Required |
| :--- | :--- | :---: |
| Node.js | `20+` | ✅ |
| npm | `9+` | ✅ |
| Docker & Docker Compose | Latest | Recommended |
| PostgreSQL | `15+` | If not using Docker |
| Redis | `7+` | If not using Docker |

### Option 1 — Docker (Recommended)

Spin up the full stack (API + Redis) in seconds:

```bash
# 1. Clone the repository
git clone https://github.com/Ur-Code-Buddy/nutribackend.git
cd nutribackend

# 2. Set up environment variables
cp .env.example .env
# ✏️  Edit .env with your DB, AWS, and Brevo credentials

# 3. Launch everything
docker-compose up --build
```

The API will be available at **`http://localhost:3000`**.

### Option 2 — Local Development

```bash
# 1. Clone and install
git clone https://github.com/Ur-Code-Buddy/nutribackend.git
cd nutribackend
npm install

# 2. Configure
cp .env.example .env
# ✏️  Edit .env — point to your local PostgreSQL & Redis

# 3. Start in watch mode (auto-reload)
npm run start:dev
```

### Environment Variables

<details>
<summary><strong>📋 Click to expand full <code>.env</code> reference</strong></summary>

| Variable | Description | Default |
| :--- | :--- | :---: |
| `DB_HOST` | PostgreSQL host | — |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | — |
| `DB_NAME` | Database name | `postgres` |
| `DB_SSL` | Enable SSL for DB connection | `true` |
| `JWT_SECRET` | Secret key for JWT signing | — |
| `JWT_EXPIRATION` | Token expiry duration | `1d` |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | — |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | — |
| `AWS_REGION` | S3 bucket region | `us-east-1` |
| `AWS_BUCKET_NAME` | S3 bucket name | — |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_TLS` | Enable Redis TLS | `false` |
| `CURRENT_VERSION` | API version string | `1.0.0` |
| `PLATFORM_FEES` | Platform fee (₹) charged per order | `10` |
| `KITCHEN_FEES` | Kitchen fee (₹) per order | `15` |
| `DELIVERY_FEES` | Delivery fee (₹) per order | `20` |
| `ADMIN_ACCESS_PASS` | Secret pass to register as Admin | — |
| `BREVO_API_KEY` | Brevo (Sendinblue) API key | — |
| `BASE_URL` | Backend base URL | — |
| `FRONTEND_URL` | Frontend app URL (for email redirects) | — |

</details>

---

## 📡 API Reference

Below is a summary of all available endpoints. For full request/response schemas, see [**`docs/endpoints.md`**](docs/endpoints.md).

### Authentication

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/auth/register` | — | Register a new user |
| `POST` | `/auth/login` | — | Login & receive JWT |
| `GET` | `/auth/verify-email` | — | Verify email via token |
| `POST` | `/auth/resend-verification` | — | Resend verification email |
| `POST` | `/auth/retry-email-login` | — | Retry sending verification |
| `POST` | `/auth/check-email-verified` | — | Check verification status |
| `POST` | `/auth/forgot-password` | — | Initiate password reset flow via OTP |
| `POST` | `/auth/reset-password` | — | Complete password reset using OTP |
| `POST` | `/auth/resend-phone-otp` | — | Dispatch SMS OTP via MessageCentral |
| `POST` | `/auth/verify-phone` | 🔑 Any | Verify SMS OTP and mark phone verified |

### Users & Administration

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `GET` | `/users/check-username/:username` | — | Check if a username exists (rate limited) |
| `GET` | `/users/me` | 🔑 Any | Get current user profile |
| `PATCH` | `/users/me` | 🔑 Any | Update own profile (address, phone, pincode) |
| `GET` | `/admin/users` | 🛡️ Admin | List all users |
| `POST` | `/admin/credits/add` | 🛡️ Admin | Add credits to a user |
| `POST` | `/admin/credits/deduct` | 🛡️ Admin | Deduct credits from a user |
| `POST` | `/admin/users/:id/disable` | 🛡️ Admin | Disable a user account |
| `POST` | `/admin/users/:id/enable` | 🛡️ Admin | Enable a user account |

### Kitchens

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/kitchens` | 👨‍🍳 Owner | Create kitchen profile |
| `GET` | `/kitchens` | — | List all active kitchens |
| `GET` | `/kitchens/:id` | — | Get kitchen details |
| `PATCH` | `/kitchens/:id` | 👨‍🍳 Owner | Update kitchen profile |
| `GET` | `/kitchens/credits` | 👨‍🍳 Owner | View earned credits |

### Menu Items

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/menu-items` | 👨‍🍳 Owner | Add new menu item |
| `GET` | `/menu-items/my-items` | 👨‍🍳 Owner | View own menu items |
| `GET` | `/menu-items/kitchen/:id` | — | View kitchen's menu |
| `GET` | `/menu-items/:id` | — | Get item details |
| `PATCH` | `/menu-items/:id` | 👨‍🍳 Owner | Update menu item |
| `PATCH` | `/menu-items/:id/availability` | 👨‍🍳 Owner | Toggle availability |

### Orders

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/orders` | 🍽️ Client | Place a new order |
| `GET` | `/orders` | 🔑 Any | List orders (role-aware) |
| `GET` | `/orders/:id` | 🔑 Any | Get order details |
| `PATCH` | `/orders/:id/accept` | 👨‍🍳 Owner | Accept an order |
| `PATCH` | `/orders/:id/reject` | 👨‍🍳 Owner | Reject an order |

### Deliveries

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `GET` | `/deliveries/available` | 🚚 Driver | Browse available pickups |
| `GET` | `/deliveries/my-orders` | 🚚 Driver | View assigned deliveries |
| `GET` | `/deliveries/credits` | 🚚 Driver | View earned credits |
| `PATCH` | `/deliveries/:id/accept` | 🚚 Driver | Accept a delivery |
| `PATCH` | `/deliveries/:id/pick-up` | 🚚 Driver | Mark as picked up |
| `PATCH` | `/deliveries/:id/out-for-delivery` | 🚚 Driver | Mark as out for delivery |
| `PATCH` | `/deliveries/:id/finish` | 🚚 Driver | Mark as delivered |
| `GET` | `/deliveries/:id` | 🚚 Driver | View delivery details |

### Transactions

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `GET` | `/transactions/my` | 🔑 Any | View my transactions (paginated) |
| `GET` | `/transactions/:id` | 🔑 Any | View single transaction |
| `GET` | `/transactions` | 🛡️ Admin | View all transactions (paginated) |

### Uploads & General

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/upload-image` | 🔑 Any | Upload image to S3 |
| `GET` | `/health` | — | Health check |
| `GET` | `/uptime` | — | Version & uptime |
| `GET` | `/` | — | Welcome message |

---

## 📂 Documentation

Detailed guides are maintained in the [`docs/`](docs/) directory:

| Doc | Description |
| :--- | :--- |
| 🍎 [**Client Features**](docs/Client.md) | User registration, meal discovery, order placement flows |
| 👨‍🍳 [**Kitchen Management**](docs/Kitchen.md) | Dashboard: menu creation, order acceptance, earnings |
| 🚚 [**Delivery Logistics**](docs/delivery.md) | Driver workflows: job discovery → pickup → delivery |
| 📡 [**API Endpoints**](docs/endpoints.md) | Comprehensive endpoint reference with schema details |
| 🖥️ [**Frontend Integration**](docs/frontend.md) | Guide for frontend developers consuming the API |
| 🐳 [**Docker & BullMQ Setup**](docs/bullmq-docker.md) | Infrastructure & background job setup guide |
| 🐋 [**Docker Deployment**](docs/project-docker.md) | Project containerization guide |

---

## 🧪 Testing

We emphasize code quality with comprehensive test coverage:

```bash
# Run unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:cov
```

---

## 🗄️ Database Entity Relationship

```
┌─────────────┐       ┌──────────────┐       ┌───────────────┐
│    Users     │       │   Kitchens   │       │  Food Items   │
├─────────────┤       ├──────────────┤       ├───────────────┤
│ id (uuid)   │◄──┐   │ id (uuid)    │◄──┐   │ id (uuid)     │
│ username    │   │   │ name         │   │   │ name          │
│ name        │   │   │ details      │   │   │ price         │
│ email       │   │   │ owner_id ────┼───┘   │ kitchen_id ───┼──►
│ role        │   │   │ is_active    │       │ max_daily     │
│ credits     │   │   │ image_url    │       │ availability  │
│ is_verified │   │   └──────────────┘       └───────────────┘
└─────────────┘   │
       ▲          │
       │          │   ┌──────────────┐       ┌───────────────┐
       │          │   │    Orders     │       │  Order Items  │
       │          │   ├──────────────┤       ├───────────────┤
       │          ├───┤ client_id    │       │ order_id ─────┼──►
       │          │   │ kitchen_id ──┼──►    │ food_item_id  │
       │          │   │ driver_id ───┼──►    │ quantity      │
       │          │   │ status       │       │ snapshot_price│
       │          │   │ total_price  │       └───────────────┘
       │          │   │ platform_fees│
       │          │   │ kitchen_fees │
       │          │   │ delivery_fees│
       │          │   └──────────────┘
       │          │
       │          │   ┌──────────────────┐
       │          │   │  Transactions    │
       │          │   ├──────────────────┤
       │          └───┤ from_user_id     │
       └──────────────┤ to_user_id       │
                      │ amount           │
                      │ type (CR / DB)   │
                      │ source           │
                      │ short_id         │
                      │ description      │
                      └──────────────────┘
```

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Dev Server** | `npm run start:dev` | Start with hot-reload (watch mode) |
| **Debug** | `npm run start:debug` | Start with debugger attached |
| **Production** | `npm run start:prod` | Run compiled JS from `dist/` |
| **Build** | `npm run build` | Compile TypeScript to JavaScript |
| **Lint** | `npm run lint` | ESLint with auto-fix |
| **Format** | `npm run format` | Prettier formatting |
| **Unit Tests** | `npm run test` | Run Jest unit tests |
| **E2E Tests** | `npm run test:e2e` | Run end-to-end tests |
| **Coverage** | `npm run test:cov` | Generate test coverage report |
| **Reset DB** | `npx ts-node scripts/reset-db.ts` | Reset database (⚠️ destructive) |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── auth/                  # Authentication (JWT, Guards, Roles)
│   │   ├── dto/               #   Login, Register DTOs
│   │   ├── jwt.strategy.ts    #   Passport JWT strategy
│   │   ├── jwt-auth.guard.ts  #   JWT authentication guard
│   │   ├── roles.guard.ts     #   RBAC enforcement guard
│   │   └── roles.decorator.ts #   @Roles() decorator
│   ├── users/                 # User management & admin tools
│   ├── kitchens/              # Kitchen CRUD & operating hours
│   ├── food-items/            # Menu items & availability logic
│   ├── orders/                # Order placement & state machine
│   │   └── entities/          #   Order + OrderItem entities
│   ├── deliveries/            # Driver dispatch & delivery flow
│   ├── transactions/          # Credit ledger & audit trail
│   ├── upload/                # S3 image upload service
│   ├── queue/                 # BullMQ queue registration
│   ├── jobs/                  # Background job processors
│   ├── redis/                 # Redis connection module
│   ├── common/                # Shared utilities
│   │   ├── filters/           #   Global exception filter
│   │   ├── dto/               #   Shared DTOs
│   │   ├── s3/                #   S3 client service
│   │   └── utils/             #   Response mapper, helpers
│   ├── app.module.ts          # Root module
│   └── main.ts                # Bootstrap & global pipes
├── docs/                      # Detailed feature documentation
├── scripts/                   # DB reset & admin test scripts
├── test/                      # E2E test suites
├── docker-compose.yml         # Docker orchestration
├── Dockerfile                 # Multi-stage production build
├── .env.example               # Environment variable template
└── package.json               # Dependencies & scripts
```

---

## 👥 Contributors

Built with ❤️ by **[Ur-Code-Buddy](https://github.com/Ur-Code-Buddy)**.

---

<p align="center">
  <sub>For detailed architecture walkthroughs, check the <a href="docs/"><code>docs/</code></a> folder.</sub>
</p>
