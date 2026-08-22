const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://cqhgqirfrghpddotgmdc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxaGdxaXJmcmdocGRkb3RnbWRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTk2MTE2OSwiZXhwIjoyMDk3NTM3MTY5fQ.ZU1HsC7fUN_VwtGhEK2dvnS7rZdt7Tmp8mIWFSvzTEw";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testFlow() {
  const email = 'flow_test@jklu.edu.in';
  
  console.log('1. Blocking...');
  const { error: blockErr } = await supabase.from('blocked_emails').insert({ email: email.trim().toLowerCase() });
  if (blockErr) {
    console.error('Block failed:', blockErr.message);
  } else {
    console.log('Block success!');
  }
  
  console.log('2. Fetching blocked emails...');
  const { data: fetch1 } = await supabase.from('blocked_emails').select('*');
  console.log('Total blocked now:', fetch1.length, 'Is mine there?', fetch1.some(f => f.email === email));
  
  console.log('3. Unblocking...');
  const emailLower = email.trim().toLowerCase();
  const { data: delData, error: delErr } = await supabase.from('blocked_emails').delete().ilike('email', `%${emailLower}%`).select();
  if (delErr) {
    console.error('Unblock query failed:', delErr.message);
  } else if (!delData || delData.length === 0) {
    console.log('Unblock failed: Email not found (0 rows deleted).');
  } else {
    console.log('Unblock success! Deleted rows:', delData.length);
  }
  
  console.log('4. Fetching blocked emails again...');
  const { data: fetch2 } = await supabase.from('blocked_emails').select('*');
  console.log('Total blocked now:', fetch2.length, 'Is mine there?', fetch2.some(f => f.email === email));
}
testFlow();
