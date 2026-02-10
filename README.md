# NutriTiffin Backend

Backend service for the NutriTiffin application, built with NestJS.

## Features

- **Authentication**: JWT-based auth with Role-Based Access Control (Client, Kitchen Owner, etc.).
- **Order Management**: Complex ordering logic with rigorous validation.
- **Background Jobs**: BullMQ for handling asynchronous tasks (e.g., order timeouts, emails).
- **File Upload**: AWS S3 integration for food images.
- **Database**: PostgreSQL with TypeORM.

---

## Local Development

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose (for Redis/DB)
- PostgreSQL (if running locally without Docker)

### Installation

```bash
$ npm install
```

### Running the App

**Option 1: Docker (Recommended)**

Start the backend and Redis service together:

```bash
$ docker-compose up --build
```

**Option 2: Manual**

1. Ensure Redis and PostgreSQL are running.
2. Configure `.env` (see `.env.example`).
3. Start the server:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

### Testing

```bash
# unit tests
$ npm run test

# queue verification
$ npx ts-node src/check-queue.ts
```

### Health Check

Check if the application is running:
- **URL**: `http://localhost:3000/health`
- **Method**: `GET`
- **Response**: `{ "status": "ok", "timestamp": "..." }`

---

## Deployment Guide: AWS EC2 with Docker

This guide explains how to deploy the backend to an AWS EC2 instance.

### 1. Launch EC2 Instance
- **AMI**: Amazon Linux 2023 or Ubuntu 22.04 LTS.
- **Type**: t3.small (recommended minimum for Node+Redis).
- **Security Group**: Allow Inbound ports:
    - `22` (SSH)
    - `3000` (Application) - *Or map to 80 via load balancer.*

### 2. Install Docker
SSH into your instance and run:

**For Amazon Linux 2023:**
```bash
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user
# Logout and log back in to pick up group changes
```

**Install Docker Compose:**
```bash
sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Deploy Code
You can clone via Git or copy files.

```bash
git clone https://github.com/Ur-Code-Buddy/nutribackend.git
cd nutribackend
```

### 4. Configure Environment
Create the production `.env` file:

```bash
cp .env.example .env
nano .env
```
Fill in your production DB credentials, AWS keys, and JWT secret.

### 5. Start Application
Run the container in detached mode:

```bash
docker-compose up -d --build
```

### 6. Verify
Check if the container is running:
```bash
docker-compose ps
```

View logs if needed:
```bash
docker-compose logs -f backend
```

---

## Documentation

- [BullMQ & Docker Guide](docs/bullmq-docker.md)
- [Project Docker Guide](docs/project-docker.md)
- [API Documentation (Postman)](docs/postman.md)
