const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zhkjjakzqaghosayaeqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5ey2J_CdnPIeeAR0vkPyWA_cEicyX42';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testRls() {
  console.log('--- Testing RLS issue ---');
  // Attempt to select
  const { data: selData, error: selErr } = await supabase.from('weekly_rosters').select('*');
  console.log('Select result:', selData, 'Error:', selErr);
}

testRls();
