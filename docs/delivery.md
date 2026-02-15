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
    "created_at": "2026-02-15T12:00:00.000Z",
    "kitchen": {
      "name": "Rahul's Home Kitchen",
      "details": {
        "address": "221B Baker Street, Mumbai",
        "phone": "23872393834"
      }
    }
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
    "updated_at": "2026-02-15T14:30:00.000Z",
    "kitchen": {
      "name": "Rahul's Home Kitchen"
    },
    "client": {
      "name": "John Doe",
      "address": "123 Main St" // Assuming client details are exposed or fetched via user entity
    }
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
  "delivery_driver_id": "driver-uuid-9876",
  "picked_up_at": "2026-02-15T14:00:00.000Z",
  "updated_at": "2026-02-15T14:00:00.000Z"
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
  "delivered_at": "2026-02-15T15:00:00.000Z",
  "updated_at": "2026-02-15T15:00:00.000Z"
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
