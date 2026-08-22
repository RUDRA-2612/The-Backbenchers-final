const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://cqhgqirfrghpddotgmdc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxaGdxaXJmcmdocGRkb3RnbWRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTk2MTE2OSwiZXhwIjoyMDk3NTM3MTY5fQ.ZU1HsC7fUN_VwtGhEK2dvnS7rZdt7Tmp8mIWFSvzTEw";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function unblockAdmin() {
  try {
    console.log('Connecting to Supabase to clear all blocks...');
    // Delete all records where email is not empty
    const { data, error } = await supabase.from('blocked_emails').delete().neq('email', 'some_impossible_value');
    
    if (error) {
      console.error('Error unblocking:', error.message);
    } else {
      console.log('SUCCESS! Unblocked everyone.');
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

unblockAdmin();
