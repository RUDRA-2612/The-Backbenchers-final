const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://cqhgqirfrghpddotgmdc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxaGdxaXJmcmdocGRkb3RnbWRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTk2MTE2OSwiZXhwIjoyMDk3NTM3MTY5fQ.ZU1HsC7fUN_VwtGhEK2dvnS7rZdt7Tmp8mIWFSvzTEw";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testDelete() {
  try {
    const testEmail = 'test_delete_bug@jklu.edu.in';

    console.log('1. Inserting test email...');
    await supabase.from('blocked_emails').insert({ email: testEmail });
    
    console.log('2. Fetching to verify insertion...');
    let { data: verify1 } = await supabase.from('blocked_emails').select('*').eq('email', testEmail);
    console.log('Inserted:', verify1);

    console.log('3. Running the EXACT delete query from server.js...');
    const emailLower = testEmail.trim().toLowerCase();
    const { data: deleteData, error: deleteError } = await supabase.from('blocked_emails').delete().ilike('email', `%${emailLower}%`).select();
    
    if (deleteError) {
      console.error('Delete Error:', deleteError);
    } else {
      console.log('Delete Returned Data (rows deleted):', deleteData);
    }

    console.log('4. Fetching to verify deletion...');
    let { data: verify2 } = await supabase.from('blocked_emails').select('*').eq('email', testEmail);
    console.log('Remaining:', verify2);

  } catch (err) {
    console.error('Script error:', err);
  }
}

testDelete();
