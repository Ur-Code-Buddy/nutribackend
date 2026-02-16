# Delivery API Documentation

## Base URL

Production:
https://backend.v1.nutritiffin.com

Local Development:
http://localhost:3000

---

## Authentication

Protected routes require:

Authorization: Bearer <JWT_TOKEN>

Only users with role `DELIVERY_DRIVER` can access these endpoints.

---

# Delivery Module Overview

The Delivery module allows:

- Drivers to finding available orders ready for pickup
- Drivers to accept orders
- Drivers to mark orders as delivered
- Viewing delivery history

---

# 1. View Available Deliveries

Endpoint:
GET /deliveries/available

Role Required:
DELIVERY_DRIVER

Headers:
Authorization: Bearer <JWT_TOKEN>

Returns a list of orders that are `ACCEPTED` by the kitchen but have no driver assigned.

---

## Success Response (200 OK)

```json
[
  {
    "id": "order-uuid-1234-5678",
    "status": "ACCEPTED",
    "scheduled_for": "2026-02-16",
    "total_price": 250.00,
    "kitchen": {
      "id": "kitchen-uuid",
      "name": "Rahul's Home Kitchen",
      "phone": "23872393834",
      "address": "221B Baker Street, Mumbai"
    },
    "items": [
      {
        "food_item_id": "item-uuid",
        "name": "Pizza",
        "image_url": "http://...",
        "quantity": 2,
        "snapshot_price": 50.00
      }
    ]
  }
]
```

---

# 2. View My Assignments

Endpoint:
GET /deliveries/my-orders

Role Required:
DELIVERY_DRIVER

Headers:
Authorization: Bearer <JWT_TOKEN>

Returns a list of orders assigned to the authenticated driver.

---

## Success Response (200 OK)

```json
[
  {
    "id": "order-uuid-1234-5678",
    "status": "OUT_FOR_DELIVERY",
    "scheduled_for": "2026-02-16",
    "total_price": 250.00,
    "kitchen": {
      "id": "kitchen-uuid",
      "name": "Rahul's Home Kitchen",
      "phone": "23872393834",
      "address": "221B Baker Street, Mumbai"
    },
    "client": {
      "id": "client-uuid",
      "name": "John Doe",
      "phone_number": "9876543210",
      "address": "123 Main St"
    },
    "items": [ ... ]
  }
]
```

---

# 3. Accept Delivery

Endpoint:
PATCH /deliveries/:id/accept

Role Required:
DELIVERY_DRIVER

Headers:
Authorization: Bearer <JWT_TOKEN>

Assigns the order to the authenticated driver and updates status to `OUT_FOR_DELIVERY`.

---

## Success Response (200 OK)

```json
{
  "id": "order-uuid-1234-5678",
  "status": "OUT_FOR_DELIVERY",
  "total_price": 250.00,
  "kitchen": { ... },
  "client": { ... },
  "items": [ ... ],
  "delivery_driver": {
    "id": "driver-uuid-9876",
    "name": "Driver Name",
    "phone_number": "9998887776"
  }
}
```

---

## Error Responses

400 Bad Request (If order is not ACCEPTED or already assigned)  
404 Not Found  

---

# 4. Finish Delivery

Endpoint:
PATCH /deliveries/:id/finish

Role Required:
DELIVERY_DRIVER

Headers:
Authorization: Bearer <JWT_TOKEN>

Marks the order as `DELIVERED`. Driver must be the one assigned.

---

## Success Response (200 OK)

```json
{
  "id": "order-uuid-1234-5678",
  "status": "DELIVERED",
  "total_price": 250.00,
  "kitchen": { ... },
  "client": { ... },
  "items": [ ... ],
  "delivery_driver": { ... }
}
```

---

## Error Responses

400 Bad Request (If order is not OUT_FOR_DELIVERY or assigned to another driver)  
404 Not Found  

---

# Business Rules

1. Drivers can only pick up orders that are in `ACCEPTED` status.
2. Only one driver can be assigned to an order.
3. Once accepted, the status moves to `OUT_FOR_DELIVERY`.
4. Once delivered, the status moves to `DELIVERED`.

---

# Security Notes

- JWT authentication enforced.
- Drivers cannot modify orders they are not assigned to (except to accept available ones).
- Address details are provided only for assigned deliveries.
