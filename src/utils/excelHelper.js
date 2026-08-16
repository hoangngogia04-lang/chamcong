import ExcelJS from 'exceljs';

/**
 * Gets the number of days in a given month and year
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

/**
 * Branch highlight colors for employee rows (matching original cham cong.xlsx)
 */
const BRANCH_COLORS = {
  CN1: 'FFE6D9', // Light Peach
  CN2: 'E2F0D9', // Light Green
  CN3: 'FFF2CC', // Light Yellow
  CN4: 'FCE4D6', // Light Salmon
  CN5: 'E8EEF5'  // Light Blue
};

/**
 * Exports current attendance matrix to a pixel-perfect styled Excel file matching E:\chamcong\cham cong.xlsx format
 * Supports Front Section (Cols D..AH for Ca 1) & Back Section (Cols AI..BA for Part-Time Ca 2)
 * Native Freeze Panes for Columns A, B, C & Top 4 Header Rows
 */
export const exportToExcel = async (year, month, employees = [], attendanceData = {}, branchPrefix = '') => {
  const daysInMonth = getDaysInMonth(year, month);
  const formattedMonthStr = String(month).padStart(2, '0');

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(`${month}班`, {
    views: [
      { state: 'frozen', xSplit: 3, ySplit: 4, topLeftCell: 'D5', activePane: 'bottomRight' }
    ]
  });

  const thinBorder = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // 1. Title Row (Row 1): "2026 08 GIẤY LÊN CA(上班月表)"
  const titleEndCol = daysInMonth + 3;
  ws.mergeCells(1, 1, 1, titleEndCol);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = `${year} ${formattedMonthStr} GIẤY LÊN CA(上班月表)`;
  titleCell.font = { name: 'Times New Roman', size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // 2. Subtitle Header Row 2 & 3: "THÁNG 8" & "NGÀY(日期)"
  ws.mergeCells(2, 1, 3, 3);
  const mCell = ws.getCell(2, 1);
  mCell.value = `THÁNG ${month}`;
  mCell.font = { name: 'Times New Roman', size: 11, bold: true };
  mCell.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells(2, 4, 3, titleEndCol);
  const nCell = ws.getCell(2, 4);
  nCell.value = 'NGÀY(日期)';
  nCell.font = { name: 'Times New Roman', size: 11, bold: true };
  nCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Thin borders for header rows 2 & 3
  for (let r = 2; r <= 3; r++) {
    for (let c = 1; c <= titleEndCol; c++) {
      ws.getCell(r, c).border = thinBorder;
    }
  }

  // 3. Column Header Row 4: STT, TÊN, CA(班別), 1..31 (FRONT & BACK SECTIONS)
  const cellA4 = ws.getCell(4, 1);
  cellA4.value = 'STT';
  cellA4.font = { name: 'Times New Roman', size: 11, bold: true };
  cellA4.alignment = { horizontal: 'center', vertical: 'middle' };
  cellA4.border = thinBorder;

  const cellB4 = ws.getCell(4, 2);
  cellB4.value = 'TÊN';
  cellB4.font = { name: 'Times New Roman', size: 11, bold: true };
  cellB4.alignment = { horizontal: 'center', vertical: 'middle' };
  cellB4.border = thinBorder;

  const cellC4 = ws.getCell(4, 3);
  cellC4.value = 'CA(班別)';
  cellC4.font = { name: 'Times New Roman', size: 11, bold: true };
  cellC4.alignment = { horizontal: 'center', vertical: 'middle' };
  cellC4.border = thinBorder;

  // FRONT SECTION DAYS (Cols 4..4+daysInMonth-1)
  for (let d = 1; d <= daysInMonth; d++) {
    const colIdx = d + 3;
    const cell = ws.getCell(4, colIdx);
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    cell.value = d;
    cell.font = {
      name: 'Times New Roman',
      size: 10,
      bold: true,
      color: isWeekend ? { argb: 'FFFF0000' } : { argb: 'FF000000' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder;
  }

  // BACK SECTION DAYS (Cols 35..35+daysInMonth-1, starting at Column AI)
  const backSectionColStart = 35;
  for (let d = 1; d <= daysInMonth; d++) {
    const colIdx = backSectionColStart + (d - 1);
    const cell = ws.getCell(4, colIdx);
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    cell.value = d;
    cell.font = {
      name: 'Times New Roman',
      size: 10,
      bold: true,
      color: isWeekend ? { argb: 'FFFF0000' } : { argb: 'FF000000' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder;
  }

  // 4. Employee Data Rows (Row 5 onwards)
  let currentRow = 5;
  employees.forEach((emp, index) => {
    const rStart = currentRow;
    const rEnd = currentRow + 1;
    const branchBgColor = `FF${BRANCH_COLORS[emp.branchId] || 'FFE6D9'}`;
    const isOddEmp = index % 2 === 1;
    const shiftBgColor = isOddEmp ? 'FFF2F2F2' : 'FFFFFFFF';
    const empStt = emp.stt || (index + 1);

    // STT (Merged A{rStart}:A{rEnd})
    ws.mergeCells(rStart, 1, rEnd, 1);
    const sttCell = ws.getCell(rStart, 1);
    sttCell.value = empStt;
    sttCell.font = { name: 'Times New Roman', size: 10, bold: true };
    sttCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sttCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };
    sttCell.border = thinBorder;
    ws.getCell(rEnd, 1).border = thinBorder;

    // TÊN (Merged B{rStart}:B{rEnd})
    ws.mergeCells(rStart, 2, rEnd, 2);
    const nameCell = ws.getCell(rStart, 2);
    nameCell.value = emp.name || '';
    nameCell.font = { name: 'Times New Roman', size: 10, bold: true };
    nameCell.alignment = { horizontal: 'center', vertical: 'middle' };
    nameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };
    nameCell.border = thinBorder;
    ws.getCell(rEnd, 2).border = thinBorder;

    // CA (C)
    const caStartCell = ws.getCell(rStart, 3);
    caStartCell.value = 'Lên Ca';
    caStartCell.font = { name: 'Times New Roman', size: 9, bold: true, color: { argb: 'FF008000' } };
    caStartCell.alignment = { horizontal: 'center', vertical: 'middle' };
    caStartCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };
    caStartCell.border = thinBorder;

    const caEndCell = ws.getCell(rEnd, 3);
    caEndCell.value = 'Xuống Ca';
    caEndCell.font = { name: 'Times New Roman', size: 9, bold: true, color: { argb: 'FF0000FF' } };
    caEndCell.alignment = { horizontal: 'center', vertical: 'middle' };
    caEndCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };
    caEndCell.border = thinBorder;

    // Attendance records for Front Section (Ca 1)
    const empAtt = (attendanceData && attendanceData[emp.id]) || {};

    for (let d = 1; d <= daysInMonth; d++) {
      const colIdx = d + 3;
      const dayStr = String(d).padStart(2, '0');
      const dateKey = `${year}-${formattedMonthStr}-${dayStr}`;
      const rec = empAtt[dateKey] || {};

      const startCell = ws.getCell(rStart, colIdx);
      const endCell = ws.getCell(rEnd, colIdx);

      if (rec.start === 'OFF') {
        startCell.value = 'OFF';
        startCell.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FFFF0000' } };
        startCell.alignment = { horizontal: 'center', vertical: 'middle' };
        startCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: shiftBgColor } };
        startCell.border = thinBorder;

        endCell.value = '-';
        endCell.font = { name: 'Times New Roman', size: 9, color: { argb: 'FF999999' } };
        endCell.alignment = { horizontal: 'center', vertical: 'middle' };
        endCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: shiftBgColor } };
        endCell.border = thinBorder;
      } else {
        startCell.value = rec.start || '';
        startCell.font = { name: 'Times New Roman', size: 9, color: { argb: 'FF000000' } };
        startCell.alignment = { horizontal: 'center', vertical: 'middle' };
        startCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: shiftBgColor } };
        startCell.border = thinBorder;

        endCell.value = rec.end || '';
        endCell.font = { name: 'Times New Roman', size: 9, color: { argb: 'FF000000' } };
        endCell.alignment = { horizontal: 'center', vertical: 'middle' };
        endCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: shiftBgColor } };
        endCell.border = thinBorder;
      }
    }

    // Attendance records for Back Section (Part-Time Ca 2)
    for (let d = 1; d <= daysInMonth; d++) {
      const colIdx = backSectionColStart + (d - 1);
      const dayStr = String(d).padStart(2, '0');
      const dateKey = `${year}-${formattedMonthStr}-${dayStr}`;
      const rec = empAtt[dateKey] || {};

      const backStartCell = ws.getCell(rStart, colIdx);
      const backEndCell = ws.getCell(rEnd, colIdx);

      const hasSplitShift = Boolean(rec.start2 || rec.end2);
      const backBgColor = hasSplitShift ? 'FFFFF2CC' : 'FFFFFFFF';

      backStartCell.value = rec.start2 || '';
      backStartCell.font = { name: 'Times New Roman', size: 9, bold: hasSplitShift, color: { argb: 'FF7030A0' } };
      backStartCell.alignment = { horizontal: 'center', vertical: 'middle' };
      backStartCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: backBgColor } };
      backStartCell.border = thinBorder;

      backEndCell.value = rec.end2 || '';
      backEndCell.font = { name: 'Times New Roman', size: 9, bold: hasSplitShift, color: { argb: 'FF7030A0' } };
      backEndCell.alignment = { horizontal: 'center', vertical: 'middle' };
      backEndCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: backBgColor } };
      backEndCell.border = thinBorder;
    }

    currentRow += 2;
  });

  // Column Widths
  ws.getColumn(1).width = 6;  // STT
  ws.getColumn(2).width = 18; // TÊN
  ws.getColumn(3).width = 10; // CA

  for (let d = 1; d <= daysInMonth; d++) {
    ws.getColumn(d + 3).width = 7;
  }
  for (let c = daysInMonth + 4; c < backSectionColStart; c++) {
    ws.getColumn(c).width = 4;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    ws.getColumn(backSectionColStart + (d - 1)).width = 7;
  }

  // Dynamic file name depending on branchPrefix or Admin
  let prefixStr = '';
  if (typeof branchPrefix === 'string') {
    prefixStr = branchPrefix.trim();
  } else if (branchPrefix && typeof branchPrefix === 'object' && branchPrefix.name) {
    prefixStr = String(branchPrefix.name).trim().replace(/\s+/g, '_');
  }

  let fileName = `Cham_Cong_Thang_${formattedMonthStr}.xlsx`;
  if (prefixStr && prefixStr !== '[object Object]') {
    fileName = `${prefixStr}_Cham_Cong_Thang_${formattedMonthStr}.xlsx`;
  }

  // Download buffer in browser natively with ExcelJS
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
