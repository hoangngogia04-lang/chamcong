const ExcelJS = require('exceljs');

async function testView() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('8班', {
    views: [
      {
        state: 'frozen',
        xSplit: 3,
        ySplit: 4,
        topLeftCell: 'D5',
        activePane: 'bottomRight',
        showGridLines: true
      }
    ]
  });

  // Set explicit column widths
  ws.getColumn(1).width = 8;  // STT (Col A)
  ws.getColumn(2).width = 20; // TÊN (Col B)
  ws.getColumn(3).width = 12; // CA (Col C)

  for (let d = 1; d <= 31; d++) {
    ws.getColumn(d + 3).width = 8;
  }

  // Row 1 Title
  ws.mergeCells(1, 1, 1, 34);
  ws.getCell(1, 1).value = '2026 08 GIẤY LÊN CA(上班月表)';
  ws.getCell(1, 1).font = { name: 'Times New Roman', size: 16, bold: true };
  ws.getCell(1, 1).alignment = { horizontal: 'center', vertical: 'middle' };

  // Row 2 & 3 Subtitle
  ws.mergeCells(2, 1, 3, 3);
  ws.getCell(2, 1).value = 'THÁNG 8';
  ws.getCell(2, 1).font = { name: 'Times New Roman', size: 11, bold: true };
  ws.getCell(2, 1).alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells(2, 4, 3, 34);
  ws.getCell(2, 4).value = 'NGÀY(日期)';
  ws.getCell(2, 4).font = { name: 'Times New Roman', size: 11, bold: true };
  ws.getCell(2, 4).alignment = { horizontal: 'center', vertical: 'middle' };

  // Row 4 Headers
  ws.getCell(4, 1).value = 'STT';
  ws.getCell(4, 2).value = 'TÊN';
  ws.getCell(4, 3).value = 'CA(班別)';
  for (let d = 1; d <= 31; d++) {
    ws.getCell(4, d + 3).value = d;
  }

  // Sample data
  for (let r = 5; r <= 14; r += 2) {
    ws.mergeCells(r, 1, r + 1, 1);
    ws.getCell(r, 1).value = (r - 3) / 2;

    ws.mergeCells(r, 2, r + 1, 2);
    ws.getCell(r, 2).value = `Nhân viên ${(r - 3) / 2}`;

    ws.getCell(r, 3).value = 'Lên Ca';
    ws.getCell(r + 1, 3).value = 'Xuống Ca';

    for (let d = 1; d <= 31; d++) {
      ws.getCell(r, d + 3).value = '08:00';
      ws.getCell(r + 1, d + 3).value = '17:00';
    }
  }

  await wb.xlsx.writeFile('E:\\chamcong\\test_view_out.xlsx');
  console.log('Successfully wrote test_view_out.xlsx!');
}

testView().catch(console.error);
