# API Documentation

This documentation covers the API endpoints for the Nutri Tiffin backend.

## Base URL
`http://localhost:3000` (or your deployed URL)

## Authentication (`/auth`)

### Register
- **Endpoint**: `POST /auth/register`
- **Description**: Register a new user (Client, Kitchen Owner, or Delivery Driver).
- **Body** (`application/json`):
  ```json
  {
    "username": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone_number": "1234567890",
    "address": "123 Main St",
    "password": "password123",
    "role": "client" // Enum: "client", "kitchen_owner", "delivery_driver"
  }
  ```
- **Response**: User object (without password or email).

### Login
- **Endpoint**: `POST /auth/login`
- **Description**: Login to receive an access token.
- **Body** (`application/json`):
  ```json
  {
    "username": "user123",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "jwt_token_string"
  }
  ```

## Utilities

### Health Check
- **Endpoint**: `GET /health`
- **Description**: Check if the API is running.
- **Response**: `{"status": "ok", "timestamp": "..."}`

### Uptime
- **Endpoint**: `GET /uptime`
- **Description**: Check application uptime and version.

### Upload Image
- **Endpoint**: `POST /upload-image`
- **Description**: Upload an image file (e.g., for kitchen profile or menu item).
- **Body** (`multipart/form-data`):
  - `file`: (Binary file data, max 5MB, .jpg/.png)
- **Response**:
  ```json
  {
    "url": "https://s3-bucket-url.com/image.jpg"
  }
  ```

## Role-Specific Documentation

For specific role-based endpoints, please refer to:
- [Kitchen Endpoints](./Kitchen.md)
- [Delivery Endpoints](./delivery.md)
- [Client Endpoints](./client.md)
