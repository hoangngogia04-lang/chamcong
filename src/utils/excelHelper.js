import ExcelJS from 'exceljs';
import { getMergedFullTimeShift, calculateEmployeeMonthlyStats } from './calcUtils';

/**
 * Gets the number of days in a given month and year
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

/**
 * Calculates duration between start and end time in HH:MM format (e.g. '08:00' & '13:00' -> '05:00')
 */
function calcShiftDurationHHMM(startStr, endStr) {
  if (!startStr || !endStr || startStr === 'OFF' || endStr === '-') return '';
  if (typeof startStr !== 'string' || typeof endStr !== 'string') return '';
  if (!startStr.includes(':') || !endStr.includes(':')) return '';

  const [h1, m1] = startStr.split(':').map(Number);
  const [h2, m2] = endStr.split(':').map(Number);

  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return '';

  let diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diffMins < 0) diffMins += 24 * 60; // Midnight rollover if any

  const dH = String(Math.floor(diffMins / 60)).padStart(2, '0');
  const dM = String(diffMins % 60).padStart(2, '0');

  return `${dH}:${dM}`;
}

/**
 * Calculates Full-Time overtime hours in H:MM format
 * Standard Full-Time shift: 9 hours (e.g. 08:00 - 17:00 -> 0:00 OT)
 * Overtime: Total hours - 9h (e.g. 08:00 - 18:00 = 10h total -> 1:00 OT, 08:00 - 22:00 = 14h total -> 5:00 OT)
 */
function calcFullTimeOvertimeHHMM(startStr, endStr) {
  if (!startStr || !endStr || startStr === 'OFF' || endStr === '-') return '';
  if (typeof startStr !== 'string' || typeof endStr !== 'string') return '';
  if (!startStr.includes(':') || !endStr.includes(':')) return '';

  const [h1, m1] = startStr.split(':').map(Number);
  const [h2, m2] = endStr.split(':').map(Number);

  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return '';

  let totalMins = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (totalMins < 0) totalMins += 24 * 60;

  const standardMins = 9 * 60; // 540 mins (9h)
  const otMins = Math.max(0, totalMins - standardMins);

  const otH = Math.floor(otMins / 60);
  const otM = String(otMins % 60).padStart(2, '0');

  return `${otH}:${otM}`;
}

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
 * Bottom left box displays pure number (e.g. 16.4 for Full-Time working days or 135.0 for Part-Time working hours) matching web app stats exactly.
 */
function renderEmployeePayrollSummaryBlock(ws, startRow, summaryValue = '') {
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

  // Row startRow + 2: Col 1 & 2 merged for Summary Cell (Pure Number matching web app: e.g. 16.4 or 135.0)
  ws.mergeCells(startRow + 2, 1, startRow + 2, 2);
  const totCell = ws.getCell(startRow + 2, 1);
  totCell.value = summaryValue;
  totCell.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FFC00000' } };
  totCell.alignment = { horizontal: 'center', vertical: 'middle' };
  totCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF200' } };
  ws.getCell(startRow + 2, 1).border = thinBorder;
  ws.getCell(startRow + 2, 2).border = thinBorder;

  // Row startRow + 2: Cols 3..8 empty for accountant
  for (let c = 3; c <= 8; c++) {
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
 * Creates a styled Excel Worksheet with Fixed Columns A, B, C (STT, TÊN, CA) & Top Header Rows
 */
function createAttendanceSheet(wb, sheetName, employeesList, attendanceData, year, month, allEmployees = [], salaryAdvances = [], branches = [], targetBranchId = 'ALL') {
  const daysInMonth = getDaysInMonth(year, month);
  const formattedMonthStr = String(month).padStart(2, '0');
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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
  ws.getColumn(1).width = 7;  // STT / TYPE (Col A)
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

  // 4. Employee Data Blocks (Row 4 onwards)
  let currentRow = 4;
  employeesList.forEach((emp, index) => {
    const isPartTime = emp.type === 'parttime';
    // Full-time: 3 rows (Lên Ca, Xuống Ca, Tăng Ca)
    // Part-time: 6 rows (Lên Ca 1, Xuống Ca 1, Số tiếng Ca 1, Lên Ca 2, Xuống Ca 2, Số tiếng Ca 2)
    const numShiftRows = isPartTime ? 6 : 3;

    // --- Per-Employee Date Header Row ---
    const headerRow = currentRow;
    const hA = ws.getCell(headerRow, 1);
    hA.value = 'STT';
    hA.font = { name: 'Times New Roman', size: 10, bold: true };
    hA.alignment = { horizontal: 'center', vertical: 'middle' };
    hA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } };
    hA.border = thinBorder;

    const hB = ws.getCell(headerRow, 2);
    hB.value = 'TÊN';
    hB.font = { name: 'Times New Roman', size: 10, bold: true };
    hB.alignment = { horizontal: 'center', vertical: 'middle' };
    hB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } };
    hB.border = thinBorder;

    const hC = ws.getCell(headerRow, 3);
    hC.value = 'CA(班別)';
    hC.font = { name: 'Times New Roman', size: 10, bold: true };
    hC.alignment = { horizontal: 'center', vertical: 'middle' };
    hC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } };
    hC.border = thinBorder;

    for (let d = 1; d <= daysInMonth; d++) {
      const colIdx = d + 3;
      const cell = ws.getCell(headerRow, colIdx);
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
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } };
      cell.border = thinBorder;
    }

    currentRow += 1;

    // --- Attendance Block ---
    const rStart = currentRow;
    const rEnd = currentRow + numShiftRows - 1;
    const branchBgColor = `FF${BRANCH_COLORS[emp.branchId] || 'FFE6D9'}`;
    const isOddEmp = index % 2 === 1;
    const shiftBgColor = isOddEmp ? 'FFF2F2F2' : 'FFFFFFFF';
    const empStt = emp.stt || (index + 1);

    if (isPartTime) {
      // Part-Time: Merged Box 1 (Rows 1..3 across Cols A & B) = "part time"
      ws.mergeCells(rStart, 1, rStart + 2, 2);
      const ptBox = ws.getCell(rStart, 1);
      ptBox.value = 'part time';
      ptBox.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FF333333' } };
      ptBox.alignment = { horizontal: 'center', vertical: 'middle' };
      ptBox.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };

      for (let r = rStart; r <= rStart + 2; r++) {
        ws.getCell(r, 1).border = thinBorder;
        ws.getCell(r, 2).border = thinBorder;
      }

      // Part-Time: Merged Box 2 (Rows 4..6 across Cols A & B) = emp.name (e.g. Trúc Anh)
      ws.mergeCells(rStart + 3, 1, rEnd, 2);
      const nameBox = ws.getCell(rStart + 3, 1);
      nameBox.value = emp.name || '';
      nameBox.font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FF000000' } };
      nameBox.alignment = { horizontal: 'center', vertical: 'middle' };
      nameBox.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };

      for (let r = rStart + 3; r <= rEnd; r++) {
        ws.getCell(r, 1).border = thinBorder;
        ws.getCell(r, 2).border = thinBorder;
      }

      // Col C Labels for Part-Time
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
      ca3.value = '';
      ca3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };
      ca3.border = thinBorder;

      const ca4 = ws.getCell(rStart + 3, 3);
      ca4.value = 'Lên Ca 2';
      ca4.font = { name: 'Times New Roman', size: 9, bold: true, color: { argb: 'FF7030A0' } };
      ca4.alignment = { horizontal: 'center', vertical: 'middle' };
      ca4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };
      ca4.border = thinBorder;

      const ca5 = ws.getCell(rStart + 4, 3);
      ca5.value = 'Xuống Ca 2';
      ca5.font = { name: 'Times New Roman', size: 9, bold: true, color: { argb: 'FF7030A0' } };
      ca5.alignment = { horizontal: 'center', vertical: 'middle' };
      ca5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };
      ca5.border = thinBorder;

      const ca6 = ws.getCell(rStart + 5, 3);
      ca6.value = '';
      ca6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };
      ca6.border = thinBorder;
    } else {
      // Full-Time: 3 rows (STT, TÊN)
      ws.mergeCells(rStart, 1, rEnd, 1);
      const sttCell = ws.getCell(rStart, 1);
      sttCell.value = empStt;
      sttCell.font = { name: 'Times New Roman', size: 10, bold: true };
      sttCell.alignment = { horizontal: 'center', vertical: 'middle' };
      sttCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };

      ws.mergeCells(rStart, 2, rEnd, 2);
      const nameCell = ws.getCell(rStart, 2);
      nameCell.value = emp.name || '';
      nameCell.font = { name: 'Times New Roman', size: 10, bold: true };
      nameCell.alignment = { horizontal: 'center', vertical: 'middle' };
      nameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };

      for (let r = rStart; r <= rEnd; r++) {
        ws.getCell(r, 1).border = thinBorder;
        ws.getCell(r, 2).border = thinBorder;
      }

      // Col C Labels for Full-Time (3 rows: Lên Ca, Xuống Ca, Tăng Ca)
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

      const ca3 = ws.getCell(rStart + 2, 3);
      ca3.value = 'Tăng Ca';
      ca3.font = { name: 'Times New Roman', size: 9, bold: true, color: { argb: 'FFC00000' } };
      ca3.alignment = { horizontal: 'center', vertical: 'middle' };
      ca3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: branchBgColor } };
      ca3.border = thinBorder;
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
        // Full-Time (3 rows: Lên Ca, Xuống Ca, Tăng Ca)
        const cell1 = ws.getCell(rStart, colIdx);
        const cell2 = ws.getCell(rStart + 1, colIdx);
        const cell3 = ws.getCell(rStart + 2, colIdx);

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
        } else {
          let displayStart = rec.start || '';
          let displayEnd = rec.end || '';

          if (rec.start && rec.end && rec.start2 && rec.end2) {
            const merged = getMergedFullTimeShift(rec.start, rec.end, rec.start2, rec.end2);
            displayStart = merged.start;
            displayEnd = merged.end;
          }

          // Row 1: Lên Ca
          cell1.value = displayStart;
          cell1.font = { name: 'Times New Roman', size: 9, bold: isSplitShiftRec, color: { argb: 'FF000000' } };
          cell1.alignment = { horizontal: 'center', vertical: 'middle' };
          cell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell1.border = thinBorder;

          // Row 2: Xuống Ca
          cell2.value = displayEnd;
          cell2.font = { name: 'Times New Roman', size: 9, bold: isSplitShiftRec, color: { argb: 'FF000000' } };
          cell2.alignment = { horizontal: 'center', vertical: 'middle' };
          cell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell2.border = thinBorder;

          // Row 3: Tăng Ca (08:00 - 18:00 -> 1:00, 08:00 - 17:00 -> 0:00, 08:00 - 22:00 -> 5:00)
          const otStr = calcFullTimeOvertimeHHMM(displayStart, displayEnd);
          cell3.value = otStr;
          cell3.font = { name: 'Times New Roman', size: 9, bold: true, color: { argb: (otStr && otStr !== '0:00') ? 'FFC00000' : 'FF555555' } };
          cell3.alignment = { horizontal: 'center', vertical: 'middle' };
          cell3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell3.border = thinBorder;
        }
      } else {
        // Part-Time (6 rows: Ca 1, Ca 1 Dur, Ca 2, Ca 2 Dur)
        const cell1 = ws.getCell(rStart, colIdx);
        const cell2 = ws.getCell(rStart + 1, colIdx);
        const cell3 = ws.getCell(rStart + 2, colIdx);
        const cell4 = ws.getCell(rStart + 3, colIdx);
        const cell5 = ws.getCell(rStart + 4, colIdx);
        const cell6 = ws.getCell(rStart + 5, colIdx);

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

          cell5.value = '';
          cell5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell5.border = thinBorder;

          cell6.value = '';
          cell6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell6.border = thinBorder;
        } else {
          // Ca 1 (Start & End)
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

          // Ca 1 Total Duration (e.g. 05:00)
          const dur1Str = calcShiftDurationHHMM(rec.start, rec.end);
          cell3.value = dur1Str;
          cell3.font = { name: 'Times New Roman', size: 9, bold: true, color: { argb: 'FF000000' } };
          cell3.alignment = { horizontal: 'center', vertical: 'middle' };
          cell3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell3.border = thinBorder;

          // Ca 2 (Start & End)
          cell4.value = rec.start2 || '';
          cell4.font = { name: 'Times New Roman', size: 9, bold: Boolean(rec.start2), color: { argb: 'FF7030A0' } };
          cell4.alignment = { horizontal: 'center', vertical: 'middle' };
          cell4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell4.border = thinBorder;

          cell5.value = rec.end2 || '';
          cell5.font = { name: 'Times New Roman', size: 9, bold: Boolean(rec.end2), color: { argb: 'FF7030A0' } };
          cell5.alignment = { horizontal: 'center', vertical: 'middle' };
          cell5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell5.border = thinBorder;

          // Ca 2 Total Duration (e.g. 04:30)
          const dur2Str = calcShiftDurationHHMM(rec.start2, rec.end2);
          cell6.value = dur2Str;
          cell6.font = { name: 'Times New Roman', size: 9, bold: true, color: { argb: 'FF7030A0' } };
          cell6.alignment = { horizontal: 'center', vertical: 'middle' };
          cell6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentCellBg } };
          cell6.border = thinBorder;
        }
      }
    }

    // Render Pure Number matching web app's precise calculateEmployeeMonthlyStats:
    // Full-Time: Exact calculated Working Days (e.g. 16.4 for Dung)
    // Part-Time: Exact calculated Working Hours (e.g. 135.0)
    const stats = calculateEmployeeMonthlyStats(emp, attendanceData, daysArray, year, month);
    if (!isPartTime) {
      renderEmployeePayrollSummaryBlock(ws, rEnd + 1, stats.totalWorkingDays);
    } else {
      renderEmployeePayrollSummaryBlock(ws, rEnd + 1, Number(stats.totalHoursWorked));
    }

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
 * Uses calculateEmployeeMonthlyStats for exact matching between Web App stats (16.4 ngày công) and Excel yellow cell (16.4)
 * Full-Time 3 rows: Lên Ca, Xuống Ca, Tăng Ca (1:00, 0:00, 5:00)
 * Part-Time 6 rows: Lên Ca 1, Xuống Ca 1, Số tiếng Ca 1, Lên Ca 2, Xuống Ca 2, Số tiếng Ca 2
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
