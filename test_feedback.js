require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function testFeedback() {
  const newReport = {
    id: uuidv4(),
    materialId: null,
    title: 'FEEDBACK',
    description: 'Test feedback description',
    userEmail: 'test@example.com',
    userName: 'Test User',
    timestamp: new Date().toISOString()
  };
  
  const { data, error } = await supabase.from('reports').insert(newReport);
  console.log("Error:", error);
  console.log("Data:", data);
}

testFeedback();
