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
 * Renders Payroll Summary Block below each employee matching physical payslip in image
 * Headers: cơ bản | tăng ca | tiền thưởng | tiền ăn | tiền ăn tối | tiền cc | Tập ze | ao | tổng số tiền
 * Values left empty for accountant manual calculation as requested by user.
 */
function renderEmployeePayrollSummaryBlock(ws, startRow) {
  const thinBorder = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  const payrollHeaders = [
    { label: 'cơ bản', col: 1 },
    { label: 'tăng ca', col: 2 },
    { label: 'tiền thưởng', col: 3 },
    { label: 'tiền ăn', col: 4 },
    { label: 'tiền ăn tối', col: 5 },
    { label: 'tiền cc', col: 6 },
    { label: 'Tập ze', col: 7 },
    { label: 'ao', col: 8 }
  ];

  // Header Row (startRow)
  payrollHeaders.forEach(item => {
    const cell = ws.getCell(startRow, item.col);
    cell.value = item.label;
    cell.font = { name: 'Times New Roman', size: 9, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
    cell.border = thinBorder;
  });

  // Merged Header for "tổng số tiền" (Cols 9 & 10)
  ws.mergeCells(startRow, 9, startRow, 10);
  const totalHeaderCell = ws.getCell(startRow, 9);
  totalHeaderCell.value = 'tổng số tiền';
  totalHeaderCell.font = { name: 'Times New Roman', size: 9, bold: true };
  totalHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
  totalHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
  ws.getCell(startRow, 9).border = thinBorder;
  ws.getCell(startRow, 10).border = thinBorder;

  // Row startRow + 1: Empty cells with borders for Accountant Unit Rate / Quantity
  for (let c = 1; c <= 8; c++) {
    const cell = ws.getCell(startRow + 1, c);
    cell.value = '';
    cell.border = thinBorder;
  }
  ws.mergeCells(startRow + 1, 9, startRow + 1, 10);
  ws.getCell(startRow + 1, 9).border = thinBorder;
  ws.getCell(startRow + 1, 10).border = thinBorder;

  // Row startRow + 2: Empty cells with borders for Accountant Total Amount
  for (let c = 1; c <= 8; c++) {
    const cell = ws.getCell(startRow + 2, c);
    cell.value = '';
    cell.border = thinBorder;
  }
  ws.mergeCells(startRow + 2, 9, startRow + 2, 10);
  ws.getCell(startRow + 2, 9).border = thinBorder;
  ws.getCell(startRow + 2, 10).border = thinBorder;
}

/**
 * Renders Side-by-Side Branch Salary Advance Mini-Tables below the attendance table
 * Exactly matching user's screenshot media_1786897566190.png & media_1786902640441.png
 * Single branch export renders ONLY that branch's table, ALL branches export renders 5 tables.
 */
function renderBranchSalaryAdvanceTables(ws, startRow, allEmployees, salaryAdvances = [], branches = [], year, month, targetBranchId = 'ALL') {
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

  const branchTableConfig = [
    { branchId: 'CN2', startCol: 5 },  // Long Thành
    { branchId: 'CN1', startCol: 10 }, // Biên Hoà
    { branchId: 'CN3', startCol: 15 }, // Long Khánh
    { branchId: 'CN4', startCol: 20 }, // Xuân Lộc
    { branchId: 'CN5', startCol: 25 }  // Lê Duẩn
  ];

  // Filter tables to render: if targetBranchId is a specific branch, render ONLY that branch's table!
  let tablesToRender = branchTableConfig;
  if (targetBranchId && targetBranchId !== 'ALL' && targetBranchId !== 'Tat_Ca_Chi_Nhanh') {
    tablesToRender = branchTableConfig.filter(cfg => cfg.branchId === targetBranchId);
  }

  tablesToRender.forEach(cfg => {
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
function createAttendanceSheet(wb, sheetName, employeesList, attendanceData, year, month, allEmployees = [], salaryAdvances = [], branches = [], targetBranchId = 'ALL') {
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
  ws.getColumn(3).width = 11; // CA (Col C)

  for (let d = 1; d <= daysInMonth; d++) {
    ws.getColumn(d + 3).width = 7;
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

  // 3. Column Header Row 4: STT, TÊN, CA(班別), 1..31
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

  // DAYS (Cols 4..4+daysInMonth-1)
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

  // 4. Employee Data Rows (Row 5 onwards)
  let currentRow = 5;
  employeesList.forEach((emp, index) => {
    const isPartTime = emp.type === 'parttime';
    const numShiftRows = isPartTime ? 4 : 2;

    const rStart = currentRow;
    const rEnd = currentRow + numShiftRows - 1;
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
    for (let r = rStart; r <= rEnd; r++) {
      ws.getCell(r, 1).border = thinBorder;
    }

    // TÊN (Merged B{rStart}:B{rEnd})
    ws.mergeCells(rStart, 2, rEnd, 2);
    const nameCell = ws.getCell(rStart, 2);
    nameCell.value = emp.name || '';
    nameCell.font = { name: 'Times New Roman', size: 10, bold: true };
    nameCell.alignment = { horizontal: 'center', vertical: 'middle' };
    nameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };
    for (let r = rStart; r <= rEnd; r++) {
      ws.getCell(r, 2).border = thinBorder;
    }

    // CA Labels (Col C)
    if (!isPartTime) {
      // Full-Time (2 rows)
      const ca1 = ws.getCell(rStart, 3);
      ca1.value = 'Lên Ca';
      ca1.font = { name: 'Times New Roman', size: 9, bold: true, color: { argb: 'FF008000' } };
      ca1.alignment = { horizontal: 'center', vertical: 'middle' };
      ca1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };
      ca1.border = thinBorder;

      const ca2 = ws.getCell(rStart + 1, 3);
      ca2.value = 'Xuống Ca';
      ca2.font = { name: 'Times New Roman', size: 9, bold: true, color: { argb: 'FF0000FF' } };
      ca2.alignment = { horizontal: 'center', vertical: 'middle' };
      ca2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };
      ca2.border = thinBorder;
    } else {
      // Part-Time (4 rows: Ca 1 & Ca 2 directly underneath each other)
      const ca1 = ws.getCell(rStart, 3);
      ca1.value = 'Lên Ca 1';
      ca1.font = { name: 'Times New Roman', size: 9, bold: true, color: { argb: 'FF008000' } };
      ca1.alignment = { horizontal: 'center', vertical: 'middle' };
      ca1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };
      ca1.border = thinBorder;

      const ca2 = ws.getCell(rStart + 1, 3);
      ca2.value = 'Xuống Ca 1';
      ca2.font = { name: 'Times New Roman', size: 9, bold: true, color: { argb: 'FF0000FF' } };
      ca2.alignment = { horizontal: 'center', vertical: 'middle' };
      ca2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };
      ca2.border = thinBorder;

      const ca3 = ws.getCell(rStart + 2, 3);
      ca3.value = 'Lên Ca 2';
      ca3.font = { name: 'Times New Roman', size: 9, bold: true, color: { argb: 'FF7030A0' } };
      ca3.alignment = { horizontal: 'center', vertical: 'middle' };
      ca3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };
      ca3.border = thinBorder;

      const ca4 = ws.getCell(rStart + 3, 3);
      ca4.value = 'Xuống Ca 2';
      ca4.font = { name: 'Times New Roman', size: 9, bold: true, color: { argb: 'FF7030A0' } };
      ca4.alignment = { horizontal: 'center', vertical: 'middle' };
      ca4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };
      ca4.border = thinBorder;
    }

    // Attendance Data Days 1..31
    const empAtt = (attendanceData && attendanceData[emp.id]) || {};

    for (let d = 1; d <= daysInMonth; d++) {
      const colIdx = d + 3;
      const dayStr = String(d).padStart(2, '0');
      const dateKey = `${year}-${formattedMonthStr}-${dayStr}`;
      const rec = empAtt[dateKey] || {};

      const isSplitShiftRec = Boolean(
        rec.start2 ||
        rec.end2 ||
        rec.isSplitShift ||
        (rec.presetLabel && String(rec.presetLabel).toLowerCase().includes('gãy')) ||
        (rec.start === '08:00' && rec.end === '22:00')
      );

      const currentCellBg = isSplitShiftRec ? 'FFFFF200' : shiftBgColor;

      if (!isPartTime) {
        // Full-Time (2 rows)
        const cell1 = ws.getCell(rStart, colIdx);
        const cell2 = ws.getCell(rStart + 1, colIdx);

        if (rec.start === 'OFF') {
          cell1.value = 'OFF';
          cell1.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FFFF0000' } };
          cell1.alignment = { horizontal: 'center', vertical: 'middle' };
          cell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell1.border = thinBorder;

          cell2.value = '-';
          cell2.font = { name: 'Times New Roman', size: 9, color: { argb: 'FF999999' } };
          cell2.alignment = { horizontal: 'center', vertical: 'middle' };
          cell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell2.border = thinBorder;
        } else {
          let displayStart = rec.start || '';
          let displayEnd = rec.end || '';

          if (rec.start && rec.end && rec.start2 && rec.end2) {
            const merged = getMergedFullTimeShift(rec.start, rec.end, rec.start2, rec.end2);
            displayStart = merged.start;
            displayEnd = merged.end;
          }

          cell1.value = displayStart;
          cell1.font = { name: 'Times New Roman', size: 9, bold: isSplitShiftRec, color: { argb: 'FF000000' } };
          cell1.alignment = { horizontal: 'center', vertical: 'middle' };
          cell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell1.border = thinBorder;

          cell2.value = displayEnd;
          cell2.font = { name: 'Times New Roman', size: 9, bold: isSplitShiftRec, color: { argb: 'FF000000' } };
          cell2.alignment = { horizontal: 'center', vertical: 'middle' };
          cell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell2.border = thinBorder;
        }
      } else {
        // Part-Time (4 rows: Ca 1 & Ca 2 directly underneath each other)
        const cell1 = ws.getCell(rStart, colIdx);
        const cell2 = ws.getCell(rStart + 1, colIdx);
        const cell3 = ws.getCell(rStart + 2, colIdx);
        const cell4 = ws.getCell(rStart + 3, colIdx);

        if (rec.start === 'OFF') {
          cell1.value = 'OFF';
          cell1.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FFFF0000' } };
          cell1.alignment = { horizontal: 'center', vertical: 'middle' };
          cell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell1.border = thinBorder;

          cell2.value = '-';
          cell2.font = { name: 'Times New Roman', size: 9, color: { argb: 'FF999999' } };
          cell2.alignment = { horizontal: 'center', vertical: 'middle' };
          cell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell2.border = thinBorder;

          cell3.value = '';
          cell3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell3.border = thinBorder;

          cell4.value = '';
          cell4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell4.border = thinBorder;
        } else {
          // Ca 1
          cell1.value = rec.start || '';
          cell1.font = { name: 'Times New Roman', size: 9, bold: isSplitShiftRec, color: { argb: 'FF000000' } };
          cell1.alignment = { horizontal: 'center', vertical: 'middle' };
          cell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell1.border = thinBorder;

          cell2.value = rec.end || '';
          cell2.font = { name: 'Times New Roman', size: 9, bold: isSplitShiftRec, color: { argb: 'FF000000' } };
          cell2.alignment = { horizontal: 'center', vertical: 'middle' };
          cell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell2.border = thinBorder;

          // Ca 2 (Placed directly underneath Ca 1!)
          cell3.value = rec.start2 || '';
          cell3.font = { name: 'Times New Roman', size: 9, bold: Boolean(rec.start2), color: { argb: 'FF7030A0' } };
          cell3.alignment = { horizontal: 'center', vertical: 'middle' };
          cell3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell3.border = thinBorder;

          cell4.value = rec.end2 || '';
          cell4.font = { name: 'Times New Roman', size: 9, bold: Boolean(rec.end2), color: { argb: 'FF7030A0' } };
          cell4.alignment = { horizontal: 'center', vertical: 'middle' };
          cell4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell4.border = thinBorder;
        }
      }
    }

    // Render Payroll Summary Block matching physical paper slip below employee's attendance rows (rEnd + 1)
    renderEmployeePayrollSummaryBlock(ws, rEnd + 1);

    // Advance attendance rows + 3 payroll table rows + 2 blank separator rows!
    currentRow += (numShiftRows + 5);
  });

  // Render Side-by-Side Branch Salary Advance Mini-Tables below main attendance grid (Row currentRow + 2)
  renderBranchSalaryAdvanceTables(
    ws,
    currentRow + 2,
    allEmployees.length > 0 ? allEmployees : employeesList,
    salaryAdvances,
    branches,
    year,
    month,
    targetBranchId
  );
}

/**
 * Exports current attendance matrix to a pixel-perfect styled Excel file matching E:\chamcong\cham cong.xlsx format
 * Supports Part-Time Ca 2 placed directly underneath Ca 1 for neat readability
 * Supports Multi-Sheet Export for ALL Branches or Individual Branch Sheet
 * Render Branch Salary Advance Mini-Tables at bottom matching image media_1786897566190.png & media_1786902640441.png
 */
export const exportToExcel = async (year, month, employees = [], attendanceData = {}, branchPrefix = '', allBranchesList = [], salaryAdvances = []) => {
  const wb = new ExcelJS.Workbook();
  const formattedMonthStr = String(month).padStart(2, '0');

  // If ALL branches selected, export Sheet 1 (All Branches) + Sheets for each individual branch!
  if (branchPrefix === 'Tat_Ca_Chi_Nhanh' && allBranchesList && allBranchesList.length > 0) {
    // Sheet 1: Tất Cả Chi Nhánh -> Renders all 5 branch tables at bottom
    createAttendanceSheet(wb, `${month}班 (Tất Cả)`, employees, attendanceData, year, month, employees, salaryAdvances, allBranchesList, 'ALL');

    // Sheets 2..6: Each Branch tab -> Renders ONLY that branch's table at bottom
    allBranchesList.forEach(branch => {
      const branchEmps = employees.filter(e => e.branchId === branch.id);
      if (branchEmps.length > 0) {
        createAttendanceSheet(wb, branch.name, branchEmps, attendanceData, year, month, employees, salaryAdvances, allBranchesList, branch.id);
      }
    });
  } else {
    // Single Branch Export (e.g. "Long_Thành", "Biên_Hoà"...)
    const targetBranch = (allBranchesList || []).find(b => b.name.replace(/\s+/g, '_') === branchPrefix || b.id === branchPrefix);
    const targetBranchId = targetBranch ? targetBranch.id : (employees.length > 0 ? employees[0].branchId : 'ALL');

    const cleanSheetName = branchPrefix ? branchPrefix.replace(/_/g, ' ') : `${month}班`;
    createAttendanceSheet(wb, cleanSheetName, employees, attendanceData, year, month, employees, salaryAdvances, allBranchesList, targetBranchId);
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
