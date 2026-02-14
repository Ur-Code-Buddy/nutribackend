# Managing BullMQ on Docker

This guide explains how to manage and monitor your BullMQ queues when running the NutriTiffin backend in Docker.

## Prerequisites

Ensure you have Docker and Docker Compose installed.

## Starting the Queue System

The Redis service (required for BullMQ) is defined in `docker-compose.yml`. To start it along with the backend:

```bash
docker-compose up -d
```

This starts:
- **backend**: Your NestJS application
- **redis**: The Redis store for BullMQ (exposed on port 6379)

## Configuration

The backend connects to Redis using environment variables defined in `docker-compose.yml`:

```yaml
environment:
  - REDIS_HOST=redis
  - REDIS_PORT=6379
```

If you need to change these (e.g., to use an external Redis provider), update the `docker-compose.yml` or your `.env` file.

## Monitoring Queues

### 1. Using Redis CLI
You can inspect the Redis keys directly to see queue status.

**Access the Redis container:**
```bash
docker-compose exec redis redis-cli
```

**List all keys:**
```bash
keys *
```

**Check queue length (example for 'email' queue):**
```bash
llen bull:email:wait
```

### 2. Using Bull Board (Optional)
For a visual dashboard, you can install `@bull-board/nestjs`.

1. Install dependencies:
   ```bash
   npm install @bull-board/nestjs @bull-board/api @bull-board/express
   ```
2. Configure it in `AppModule` (refer to Bull Board documentation).

## Troubleshooting

- **Connection Refused**: Ensure the `redis` container is running (`docker-compose ps`).
- **Job Not Processing**: Check backend logs:
  ```bash

  docker-compose logs -f backend
  ```

## Handling Updates

When there are updates to the codebase (e.g., from a `git pull`), follow these steps to update your running containers:

1.  **Pull the latest code:**
    ```bash
    git pull origin main
    ```

2.  **Rebuild and Restart Docker Compose:**
    ```bash
    docker-compose up -d --build
    ```
    This command will:
    - Rebuild the images with the new code.
    - Recreate the containers if changes are detected.
    - Leave unchanged containers running.
