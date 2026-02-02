
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  const email = 'admin@urjasetu.com';
  const password = 'password123';
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
        data: {
            name: 'Test Admin',
            role: 'admin',
            phone: '1234567890'
        }
    }
  });

  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('User created (or already exists):', email);
    console.log('Password:', password);
  }
}

createTestUser();

