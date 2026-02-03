const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

const LOCATIONS = {
    center: { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
    spread: 0.15 // Increased spread for wider scattering
};

const ISSUE_TYPES = [
    'Transformer Spark',
    'Line Breakage',
    'Meter Fault',
    'Low Voltage',
    'Pole Leaning',
    'Wire Theft Attempt',
    'Vegetation Interference'
];

const STATUSES = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

function randomLoc() {
    const lat = LOCATIONS.center.lat + (Math.random() - 0.5) * LOCATIONS.spread;
    const lng = LOCATIONS.center.lng + (Math.random() - 0.5) * LOCATIONS.spread;
    return { lat, lng };
}

async function seedLinemen() {
    console.log('--- Seeding Linemen ---');
    for (let i = 1; i <= 20; i++) {
        const email = `lineman${i}@urjasetu.com`;
        const password = 'password123';
        const name = `Lineman ${i}`;

        try {
            const res = await fetch(`${BASE_URL}/auth/v1/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    data: {
                        name,
                        role: 'lineman',
                        phone: `99000000${i.toString().padStart(2, '0')}`
                    }
                })
            });
            if (res.ok) console.log(`✅ Created ${name}`);
            else console.log(`ℹ️ User ${name} might exist`);
        } catch (e) {
            console.error(`❌ Error creating ${name}:`, e.message);
        }
    }
}

async function seedIssues() {
    console.log('--- Seeding Issues ---');
    // Delete existing? No, just append.

    for (let i = 1; i <= 50; i++) {
        const type = ISSUE_TYPES[Math.floor(Math.random() * ISSUE_TYPES.length)];
        const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
        const priority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
        const loc = randomLoc();

        // Location format compatible with mobile and web
        const locationJson = JSON.stringify({
            coords: {
                latitude: loc.lat,
                longitude: loc.lng
            }
        });

        const issue = {
            title: `${type} reported at Sector ${Math.floor(Math.random() * 30)}`,
            description: `Generated test issue #${i}. Needs verification.`,
            issue_type: type,
            location: locationJson,
            address_text: `${Math.floor(Math.random() * 100)}, Gandhi Road, Sector ${Math.floor(Math.random() * 30)}, Gandhinagar`,
            status: status,
            priority: priority,
            citizen_id: 'citizen-id-placeholder'
        };

        try {
            const res = await fetch(`${BASE_URL}/rest/v1/issues`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(issue)
            });
            if (res.ok) console.log(`✅ Created Issue: ${issue.title} [${status}]`);
            else {
                const txt = await res.text();
                console.log(`❌ Failed Issue:`, txt);
            }
        } catch (e) {
            console.error(`❌ Error creating issue:`, e.message);
        }
    }
}

async function gamifyLinemen() {
    console.log('--- Gamifying Linemen ---');
    try {
        // 1. Fetch all linemen
        const res = await fetch(`${BASE_URL}/rest/v1/users?role=eq.lineman`);
        const linemen = await res.json();

        const BADGES = ['⚡ Fast Fixer', '🌟 Top Rated', '🛡️ Safety First', '🦸 Super Hero'];

        for (const user of linemen) {
            const points = Math.floor(Math.random() * 5000) + 100;
            const level = Math.floor(points / 1000) + 1;
            const userBadges = [];
            if (points > 1000) userBadges.push(BADGES[0]);
            if (points > 2000) userBadges.push(BADGES[1]);
            if (Math.random() > 0.5) userBadges.push(BADGES[2]);

            await fetch(`${BASE_URL}/rest/v1/users?id=eq.${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    points,
                    level,
                    badges: JSON.stringify(userBadges)
                })
            });
            console.log(`Updated ${user.name}: Pts ${points}, Lwl ${level}`);
        }
    } catch (e) {
        console.error('Gamification Error:', e);
    }
}

async function run() {
    await seedLinemen();
    await gamifyLinemen(); // Add this
    await seedIssues();
    console.log('--- Seeding Complete ---');
}

run();
