# Client API Documentation

## Base URL

Production:
https://backend.v1.nutritiffin.com

Local Development:
http://localhost:3000

---

## Authentication

Protected routes require:

Authorization: Bearer <JWT_TOKEN>

Only users with role `CLIENT` can place orders.

---

# Client Module Overview

The Client module allows:

- Registered clients to browse kitchens (via Kitchens API)
- View menus of specific kitchens
- Place orders for food items
- View order history and status

---

# 1. View Menu Items

Endpoint:
GET /menu-items/kitchen/:kitchenId

Public endpoint.

Returns all food items available for a specific kitchen.

---

## Success Response (200 OK)

```json
[
  {
    "id": "item-uuid-1",
    "name": "Thali",
    "description": "Full meal with rice, dal, and veggies.",
    "price": 150.00,
    "image_url": "https://example.com/thali.jpg",
    "is_veg": true,
    "is_available": true,
    "kitchen_id": "814cec7e-dd52-4ced-a46f-58cbff911e02"
  }
]
```

---

# 2. Place Order

Endpoint:
POST /orders

Role Required:
CLIENT

Headers:
Authorization: Bearer <JWT_TOKEN>

---

## Request Body

```json
{
  "kitchen_id": "814cec7e-dd52-4ced-a46f-58cbff911e02",
  "scheduled_for": "2026-02-16",
  "items": [
    {
      "food_item_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "quantity": 2
    },
    {
      "food_item_id": "b2c3d4e5-f678-9012-3456-7890abcdef12",
      "quantity": 1
    }
  ]
}
```

---

## Field Details

| Field            | Required | Description |
|------------------|----------|-------------|
| kitchen_id       | Yes      | UUID of the kitchen |
| scheduled_for    | Yes      | Date string (YYYY-MM-DD) for delivery |
| items            | Yes      | Array of items to order |
| items[].food_item_id | Yes | UUID of the food item |
| items[].quantity | Yes      | Quantity (Min: 1) |

---

## Success Response (201 Created)

```json
{
  "id": "order-uuid-1234-5678",
  "client_id": "client-uuid-1234",
  "kitchen_id": "814cec7e-dd52-4ced-a46f-58cbff911e02",
  "status": "PENDING",
  "scheduled_for": "2026-02-16",
  "total_price": 450.00,
  "created_at": "2026-02-15T12:00:00.000Z",
  "updated_at": "2026-02-15T12:00:00.000Z",
  "items": [
    {
      "id": "item-uuid-1",
      "food_item_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "quantity": 2,
      "snapshot_price": 150.00
    },
    {
      "id": "item-uuid-2",
      "food_item_id": "b2c3d4e5-f678-9012-3456-7890abcdef12",
      "quantity": 1,
      "snapshot_price": 150.00
    }
  ]
}
```

---

## Error Responses

401 Unauthorized  
400 Bad Request  
404 Not Found (Kitchen or Food Item not found)  

---

# 3. Get My Orders

Endpoint:
GET /orders

Role Required:
CLIENT

Headers:
Authorization: Bearer <JWT_TOKEN>

Returns all orders placed by the authenticated client.

---

## Success Response (200 OK)

```json
[
  {
    "id": "order-uuid-1234-5678",
    "status": "ACCEPTED",
    "scheduled_for": "2026-02-16",
    "total_price": 450.00,
    "created_at": "2026-02-15T12:00:00.000Z",
    "kitchen": {
      "id": "814cec7e-dd52-4ced-a46f-58cbff911e02",
      "name": "Rahul's Home Kitchen"
    }
  }
]
```

---

# 4. Get Order By ID

Endpoint:
GET /orders/:id

Role Required:
CLIENT (Must be the order owner)

Headers:
Authorization: Bearer <JWT_TOKEN>

---

## Success Response (200 OK)

```json
{
  "id": "order-uuid-1234-5678",
  "status": "ACCEPTED",
  "scheduled_for": "2026-02-16",
  "total_price": 450.00,
  "created_at": "2026-02-15T12:00:00.000Z",
  "items": [
    {
         "food_item": { "name": "Thali" },
         "quantity": 2,
         "snapshot_price": 150.00
    }
  ]
}
```

---

## Error Responses

404 Not Found  
403 Forbidden (If accessing another user's order)  

---

# Business Rules

1. Orders are placed for a specific date (typically "tomorrow").
2. Orders start in `PENDING` status.
3. Only `ACCEPTED` orders can be picked up by delivery drivers.
4. Clients can only see their own orders.

---

# Security Notes

- JWT authentication enforced.
- Role-based access control for order creation.
- Users cannot access orders belonging to others.
