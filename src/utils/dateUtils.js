/**
 * Precise Calendar Week Helper for Monthly Shift Rosters
 */

export function getWeekDaysForMonthAndWeek(year, month, weekNum) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const mondays = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month - 1, d);
    if (dateObj.getDay() === 1) { // 1 = Monday
      mondays.push(d);
    }
  }

  let startMondayDay = 1;

  if (mondays.length === 0) {
    startMondayDay = 1;
  } else if (weekNum <= mondays.length) {
    startMondayDay = mondays[weekNum - 1];
  } else {
    // If weekNum exceeds mondays count, use last monday + 7 days for subsequent weeks
    startMondayDay = mondays[mondays.length - 1] + (weekNum - mondays.length) * 7;
  }

  const baseDays = [
    { key: 'Mon', label: 'Thứ 2', offset: 0 },
    { key: 'Tue', label: 'Thứ 3', offset: 1 },
    { key: 'Wed', label: 'Thứ 4', offset: 2 },
    { key: 'Thu', label: 'Thứ 5', offset: 3 },
    { key: 'Fri', label: 'Thứ 6', offset: 4 },
    { key: 'Sat', label: 'Thứ 7', offset: 5 },
    { key: 'Sun', label: 'Chủ Nhật', offset: 6 }
  ];

  return baseDays.map(d => {
    const targetDate = new Date(year, month - 1, startMondayDay + d.offset);
    const m = targetDate.getMonth() + 1;
    const dayVal = targetDate.getDate();

    const formattedD = String(dayVal).padStart(2, '0');
    const formattedM = String(m).padStart(2, '0');
    const dateStr = `${formattedD}/${formattedM}`;

    return {
      ...d,
      dayNum: dayVal,
      monthNum: m,
      yearNum: targetDate.getFullYear(),
      dateStr,
      dateKey: `${targetDate.getFullYear()}-${formattedM}-${formattedD}`,
      fullTitle: `${d.label} (${dateStr})`,
      isWeekend: d.key === 'Sat' || d.key === 'Sun'
    };
  });
}

/**
 * Determine which week of the month a specific date falls into
 */
export function getCurrentWeekOfMonth(year = new Date().getFullYear(), month = new Date().getMonth() + 1, day = new Date().getDate()) {
  const targetDate = new Date(year, month - 1, day);
  const targetTime = targetDate.getTime();

  for (let w = 1; w <= 5; w++) {
    const days = getWeekDaysForMonthAndWeek(year, month, w);
    const firstDayTime = new Date(days[0].yearNum, days[0].monthNum - 1, days[0].dayNum, 0, 0, 0).getTime();
    const lastDayTime = new Date(days[6].yearNum, days[6].monthNum - 1, days[6].dayNum, 23, 59, 59).getTime();

    if (targetTime >= firstDayTime && targetTime <= lastDayTime) {
      return w;
    }
  }
  return 1;
}
