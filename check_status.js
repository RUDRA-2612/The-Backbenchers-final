require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

const email = 'angelsoni@jklu.edu.in';

async function checkStatus() {
  const { data, error } = await supabase.from('active_sessions').select('*').eq('email', email);
  if (error) {
    console.error('Error checking status:', error.message);
  } else {
    if (data && data.length > 0) {
      console.log(`User ${email} is LOGGED IN. Session ID: ${data[0].session_id}`);
    } else {
      console.log(`User ${email} is LOGGED OUT (No active session found).`);
    }
  }
}

checkStatus();
