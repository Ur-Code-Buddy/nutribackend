# Managing NutriTiffin Backend on Docker

This guide provides instructions for running and managing the NutriTiffin backend using Docker.

## Quick Start

1. **Build and Run:**
   ```bash
   docker-compose up --build
   ```
   This will build the NestJS application and start it alongside a Redis container.

2. **Access the Application:**
   The backend will be available at `http://localhost:3000`.

## Environment Variables

The `docker-compose.yml` file passes environment variables to the container. Ensure your `.env` file or system environment variables are set for:
- Database credentials (`DB_HOST`, `DB_PORT`, etc.)
- AWS credentials (`AWS_ACCESS_KEY_ID`, etc.)
- JWT secrets

**Note:** For local Docker development, `DB_HOST` usually needs to point to your host machine's IP (if DB is local) or the Docker service name (if DB is in Docker).

## Common Commands

### Stop All Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Rebuild Containers
If you install new packages, rebuild the images:
```bash
docker-compose up -d --build
```

## Production Deployment

For production:
1. Ensure `NODE_ENV` is set to `production` (default in the Dockerfile's production stage).
2. Use a managed Redis instance (e.g., AWS ElastiCache) and update `REDIS_HOST` in your configuration.
