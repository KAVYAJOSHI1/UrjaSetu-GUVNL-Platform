
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function seedUsers() {
    try {
        console.log('--- Seeding Test Users ---');

        // 1. Citizen
        const citizenEmail = 'citizen@test.com';
        const password = 'password123';
        const citizenRes = await fetch(`${BASE_URL}/auth/v1/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: citizenEmail,
                password: password,
                data: {
                    name: 'Rahul Citizen',
                    role: 'citizen',
                    phone: '9876543210'
                }
            })
        });
        const citizenData = await citizenRes.json();
        if (citizenRes.ok) console.log(`✅ Created Citizen: ${citizenEmail} / ${password}`);
        else console.log(`ℹ️ Citizen might already exist: ${citizenData.error || citizenData.msg}`);

        // 2. Lineman
        // For lineman, we often need to manually ensure the role is set if signup defaults to citizen.
        // My server.js signup allows passing role in 'data'.
        const linemanEmail = 'lineman@test.com';
        const linemanRes = await fetch(`${BASE_URL}/auth/v1/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: linemanEmail,
                password: password,
                data: {
                    name: 'Suresh Lineman',
                    role: 'lineman', // This triggers the role-based UI in the app
                    phone: '9876543211'
                }
            })
        });
        const linemanData = await linemanRes.json();
        if (linemanRes.ok) console.log(`✅ Created Lineman: ${linemanEmail} / ${password}`);
        else console.log(`ℹ️ Lineman might already exist: ${linemanData.error || linemanData.msg}`);

        // 3. Admin (Just verifying)
        // Admin is usually seeded by server.js on startup, but let's just log credentials.
        console.log(`✅ Admin Creds (Pre-configured): admin@urjasetu.com / password123`);

    } catch (e) {
        console.error('❌ Seeding Failed:', e);
    }
}

seedUsers();
