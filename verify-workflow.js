
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
let adminToken = '';
let linemanId = 'test-lineman-01';
let issueId = '';

async function runTests() {
    try {
        console.log('--- 1. Admin Login ---');
        const loginRes = await fetch(`${BASE_URL}/auth/v1/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@urjasetu.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(JSON.stringify(loginData));
        adminToken = loginData.access_token;
        console.log('✅ Admin Logged In');

        console.log('\n--- 2. Create Dummy Lineman ---');
        // We insert into 'users' directly as our simplified backend maps profiles -> users
        // Use a random ID to avoid collision on re-runs
        linemanId = `lineman-${Math.floor(Math.random() * 1000)}`;
        const createLinemanRes = await fetch(`${BASE_URL}/rest/v1/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: linemanId,
                email: `lineman${Math.floor(Math.random() * 100)}@test.com`,
                role: 'lineman',
                name: 'Ramesh Power',
                status: 'active'
            })
        });
        if (!createLinemanRes.ok) console.log('Lineman creation note:', await createLinemanRes.text());
        else console.log('✅ Lineman Created:', linemanId);

        console.log('\n--- 3. Create Dummy Issue ---');
        const createIssueRes = await fetch(`${BASE_URL}/rest/v1/issues`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' }, // prefer header mock
            body: JSON.stringify({
                title: 'Test Transformer Fail',
                status: 'open',
                priority: 'high',
                address_text: 'Sector 4, Gandhinagar'
            })
        });
        const issueData = await createIssueRes.json();
        issueId = issueData.id;
        console.log('✅ Issue Created:', issueId);

        console.log('\n--- 4. Assign Issue (Admin) ---');
        const assignRes = await fetch(`${BASE_URL}/rest/v1/issues?id=eq.${issueId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                assigned_to: linemanId,
                status: 'assigned'
            })
        });
        const assignData = await assignRes.json();
        console.log('✅ Assignment Result:', assignData);

        console.log('\n--- 5. Verify Lineman View (Mobile Filter) ---');
        // Simulate: select * from issues where assigned_to = linemanId and status != resolved
        const linemanViewRes = await fetch(`${BASE_URL}/rest/v1/issues?assigned_to=eq.${linemanId}&status=neq.resolved`);
        const linemanViewData = await linemanViewRes.json();
        console.log('Lineman sees issues:', linemanViewData.length);
        const seenIssue = linemanViewData.find(i => i.id === issueId);
        if (seenIssue) console.log('✅ Lineman sees the assigned issue');
        else throw new Error('❌ Lineman CANNOT see the issue');

        console.log('\n--- 6. Simulate Proof of Work & Resolution ---');
        const resolveRes = await fetch(`${BASE_URL}/rest/v1/issues?id=eq.${issueId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'resolved' })
        });
        console.log('✅ Issue Resolved');

        console.log('\n--- 7. Verify Issue Closed/Resolved ---');
        const verifyRes = await fetch(`${BASE_URL}/rest/v1/issues?id=eq.${issueId}`);
        const verifyData = await verifyRes.json();
        // Since get returns array
        if (verifyData[0].status === 'resolved') console.log('✅ Verified Status is RESOLVED');
        else throw new Error(`❌ Status Check Failed: ${verifyData[0].status}`);

    } catch (e) {
        console.error('❌ TEST FAILED:', e);
        process.exit(1);
    }
}

runTests();
