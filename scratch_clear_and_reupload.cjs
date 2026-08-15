const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://zhkjjakzqaghosayaeqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5ey2J_CdnPIeeAR0vkPyWA_cEicyX42';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function clearAndReupload() {
  console.log('--- Clearing existing attendance & employees ---');
  const { error: errAtt } = await supabase.from('attendance').delete().neq('id', 'NONE');
  if (errAtt) console.error('Error clearing attendance:', errAtt);

  const { error: errEmp } = await supabase.from('employees').delete().neq('id', 'NONE');
  if (errEmp) console.error('Error clearing employees:', errEmp);

  console.log('--- Re-uploading 23 Employees ---');
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

  console.log('--- Re-uploading 289 Attendance Records ---');
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

  console.log(`Successfully cleared & re-uploaded 23 employees and ${count} attendance records to Supabase Cloud!`);
}

clearAndReupload();
