# Client Endpoints

These endpoints are for users with the role `CLIENT`. All endpoints require authentication (Bearer Token).

## Browse Kitchens
- **Endpoint**: `GET /kitchens`
- **Description**: List all active kitchens.
- **Response**: Array of kitchen profiles.

- **Endpoint**: `GET /kitchens/:id`
- **Description**: Get details of a specific kitchen.

## Browse Menu
- **Endpoint**: `GET /menu-items/kitchen/:kitchenId`
- **Description**: Get all menu items for a specific kitchen.
  - Useful for displaying the menu when a client clicks on a kitchen.

- **Endpoint**: `GET /menu-items/:id`
- **Description**: Get details of a specific menu item.

## Orders

### Create Order
- **Endpoint**: `POST /orders`
- **Description**: Place a new order.
- **Body**:
  ```json
  {
    "kitchen_id": "uuid-of-kitchen",
    "scheduled_for": "2023-12-25", // Date string (YYYY-MM-DD), usually for tomorrow
    "items": [
      { "food_item_id": "uuid-of-item-1", "quantity": 2 },
      { "food_item_id": "uuid-of-item-2", "quantity": 1 }
    ]
  }
  ```

### My Orders
- **Endpoint**: `GET /orders`
- **Description**: List all orders placed by the logged-in client.

### Order Details
- **Endpoint**: `GET /orders/:id`
- **Description**: Get details of a specific order.
