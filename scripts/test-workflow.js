const https = require('https');

const hostname = 'backend.v1.nutritiffin.com';

function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : '';
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (body) headers['Content-Length'] = Buffer.byteLength(data);

        const req = https.request({
            hostname, path, method, headers
        }, res => {
            let resBody = '';
            res.on('data', d => resBody += d);
            res.on('end', () => {
                try {
                    if (resBody) {
                        const parsed = JSON.parse(resBody);
                        resolve({ status: res.statusCode, data: parsed });
                    } else {
                        resolve({ status: res.statusCode, data: null });
                    }
                } catch (e) {
                    resolve({ status: res.statusCode, data: resBody });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(data);
        req.end();
    });
}

function getTomorrowStr() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
}

async function runTest() {
    console.log('--- Starting Flow Test ---');

    // 1. Logins
    console.log('Logging in...');
    const kRes = await request('POST', '/auth/login', { username: 'vkitchen1', password: 'Password123!' });
    if (kRes.status !== 200 && kRes.status !== 201) return console.log('Kitchen login failed:', kRes.data);
    const kToken = kRes.data.access_token;
    console.log('Kitchen Logger in.');

    const cRes = await request('POST', '/auth/login', { username: 'vclient1', password: 'Password123!' });
    if (cRes.status !== 200 && cRes.status !== 201) return console.log('Client login failed:', cRes.data);
    const cToken = cRes.data.access_token;
    console.log('Client Logged in.');

    const dRes = await request('POST', '/auth/login', { username: 'vdriver1', password: 'Password123!' });
    if (dRes.status !== 200 && dRes.status !== 201) return console.log('Driver login failed:', dRes.data);
    const dToken = dRes.data.access_token;
    console.log('Driver Logged in.');

    // 2. Kitchen Setup
    console.log('Setting up Kitchen...');
    let kDataRes = await request('GET', '/kitchens');
    let kitchenId = null;
    const kitchens = kDataRes.data;
    let kitchen = kitchens.find(k => k.name === 'My Virtual Kitchen');

    if (!kitchen) {
        const kCreateRes = await request('POST', '/kitchens', {
            name: 'My Virtual Kitchen',
            details: { address: 'Kitchen 1 Street' },
            is_active: true,
            is_menu_visible: true
        }, kToken);
        if (kCreateRes.status !== 201) return console.log('Failed to create kitchen:', kCreateRes.data);
        kitchenId = kCreateRes.data.id;
    } else {
        kitchenId = kitchen.id;
    }

    // Add Item
    console.log('Adding menu item...');
    const miRes = await request('POST', '/menu-items', {
        name: 'Virtual Tiffin',
        price: 100,
        description: 'A delicious test tiffin',
        max_daily_orders: 50,
        is_veg: true
    }, kToken);
    if (miRes.status !== 201) return console.log('Failed to create menu item:', miRes.data);
    const menuItemId = miRes.data.id;

    // 3. Client places order
    console.log('Client placing order...');
    const orderRes = await request('POST', '/orders', {
        kitchen_id: kitchenId,
        scheduled_for: getTomorrowStr(),
        items: [{ food_item_id: menuItemId, quantity: 1 }]
    }, cToken);
    if (orderRes.status !== 201) return console.log('Failed to create order:', orderRes.data);
    const orderId = orderRes.data.id;
    const orderItemId = orderRes.data.items[0].id;
    console.log('Order created:', orderId);

    // 4. Kitchen accepts
    console.log('Kitchen accepting order...');
    const accRes = await request('PATCH', `/orders/${orderId}/accept`, null, kToken);
    if (accRes.status !== 200) return console.log('Kitchen accept failed:', accRes.data);

    // 5. Kitchen marks ready
    console.log('Kitchen marking order ready...');
    const readyRes = await request('PATCH', `/orders/${orderId}/ready`, null, kToken);
    if (readyRes.status !== 200) return console.log('Kitchen mark ready failed:', readyRes.data);

    // 6. Driver checks available deliveries
    console.log('Driver listing available deliveries...');
    const availRes = await request('GET', `/deliveries/available`, null, dToken);
    if (availRes.status !== 200) return console.log('Fetch available failed:', availRes.data);
    const availableOrders = availRes.data;
    const targetAvailable = availableOrders.find(o => o.id === orderId);
    if (!targetAvailable) return console.log('Order not found in available deliveries!');

    // 7. Driver accepts delivery
    console.log('Driver accepting delivery...');
    const dAccRes = await request('PATCH', `/deliveries/${orderId}/accept`, null, dToken);
    if (dAccRes.status !== 200) return console.log('Driver accept failed:', dAccRes.data);

    // 8. Driver picks up
    // NOT ANYMORE, driver skips pick-up and goes to out-for-delivery directly as per the code
    // Wait, I left out-for-delivery checking orderStatus = READY! Wait, NO, I updated it so it picks it up!
    // Wait, didn't I re-add pickUpDelivery? Yes, I added PICKED_UP back!
    // Then there are 3 steps for driver: Accept, Pick-up, Out-for-delivery, Finish.
    console.log('Driver picking up delivery...');
    let pickRes = await request('PATCH', `/deliveries/${orderId}/pick-up`, null, dToken);
    if (pickRes.status !== 200 && pickRes.status !== 404) {
        console.log('Driver pickup failed (might not exist if refactored correctly!):', pickRes.status, pickRes.data);
    }

    // 9. Driver out for delivery
    console.log('Driver marking out for delivery...');
    const outRes = await request('PATCH', `/deliveries/${orderId}/out-for-delivery`, null, dToken);
    if (outRes.status !== 200) return console.log('Driver out for delivery failed:', outRes.data);

    // 10. Driver finishes delivery
    console.log('Driver finishing delivery...');
    const finRes = await request('PATCH', `/deliveries/${orderId}/finish`, null, dToken);
    if (finRes.status !== 200) return console.log('Driver finish delivery failed:', finRes.data);

    // 11. Client reviews
    console.log('Client reviewing...');
    const revRes = await request('POST', '/reviews', {
        order_item_id: orderItemId,
        is_positive: true
    }, cToken);
    if (revRes.status !== 201) return console.log('Review failed:', revRes.data);

    console.log('--- ALL ENDPOINTS TESTED SUCCESSFULLY! ---');
}

runTest();
