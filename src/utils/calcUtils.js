/**
 * Precision Calculation Utility for Employee Attendance (Full-Time vs Part-Time)
 * Standard Full-Time shift = 9 hours (540 minutes).
 * Any hours worked beyond 9h/day count as Overtime (Tăng Ca).
 */

/**
 * Calculates merged shift time for Full-Time split shifts (e.g. 8h-13h + 17h-22h = 10h work -> 08:00 - 18:00)
 */
export function getMergedFullTimeShift(start, end, start2, end2) {
  if (!start || start === 'OFF') return { start: 'OFF', end: '' };
  if (!start2 || !end2) return { start, end };

  let totalMins = 0;
  if (typeof start === 'string' && typeof end === 'string' && start.includes(':') && end.includes(':')) {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
      totalMins += Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1));
    }
  }

  if (typeof start2 === 'string' && typeof end2 === 'string' && start2.includes(':') && end2.includes(':')) {
    const [h1, m1] = start2.split(':').map(Number);
    const [h2, m2] = end2.split(':').map(Number);
    if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
      totalMins += Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1));
    }
  }

  if (totalMins <= 0) return { start, end };

  const [sH, sM] = start.split(':').map(Number);
  const totalEndMins = (sH * 60 + sM) + totalMins;
  const eH = String(Math.floor(totalEndMins / 60) % 24).padStart(2, '0');
  const eM = String(totalEndMins % 60).padStart(2, '0');

  return {
    start,
    end: `${eH}:${eM}`
  };
}

export function calculateEmployeeMonthlyStats(emp, attendanceMap = {}, daysArray = [], year, month) {
  const isPartTime = (emp?.type || 'fulltime') === 'parttime';
  const formattedMonthStr = String(month).padStart(2, '0');

  let totalWorkingDays = 0;
  let totalOffDays = 0;
  let totalMinutesWorked = 0;
  let totalOvertimeMinutes = 0;

  try {
    const empAttMap = (attendanceMap && emp?.id && attendanceMap[emp.id]) ? attendanceMap[emp.id] : (attendanceMap || {});

    daysArray.forEach(day => {
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${year}-${formattedMonthStr}-${dayStr}`;
      const rec = empAttMap[dateKey];

      if (!rec || !rec.start) return;

      if (rec.start === 'OFF') {
        totalOffDays++;
      } else {
        let dayMinutes = 0;

        // Ca 1 duration
        if (rec.start && rec.end && typeof rec.start === 'string' && typeof rec.end === 'string' && rec.start.includes(':') && rec.end.includes(':')) {
          const [h1, m1] = rec.start.split(':').map(Number);
          const [h2, m2] = rec.end.split(':').map(Number);
          if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
            const dur1 = Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1));
            dayMinutes += dur1;
          }
        }

        // Ca 2 duration (Split shift / Ca Gãy)
        if (rec.start2 && rec.end2 && typeof rec.start2 === 'string' && typeof rec.end2 === 'string' && rec.start2.includes(':') && rec.end2.includes(':')) {
          const [h1, m1] = rec.start2.split(':').map(Number);
          const [h2, m2] = rec.end2.split(':').map(Number);
          if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
            const dur2 = Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1));
            dayMinutes += dur2;
          }
        }

        if (dayMinutes > 0) {
          totalMinutesWorked += dayMinutes;

          if (isPartTime) {
            totalWorkingDays += 1;
          } else {
            // Full-Time Logic: Standard shift = 9h (540 mins)
            if (dayMinutes >= 540) {
              totalWorkingDays += 1;
              totalOvertimeMinutes += (dayMinutes - 540);
            } else {
              // Worked less than 9h (e.g. 5h shift => 5/9 work day)
              const partialDay = Math.round((dayMinutes / 540) * 100) / 100;
              totalWorkingDays += partialDay;
            }
          }
        }
      }
    });
  } catch (err) {
    console.error('Error calculating monthly stats:', err);
  }

  const totalHoursWorked = (totalMinutesWorked / 60).toFixed(1);
  const totalOvertimeHours = (totalOvertimeMinutes / 60).toFixed(1);

  return {
    isPartTime,
    totalWorkingDays: isPartTime ? totalWorkingDays : Math.round(totalWorkingDays * 10) / 10,
    totalOffDays,
    totalHoursWorked,
    totalOvertimeHours
  };
}
