const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zhkjjakzqaghosayaeqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5ey2J_CdnPIeeAR0vkPyWA_cEicyX42';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testSave() {
  const recordId = 'CN1_2026_8_W4';
  const testData = {
    '8h - 13h': { 'Mon': ['emp_3', 'emp_1'] }
  };

  console.log('--- Upserting sample roster record ---');
  const { data, error } = await supabase.from('weekly_rosters').upsert({
    id: recordId,
    branch_id: 'CN1',
    year: 2026,
    month: 8,
    week_num: 4,
    roster_data: testData
  }).select();

  if (error) {
    console.error('Upsert Error:', error);
  } else {
    console.log('Upsert Success! Data returned:', data);
  }
}

testSave();
