# Postman API Documentation

This guide details the API endpoints for the NutriTiffin backend. You can use this to manually test the API using Postman or any other API client.

## Base URL
`http://localhost:3000` (or your production URL)

## Authentication
Most endpoints require a Bearer Token.
1.  **Register/Login** to get an `access_token`.
2.  In Postman, go to **Authorization** tab -> Select **Bearer Token** -> Paste the token.

---

## Endpoints

### 0. Health Check

#### Check Status (`GET /health`)
- **Response**:
    ```json
    {
      "status": "ok",
      "timestamp": "2023-11-20T10:00:00.000Z"
    }
    ```

### 1. Authentication

#### Register (`POST /auth/register`)
Create a new user.
- **Body** (JSON):
    ```json
    {
      "username": "client_user",
      "password": "password123",
      "role": "client" 
    }
    ```
    *Roles: `client` or `kitchen_owner`*

#### Login (`POST /auth/login`)
Get access token.
- **Body** (JSON):
    ```json
    {
      "username": "client_user",
      "password": "password123"
    }
    ```
- **Response**:
    ```json
    {
      "access_token": "...",
      "user": { ... }
    }
    ```

---

### 2. Kitchens (Kitchen Owner Only)

#### Create Kitchen (`POST /kitchens`)
*Requires `kitchen_owner` role.*
- **Body** (JSON):
    ```json
    {
      "name": "Mama's Kitchen",
      "description": "Home cooked meals",
      "address": "123 Food St"
    }
    ```

#### List All Kitchens (`GET /kitchens`)
Public endpoint.

#### Get Kitchen Details (`GET /kitchens/:id`)
Public endpoint.

#### Update Kitchen (`PATCH /kitchens/:id`)
*Requires ownership of the kitchen.*
- **Body** (JSON):
    ```json
    {
      "description": "Updated description"
    }
    ```

---

### 3. Menu Items (Kitchen Owner Only)

#### Add Food Item (`POST /menu-items`)
*Requires `kitchen_owner` role. Adds item to your kitchen.*
- **Body** (JSON):
    ```json
    {
      "name": "Chicken Curry",
      "description": "Spicy and tasty",
      "price": 12.99,
      "category": "Main Course",
      "is_veg": false,
      "image_url": "http://example.com/image.jpg"
    }
    ```

#### List Items by Kitchen (`GET /menu-items/kitchen/:kitchenId`)
Public endpoint.

#### Update Item Availability (`PATCH /menu-items/:id/availability`)
- **Body** (JSON):
    ```json
    {
      "is_available": true
    }
    ```

---

### 4. Orders

#### Create Order (`POST /orders`)
*Requires `client` role.*
- **Body** (JSON):
    ```json
    {
      "kitchen_id": "uuid-of-kitchen",
      "items": [
        {
          "food_item_id": "uuid-of-item",
          "quantity": 2
        }
      ]
    }
    ```

#### List My Orders (`GET /orders`)
Returns all orders for the logged-in user (Client or Kitchen Owner).

#### Get Order Details (`GET /orders/:id`)

#### Accept/Reject Order (`PATCH /orders/:id/accept` or `reject`)
*Requires `kitchen_owner` role.*
