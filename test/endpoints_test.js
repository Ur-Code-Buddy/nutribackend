const axios = require("axios");

const BASE_URL = "https://backend.v1.nutritiffin.com";

// ---- HELPERS ----

function generateRandomString(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function tomorrowDate() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
}

function authHeaders(token) {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
}

// ---- AUTH ACTIONS ----

async function registerUser(role, prefix) {
    const username = `${prefix}_${generateRandomString()}`;
    const password = "password123";
    const email = `${username}@example.com`;
    const phone_number = "9" + generateRandomString(9).replace(/[^0-9]/g, '0');
    const name = `${prefix} User`;
    const address = "123 Test Street, Automation City";

    console.log(`Registering ${role}: ${username}...`);
    try {
        await axios.post(`${BASE_URL}/auth/register`, {
            username,
            name,
            email,
            phone_number,
            address,
            password,
            role,
        });
    } catch (e) {
        if (e.response && e.response.status === 409) {
            console.log("User already exists, proceeding to login.");
        } else {
            throw new Error(`Registration failed for ${username}: ${e.message} ${JSON.stringify(e.response?.data)}`);
        }
    }

    console.log(`Logging in ${role}: ${username}...`);
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        username,
        password,
    });

    return {
        item: loginRes.data,
        token: loginRes.data.access_token,
        username,
        password
    };
}

// ---- MAIN TEST SUITE ----

async function main() {
    try {
        console.log("🚀 Starting Complete Endpoint Coverage Test...");

        // 1. Register Users
        const owner = await registerUser("KITCHEN_OWNER", "owner");
        const client = await registerUser("CLIENT", "client");
        const driver = await registerUser("DELIVERY_DRIVER", "driver");

        const ownerHeaders = authHeaders(owner.token);
        const clientHeaders = authHeaders(client.token);
        const driverHeaders = authHeaders(driver.token);

        // 2. Create Kitchen (Owner)
        console.log("\n👨‍🍳 Owner: Creating Kitchen...");
        const kitchenName = `Kitchen ${generateRandomString()}`
        const kitchenRes = await axios.post(
            `${BASE_URL}/kitchens`,
            {
                name: kitchenName,
                details: {
                    address: "123 Test St, Food City",
                    phone: "9876543210",
                    description: "Best automated food in town",
                },
                operating_hours: {
                    monday: { open: "08:00", close: "20:00" },
                },
            },
            ownerHeaders
        );

        if (kitchenRes.status !== 201) throw new Error(`Kitchen creation failed: ${kitchenRes.status}`);
        const kitchenId = kitchenRes.data.id;
        console.log(`✅ Kitchen created: ${kitchenId}`);

        // 2b. Update Kitchen
        console.log("👨‍🍳 Owner: Updating Kitchen details...");
        const updateKitchenRes = await axios.patch(
            `${BASE_URL}/kitchens/${kitchenId}`,
            {
                name: `${kitchenName} Updated`,
                details: {
                    address: "456 New St, Food City",
                    phone: "9876543210",
                    description: "Updated description",
                }
            },
            ownerHeaders
        );
        if (updateKitchenRes.data.name !== `${kitchenName} Updated`) throw new Error("Kitchen name update failed");
        console.log("✅ Kitchen updated successfully");

        // 2c. Get All Kitchens (Public)
        console.log("🌍 Public: Listing all kitchens...");
        const allKitchensRes = await axios.get(`${BASE_URL}/kitchens`);
        if (!allKitchensRes.data.find(k => k.id === kitchenId)) throw new Error("New kitchen not found in public list");
        console.log("✅ New kitchen found in public list");

        // 3. Create Menu Item (Owner)
        console.log("\n🥘 Owner: Adding Menu Item...");
        const itemName = `Dish ${generateRandomString()}`;
        const itemRes = await axios.post(
            `${BASE_URL}/menu-items`,
            {
                name: itemName,
                price: 250,
                description: "Original description",
                max_daily_orders: 50,
                availability_days: ["monday", "tuesday"],
                is_available: true
            },
            ownerHeaders
        );
        const menuItemId = itemRes.data.id;
        console.log(`✅ Menu Item created: ${menuItemId}`);

        // 3b. Update Menu Item
        console.log("🥘 Owner: Updating Menu Item...");
        const updateItemRes = await axios.patch(
            `${BASE_URL}/menu-items/${menuItemId}`,
            {
                price: 300,
                description: "Updated description"
            },
            ownerHeaders
        );
        console.log("Update response data:", updateItemRes.data);
        const returnedPrice = parseFloat(updateItemRes.data.price);
        if (returnedPrice !== 300) {
            throw new Error(`Menu item price update failed. Expected 300, got ${updateItemRes.data.price}`);
        }
        console.log("✅ Menu Item price updated");

        // 3c. Toggle Availability
        console.log("🥘 Owner: Toggling availability...");
        await axios.patch(
            `${BASE_URL}/menu-items/${menuItemId}/availability`,
            { is_available: false },
            ownerHeaders
        );
        // Toggle back to true for ordering
        await axios.patch(
            `${BASE_URL}/menu-items/${menuItemId}/availability`,
            { is_available: true },
            ownerHeaders
        );
        console.log("✅ Availability toggled successfully");

        // 3d. List Menu Items
        console.log("🥘 Owner: Checking 'My Items'...");
        const myItemsRes = await axios.get(`${BASE_URL}/menu-items/my-items`, ownerHeaders);
        if (!myItemsRes.data.find(i => i.id === menuItemId)) throw new Error("Item not found in 'My Items'");
        console.log("✅ Item found in owner's list");

        // 4. Place Order (Client)
        console.log("\n🛒 Client: Placing Order...");
        const tomorrow = tomorrowDate();
        // console.log("Client Headers:", JSON.stringify(clientHeaders, null, 2)); 
        const orderRes = await axios.post(
            `${BASE_URL}/orders`,
            {
                kitchen_id: kitchenId,
                scheduled_for: tomorrow,
                items: [
                    { food_item_id: menuItemId, quantity: 2 },
                ],
            },
            clientHeaders
        );
        const orderId = orderRes.data.id;
        console.log(`✅ Order placed: ${orderId}`);

        // 4b. Alternate Order for Rejection
        console.log("🛒 Client: Placing second order for rejection test...");
        const rejectOrderRes = await axios.post(
            `${BASE_URL}/orders`,
            {
                kitchen_id: kitchenId,
                scheduled_for: tomorrow,
                items: [
                    { food_item_id: menuItemId, quantity: 1 },
                ],
            },
            clientHeaders
        );
        const rejectOrderId = rejectOrderRes.data.id;
        console.log(`✅ Rejection test order placed: ${rejectOrderId}`);

        // 5. Owner Order Management
        console.log("\n👨‍🍳 Owner: Managing Orders...");

        // List Orders
        const ownerOrdersRes = await axios.get(`${BASE_URL}/orders`, ownerHeaders);
        if (!ownerOrdersRes.data.find(o => o.id === orderId)) throw new Error("Order not found in owner list");

        // Accept First Order
        console.log("👨‍🍳 Owner: Accepting first order...");
        await axios.patch(`${BASE_URL}/orders/${orderId}/accept`, {}, ownerHeaders);
        console.log("✅ First order ACCEPTED");

        // Reject Second Order
        console.log("👨‍🍳 Owner: Rejecting second order...");
        const rejectedRes = await axios.patch(`${BASE_URL}/orders/${rejectOrderId}/reject`, {}, ownerHeaders);
        if (rejectedRes.data.status !== "REJECTED") throw new Error("Order rejection failed");
        console.log("✅ Second order REJECTED");

        // 6. Delivery Driver Flow
        console.log("\n🚚 Driver: Operations...");

        // Find Available
        // console.log("Driver Headers:", JSON.stringify(driverHeaders, null, 2));
        const availableRes = await axios.get(`${BASE_URL}/deliveries/available`, driverHeaders);
        const deliveryJob = availableRes.data.find(d => d.id === orderId);
        if (!deliveryJob) throw new Error("Accepted order not found in available list");
        console.log("✅ Order found in available deliveries");

        // Accept Delivery
        console.log("🚚 Driver: Accepting Delivery...");
        await axios.patch(`${BASE_URL}/deliveries/${orderId}/accept`, {}, driverHeaders);
        console.log("✅ Delivery accepted");

        // My Orders
        console.log("🚚 Driver: Checking 'My Orders'...");
        const myDeliveriesRes = await axios.get(`${BASE_URL}/deliveries/my-orders`, driverHeaders);
        if (!myDeliveriesRes.data.find(d => d.id === orderId)) throw new Error("Delivery not found in driver's history");
        console.log("✅ Delivery found in driver's list");

        // Finish Delivery
        console.log("🏁 Driver: Finishing Delivery...");
        await axios.patch(`${BASE_URL}/deliveries/${orderId}/finish`, {}, driverHeaders);
        console.log("✅ Delivery finished");

        // 7. Verify Client View
        console.log("\n😊 Client: Verifying Order History...");
        const clientHistoryRes = await axios.get(`${BASE_URL}/orders`, clientHeaders);
        const deliveredOrder = clientHistoryRes.data.find(o => o.id === orderId);
        const rejectedOrder = clientHistoryRes.data.find(o => o.id === rejectOrderId);

        if (!deliveredOrder || deliveredOrder.status !== "DELIVERED") throw new Error("Client history mismatch for delivered order");
        if (!rejectedOrder || rejectedOrder.status !== "REJECTED") throw new Error("Client history mismatch for rejected order");

        console.log("✅ Client history verified (DELIVERED and REJECTED orders confirmed)");

        console.log("\n✨ ALL COMPREHENSIVE CHECKS PASSED ✨");

    } catch (err) {
        console.error("\n❌ TEST FAILED");
        if (err.response) {
            console.error(`Status: ${err.response.status}`);
            console.error("Data:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err.message);
        }
        process.exit(1);
    }
}

main();
