# Kitchen Owner Endpoints

These endpoints are for users with the role `KITCHEN_OWNER`. All endpoints require authentication (Bearer Token).

## Kitchen Management (`/kitchens`)

### Create Kitchen Profile
- **Endpoint**: `POST /kitchens`
- **Description**: Create a new kitchen profile. A user can only have one kitchen.
- **Body**:
  ```json
  {
    "name": "My Kitchen",
    "details": { "cuisine": "Indian", "bio": "Homemade Tiffins" },
    "operating_hours": { "open": "09:00", "close": "21:00" },
    "image_url": "https://...",
    "is_active": true,
    "is_menu_visible": true
  }
  ```

### Update Kitchen Profile
- **Endpoint**: `PATCH /kitchens/:id`
- **Description**: Update your kitchen details.
- **Body**: Same structure as Create (all fields optional).

### Get My Kitchen
There is no direct "Get My Kitchen" endpoint, but you can find your kitchen via `GET /kitchens` (filtering by owner_id if implemented) or by ID if you know it.
- **Note**: The frontend should store the kitchen ID after creation or fetching user profile.

## Menu Management (`/menu-items`)

### Add Menu Item
- **Endpoint**: `POST /menu-items`
- **Description**: Add a new food item to your kitchen.
- **Body**:
  ```json
  {
    "name": "Paneer Butter Masala",
    "description": "Rich and creamy curry",
    "price": 150,
    "image_url": "https://...",
    "max_daily_orders": 20
  }
  ```

### Get My Menu Items
- **Endpoint**: `GET /menu-items/my-items`
- **Description**: Get all menu items for your kitchen.

### Update Menu Item
- **Endpoint**: `PATCH /menu-items/:id`
- **Description**: Update details of a specific menu item.

### Set Item Availability
- **Endpoint**: `PATCH /menu-items/:id/availability`
- **Body**:
  ```json
  {
    "is_available": false
  }
  ```

## Order Management (`/orders`)

As a Kitchen Owner, you can manage incoming orders.

### Accept Order
- **Endpoint**: `PATCH /orders/:id/accept`
- **Description**: Mark an order as accepted. This should trigger a notification to the delivery network? (Currently just updates status).

### Reject Order
- **Endpoint**: `PATCH /orders/:id/reject`
- **Description**: Mark an order as rejected.

