# 🍱 NutriTiffin Backend

> **Robust, Scalable, and Feature-Rich Backend for the NutriTiffin Food Delivery Platform.**

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS%20S3-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

---

## 📖 Overview

**NutriTiffin Backend** is the powerhouse behind the NutriTiffin application, designed to connect healthy home-cooked meal providers (Kitchens) with health-conscious customers (Clients), and facilitate efficient logistics through Delivery Drivers. Built with **NestJS**, it ensures modularity, scalability, and type safety.

---

## ✨ Key Features

- **🔐 Advanced Authentication**: Secure JWT-based authentication with Role-Based Access Control (RBAC).
    - Roles: `CLIENT`, `KITCHEN_OWNER`, `DELIVERY_DRIVER`.
- **🍽️ Kitchen Management**: Comprehensive tools for kitchen owners to manage profiles, operating hours, and active status.
- **📜 Menu & Inventory**: Flexible menu management with availability toggles, daily order limits, and rich media support.
- **🛒 Order Processing**: Complex order lifecycle management (Pending -> Accepted -> Out for Delivery -> Delivered).
- **🚚 Delivery Logistics**: Dedicated dashboard for drivers to view available orders, accept deliveries, and track status.
- **☁️ Cloud Integration**: Seamless image uploads using **AWS S3**.
- **⚡ High Performance**: Utilizing **Redis** and **BullMQ** for caching and background job processing.
- **🗄️ Solid Data Layer**: **PostgreSQL** with **TypeORM** for reliable data persistence and migrations.

---

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (Node.js)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Caching & Queues**: [Redis](https://redis.io/) & [BullMQ](https://docs.bullmq.io/)
- **Storage**: [AWS S3](https://aws.amazon.com/s3/)
- **Containerization**: [Docker](https://www.docker.com/) & Docker Compose

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18+)
- **Docker** & **Docker Compose**
- **PostgreSQL** (if running locally without Docker)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Ur-Code-Buddy/nutribackend.git
    cd nutribackend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Duplicate `.env.example` to `.env` and fill in your credentials.
    ```bash
    cp .env.example .env
    ```

### Running the Application

#### Option 1: Docker (Recommended 🐳)
Start the entire stack (Backend + Redis + Postgres) with one command:
```bash
docker-compose up --build
```

#### Option 2: Local Development 💻
1.  Ensure **Redis** and **PostgreSQL** are running.
2.  Start the server:
    ```bash
    # Development mode
    npm run start:dev

    # Production mode
    npm run start:prod
    ```

---

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

-   [**API Endpoints**](docs/endpoints.md): Comprehensive list of all API routes.
-   [**Frontend Integration**](docs/frontend.txt): Guide for frontend developers.
-   [**Postman Collection**](docs/postman.md): Importable collection for testing.
-   [**BullMQ & Docker**](docs/bullmq-docker.md): Guide on background jobs.

---

## 🧪 Testing

Run duplicate checks, unit tests, and e2e tests to ensure stability.

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## ☁️ Deployment (AWS EC2)

Deploying to AWS EC2 using Docker is straightforward.

1.  **Launch EC2**: Amazon Linux 2023 or Ubuntu 22.04 (t3.small recommended).
2.  **Security Groups**: Open ports `22` (SSH) and `3000` (App).
3.  **Install Docker**:
    ```bash
    sudo yum update -y && sudo yum install -y docker
    sudo service docker start
    sudo usermod -a -G docker ec2-user
    ```
4.  **Install Docker Compose**:
    ```bash
    sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    ```
5.  **Deploy**:
    ```bash
    git clone https://github.com/Ur-Code-Buddy/nutribackend.git
    cd nutribackend
    cp .env.example .env # Configure your env
    docker-compose up -d --build
    ```

---

Made with ❤️ by the NutriTiffin Team.
