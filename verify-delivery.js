const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function main() {
    try {
        // 1. Register & Login Kitchen Owner
        console.log('--- Kitchen Owner Setup ---');
        const kitchenOwnerEmail = `owner_${Date.now()}@test.com`;
        await axios.post(`${BASE_URL}/auth/register`, {
            username: `owner_${Date.now()}`,
            name: 'Test Owner',
            email: kitchenOwnerEmail,
            phone_number: `${Date.now()}`,
            address: 'Kitchen St',
            password: 'password',
            role: 'KITCHEN_OWNER'
        });
        const ownerLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: kitchenOwnerEmail,
            password: 'password'
        });
        const ownerToken = ownerLogin.data.access_token;
        console.log('Kitchen Owner Logged In');

        // Create Kitchen
        const kitchen = await axios.post(`${BASE_URL}/kitchens`, {
            name: `Test Kitchen ${Date.now()}`,
            details: { address: '123 Food St', phone: '555-5555', email: 'kitchen@test.com' },
            operating_hours: { open: '09:00', close: '22:00', days_off: [] }
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        const kitchenId = kitchen.data.id;
        console.log('Kitchen Created:', kitchenId);

        // Create Menu Item
        const menuItem = await axios.post(`${BASE_URL}/menu-items`, {
            name: 'Burger',
            price: 10,
            description: 'Tasty burger',
            kitchen_id: kitchenId
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        const menuItemId = menuItem.data.id;
        console.log('Menu Item Created:', menuItemId);


        // 2. Register & Login Client
        console.log('\n--- Client Setup ---');
        const clientEmail = `client_${Date.now()}@test.com`;
        await axios.post(`${BASE_URL}/auth/register`, {
            username: `client_${Date.now()}`,
            name: 'Test Client',
            email: clientEmail,
            phone_number: `${Date.now() + 1}`,
            address: 'Client St',
            password: 'password',
            role: 'CLIENT'
        });
        const clientLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: clientEmail,
            password: 'password'
        });
        const clientToken = clientLogin.data.access_token;
        console.log('Client Logged In');

        // Create Order
        const order = await axios.post(`${BASE_URL}/orders`, {
            kitchen_id: kitchenId,
            scheduled_for: '2025-12-25',
            items: [{ food_item_id: menuItemId, quantity: 2 }]
        }, { headers: { Authorization: `Bearer ${clientToken}` } });
        const orderId = order.data.id;
        console.log('Order Created:', orderId);

        // 3. Kitchen Accepts Order
        console.log('\n--- Kitchen Accepts Order ---');
        await axios.patch(`${BASE_URL}/orders/${orderId}/accept`, {}, {
            headers: { Authorization: `Bearer ${ownerToken}` }
        });
        console.log('Order Accepted by Kitchen');

        // 4. Register & Login Delivery Driver
        console.log('\n--- Driver Setup ---');
        const driverEmail = `driver_${Date.now()}@test.com`;
        await axios.post(`${BASE_URL}/auth/register`, {
            username: `driver_${Date.now()}`,
            name: 'Test Driver',
            email: driverEmail,
            phone_number: `${Date.now() + 2}`,
            address: 'Driver HQ',
            password: 'password',
            role: 'DELIVERY_DRIVER'
        });
        const driverLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: driverEmail,
            password: 'password'
        });
        const driverToken = driverLogin.data.access_token;
        console.log('Driver Logged In');

        // 5. Driver Flow
        console.log('\n--- Driver Flow ---');
        // Get Available
        const available = await axios.get(`${BASE_URL}/deliveries/available`, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        console.log('Available Deliveries:', available.data.length);
        const targetOrder = available.data.find(o => o.id === orderId);
        if (!targetOrder) throw new Error('Order not found in available list');

        // Check details in available list
        console.log('Kitchen Address visible:', targetOrder.kitchen.details.address);

        // Accept
        await axios.patch(`${BASE_URL}/deliveries/${orderId}/accept`, {}, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        console.log('Driver Accepted Order');

        // Get My Orders
        const myOrders = await axios.get(`${BASE_URL}/deliveries/my-orders`, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        console.log('My Orders:', myOrders.data.length);

        // Finish
        await axios.patch(`${BASE_URL}/deliveries/${orderId}/finish`, {}, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        console.log('Driver Finished Delivery');

        // Verify Final Status
        const finalOrder = await axios.get(`${BASE_URL}/deliveries/${orderId}`, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        console.log('Final Order Status:', finalOrder.data.status);

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

main();
