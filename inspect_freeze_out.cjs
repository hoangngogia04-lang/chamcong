const XLSX = require('xlsx-js-style');

const wb = XLSX.readFile('E:\\chamcong\\test_freeze_out.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];

console.log('Keys starting with ! in test_freeze_out.xlsx:');
Object.keys(ws).filter(k => k.startsWith('!')).forEach(k => {
  console.log(`${k}:`, JSON.stringify(ws[k]));
});
