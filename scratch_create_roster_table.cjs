const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zhkjjakzqaghosayaeqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5ey2J_CdnPIeeAR0vkPyWA_cEicyX42';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testRosterTable() {
  console.log('--- Checking weekly_rosters table on Supabase ---');
  const { data, error } = await supabase.from('weekly_rosters').select('*').limit(1);
  if (error) {
    console.error('Table check error:', error.message);
    console.log('NOTICE: Bảng weekly_rosters chưa được tạo trên Supabase Cloud. Cần chạy câu lệnh SQL trên SQL Editor.');
  } else {
    console.log('Table weekly_rosters EXISTS on Supabase Cloud!');
  }
}

testRosterTable();
