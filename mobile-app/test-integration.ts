
import { supabase } from './src/lib/supabase';

async function runTest() {
    console.log("1. Testing Auth Login...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@urjasetu.com',
        password: 'password123'
    });

    if (authError) {
        console.error("❌ Auth Failed:", authError);
        return;
    }
    console.log("✅ Auth Success:", authData.user?.email);

    console.log("\n2. Testing Data Fetch (Users)...");
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .limit(5);

    if (userError) {
        console.error("❌ Fetch Users Failed:", userError);
    } else {
        console.log("✅ Fetch Users Success. Count:", users?.length);
        console.log("   First User:", users?.[0]);
    }

    console.log("\n3. Testing Data Query with Filter (eq)...");
    const { data: filtered, error: filterError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin');

    if (filterError) {
        console.error("❌ Filter Query Failed:", filterError);
    } else {
        console.log("✅ Filter Query Success. Count:", filtered?.length);
    }
}

runTest();
