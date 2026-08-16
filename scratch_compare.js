const XLSX = require('xlsx-js-style');
const path = require('path');
const fs = require('fs');

try {
  // Find the newly generated excel file
  const files = fs.readdirSync('E:\\chamcong');
  console.log('Files in E:\\chamcong:', files);

  // Read cham cong.xlsx (Original reference)
  const origWb = XLSX.readFile('E:\\chamcong\\cham cong.xlsx');
  const origSheet = origWb.Sheets[origWb.SheetNames[0]];
  const origJson = XLSX.utils.sheet_to_json(origSheet, { header: 1 });

  // Read generated file (either Tat_Ca_Chi_Nhanh... or [object Object]...)
  let exportedFile = files.find(f => f.startsWith('Tat_Ca') || f.startsWith('[object'));
  if (!exportedFile) exportedFile = 'cham cong.xlsx';

  console.log('Comparing original file cham cong.xlsx with exported file:', exportedFile);

  const expWb = XLSX.readFile(path.join('E:\\chamcong', exportedFile));
  const expSheet = expWb.Sheets[expWb.SheetNames[0]];
  const expJson = XLSX.utils.sheet_to_json(expSheet, { header: 1 });

  console.log('\n--- ORIGINAL FILE SUMMARY (Row 4 onwards) ---');
  for (let r = 3; r < Math.min(25, origJson.length); r++) {
    const row = origJson[r];
    if (!row || row.length === 0) continue;
    const stt = row[0];
    const name = row[1];
    const caType = row[2];
    const days1to13 = row.slice(3, 16).map(v => v === undefined ? '' : String(v));
    console.log(`Row ${r+1}: STT=${stt} | Tên=${name} | Ca=${caType} | N1..N13:`, days1to13.join(', '));
  }

  console.log('\n--- EXPORTED FILE SUMMARY (Row 4 onwards) ---');
  for (let r = 3; r < Math.min(25, expJson.length); r++) {
    const row = expJson[r];
    if (!row || row.length === 0) continue;
    const stt = row[0];
    const name = row[1];
    const caType = row[2];
    const days1to13 = row.slice(3, 16).map(v => v === undefined ? '' : String(v));
    console.log(`Row ${r+1}: STT=${stt} | Tên=${name} | Ca=${caType} | N1..N13:`, days1to13.join(', '));
  }

} catch (err) {
  console.error('Error comparing files:', err);
}
