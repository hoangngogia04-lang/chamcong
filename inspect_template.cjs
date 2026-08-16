const XLSX = require('xlsx-js-style');

try {
  const origWb = XLSX.readFile('E:\\chamcong\\cham cong.xlsx');
  const origSheet = origWb.Sheets[origWb.SheetNames[0]];

  console.log('--- ORIGINAL CHAM CONG.XLSX KEYS starting with ! ---');
  Object.keys(origSheet).filter(k => k.startsWith('!')).forEach(k => {
    console.log(`${k}:`, JSON.stringify(origSheet[k]));
  });

  console.log('\n--- TESTING WRITE WITH FREEZE PANES ---');
  const ws = XLSX.utils.aoa_to_sheet([
    ['STT', 'TÊN', 'CA', 'Ngày 1', 'Ngày 2', 'Ngày 3'],
    [1, 'Hoàng', 'Lên Ca', '08:00', '08:00', '08:00']
  ]);

  ws['!views'] = [{ state: 'frozen', xSplit: 3, ySplit: 1, topLeftCell: 'D2', activePane: 'bottomRight' }];
  ws['!freeze'] = { xSplit: 3, ySplit: 1, topLeftCell: 'D2', activePane: 'bottomRight', state: 'frozen' };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, 'E:\\chamcong\\test_freeze.xlsx');

  const testWb = XLSX.readFile('E:\\chamcong\\test_freeze.xlsx');
  const testSheet = testWb.Sheets[testWb.SheetNames[0]];
  console.log('Test sheet keys starting with !:', Object.keys(testSheet).filter(k => k.startsWith('!')));
  console.log('Test sheet !views:', JSON.stringify(testSheet['!views']));
  console.log('Test sheet !freeze:', JSON.stringify(testSheet['!freeze']));
} catch (err) {
  console.error(err);
}
