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
      "role": "CLIENT" 
    }
    ```
    *Roles: `CLIENT` or `KITCHEN_OWNER`*

- **Response** (201 Created):
    ```json
    {
      "id": "uuid",
      "username": "client_user",
      "role": "CLIENT",
      "created_at": "...",
      "updated_at": "..."
    }
    ```

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
      "access_token": "eyJhbGciOiJIUzI1Ni...",
      "user": {
        "id": "uuid",
        "username": "client_user",
        "role": "CLIENT"
      }
    }
    ```

---

### 2. Kitchens (Kitchen Owner Only for Write Ops)

#### Create Kitchen (`POST /kitchens`)
*Requires `KITCHEN_OWNER` role.*
- **Body** (JSON):
    ```json
    {
      "name": "Mama's Kitchen",
      "details": {
        "description": "Home cooked meals",
        "address": "123 Food St",
        "phone": "555-1234"
      },
      "operating_hours": {
        "open": "09:00",
        "close": "21:00",
        "days_off": [0]
      },
      "image_url": "http://example.com/image.jpg"
    }
    ```
- **Response** (201 Created):
    Returns the created kitchen object.

#### List All Kitchens (`GET /kitchens`)
Public endpoint.
- **Response**: Array of kitchens.

#### Get Kitchen Details (`GET /kitchens/:id`)
Public endpoint.
- **Response**: Single kitchen object.

#### Update Kitchen (`PATCH /kitchens/:id`)
*Requires ownership of the kitchen.*
- **Body** (JSON) - Partial Update:
    ```json
    {
      "details": {
        "description": "Updated description",
        "address": "123 Food St"
      }
    }
    ```
- **Response**: Updated kitchen object.

---

### 3. Menu Items (Kitchen Owner Only for Write Ops)

#### Add Food Item (`POST /menu-items`)
*Requires `KITCHEN_OWNER` role. Adds item to your kitchen.*
- **Body** (JSON):
    ```json
    {
      "name": "Chicken Curry",
      "description": "Spicy and tasty",
      "price": 12.99,
      "image_url": "http://example.com/image.jpg",
      "max_daily_orders": 50
    }
    ```
- **Response** (201 Created):
    Returns the created food item object.

#### List My Items (`GET /menu-items/my-items`)
*Requires `KITCHEN_OWNER` role. Returns items for your kitchen.*
- **Response**: Array of food items.

#### List Items by Kitchen (`GET /menu-items/kitchen/:kitchenId`)
Public endpoint.
- **Response**: Array of food items.

#### Get Menu Item (`GET /menu-items/:id`)
- **Response**: Single food item details.

#### Update Menu Item (`PATCH /menu-items/:id`)
*Requires ownership.*
- **Body** (JSON): Partial of Create body.

#### Update Item Availability (`PATCH /menu-items/:id/availability`)
*Requires ownership.*
- **Body** (JSON):
    ```json
    {
      "is_available": true
    }
    ```
- **Response**: Updated food item object.

---

### 4. Orders

#### Create Order (`POST /orders`)
*Requires `CLIENT` role.*
- **Body** (JSON):
    ```json
    {
      "kitchen_id": "uuid-of-kitchen",
      "scheduled_for": "2023-11-01",
      "items": [
        {
          "food_item_id": "uuid-of-item",
          "quantity": 2
        }
      ]
    }
    ```
- **Response** (201 Created):
    Returns the created order object with status `PENDING`.

#### List My Orders (`GET /orders`)
Returns all orders for the logged-in user (Client or Kitchen Owner).
- **Response**: Array of order objects.

#### Get Order Details (`GET /orders/:id`)
- **Response**: Single order object with items.

#### Accept Order (`PATCH /orders/:id/accept`)
*Requires `KITCHEN_OWNER` role.*
- **Body**: None.
- **Response**: Order object with status `ACCEPTED`.

#### Reject Order (`PATCH /orders/:id/reject`)
*Requires `KITCHEN_OWNER` role.*
- **Body**: None.
- **Response**: Order object with status `REJECTED`.
