require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function testFetchIKS() {
  const { data, error } = await supabase.from('materials').select('*').eq('subjectCode', 'IL1107');
  console.log("IKS Materials:", JSON.stringify(data, null, 2));
}

testFetchIKS();
