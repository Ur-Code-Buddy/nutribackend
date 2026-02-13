# API Endpoints Documentation

## Base URL
All endpoints are relative to the base URL of the deployed application (e.g., `https://backend.v1.nutritiffin.com`).

---

## Authentication (`/auth`)

### Register User
**POST** `/auth/register`

Creates a new user account.

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `username` | string | Yes | Unique username for login. |
| `password` | string | Yes | Password (min 6 characters). |
| `role` | enum | Yes | User role. Values: `CLIENT`, `KITCHEN_OWNER`. |

### Login
**POST** `/auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `username` | string | Yes | Registered username. |
| `password` | string | Yes | User password. |

---

## Kitchens (`/kitchens`)

### Create Kitchen
**POST** `/kitchens`
**Role Required:** `KITCHEN_OWNER`

Creates a new kitchen profile for the authenticated user.

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | Yes | Name of the kitchen. |
| `details` | object | No | Additional details about the kitchen. |
| `operating_hours` | object | No | Operating hours configuration. |
| `image_url` | string | No | URL to the kitchen's cover image. |

**Note:** `owner_id` is automatically set from the authenticated user's token.

### Get All Kitchens
**GET** `/kitchens`

Retrieves a list of all kitchens.

### Get Kitchen by ID
**GET** `/kitchens/:id`

Retrieves details of a specific kitchen.

### Update Kitchen
**PATCH** `/kitchens/:id`
**Role Required:** `KITCHEN_OWNER`

Updates an existing kitchen profile. User must be the owner.

**Request Body:**
Partial of Create Kitchen body. Provide only fields to update.

---

## Menu Items (`/menu-items`)

### Create Menu Item
**POST** `/menu-items`
**Role Required:** `KITCHEN_OWNER`

Adds a new food item to the user's kitchen menu.

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | Yes | Name of the dish. |
| `price` | number | Yes | Price of the dish. |
| `description` | string | No | Description of the dish. |
| `image_url` | string | No | URL to the dish image. |
| `max_daily_orders` | number | No | Maximum number of orders allowed per day. |

**Note:** `kitchen_id` is automatically determined based on the authenticated user's kitchen.

### Get My Layout Items
**GET** `/menu-items/my-items`
**Role Required:** `KITCHEN_OWNER`

Retrieves all menu items for the authenticated kitchen owner.

### Get Menu Items by Kitchen
**GET** `/menu-items/kitchen/:kitchenId`

Retrieves all menu items for a specific kitchen.

### Get Menu Item by ID
**GET** `/menu-items/:id`

Retrieves details of a specific menu item.

### Update Menu Item
**PATCH** `/menu-items/:id`
**Role Required:** `KITCHEN_OWNER`

Updates a menu item. User must own the associated kitchen.

**Request Body:**
Partial of Create Menu Item body.

### Set Menu Item Availability
**PATCH** `/menu-items/:id/availability`
**Role Required:** `KITCHEN_OWNER`

Sets the availability of a specific item indefinitely.

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `is_available` | boolean | Yes | `true` if available, `false` otherwise. |

---

## Orders (`/orders`)

### Create Order
**POST** `/orders`
**Role Required:** `CLIENT`

Places a new order.

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `kitchen_id` | string | Yes | ID of the kitchen to order from. |
| `scheduled_for` | string | Yes | Date for the order in `YYYY-MM-DD` (ISO 8601) format. |
| `items` | array | Yes | List of items to order. |

**Items Array Schema:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `food_item_id` | string | Yes | ID of the menu item. |
| `quantity` | number | Yes | Quantity to order (min 1). |

**Example Body:**
```json
{
  "kitchen_id": "uuid-of-kitchen",
  "scheduled_for": "2023-10-27",
  "items": [
    {
      "food_item_id": "uuid-of-item",
      "quantity": 2
    }
  ]
}
```

### Get All Orders
**GET** `/orders`

Retrieves all orders for the authenticated user (Client or Kitchen Owner).

### Get Order by ID
**GET** `/orders/:id`

Retrieves details of a specific order.

### Accept Order
**PATCH** `/orders/:id/accept`
**Role Required:** `KITCHEN_OWNER`

Marks an order as `ACCEPTED`.

### Reject Order
**PATCH** `/orders/:id/reject`
**Role Required:** `KITCHEN_OWNER`

Marks an order as `REJECTED`.

---

## App General

### Health Check
**GET** `/health`

Returns the API health status.
**Response:** `{ "status": "ok", "timestamp": "..." }`

### Root
**GET** `/`

Returns a welcome message.
