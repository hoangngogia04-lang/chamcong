const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zhkjjakzqaghosayaeqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5ey2J_CdnPIeeAR0vkPyWA_cEicyX42';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function removeAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

async function main() {
  const empLines = fs.readFileSync('E:/chamcong/employees.csv', 'utf8').trim().split('\n').slice(1);

  const users = [
    { id: 'usr_admin', username: 'admin', password: 'admin123', fullName: 'Quản Trị Viên (Admin)', role: 'admin', branchId: '', employeeId: '' },
    { id: 'usr_cn1', username: 'quanly_cn1', password: '123', fullName: 'Quản lý Chi Nhánh 1 (Biên Hoà)', role: 'manager', branchId: 'CN1', employeeId: '' },
    { id: 'usr_cn2', username: 'quanly_cn2', password: '123', fullName: 'Quản lý Chi Nhánh 2 (Long Thành)', role: 'manager', branchId: 'CN2', employeeId: '' },
    { id: 'usr_cn3', username: 'quanly_cn3', password: '123', fullName: 'Quản lý Chi Nhánh 3 (Long Khánh)', role: 'manager', branchId: 'CN3', employeeId: '' },
    { id: 'usr_cn4', username: 'quanly_cn4', password: '123', fullName: 'Quản lý Chi Nhánh 4 (Xuân Lộc)', role: 'manager', branchId: 'CN4', employeeId: '' },
    { id: 'usr_cn5', username: 'quanly_cn5', password: '123', fullName: 'Quản lý Chi Nhánh 5 (Lê Duẩn)', role: 'manager', branchId: 'CN5', employeeId: '' }
  ];

  empLines.forEach(line => {
    if (!line) return;
    const parts = line.split(',').map(s => s.replace(/^"|"$/g, ''));
    const [empId, stt, name, branchId, type] = parts;
    const username = removeAccents(name);

    users.push({
      id: `usr_${empId}`,
      username: username,
      password: '123',
      fullName: name,
      role: 'employee',
      branchId: branchId,
      employeeId: empId
    });
  });

  console.log(`Generated ${users.length} total accounts (6 Admin/Manager + 23 Employees)!`);

  // 1. Write user_profiles.csv
  const csvLines = ['id,username,password_hash,full_name,role,branch_id,employee_id'];
  users.forEach(u => {
    csvLines.push(`"${u.id}","${u.username}","${u.password}","${u.fullName}","${u.role}","${u.branchId}","${u.employeeId}"`);
  });
  fs.writeFileSync('E:/chamcong/user_profiles.csv', csvLines.join('\n'), 'utf8');
  console.log('Saved user_profiles.csv');

  // 2. Write src/utils/usersData.js
  const jsContent = `// Full List of 29 User Accounts (1 Admin, 5 Branch Managers, 23 Employees)
export const DEFAULT_USERS = ${JSON.stringify(users, null, 2)};
`;
  fs.writeFileSync('E:/chamcong/src/utils/usersData.js', jsContent, 'utf8');
  console.log('Saved src/utils/usersData.js');

  // 3. Upload to Supabase Cloud
  console.log('--- Uploading all 29 accounts to Supabase ---');
  for (const u of users) {
    const payload = {
      id: u.id,
      username: u.username,
      password_hash: u.password,
      full_name: u.fullName,
      role: u.role,
      branch_id: u.branchId || null,
      employee_id: u.employeeId || null
    };

    let { error } = await supabase.from('user_profiles').upsert(payload);
    if (error && error.code === 'PGRST204') {
      delete payload.employee_id;
      const res = await supabase.from('user_profiles').upsert(payload);
      if (res.error) console.error('Supabase upload error for', u.username, res.error);
    } else if (error) {
      console.error('Supabase upload error for', u.username, error);
    }
  }

  console.log('All 29 accounts uploaded to Supabase successfully!');
}

main();
