import ExcelJS from 'exceljs';
import { getMergedFullTimeShift } from './calcUtils';

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
 * Renders 5 Side-by-Side Branch Salary Advance Mini-Tables below the attendance table
 * Exactly matching user's screenshot media_1786897566190.png
 */
function renderBranchSalaryAdvanceTables(ws, startRow, allEmployees, salaryAdvances = [], branches = [], year, month) {
  const thinBorder = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  const formattedMonthStr = String(month).padStart(2, '0');

  // Total advance amount per employee for the selected month/year
  const monthAdvMap = {};
  (salaryAdvances || []).forEach(adv => {
    let match = false;
    if (adv.year && adv.month) {
      match = Number(adv.year) === Number(year) && Number(adv.month) === Number(month);
    } else if (adv.date) {
      match = adv.date.startsWith(`${year}-${formattedMonthStr}`);
    }
    if (match) {
      const empId = adv.empId;
      monthAdvMap[empId] = (monthAdvMap[empId] || 0) + (Number(adv.amount) || 0);
    }
  });

  // 5 side-by-side branch mini-tables starting at specific column offsets:
  // CN2 (Long Thành): Col E (5), F (6), G (7)
  // CN1 (Biên Hoà): Col J (10), K (11), L (12)
  // CN3 (Long Khánh): Col O (15), P (16), Q (17)
  // CN4 (Xuân Lộc): Col T (20), U (21), V (22)
  // CN5 (Lê Duẩn): Col Y (25), Z (26), AA (27)
  const branchTableConfig = [
    { branchId: 'CN2', startCol: 5 },  // Long Thành
    { branchId: 'CN1', startCol: 10 }, // Biên Hoà
    { branchId: 'CN3', startCol: 15 }, // Long Khánh
    { branchId: 'CN4', startCol: 20 }, // Xuân Lộc
    { branchId: 'CN5', startCol: 25 }  // Lê Duẩn
  ];

  branchTableConfig.forEach(cfg => {
    const branchObj = branches.find(b => b.id === cfg.branchId) || { name: cfg.branchId };
    const branchEmps = allEmployees.filter(e => e.branchId === cfg.branchId);

    const c1 = cfg.startCol;
    const c2 = cfg.startCol + 1;
    const c3 = cfg.startCol + 2;

    // Title Row (Merged 3 cols): "Long Thành", "Biên hoà"...
    ws.mergeCells(startRow, c1, startRow, c3);
    const tCell = ws.getCell(startRow, c1);
    tCell.value = branchObj.name;
    tCell.font = { name: 'Times New Roman', size: 10, bold: true };
    tCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getCell(startRow, c1).border = thinBorder;
    ws.getCell(startRow, c2).border = thinBorder;
    ws.getCell(startRow, c3).border = thinBorder;

    // Header Row: "stt", "tên", "tiền ứng"
    const h1 = ws.getCell(startRow + 1, c1);
    h1.value = 'stt';
    h1.font = { name: 'Times New Roman', size: 9, bold: true };
    h1.alignment = { horizontal: 'center', vertical: 'middle' };
    h1.border = thinBorder;

    const h2 = ws.getCell(startRow + 1, c2);
    h2.value = 'tên';
    h2.font = { name: 'Times New Roman', size: 9, bold: true };
    h2.alignment = { horizontal: 'center', vertical: 'middle' };
    h2.border = thinBorder;

    const h3 = ws.getCell(startRow + 1, c3);
    h3.value = 'tiền ứng';
    h3.font = { name: 'Times New Roman', size: 9, bold: true };
    h3.alignment = { horizontal: 'center', vertical: 'middle' };
    h3.border = thinBorder;

    // Fill employees (at least 3 rows matching user's image)
    const rowCount = Math.max(3, branchEmps.length);
    for (let i = 0; i < rowCount; i++) {
      const rIdx = startRow + 2 + i;
      const emp = branchEmps[i];

      const rCell1 = ws.getCell(rIdx, c1);
      rCell1.value = i + 1;
      rCell1.font = { name: 'Times New Roman', size: 9 };
      rCell1.alignment = { horizontal: 'center', vertical: 'middle' };
      rCell1.border = thinBorder;

      const rCell2 = ws.getCell(rIdx, c2);
      rCell2.value = emp ? emp.name : '';
      rCell2.font = { name: 'Times New Roman', size: 9 };
      rCell2.alignment = { horizontal: 'center', vertical: 'middle' };
      rCell2.border = thinBorder;

      const rCell3 = ws.getCell(rIdx, c3);
      const advAmt = emp ? (monthAdvMap[emp.id] || 0) : 0;
      rCell3.value = advAmt > 0 ? advAmt : '';
      if (advAmt > 0) {
        rCell3.numFmt = '#,##0';
      }
      rCell3.font = { name: 'Times New Roman', size: 9, bold: advAmt > 0, color: { argb: advAmt > 0 ? 'FFC00000' : 'FF000000' } };
      rCell3.alignment = { horizontal: 'right', vertical: 'middle' };
      rCell3.border = thinBorder;
    }
  });
}

/**
 * Creates a styled Excel Worksheet with Fixed Columns A, B, C (STT, TÊN, CA) & Top 4 Header Rows
 */
function createAttendanceSheet(wb, sheetName, employeesList, attendanceData, year, month, allEmployees = [], salaryAdvances = [], branches = []) {
  const daysInMonth = getDaysInMonth(year, month);
  const formattedMonthStr = String(month).padStart(2, '0');

  const ws = wb.addWorksheet(sheetName, {
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

  // Explicit Column Widths set BEFORE populating cells to fix left pane collapse
  ws.getColumn(1).width = 6;  // STT (Col A)
  ws.getColumn(2).width = 18; // TÊN (Col B)
  ws.getColumn(3).width = 10; // CA (Col C)

  for (let d = 1; d <= daysInMonth; d++) {
    ws.getColumn(d + 3).width = 7;
  }
  const backSectionColStart = 35; // Col AI
  for (let c = daysInMonth + 4; c < backSectionColStart; c++) {
    ws.getColumn(c).width = 4;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    ws.getColumn(backSectionColStart + (d - 1)).width = 7;
  }

  const thinBorder = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // 1. Title Row 1: "2026 08 GIẤY LÊN CA(上班月表)"
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

  // BACK SECTION DAYS (Cols 35..35+daysInMonth-1)
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
  employeesList.forEach((emp, index) => {
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

      // Detect split shifts / ca gãy for both Full-Time and Part-Time
      const isSplitShiftRec = Boolean(
        rec.start2 ||
        rec.end2 ||
        rec.isSplitShift ||
        (rec.presetLabel && String(rec.presetLabel).toLowerCase().includes('gãy')) ||
        (rec.start === '08:00' && rec.end === '22:00')
      );

      // Bright Yellow highlight (FFFFF200) for split shift / ca gãy days
      const currentCellBg = isSplitShiftRec ? 'FFFFF200' : shiftBgColor;

      if (rec.start === 'OFF') {
        startCell.value = 'OFF';
        startCell.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FFFF0000' } };
        startCell.alignment = { horizontal: 'center', vertical: 'middle' };
        startCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
        startCell.border = thinBorder;

        endCell.value = '-';
        endCell.font = { name: 'Times New Roman', size: 9, color: { argb: 'FF999999' } };
        endCell.alignment = { horizontal: 'center', vertical: 'middle' };
        endCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
        endCell.border = thinBorder;
      } else {
        let displayStart = rec.start || '';
        let displayEnd = rec.end || '';

        const isPartTime = emp.type === 'parttime';
        if (!isPartTime && rec.start && rec.end && rec.start2 && rec.end2) {
          const merged = getMergedFullTimeShift(rec.start, rec.end, rec.start2, rec.end2);
          displayStart = merged.start;
          displayEnd = merged.end;
        }

        startCell.value = displayStart;
        startCell.font = { name: 'Times New Roman', size: 9, bold: isSplitShiftRec, color: { argb: 'FF000000' } };
        startCell.alignment = { horizontal: 'center', vertical: 'middle' };
        startCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
        startCell.border = thinBorder;

        endCell.value = displayEnd;
        endCell.font = { name: 'Times New Roman', size: 9, bold: isSplitShiftRec, color: { argb: 'FF000000' } };
        endCell.alignment = { horizontal: 'center', vertical: 'middle' };
        endCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
        endCell.border = thinBorder;
      }
    }

    // Attendance records for Back Section (Part-Time Ca 2 ONLY)
    for (let d = 1; d <= daysInMonth; d++) {
      const colIdx = backSectionColStart + (d - 1);
      const dayStr = String(d).padStart(2, '0');
      const dateKey = `${year}-${formattedMonthStr}-${dayStr}`;
      const rec = empAtt[dateKey] || {};

      const backStartCell = ws.getCell(rStart, colIdx);
      const backEndCell = ws.getCell(rEnd, colIdx);

      const isPartTime = emp.type === 'parttime';
      const isSplitShiftRec = isPartTime && Boolean(
        rec.start2 ||
        rec.end2 ||
        rec.isSplitShift ||
        (rec.presetLabel && String(rec.presetLabel).toLowerCase().includes('gãy'))
      );
      const backBgColor = isSplitShiftRec ? 'FFFFF200' : 'FFFFFFFF';

      // Only Part-Time populates Ca 2 in Back Section
      backStartCell.value = isPartTime ? (rec.start2 || '') : '';
      backStartCell.font = { name: 'Times New Roman', size: 9, bold: isSplitShiftRec, color: { argb: 'FF7030A0' } };
      backStartCell.alignment = { horizontal: 'center', vertical: 'middle' };
      backStartCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: backBgColor } };
      backStartCell.border = thinBorder;

      backEndCell.value = isPartTime ? (rec.end2 || '') : '';
      backEndCell.font = { name: 'Times New Roman', size: 9, bold: isSplitShiftRec, color: { argb: 'FF7030A0' } };
      backEndCell.alignment = { horizontal: 'center', vertical: 'middle' };
      backEndCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: backBgColor } };
      backEndCell.border = thinBorder;
    }

    currentRow += 2;
  });

  // Render 5 Side-by-Side Branch Salary Advance Mini-Tables below the main attendance grid (Row currentRow + 2)
  renderBranchSalaryAdvanceTables(ws, currentRow + 2, allEmployees.length > 0 ? allEmployees : employeesList, salaryAdvances, branches, year, month);
}

/**
 * Exports current attendance matrix to a pixel-perfect styled Excel file matching E:\chamcong\cham cong.xlsx format
 * Supports Front Section (Cols D..AH for Ca 1) & Back Section (Cols AI..BA for Part-Time Ca 2)
 * Supports Multi-Sheet Export for ALL Branches or Individual Branch Sheet
 * Render Branch Salary Advance Mini-Tables at bottom matching image media_1786897566190.png
 */
export const exportToExcel = async (year, month, employees = [], attendanceData = {}, branchPrefix = '', allBranchesList = [], salaryAdvances = []) => {
  const wb = new ExcelJS.Workbook();
  const formattedMonthStr = String(month).padStart(2, '0');

  const allEmps = (allBranchesList && allBranchesList.length > 0) ? employees : employees;

  // If ALL branches selected, export Sheet 1 (All Branches) + Sheets for each individual branch!
  if (branchPrefix === 'Tat_Ca_Chi_Nhanh' && allBranchesList && allBranchesList.length > 0) {
    // Sheet 1: Tất Cả Chi Nhánh
    createAttendanceSheet(wb, `${month}班 (Tất Cả)`, employees, attendanceData, year, month, employees, salaryAdvances, allBranchesList);

    // Sheets 2..6: Each Branch tab
    allBranchesList.forEach(branch => {
      const branchEmps = employees.filter(e => e.branchId === branch.id);
      if (branchEmps.length > 0) {
        createAttendanceSheet(wb, branch.name, branchEmps, attendanceData, year, month, employees, salaryAdvances, allBranchesList);
      }
    });
  } else {
    // Single Branch Export (e.g. "Xuân Lộc", "Biên Hoà"...)
    const cleanSheetName = branchPrefix ? branchPrefix.replace(/_/g, ' ') : `${month}班`;
    createAttendanceSheet(wb, cleanSheetName, employees, attendanceData, year, month, employees, salaryAdvances, allBranchesList);
  }

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
