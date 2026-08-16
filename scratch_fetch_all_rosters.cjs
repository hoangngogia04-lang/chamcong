const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zhkjjakzqaghosayaeqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5ey2J_CdnPIeeAR0vkPyWA_cEicyX42';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchRosters() {
  console.log('--- Fetching all records in weekly_rosters from Supabase ---');
  const { data, error } = await supabase.from('weekly_rosters').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Total rows:', data.length);
    console.log(JSON.stringify(data, null, 2));
  }
}

fetchRosters();
