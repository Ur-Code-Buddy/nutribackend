const axios = require('axios');

const BASE_URL = 'https://backend.v1.nutritiffin.com';

async function run() {
    console.log('Checking health...');
    try {
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('Health check passed:', health.data);
    } catch (error) {
        console.error('Health check failed:', error.message);
        if (error.response) console.error('Status:', error.response.status);
        return;
    }

    const username = `driver_${Date.now()}`;
    const password = 'password123';

    console.log(`Registering user: ${username}`);
    try {
        await axios.post(`${BASE_URL}/auth/register`, {
            username,
            name: 'Test Driver',
            email: `${username}@example.com`,
            phone_number: `${Date.now()}`,
            address: '123 Test St',
            password,
            role: 'DELIVERY_DRIVER'
        });
        console.log('Registration successful');
    } catch (error) {
        if (error.response?.status === 409) {
            console.log('User already exists, proceeding to login');
        } else {
            console.error('Registration failed details:',
                JSON.stringify(error.response?.data || {}, null, 2)
            );
            console.error('Error message:', error.message);
            return;
        }
    }

    console.log('Logging in...');
    let token;
    try {
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            username,
            password
        });
        token = loginRes.data.access_token;
        console.log('Login successful, token received');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        console.error('Login failed details:',
            JSON.stringify(error.response?.data || {}, null, 2)
        );
        console.error('Error message:', error.message);
        return;
    }

    console.log('Accessing /deliveries/available...');
    try {
        const res = await axios.get(`${BASE_URL}/deliveries/available`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Success! Status:', res.status);
        console.log('Data:', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Failed! Status:', error.response?.status);
        console.log('Error data:', JSON.stringify(error.response?.data || {}, null, 2));
    }
}

run();
