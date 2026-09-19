require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

const email = 'angelsoni@jklu.edu.in';

async function logoutUser() {
  const { data, error } = await supabase.from('active_sessions').delete().eq('email', email).select();
  if (error) {
    console.error('Error logging out user:', error.message);
  } else {
    if (data && data.length > 0) {
      console.log(`Successfully logged out user: ${email}. Session invalidated.`);
    } else {
      console.log(`User ${email} was not currently logged in (no active session found).`);
    }
  }
}

logoutUser();
