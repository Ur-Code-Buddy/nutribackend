# API Endpoints Documentation

## Base URL
All endpoints are relative to the base URL: `https://backend.v1.nutritiffin.com` (or `http://localhost:3000` for local dev).

---

## Authentication (`/auth`)

### Register User
**POST** `/auth/register`

Creates a new user account.

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `username` | string | Yes | Unique username. |
| `password` | string | Yes | Password (min 6 characters). |
| `role` | enum | Yes | User role. Values: `CLIENT`, `KITCHEN_OWNER`. |
| `name` | string | Yes | Full name of the user. |
| `email` | string | Yes | Email address (unique). |
| `phone_number` | string | Yes | Phone number (unique). |

**Example Request:**
```json
{
  "username": "john_doe",
  "password": "securepassword123",
  "role": "CLIENT",
  "name": "John Doe",
  "email": "john@example.com",
  "phone_number": "1234567890"
}
```

**Response (201 Created):**
Returns the created user object.
```json
{
  "id": "uuid-string",
  "username": "john_doe",
  "role": "CLIENT",
  "created_at": "2023-10-27T10:00:00.000Z",
  "updated_at": "2023-10-27T10:00:00.000Z"
}
```

### Login
**POST** `/auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `username` | string | Yes | Registered username. |
| `password` | string | Yes | User password. |

**Example Request:**
```json
{
  "username": "john_doe",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": "uuid-string",
    "username": "john_doe",
    "role": "CLIENT"
  }
}
```

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
| `details` | object | No | Additional details like address, phone, etc. |
| `operating_hours` | object | No | Operating hours configuration. |
| `image_url` | string | No | URL to the kitchen's cover image. |
| `is_active` | boolean | No | Whether the kitchen is active (default: true). |
| `is_menu_visible` | boolean | No | Whether the menu is visible to users (default: true). |

**Example Request:**
```json
{
  "name": "Mama's Kitchen",
  "details": {
    "address": "123 Main St",
    "phone": "555-0199",
    "description": "Authentic home-cooked meals."
  },
  "operating_hours": {
    "open": "09:00",
    "close": "21:00",
    "days_off": [0, 6]
  },
  "image_url": "https://example.com/kitchen.jpg"
}
```

**Response (201 Created):**
```json
{
  "id": "kitchen-uuid",
  "owner_id": "user-uuid",
  "name": "Mama's Kitchen",
  "details": {
    "address": "123 Main St",
    "phone": "555-0199",
    "description": "Authentic home-cooked meals."
  },
  "operating_hours": {
    "open": "09:00",
    "close": "21:00",
    "days_off": [0, 6]
  },
  "image_url": "https://example.com/kitchen.jpg",
  "created_at": "...",
  "updated_at": "..."
}
```

### Get All Kitchens
**GET** `/kitchens`

Retrieves a list of all active kitchens (`is_active=true`). Public endpoint.

**Response (200 OK):**
```json
[
  {
    "id": "kitchen-uuid",
    "name": "Mama's Kitchen",
    "owner_id": "user-uuid",
    ...
  },
  ...
]
```

### Get Kitchen by ID
**GET** `/kitchens/:id`

Retrieves details of a specific kitchen.

**Response (200 OK):**
```json
{
  "id": "kitchen-uuid",
  "name": "Mama's Kitchen",
  ...
}
```

### Update Kitchen
**PATCH** `/kitchens/:id`
**Role Required:** `KITCHEN_OWNER`

Updates an existing kitchen profile. User must be the owner.

**Request Body:**
Partial of Create Kitchen body.

**Example Request:**
```json
{
  "details": {
    "description": "Updated description."
  }
}
```

**Response (200 OK):**
Returns the updated kitchen object.

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
| `max_daily_orders` | number | No | Maximum number of orders allowed per day (default 100). |

**Example Request:**
```json
{
  "name": "Chicken Curry",
  "price": 12.99,
  "description": "Spicy and delicious.",
  "image_url": "https://example.com/curry.jpg",
  "max_daily_orders": 50
}
```

**Response (201 Created):**
```json
{
  "id": "item-uuid",
  "kitchen_id": "kitchen-uuid",
  "name": "Chicken Curry",
  "price": 12.99,
  "is_available": true,
  "active": true,
  ...
}
```

### Get My Items
**GET** `/menu-items/my-items`
**Role Required:** `KITCHEN_OWNER`

Retrieves all menu items for the authenticated kitchen owner.

**Response (200 OK):**
Array of food item objects.

### Get Menu Items by Kitchen
**GET** `/menu-items/kitchen/:kitchenId`

Retrieves all menu items for a specific kitchen.

**Response (200 OK):**
Array of food item objects.

### Get Menu Item by ID
**GET** `/menu-items/:id`

Retrieves details of a specific menu item.

**Response (200 OK):**
Single food item object.

### Update Menu Item
**PATCH** `/menu-items/:id`
**Role Required:** `KITCHEN_OWNER`

Updates a menu item.

**Request Body:**
Partial of Create Menu Item body.

**Response (200 OK):**
Updated food item object.

### Set Menu Item Availability
**PATCH** `/menu-items/:id/availability`
**Role Required:** `KITCHEN_OWNER`

Sets the availability of a specific item.

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `is_available` | boolean | Yes | `true` if available, `false` otherwise. |

**Example Request:**
```json
{
  "is_available": false
}
```

**Response (200 OK):**
Updated food item object.

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
| `scheduled_for` | string | Yes | Date for the order in `YYYY-MM-DD` format. |
| `items` | array | Yes | List of items to order. |

**Item Object:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `food_item_id` | string | Yes | ID of the menu item. |
| `quantity` | number | Yes | Quantity to order (min 1). |

**Example Request:**
```json
{
  "kitchen_id": "kitchen-uuid",
  "scheduled_for": "2023-11-01",
  "items": [
    {
      "food_item_id": "item-uuid-1",
      "quantity": 2
    },
    {
      "food_item_id": "item-uuid-2",
      "quantity": 1
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": "order-uuid",
  "client_id": "user-uuid",
  "kitchen_id": "kitchen-uuid",
  "status": "PENDING",
  "scheduled_for": "2023-11-01",
  "items": [ ... ],
  "created_at": "...",
  "updated_at": "..."
}
```

### Get All Orders
**GET** `/orders`

Retrieves all orders for the authenticated user (Client or Kitchen Owner).

**Response (200 OK):**
Array of order objects.

### Get Order by ID
**GET** `/orders/:id`

Retrieves details of a specific order.

**Response (200 OK):**
Single order object.

### Accept Order
**PATCH** `/orders/:id/accept`
**Role Required:** `KITCHEN_OWNER`

Marks an order as `ACCEPTED`.

**Request Body:**
None (empty).

**Response (200 OK):**
Updates order status to `ACCEPTED`.

### Reject Order
**PATCH** `/orders/:id/reject`
**Role Required:** `KITCHEN_OWNER`

Marks an order as `REJECTED`.

**Request Body:**
None (empty).

**Response (200 OK):**
Updates order status to `REJECTED`.

---

## Uploads (`/upload-image`)

### Upload Image
**POST** `/upload-image`

Uploads an image file to S3 and returns the public URL.

**Request:**
- **Content-Type**: `multipart/form-data`
- **Body**: form-data with key `file` containing the image file (jpg/png, max 5MB).

**Response (201 Created):**
```json
{
  "image_url": "https://nutri.s3.ap-south-1.amazonaws.com/uploads/uuid.jpg"
}
```

---

## App General

### Health Check
**GET** `/health`

Returns the API health status.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2023-10-27T12:00:00.000Z"
}
```

### Root
**GET** `/`

Returns a welcome message.
