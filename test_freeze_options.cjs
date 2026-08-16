const XLSX = require('xlsx-js-style');

try {
  const ws = XLSX.utils.aoa_to_sheet([
    ['STT', 'TÊN', 'CA', 'Ngày 1', 'Ngày 2', 'Ngày 3'],
    [1, 'Hoàng', 'Lên Ca', '08:00', '08:00', '08:00']
  ]);

  // Method 1: ws['!freeze']
  ws['!freeze'] = { xSplit: "3", ySplit: "4", topLeftCell: "D5", activePane: "bottomRight", state: "frozen" };

  // Method 2: ws['!views']
  ws['!views'] = [{
    state: 'frozen',
    xSplit: 3,
    ySplit: 4,
    topLeftCell: 'D5',
    activePane: 'bottomRight'
  }];

  // Method 3: ws['!protect'] or sheetViews
  ws['!sheetView'] = {
    showGridLines: true,
    freeze: { xSplit: 3, ySplit: 4, topLeftCell: 'D5' }
  };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Test writing with options
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx', cellStyles: true, sheetViews: [{ pane: { state: 'frozen', xSplit: 3, ySplit: 4 } }] });
  require('fs').writeFileSync('E:\\chamcong\\test_freeze_out.xlsx', buf);

  console.log('Successfully wrote test_freeze_out.xlsx');
} catch (err) {
  console.error('Error:', err);
}
