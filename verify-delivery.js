const axios = require('axios');

const BASE_URL = 'https://backend.v1.nutritiffin.com';

async function main() {
    try {
        console.log(`Testing against ${BASE_URL}\n`);

        // 1. Register & Login Kitchen Owner
        console.log('--- Kitchen Owner Setup ---');
        const ts = Date.now();
        const ownerUsername = `owner_${ts}`;
        const kitchenOwnerEmail = `owner_${ts}@test.com`;

        console.log(`Registering Owner: ${ownerUsername}`);
        try {
            await axios.post(`${BASE_URL}/auth/register`, {
                username: ownerUsername,
                name: 'Test Owner',
                email: kitchenOwnerEmail,
                phone_number: `${ts}`,
                address: 'Kitchen St',
                password: 'password',
                role: 'KITCHEN_OWNER'
            });
        } catch (e) {
            if (e.response?.status !== 409) throw e;
            console.log('Owner already exists (unexpected for unique ts)');
        }

        console.log(`Logging in Owner: ${ownerUsername}`);
        const ownerLogin = await axios.post(`${BASE_URL}/auth/login`, {
            username: ownerUsername, // CHANGED from email to username
            password: 'password'
        });
        const ownerToken = ownerLogin.data.access_token;
        console.log('Kitchen Owner Logged In');

        // Create Kitchen
        console.log('Creating Kitchen...');
        const kitchen = await axios.post(`${BASE_URL}/kitchens`, {
            name: `Test Kitchen ${ts}`,
            details: { address: '123 Food St', phone: '555-5555', email: 'kitchen@test.com' },
            operating_hours: { open: '09:00', close: '22:00', days_off: [] }
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        const kitchenId = kitchen.data.id;
        console.log('Kitchen Created:', kitchenId);

        // Create Menu Item
        console.log('Creating Menu Item...');
        const menuItem = await axios.post(`${BASE_URL}/menu-items`, {
            name: 'Test Burger',
            price: 10,
            description: 'Tasty test burger',
            kitchen_id: kitchenId
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        const menuItemId = menuItem.data.id;
        console.log('Menu Item Created:', menuItemId);


        // 2. Register & Login Client
        console.log('\n--- Client Setup ---');
        const clientUsername = `client_${ts}`;
        const clientEmail = `client_${ts}@test.com`;

        console.log(`Registering Client: ${clientUsername}`);
        await axios.post(`${BASE_URL}/auth/register`, {
            username: clientUsername,
            name: 'Test Client',
            email: clientEmail,
            phone_number: `${ts + 1}`,
            address: 'Client St',
            password: 'password',
            role: 'CLIENT'
        });

        console.log(`Logging in Client: ${clientUsername}`);
        const clientLogin = await axios.post(`${BASE_URL}/auth/login`, {
            username: clientUsername, // CHANGED from email to username
            password: 'password'
        });
        const clientToken = clientLogin.data.access_token;
        console.log('Client Logged In');

        // Create Order
        console.log('Creating Order...');
        // Order for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const scheduledFor = tomorrow.toISOString().split('T')[0];

        const order = await axios.post(`${BASE_URL}/orders`, {
            kitchen_id: kitchenId,
            scheduled_for: scheduledFor,
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
        const driverUsername = `driver_${ts}`;
        const driverEmail = `driver_${ts}@test.com`;

        console.log(`Registering Driver: ${driverUsername}`);
        await axios.post(`${BASE_URL}/auth/register`, {
            username: driverUsername,
            name: 'Test Driver',
            email: driverEmail,
            phone_number: `${ts + 2}`,
            address: 'Driver HQ',
            password: 'password',
            role: 'DELIVERY_DRIVER'
        });

        console.log(`Logging in Driver: ${driverUsername}`);
        const driverLogin = await axios.post(`${BASE_URL}/auth/login`, {
            username: driverUsername, // CHANGED from email to username
            password: 'password'
        });
        const driverToken = driverLogin.data.access_token;
        console.log('Driver Logged In');

        // 5. Driver Flow
        console.log('\n--- Driver Flow ---');

        // Get Available
        console.log('Fetching Available Deliveries...');
        const available = await axios.get(`${BASE_URL}/deliveries/available`, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        console.log('Available Deliveries Count:', available.data.length);

        const targetOrder = available.data.find(o => o.id === orderId);
        if (!targetOrder) {
            console.error('Available list:', JSON.stringify(available.data, null, 2));
            throw new Error(`Order ${orderId} not found in available list`);
        }
        console.log('Found target order in available list');

        // Check details in available list
        if (targetOrder.kitchen && targetOrder.kitchen.address) {
            console.log('Kitchen Address visible:', targetOrder.kitchen.address);
        } else {
            console.log('Kitchen Address NOT visible (might be expected or issue)');
        }

        // Accept
        console.log(`Accepting Delivery ${orderId}...`);
        await axios.patch(`${BASE_URL}/deliveries/${orderId}/accept`, {}, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        console.log('Driver Accepted Order');

        // Get My Orders
        console.log('Fetching My Orders...');
        const myOrders = await axios.get(`${BASE_URL}/deliveries/my-orders`, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        console.log('My Orders Count:', myOrders.data.length);
        const myOrder = myOrders.data.find(o => o.id === orderId);
        if (!myOrder) throw new Error('Order not found in my-orders list');
        console.log('Found order in my-orders');

        // Get Details
        console.log('Fetching Order Details...');
        const orderDetails = await axios.get(`${BASE_URL}/deliveries/${orderId}`, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        console.log('Order Details Client Address:', orderDetails.data.client?.address);

        // Finish
        console.log('Finishing Delivery...');
        await axios.patch(`${BASE_URL}/deliveries/${orderId}/finish`, {}, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        console.log('Driver Finished Delivery');

        // Verify Final Status
        console.log('Verifying Final Status...');
        const finalOrder = await axios.get(`${BASE_URL}/deliveries/${orderId}`, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        console.log('Final Order Status:', finalOrder.data.status);

        if (finalOrder.data.status === 'DELIVERED') {
            console.log('\nSUCCESS: Full Delivery Flow Verified!');
        } else {
            console.error('\nFAILURE: Final status mismatch');
        }

    } catch (error) {
        console.error('\nERROR OCCURRED:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

main();
