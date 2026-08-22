const fetch = require('node-fetch');

async function testAPIs() {
  const API_URL = 'http://localhost:5000'; // Assuming they run backend locally for testing, or we hit vercel
  // Let's test the database directly like the backend would.
  
  const { createClient } = require('@supabase/supabase-js');
  const SUPABASE_URL = "https://cqhgqirfrghpddotgmdc.supabase.co";
  const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxaGdxaXJmcmdocGRkb3RnbWRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTk2MTE2OSwiZXhwIjoyMDk3NTM3MTY5fQ.ZU1HsC7fUN_VwtGhEK2dvnS7rZdt7Tmp8mIWFSvzTEw";
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  console.log('Testing admin endpoints queries...');
  try {
    const { data: logins, error: loginErr } = await supabase.from('login_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (loginErr) console.error('Logins err:', loginErr.message);
    else console.log('Logins fetched:', logins.length);
    
    const { data: downloads, error: downErr } = await supabase.from('download_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (downErr) console.error('Downloads err:', downErr.message);
    else console.log('Downloads fetched:', downloads.length);
    
    const { data: users, error: userErr } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (userErr) console.error('Users err:', userErr.message);
    else console.log('Users fetched:', users.length);
    
    const { data: blocked, error: blockErr } = await supabase.from('blocked_emails').select('*');
    if (blockErr) console.error('Blocked err:', blockErr.message);
    else console.log('Blocked fetched:', blocked.length);
  } catch(e) {
    console.error(e);
  }
}
testAPIs();
