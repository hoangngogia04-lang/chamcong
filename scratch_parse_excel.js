const XLSX = require('xlsx-js-style');
const fs = require('fs');

const wb = XLSX.readFile('E:/chamcong/cham cong.xlsx', { cellStyles: true });
const sheet = wb.Sheets[wb.SheetNames[0]];
const sheetJson = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('Total rows:', sheetJson.length);

let detectedYear = 2026;
let detectedMonth = 8;

const titleText = String(sheetJson[0]?.[0] || '');
const matchTitle = titleText.match(/(\d{4})\s+(\d{1,2})/);
if (matchTitle) {
  detectedYear = parseInt(matchTitle[1], 10);
  detectedMonth = parseInt(matchTitle[2], 10);
}

console.log(`Detected Year: ${detectedYear}, Month: ${detectedMonth}`);

// Read days row (Row 3 / Index 3)
const daysRow = sheetJson[3] || [];
const frontDays = [];
const backDays = [];

for (let c = 3; c < 34; c++) {
  const val = daysRow[c];
  if (val && !isNaN(val)) {
    frontDays.push({ day: parseInt(val, 10), colIdx: c });
  }
}

for (let c = 34; c < 65; c++) {
  const val = daysRow[c];
  if (val && !isNaN(val)) {
    backDays.push({ day: parseInt(val, 10), colIdx: c });
  }
}

console.log(`Front Days count: ${frontDays.length}, Back Days count: ${backDays.length}`);

function excelValueToTimeStr(val) {
  if (val === undefined || val === null || val === '') return '';
  if (typeof val === 'string') {
    const clean = val.trim();
    if (clean.toUpperCase() === 'OFF') return 'OFF';
    return clean;
  }
  if (typeof val === 'number') {
    const totalMinutes = Math.round(val * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return String(val);
}

const employees = [];
const attendanceRecords = [];

let empCounter = 1;
const formattedMonthStr = String(detectedMonth).padStart(2, '0');

for (let r = 4; r < sheetJson.length; r += 2) {
  const rowStart = sheetJson[r];
  const rowEnd = sheetJson[r + 1] || [];

  if (!rowStart || rowStart.length === 0) continue;

  const stt = rowStart[0];
  const nameRaw = rowStart[1];
  if (!nameRaw) continue;

  const name = String(nameRaw).trim().replace(/\n/g, ' ');

  // Determine Branch
  let branchId = 'CN1';
  if (name.includes('(LT)') || name.includes('(Lt)')) branchId = 'CN2';
  else if (name.includes('(LK)')) branchId = 'CN3';
  else if (name.includes('(XL)')) branchId = 'CN4';
  else if (name.includes('(P)') || name.includes('(LD)')) branchId = 'CN5';

  const empId = `emp_${empCounter}`;

  // Check if has Ca 2 (Back section) to set type
  let hasCa2 = false;
  backDays.forEach(({ colIdx }) => {
    const valStart2 = rowStart[colIdx];
    const valEnd2 = rowEnd[colIdx];
    if ((valStart2 !== undefined && valStart2 !== null && valStart2 !== '') ||
        (valEnd2 !== undefined && valEnd2 !== null && valEnd2 !== '')) {
      hasCa2 = true;
    }
  });

  const empType = hasCa2 ? 'parttime' : 'fulltime';

  employees.push({
    id: empId,
    stt: typeof stt === 'number' ? stt : empCounter,
    name: name,
    branchId: branchId,
    type: empType
  });

  // Extract Attendance per Day
  frontDays.forEach(({ day, colIdx }) => {
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${detectedYear}-${formattedMonthStr}-${dayStr}`;

    const rawStart1 = rowStart[colIdx];
    const rawEnd1 = rowEnd[colIdx];

    const backObj = backDays.find(b => b.day === day);
    const backColIdx = backObj ? backObj.colIdx : -1;

    const rawStart2 = backColIdx !== -1 ? rowStart[backColIdx] : '';
    const rawEnd2 = backColIdx !== -1 ? rowEnd[backColIdx] : '';

    let s1 = excelValueToTimeStr(rawStart1);
    let e1 = excelValueToTimeStr(rawEnd1);
    let s2 = excelValueToTimeStr(rawStart2);
    let e2 = excelValueToTimeStr(rawEnd2);

    if (s1 === 'OFF' || e1 === 'OFF') {
      s1 = 'OFF';
      e1 = '';
      s2 = '';
      e2 = '';
    }

    if (s1 || e1 || s2 || e2) {
      attendanceRecords.push({
        id: `${empId}_${dateKey}`,
        employee_id: empId,
        work_date: dateKey,
        shift_start: s1,
        shift_end: e1,
        shift_start_2: s2,
        shift_end_2: e2
      });
    }
  });

  empCounter++;
}

console.log(`Parsed ${employees.length} employees and ${attendanceRecords.length} attendance records.`);

// Generate employees.csv
let empCsvContent = 'id,stt,name,branch_id,type\n';
employees.forEach(e => {
  empCsvContent += `"${e.id}",${e.stt},"${e.name}","${e.branchId}","${e.type}"\n`;
});
fs.writeFileSync('E:/chamcong/employees.csv', empCsvContent, 'utf8');

// Generate attendance.csv
let attCsvContent = 'id,employee_id,work_date,shift_start,shift_end,shift_start_2,shift_end_2\n';
attendanceRecords.forEach(a => {
  attCsvContent += `"${a.id}","${a.employee_id}","${a.work_date}","${a.shift_start}","${a.shift_end}","${a.shift_start_2}","${a.shift_end_2}"\n`;
});
fs.writeFileSync('E:/chamcong/attendance.csv', attCsvContent, 'utf8');

// Generate branches.csv
const branchesCsvContent = `id,name,code
CN1,Chi nhánh 1 (Biên Hoà),CN1
CN2,Chi nhánh 2 (Long Thành),CN2
CN3,Chi nhánh 3 (Long Khánh),CN3
CN4,Chi nhánh 4 (Xuân Lộc),CN4
CN5,Chi nhánh 5 (Lê Duẩn),CN5
`;
fs.writeFileSync('E:/chamcong/branches.csv', branchesCsvContent, 'utf8');

// Generate user_profiles.csv
const usersCsvContent = `id,username,password_hash,full_name,role,branch_id
usr_admin,admin,admin123,Quản Trị Viên (Admin),admin,
usr_cn1,quanly_cn1,123456,Quản lý Chi Nhánh 1,manager,CN1
usr_cn2,quanly_cn2,123456,Quản lý Chi Nhánh 2,manager,CN2
usr_cn3,quanly_cn3,123456,Quản lý Chi Nhánh 3,manager,CN3
usr_cn4,quanly_cn4,123456,Quản lý Chi Nhánh 4,manager,CN4
usr_cn5,quanly_cn5,123456,Quản lý Chi Nhánh 5,manager,CN5
`;
fs.writeFileSync('E:/chamcong/user_profiles.csv', usersCsvContent, 'utf8');

console.log('Successfully generated all CSV files in E:/chamcong!');
