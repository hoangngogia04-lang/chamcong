import XLSX from 'xlsx-js-style';

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
 */
export const exportToExcel = (year, month, employees, attendanceData, branchPrefix = '') => {
  const daysInMonth = getDaysInMonth(year, month);
  const formattedMonthStr = String(month).padStart(2, '0');

  const wb = XLSX.utils.book_new();
  const ws = {};
  const merges = [];

  // Thin black gridline border for table cells
  const thinBorder = {
    top: { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
    left: { style: 'thin', color: { rgb: '000000' } },
    right: { style: 'thin', color: { rgb: '000000' } }
  };

  // 1. Title Row (Row 0 / Index 0): "2026 08 GIẤY LÊN CA(上班月表)"
  ws['A1'] = {
    v: `${year} ${formattedMonthStr} GIẤY LÊN CA(上班月表)`,
    s: {
      font: { bold: true, sz: 16, name: 'Times New Roman' },
      alignment: { horizontal: 'center', vertical: 'center' }
    }
  };
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: daysInMonth + 2 } });

  // 2. Subtitle Header Row 2 & 3 (Rows 1 & 2 / Index 1 & 2): "THÁNG 8" & "NGÀY(日期)"
  ws['A2'] = {
    v: `THÁNG ${month}`,
    s: {
      font: { bold: true, sz: 11, name: 'Times New Roman' },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: thinBorder
    }
  };
  merges.push({ s: { r: 1, c: 0 }, e: { r: 2, c: 2 } });

  ws['D2'] = {
    v: 'NGÀY(日期)',
    s: {
      font: { bold: true, sz: 11, name: 'Times New Roman' },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: thinBorder
    }
  };
  merges.push({ s: { r: 1, c: 3 }, e: { r: 2, c: daysInMonth + 2 } });

  // Ensure thin borders for merged subtitle header cells
  for (let r = 1; r <= 2; r++) {
    for (let c = 0; c <= daysInMonth + 2; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      if (!ws[cellRef]) {
        ws[cellRef] = { v: '', s: { border: thinBorder } };
      }
    }
  }

  // 3. Column Header Row 4 (Row 3 / Index 3): STT, TÊN, CA(班別), 1..31 (FRONT & BACK SECTIONS)
  ws['A4'] = {
    v: 'STT',
    s: {
      font: { bold: true, sz: 11, name: 'Times New Roman' },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: thinBorder
    }
  };
  ws['B4'] = {
    v: 'TÊN',
    s: {
      font: { bold: true, sz: 11, name: 'Times New Roman' },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: thinBorder
    }
  };
  ws['C4'] = {
    v: 'CA(班別)',
    s: {
      font: { bold: true, sz: 11, name: 'Times New Roman' },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: thinBorder
    }
  };

  // FRONT SECTION DAYS (Cols 3..3+daysInMonth-1)
  for (let d = 1; d <= daysInMonth; d++) {
    const colIdx = d + 2;
    const cellRef = XLSX.utils.encode_cell({ r: 3, c: colIdx });
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    ws[cellRef] = {
      v: d,
      s: {
        font: {
          bold: true,
          sz: 10,
          name: 'Times New Roman',
          color: isWeekend ? { rgb: 'FF0000' } : { rgb: '000000' }
        },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: thinBorder
      }
    };
  }

  // BACK SECTION DAYS (Cols 34..34+daysInMonth-1, starting at Column AI)
  const backSectionColStart = 34; // Col AI
  for (let d = 1; d <= daysInMonth; d++) {
    const colIdx = backSectionColStart + (d - 1);
    const cellRef = XLSX.utils.encode_cell({ r: 3, c: colIdx });
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    ws[cellRef] = {
      v: d,
      s: {
        font: {
          bold: true,
          sz: 10,
          name: 'Times New Roman',
          color: isWeekend ? { rgb: 'FF0000' } : { rgb: '000000' }
        },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: thinBorder
      }
    };
  }

  // 4. Employee Data Rows (Row 5 onwards / Index 4...)
  let currentRow = 4;
  employees.forEach((emp, index) => {
    const rStart = currentRow;
    const rEnd = currentRow + 1;
    const branchBgColor = BRANCH_COLORS[emp.branchId] || 'FFE6D9';

    // Alternating background for shift cells (White #FFFFFF for even index 0, 2, 4..., Soft Grey #F2F2F2 for odd index 1, 3, 5...)
    const isOddEmp = index % 2 === 1;
    const shiftBgColor = isOddEmp ? 'F2F2F2' : 'FFFFFF';

    const empStt = emp.stt || (index + 1);

    // STT (Merged A{rStart+1}:A{rEnd+1})
    const sttCell = XLSX.utils.encode_cell({ r: rStart, c: 0 });
    const sttEndCell = XLSX.utils.encode_cell({ r: rEnd, c: 0 });
    ws[sttCell] = {
      v: empStt,
      s: {
        font: { bold: true, sz: 10, name: 'Times New Roman' },
        alignment: { horizontal: 'center', vertical: 'center' },
        fill: { fgColor: { rgb: branchBgColor } },
        border: thinBorder
      }
    };
    ws[sttEndCell] = { v: '', s: { fill: { fgColor: { rgb: branchBgColor } }, border: thinBorder } };
    merges.push({ s: { r: rStart, c: 0 }, e: { r: rEnd, c: 0 } });

    // TÊN (Merged B{rStart+1}:B{rEnd+1})
    const nameCell = XLSX.utils.encode_cell({ r: rStart, c: 1 });
    const nameEndCell = XLSX.utils.encode_cell({ r: rEnd, c: 1 });
    ws[nameCell] = {
      v: emp.name || '',
      s: {
        font: { bold: true, sz: 10, name: 'Times New Roman' },
        alignment: { horizontal: 'center', vertical: 'center' },
        fill: { fgColor: { rgb: branchBgColor } },
        border: thinBorder
      }
    };
    ws[nameEndCell] = { v: '', s: { fill: { fgColor: { rgb: branchBgColor } }, border: thinBorder } };
    merges.push({ s: { r: rStart, c: 1 }, e: { r: rEnd, c: 1 } });

    // CA (Merged C{rStart+1}:C{rEnd+1})
    const caStartCell = XLSX.utils.encode_cell({ r: rStart, c: 2 });
    const caEndCell = XLSX.utils.encode_cell({ r: rEnd, c: 2 });
    ws[caStartCell] = { v: '', s: { fill: { fgColor: { rgb: shiftBgColor } }, border: thinBorder } };
    ws[caEndCell] = { v: '', s: { fill: { fgColor: { rgb: shiftBgColor } }, border: thinBorder } };
    merges.push({ s: { r: rStart, c: 2 }, e: { r: rEnd, c: 2 } });

    // Days Shift Data: FRONT SECTION (Ca 1) & BACK SECTION (Part-Time Ca 2)
    const isPartTime = (emp.type || 'fulltime') === 'parttime';

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = String(d).padStart(2, '0');
      const dateKey = `${year}-${formattedMonthStr}-${dayStr}`;

      const record = (attendanceData[emp.id] && attendanceData[emp.id][dateKey]) || {};
      const startVal = record.start || '';
      const endVal = record.end || '';
      const start2Val = record.start2 || '';
      const end2Val = record.end2 || '';

      const isOff = startVal === 'OFF';
      const hasSplitShift = Boolean(start2Val && end2Val);

      // Yellow highlight (#FFFF00) for split shift cells in Excel!
      const cellBgColor = hasSplitShift ? 'FFFF00' : shiftBgColor;

      // --- FRONT SECTION (Cols D..AH) ---
      const frontColIdx = d + 2;
      const frontStartRef = XLSX.utils.encode_cell({ r: rStart, c: frontColIdx });
      const frontEndRef = XLSX.utils.encode_cell({ r: rEnd, c: frontColIdx });

      ws[frontStartRef] = {
        v: startVal,
        s: {
          font: {
            sz: 9,
            name: 'Times New Roman',
            bold: isOff || hasSplitShift,
            color: isOff ? { rgb: 'FF0000' } : { rgb: '000000' }
          },
          alignment: { horizontal: 'center', vertical: 'center' },
          fill: { fgColor: { rgb: cellBgColor } },
          border: thinBorder
        }
      };

      ws[frontEndRef] = {
        v: endVal,
        s: {
          font: {
            sz: 9,
            name: 'Times New Roman',
            bold: hasSplitShift
          },
          alignment: { horizontal: 'center', vertical: 'center' },
          fill: { fgColor: { rgb: cellBgColor } },
          border: thinBorder
        }
      };

      // --- BACK SECTION (Cols AI..BA starting at col 34) ---
      // ONLY write Ca 2 in back section for Part-Time employees! (Full-Time split shifts were already combined in front section)
      const backColIdx = backSectionColStart + (d - 1);
      const backStartRef = XLSX.utils.encode_cell({ r: rStart, c: backColIdx });
      const backEndRef = XLSX.utils.encode_cell({ r: rEnd, c: backColIdx });

      const backStartVal = isPartTime ? start2Val : '';
      const backEndVal = isPartTime ? end2Val : '';
      const backBgColor = (isPartTime && hasSplitShift) ? 'FFFF00' : shiftBgColor;

      ws[backStartRef] = {
        v: backStartVal,
        s: {
          font: { sz: 9, name: 'Times New Roman', bold: hasSplitShift },
          alignment: { horizontal: 'center', vertical: 'center' },
          fill: { fgColor: { rgb: backBgColor } },
          border: thinBorder
        }
      };

      ws[backEndRef] = {
        v: backEndVal,
        s: {
          font: { sz: 9, name: 'Times New Roman', bold: hasSplitShift },
          alignment: { horizontal: 'center', vertical: 'center' },
          fill: { fgColor: { rgb: backBgColor } },
          border: thinBorder
        }
      };
    }

    currentRow += 2;
  });

  // Apply merges and ref bounds up to back section
  const totalMaxCols = backSectionColStart + daysInMonth - 1;
  ws['!merges'] = merges;
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: currentRow - 1, c: totalMaxCols } });

  // Freeze Columns A, B, C (STT, TÊN, CA) & Top 4 Header Rows
  // Helps fixed columns A, B, C stay pinned on screen when scrolling horizontally
  ws['!views'] = [
    {
      state: 'frozen',
      xSplit: 3,
      ySplit: 4,
      topLeftCell: 'D5',
      activePane: 'bottomRight'
    }
  ];

  // Column Widths
  const colWidths = [
    { wch: 6 },  // STT
    { wch: 18 }, // TÊN
    { wch: 10 }  // CA
  ];
  for (let d = 1; d <= daysInMonth; d++) {
    colWidths.push({ wch: 7 });
  }

  // Widths for gap and back section
  for (let c = daysInMonth + 3; c < backSectionColStart; c++) {
    colWidths.push({ wch: 4 });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    colWidths.push({ wch: 7 });
  }
  ws['!cols'] = colWidths;

  const sheetName = `${month}班`; // e.g. "8班" matching original sheet name
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

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

  XLSX.writeFile(wb, fileName);
};

/**
 * Imports attendance data from an uploaded Excel file
 */
export const importFromExcel = (file, existingEmployees, branches) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const sheetJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!sheetJson || sheetJson.length < 5) {
          throw new Error('File Excel không đúng định dạng mẫu!');
        }

        // Row 4 (index 3) contains days
        const daysRow = sheetJson[3] || [];
        const dayIndices = [];
        const backDayIndices = [];

        // Front section days (Cols 3..33)
        for (let c = 3; c < Math.min(34, daysRow.length); c++) {
          const val = daysRow[c];
          if (val && !isNaN(val)) {
            dayIndices.push({ day: parseInt(val, 10), colIdx: c });
          }
        }

        // Back section days (Cols 34..)
        for (let c = 34; c < daysRow.length; c++) {
          const val = daysRow[c];
          if (val && !isNaN(val)) {
            backDayIndices.push({ day: parseInt(val, 10), colIdx: c });
          }
        }

        let detectedYear = new Date().getFullYear();
        let detectedMonth = new Date().getMonth() + 1;

        const titleText = String(sheetJson[0]?.[0] || '');
        const matchTitle = titleText.match(/(\d{4})\s+(\d{1,2})/);
        if (matchTitle) {
          detectedYear = parseInt(matchTitle[1], 10);
          detectedMonth = parseInt(matchTitle[2], 10);
        } else {
          const subText = String(sheetJson[1]?.[0] || '');
          const matchSub = subText.match(/THÁNG\s*(\d{1,2})/i);
          if (matchSub) {
            detectedMonth = parseInt(matchSub[1], 10);
          }
        }

        const newEmployees = [...existingEmployees];
        const newAttendance = {};

        let empSttCounter = newEmployees.length + 1;
        for (let r = 4; r < sheetJson.length; r += 2) {
          const rowStart = sheetJson[r];
          if (!rowStart || rowStart.length === 0) continue;

          const stt = rowStart[0];
          const nameRaw = rowStart[1];
          if (!nameRaw) continue;

          const name = String(nameRaw).trim().replace('\n', ' ');

          let emp = newEmployees.find(e => e.name.toLowerCase() === name.toLowerCase());
          if (!emp) {
            let branchId = 'CN1';
            if (name.includes('(LT)') || name.includes('(Lt)')) branchId = 'CN2';
            else if (name.includes('(LK)')) branchId = 'CN3';
            else if (name.includes('(XL)')) branchId = 'CN4';
            else if (name.includes('(P)')) branchId = 'CN5';

            emp = {
              id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              stt: typeof stt === 'number' ? stt : empSttCounter++,
              name: name,
              branchId: branchId,
              type: 'fulltime'
            };
            newEmployees.push(emp);
          }

          if (!newAttendance[emp.id]) {
            newAttendance[emp.id] = {};
          }

          const rowEnd = sheetJson[r + 1] || [];
          const formattedMonthStr = String(detectedMonth).padStart(2, '0');

          // Read Front Section (Ca 1)
          dayIndices.forEach(({ day, colIdx }) => {
            const dayStr = String(day).padStart(2, '0');
            const dateKey = `${detectedYear}-${formattedMonthStr}-${dayStr}`;

            let valStart = rowStart[colIdx];
            let valEnd = rowEnd[colIdx];

            let startStr = '';
            let endStr = '';

            if (valStart === 'OFF' || valEnd === 'OFF') {
              startStr = 'OFF';
            } else {
              if (valStart !== undefined && valStart !== null) startStr = String(valStart).trim();
              if (valEnd !== undefined && valEnd !== null) endStr = String(valEnd).trim();
            }

            if (startStr || endStr) {
              newAttendance[emp.id][dateKey] = {
                ...newAttendance[emp.id][dateKey],
                start: startStr,
                end: endStr
              };
            }
          });

          // Read Back Section (Ca 2)
          backDayIndices.forEach(({ day, colIdx }) => {
            const dayStr = String(day).padStart(2, '0');
            const dateKey = `${detectedYear}-${formattedMonthStr}-${dayStr}`;

            let valStart2 = rowStart[colIdx];
            let valEnd2 = rowEnd[colIdx];

            let start2Str = '';
            let end2Str = '';

            if (valStart2 !== undefined && valStart2 !== null) start2Str = String(valStart2).trim();
            if (valEnd2 !== undefined && valEnd2 !== null) end2Str = String(valEnd2).trim();

            if (start2Str || end2Str) {
              newAttendance[emp.id][dateKey] = {
                ...newAttendance[emp.id][dateKey],
                start2: start2Str,
                end2: end2Str
              };
              // If employee has Ca 2, auto mark as parttime
              emp.type = 'parttime';
            }
          });
        }

        resolve({
          year: detectedYear,
          month: detectedMonth,
          employees: newEmployees,
          attendance: newAttendance
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
