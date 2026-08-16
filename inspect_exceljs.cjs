const XLSX = require('xlsx-js-style');

const wb = XLSX.readFile('E:\\chamcong\\test_exceljs_out.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];

console.log('--- SHEETJS READ OF EXCELJS CREATED FILE ---');
console.log('Keys starting with !:', Object.keys(ws).filter(k => k.startsWith('!')));
console.log('!views:', JSON.stringify(ws['!views']));
