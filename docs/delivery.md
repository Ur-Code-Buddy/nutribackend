# Delivery Driver Endpoints

These endpoints are for users with the role `DELIVERY_DRIVER`. All endpoints require authentication (Bearer Token).

## Available Deliveries
- **Endpoint**: `GET /deliveries/available`
- **Description**: View all orders that are ready for pickup and not yet assigned to a driver.
- **Response**: List of orders with pickup and delivery addresses.

## My Deliveries
- **Endpoint**: `GET /deliveries/my-orders`
- **Description**: View all orders currently assigned to you (the logged-in driver).

## Manage Delivery

### Accept Delivery
- **Endpoint**: `PATCH /deliveries/:id/accept`
- **Description**: Assign yourself to an order.
- **Path Parameter**: `id` - The Order ID.

### Finish Delivery
- **Endpoint**: `PATCH /deliveries/:id/finish`
- **Description**: Mark a delivery as completed (delivered to customer).
- **Path Parameter**: `id` - The Order ID.
