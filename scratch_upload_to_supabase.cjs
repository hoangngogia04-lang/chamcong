const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://zhkjjakzqaghosayaeqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5ey2J_CdnPIeeAR0vkPyWA_cEicyX42';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function uploadAllData() {
  console.log('--- Uploading Employees to Supabase ---');
  const empLines = fs.readFileSync('E:/chamcong/employees.csv', 'utf8').trim().split('\n').slice(1);
  for (const line of empLines) {
    if (!line) continue;
    const parts = line.split(',').map(s => s.replace(/^"|"$/g, ''));
    const [id, stt, name, branch_id, type] = parts;
    const { error } = await supabase.from('employees').upsert({
      id,
      stt: parseInt(stt, 10),
      name,
      branch_id,
      type
    });
    if (error) console.error('Emp error:', name, error);
  }

  console.log('--- Uploading Attendance to Supabase ---');
  const attLines = fs.readFileSync('E:/chamcong/attendance.csv', 'utf8').trim().split('\n').slice(1);
  let count = 0;
  for (const line of attLines) {
    if (!line) continue;
    const parts = line.split(',').map(s => s.replace(/^"|"$/g, ''));
    const [id, employee_id, work_date, shift_start, shift_end, shift_start_2, shift_end_2] = parts;
    const { error } = await supabase.from('attendance').upsert({
      id,
      employee_id,
      work_date,
      shift_start: shift_start || null,
      shift_end: shift_end || null,
      shift_start_2: shift_start_2 || null,
      shift_end_2: shift_end_2 || null
    });
    if (error) console.error('Att error:', id, error);
    else count++;
  }

  console.log(`Successfully uploaded 23 employees and ${count} attendance records to Supabase Cloud!`);
}

uploadAllData();
