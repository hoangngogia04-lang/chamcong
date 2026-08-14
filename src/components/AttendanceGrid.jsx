import React from 'react';
import { getDaysInMonth } from '../utils/excelHelper';
import { Lock } from 'lucide-react';

export default function AttendanceGrid({
  year,
  month,
  employees,
  attendance,
  branches,
  isAdmin,
  searchQuery,
  onCellClick
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const formattedMonthStr = String(month).padStart(2, '0');

  // Real-time date constraint (Option B: Lock future days)
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
  const filteredEmployees = employees.filter(emp => {
    if (!searchQuery) return true;
    return emp.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getDayOfWeekStr = (day) => {
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay();
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return { name: dayNames[dayOfWeek], isWeekend: dayOfWeek === 0 || dayOfWeek === 6 };
  };

  const handleCellClickGuard = (emp, dateKey, start, end, day) => {
    if (!isAdmin) return;
    if (day > maxAllowedDay) {
      alert(`⚠️ Không thể chấm công trước cho ngày tương lai (Ngày ${day}/${month})!`);
      return;
    }
    onCellClick(emp, dateKey, start, end);
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
                  📊 GIẤY LÊN CA - THÁNG {month}/{year} (上班月表)
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '1rem' }}>
                  🔒 Chế độ B: Các ngày từ Ngày {maxAllowedDay + 1} trở đi đã được khóa an toàn
                </span>
              </th>
            </tr>

            {/* Column Titles */}
            <tr>
              <th className="col-stt">STT</th>
              <th className="col-name">TÊN NHÂN VIÊN</th>
              <th className="col-ca">CA</th>

              {daysArray.map((day) => {
                const { name: dayName, isWeekend } = getDayOfWeekStr(day);
                const isLocked = day > maxAllowedDay;
                return (
                  <th
                    key={day}
                    className={`day-col ${isWeekend ? 'weekend-col' : ''}`}
                    style={{ opacity: isLocked ? 0.45 : 1, position: 'relative' }}
                    title={isLocked ? `Ngày ${day} chưa tới (Đã khóa)` : `Ngày ${day}`}
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
                  Không tìm thấy nhân viên phù hợp!
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp, index) => {
                const empAtt = attendance[emp.id] || {};
                const branchObj = branches.find(b => b.id === emp.branchId);

                return (
                  <React.Fragment key={emp.id}>
                    {/* Row 1: Start Time (Giờ Lên Ca) */}
                    <tr className="row-start">
                      <td className="col-stt" rowSpan={2}>
                        {emp.stt || (index + 1)}
                      </td>
                      <td className="col-name" rowSpan={2}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{emp.name}</span>
                          <span className="branch-tag">
                            {branchObj?.code || emp.branchId}
                          </span>
                        </div>
                      </td>
                      <td className="col-ca" style={{ color: 'var(--accent-emerald)' }}>
                        Lên Ca
                      </td>

                      {daysArray.map((day) => {
                        const isLocked = day > maxAllowedDay;
                        const dayStr = String(day).padStart(2, '0');
                        const dateKey = `${year}-${formattedMonthStr}-${dayStr}`;
                        const record = empAtt[dateKey] || {};
                        const val = record.start || '';
                        const isOff = val === 'OFF';

                        return (
                          <td
                            key={day}
                            className={`cell-time ${isAdmin && !isLocked ? 'editable' : ''}`}
                            onClick={() => handleCellClickGuard(emp, dateKey, record.start, record.end, day)}
                            title={isLocked ? `Ngày ${day} chưa tới (Đã khóa)` : 'Click để sửa ca làm'}
                            style={{
                              opacity: isLocked ? 0.35 : 1,
                              background: isLocked ? 'rgba(0, 0, 0, 0.04)' : undefined,
                              cursor: isLocked ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {isLocked ? (
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>🔒</span>
                            ) : isOff ? (
                              <span className="text-off">OFF</span>
                            ) : val ? (
                              <span className="text-start-time">{val}</span>
                            ) : (
                              <span className="text-empty">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Row 2: End Time (Giờ Xuống Ca) */}
                    <tr className="row-end">
                      <td className="col-ca" style={{ color: 'var(--accent-cyan)' }}>
                        Xuống Ca
                      </td>

                      {daysArray.map((day) => {
                        const isLocked = day > maxAllowedDay;
                        const dayStr = String(day).padStart(2, '0');
                        const dateKey = `${year}-${formattedMonthStr}-${dayStr}`;
                        const record = empAtt[dateKey] || {};
                        const val = record.end || '';
                        const isOff = record.start === 'OFF';

                        return (
                          <td
                            key={day}
                            className={`cell-time ${isAdmin && !isLocked ? 'editable' : ''}`}
                            onClick={() => handleCellClickGuard(emp, dateKey, record.start, record.end, day)}
                            title={isLocked ? `Ngày ${day} chưa tới (Đã khóa)` : 'Click để sửa ca làm'}
                            style={{
                              opacity: isLocked ? 0.35 : 1,
                              background: isLocked ? 'rgba(0, 0, 0, 0.04)' : undefined,
                              cursor: isLocked ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {isLocked ? (
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>🔒</span>
                            ) : isOff ? (
                              <span className="text-off" style={{ opacity: 0.3 }}>-</span>
                            ) : val ? (
                              <span className="text-end-time">{val}</span>
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

      {/* Legend & Footer */}
      <div className="table-footer">
        <div className="legend-list">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: 'var(--accent-emerald)' }}></span>
            <span>Giờ lên ca</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: 'var(--accent-cyan)' }}></span>
            <span>Giờ xuống ca</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: 'var(--accent-rose)' }}></span>
            <span>Nghỉ (OFF)</span>
          </div>
          <div className="legend-item">
            <Lock size={12} className="text-muted" />
            <span>Ngày chưa tới (Khóa)</span>
          </div>
        </div>

        <div>
          Tổng hiển thị: <strong>{filteredEmployees.length}</strong> / {employees.length} nhân viên
        </div>
      </div>
    </div>
  );
}
