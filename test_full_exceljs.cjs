const ExcelJS = require('exceljs');

async function testFull() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('8班', {
    views: [
      { state: 'frozen', xSplit: 3, ySplit: 4, topLeftCell: 'D5', activePane: 'bottomRight' }
    ]
  });

  ws.mergeCells(1, 1, 1, 34);
  ws.getCell(1, 1).value = '2026 08 GIẤY LÊN CA(上班月表)';
  ws.getCell(1, 1).font = { name: 'Times New Roman', size: 16, bold: true };
  ws.getCell(1, 1).alignment = { horizontal: 'center', vertical: 'middle' };

  ws.getCell(4, 1).value = 'STT';
  ws.getCell(4, 2).value = 'TÊN';
  ws.getCell(4, 3).value = 'CA(班別)';

  await wb.xlsx.writeFile('E:\\chamcong\\test_full_exceljs.xlsx');
  console.log('Successfully wrote E:\\chamcong\\test_full_exceljs.xlsx with ExcelJS native freeze panes!');
}

testFull().catch(console.error);
