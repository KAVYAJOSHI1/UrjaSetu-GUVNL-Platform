
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function assignTask() {
    try {
        console.log('--- 1. finding Lineman ID ---');
        // Since my local backend is simple, let's try to login as lineman to get ID, or list users.
        // Listing users via REST is easier if allowed.
        // Let's try login as it's guaranteed to return the user object.
        const loginRes = await fetch(`${BASE_URL}/auth/v1/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'lineman@test.com', password: 'password123' })
        });

        if (!loginRes.ok) {
            throw new Error('Could not login as lineman to get ID. Did you run seed-users.js?');
        }

        const loginData = await loginRes.json();
        const LINEMAN_ID = loginData.user.id;
        console.log(`✅ Found Lineman ID: ${LINEMAN_ID}`);

        console.log('\n--- 2. Create "Transformer Sparking" Issue ---');
        const issueTitle = "Transformer Sparking at Sector 15";
        const createRes = await fetch(`${BASE_URL}/rest/v1/issues`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
            body: JSON.stringify({
                title: issueTitle,
                description: "Sparks observed coming from the main transformer unit. Urgent.",
                issue_type: "Transformer Fault",
                status: "assigned", // Directly assigning for this test
                priority: "High",
                address_text: "Sector 15, Gandhinagar, Gujarat",
                assigned_to: LINEMAN_ID,
                assigned_at: new Date().toISOString(),
                location: JSON.stringify({ // Mock GeoJSON
                    type: "Point",
                    coordinates: [72.6369, 23.2156]
                })
            })
        });

        const issueData = await createRes.json();
        if (createRes.ok) {
            console.log(`✅ Issue Created & Assigned!`);
            console.log(`Title: ${issueTitle}`);
            console.log(`Assigned To: lineman@test.com`);
            console.log(`Issue ID: ${issueData.id || 'N/A'}`);
        } else {
            console.log('Error creating issue:', issueData);
        }

    } catch (e) {
        console.error('❌ Failed:', e.message);
    }
}

assignTask();
