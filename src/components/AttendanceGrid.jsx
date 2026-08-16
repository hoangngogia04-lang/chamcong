import React from 'react';
import { getDaysInMonth } from '../utils/excelHelper';
import { Lock } from 'lucide-react';
import { translations } from '../utils/language';

export default function AttendanceGrid({
  year,
  month,
  visibleEmployees = [],
  attendance = {},
  currentUser,
  searchQuery,
  handleCellClick,
  onSelectEmpDetail,
  lang = 'vi'
}) {
  const t = translations[lang] || translations.vi;
  const daysInMonth = getDaysInMonth(year, month);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const formattedMonthStr = String(month).padStart(2, '0');

  // Real-time date constraint
  const todayDate = new Date();
  const currentRealYear = todayDate.getFullYear();
  const currentRealMonth = todayDate.getMonth() + 1;
  const currentRealDay = todayDate.getDate();

  let maxAllowedDay = 31;
  if (year > currentRealYear || (year === currentRealYear && month > currentRealMonth)) {
    maxAllowedDay = 0;
  } else if (year === currentRealYear && month === currentRealMonth) {
    maxAllowedDay = currentRealDay;
  }

  // Filter employees by search query
  const filteredEmployees = visibleEmployees.filter(emp => {
    if (!searchQuery) return true;
    return emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || String(emp.stt) === searchQuery;
  });

  const getDayOfWeekStr = (day) => {
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay();
    const dayNames = lang === 'zh'
      ? ['日', '一', '二', '三', '四', '五', '六']
      : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return { name: dayNames[dayOfWeek], isWeekend: dayOfWeek === 0 || dayOfWeek === 6 };
  };

  const handleCellClickGuard = (emp, dateKey, start, end, start2, end2, day) => {
    if (currentUser?.role === 'employee') return;
    if (day > maxAllowedDay) {
      alert(`⚠️ ${lang === 'zh' ? '無法預先打卡未來日期' : 'Không thể chấm công trước cho ngày tương lai'} (${day}/${month})!`);
      return;
    }
    handleCellClick(emp, dateKey, start, end, start2, end2);
  };

  return (
    <div className="matrix-card">
      <div className="table-responsive">
        <table className="attendance-table">
          <thead>
            {/* Title Header Row */}
            <tr>
              <th colSpan={3 + daysInMonth} style={{ textAlign: 'left', padding: '0.75rem 1rem', background: 'var(--bg-input)', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  📊 {t.attendanceTab} - {t.month} {month}/{year}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '1rem' }}>
                  🔒 {lang === 'zh' ? `從 ${maxAllowedDay + 1} 號起已鎖定` : `Các ngày từ Ngày ${maxAllowedDay + 1} trở đi đã được khóa an toàn`}
                </span>
              </th>
            </tr>

            {/* Column Titles */}
            <tr>
              <th className="col-stt">{t.stt}</th>
              <th className="col-name">{t.employeeName}</th>
              <th className="col-ca">{t.shiftType}</th>

              {daysArray.map((day) => {
                const { name: dayName, isWeekend } = getDayOfWeekStr(day);
                const isLocked = day > maxAllowedDay;
                return (
                  <th
                    key={day}
                    className={`day-col ${isWeekend ? 'weekend-col' : ''}`}
                    style={{ opacity: isLocked ? 0.45 : 1, position: 'relative' }}
                    title={isLocked ? `${t.month} ${day}` : `${t.month} ${day}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                      <span>{day}</span>
                      {isLocked && <Lock size={9} style={{ opacity: 0.7 }} />}
                    </div>
                    <small>{dayName}</small>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={3 + daysInMonth} style={{ padding: '3rem', color: 'var(--text-dim)' }}>
                  {lang === 'zh' ? '查無符合條件的員工' : 'Không tìm thấy nhân viên phù hợp!'}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp, index) => {
                const empAtt = attendance[emp.id] || {};
                const isPartTime = (emp.type || 'fulltime') === 'parttime';

                return (
                  <React.Fragment key={emp.id}>
                    {/* Row 1: Start Time (Giờ Lên Ca) */}
                    <tr className="row-start">
                      <td className="col-stt" rowSpan={2}>
                        {emp.stt || (index + 1)}
                      </td>
                      <td
                        className="col-name"
                        rowSpan={2}
                        onClick={() => onSelectEmpDetail && onSelectEmpDetail(emp)}
                        style={{ cursor: 'pointer' }}
                        title={lang === 'zh' ? `點擊查看 ${emp.name} 的個人詳細班表與考勤` : `Nhấp vào đây để xem toàn bộ lịch ca cá nhân của ${emp.name}`}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', fontWeight: 700 }}>
                            {emp.name} 🔍
                          </span>
                          <span style={{ fontSize: '0.68rem', color: isPartTime ? 'var(--accent-purple)' : 'var(--accent-emerald)' }}>
                            {isPartTime ? t.partTime : t.fullTime}
                          </span>
                        </div>
                      </td>

                      <td className="col-ca" style={{ color: 'var(--accent-emerald)' }}>{t.shiftStart}</td>

                      {daysArray.map((day) => {
                        const dayStr = String(day).padStart(2, '0');
                        const dateKey = `${year}-${formattedMonthStr}-${dayStr}`;
                        const rec = empAtt[dateKey] || {};
                        const isLocked = day > maxAllowedDay;

                        const startVal = rec.start || '';
                        const endVal = rec.end || '';
                        const start2Val = rec.start2 || '';
                        const end2Val = rec.end2 || '';

                        const isOff = startVal === 'OFF';

                        return (
                          <td
                            key={day}
                            className={`cell-time ${!isLocked && currentUser?.role !== 'employee' ? 'editable' : ''}`}
                            onClick={() => handleCellClickGuard(emp, dateKey, startVal, endVal, start2Val, end2Val, day)}
                            style={{ opacity: isLocked ? 0.35 : 1 }}
                          >
                            {isOff ? (
                              <span className="text-off">OFF</span>
                            ) : startVal ? (
                              <span className="text-start-time">{startVal}</span>
                            ) : (
                              <span className="text-empty">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Row 2: End Time (Giờ Xuống Ca) */}
                    <tr className="row-end">
                      <td className="col-ca" style={{ color: 'var(--accent-cyan)' }}>{t.shiftEnd}</td>

                      {daysArray.map((day) => {
                        const dayStr = String(day).padStart(2, '0');
                        const dateKey = `${year}-${formattedMonthStr}-${dayStr}`;
                        const rec = empAtt[dateKey] || {};
                        const isLocked = day > maxAllowedDay;

                        const startVal = rec.start || '';
                        const endVal = rec.end || '';
                        const start2Val = rec.start2 || '';
                        const end2Val = rec.end2 || '';

                        const isOff = startVal === 'OFF';

                        return (
                          <td
                            key={day}
                            className={`cell-time ${!isLocked && currentUser?.role !== 'employee' ? 'editable' : ''}`}
                            onClick={() => handleCellClickGuard(emp, dateKey, startVal, endVal, start2Val, end2Val, day)}
                            style={{ opacity: isLocked ? 0.35 : 1 }}
                          >
                            {isOff ? (
                              <span className="text-off" style={{ opacity: 0.3 }}>-</span>
                            ) : endVal ? (
                              <span className="text-end-time">{endVal}</span>
                            ) : (
                              <span className="text-empty">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
