require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function testFetch() {
  const { data, error } = await supabase.from('reports').select('*');
  console.log("Reports:", JSON.stringify(data, null, 2));
}

testFetch();
