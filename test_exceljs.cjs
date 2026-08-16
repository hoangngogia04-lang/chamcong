const ExcelJS = require('exceljs');

async function test() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('8班', {
    views: [
      { state: 'frozen', xSplit: 3, ySplit: 4, topLeftCell: 'D5' }
    ]
  });

  ws.mergeCells('A1:AH1');
  ws.getCell('A1').value = '2026 08 GIẤY LÊN CA(上班月表)';
  ws.getCell('A1').font = { name: 'Times New Roman', size: 16, bold: true };
  ws.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  ws.getCell('A4').value = 'STT';
  ws.getCell('B4').value = 'TÊN';
  ws.getCell('C4').value = 'CA(班別)';

  for (let i = 1; i <= 31; i++) {
    ws.getCell(4, i + 3).value = i;
  }

  await wb.xlsx.writeFile('E:\\chamcong\\test_exceljs_out.xlsx');
  console.log('Successfully wrote E:\\chamcong\\test_exceljs_out.xlsx with ExcelJS freeze panes!');
}

test().catch(console.error);
