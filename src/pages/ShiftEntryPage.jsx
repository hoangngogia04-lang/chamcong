import React, { useState, useEffect } from 'react';
import { Clock, Calendar, User, Check, CheckCircle2, Sparkles, Info, Lock, AlertCircle } from 'lucide-react';

export default function ShiftEntryPage({
  year,
  month,
  employees,
  branches,
  attendance,
  currentUser,
  onSaveShift
}) {
  const isAdmin = currentUser?.role === 'admin';

  // Filter employees by branch permission
  const visibleEmployees = isAdmin
    ? employees
    : employees.filter(e => e.branchId === currentUser?.branchId);

  const todayDate = new Date();
  const currentRealYear = todayDate.getFullYear();
  const currentRealMonth = todayDate.getMonth() + 1;
  const currentRealDay = todayDate.getDate();

  // Determine maximum allowed day for the selected month/year
  let maxAllowedDay = 31;
  if (year > currentRealYear || (year === currentRealYear && month > currentRealMonth)) {
    maxAllowedDay = 0;
  } else if (year === currentRealYear && month === currentRealMonth) {
    maxAllowedDay = currentRealDay;
  }

  const [selectedEmpId, setSelectedEmpId] = useState(visibleEmployees[0]?.id || '');
  const [selectedDay, setSelectedDay] = useState(Math.min(currentRealDay, maxAllowedDay || 1));
  const [shiftStart, setShiftStart] = useState('08:00');
  const [shiftEnd, setShiftEnd] = useState('17:00');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const daysInMonth = new Date(year, month, 0).getDate();
  const selectedEmp = employees.find(e => e.id === selectedEmpId);
  const formattedMonthStr = String(month).padStart(2, '0');

  // Auto-fill existing shift when Employee or Day changes
  useEffect(() => {
    if (!selectedEmpId || !selectedDay) return;

    const formattedDay = String(selectedDay).padStart(2, '0');
    const dateKey = `${year}-${formattedMonthStr}-${formattedDay}`;

    const empAttMap = attendance[selectedEmpId] || {};
    const existingRec = empAttMap[dateKey];

    if (existingRec && (existingRec.start || existingRec.end)) {
      setShiftStart(existingRec.start || '');
      setShiftEnd(existingRec.end || '');
    } else {
      setShiftStart('08:00');
      setShiftEnd('17:00');
    }
    setErrorMsg('');
  }, [selectedEmpId, selectedDay, year, month, attendance]);

  // Fixed Presets with clean emoji icons
  const presets = [
    { label: 'Ca Full (8h - 22h)', start: '08:00', end: '22:00', icon: '⚡' },
    { label: 'Ca Sáng (8h - 17h)', start: '08:00', end: '17:00', icon: '☀️' },
    { label: 'Ca Tối (13h - 22h)', start: '13:00', end: '22:00', icon: '🌙' },
    { label: 'Sáng Ngắn (8h - 13h)', start: '08:00', end: '13:00', icon: '🌅' },
    { label: 'Tối Ngắn (17h - 22h)', start: '17:00', end: '22:00', icon: '🌆' },
    { label: 'Nghỉ (OFF)', start: 'OFF', end: '', icon: '☕' }
  ];

  const handleApplyPreset = (p) => {
    setShiftStart(p.start);
    setShiftEnd(p.end);
    setErrorMsg('');
  };

  // Helper to validate & format time (e.g., '08:00', '8:00', 'OFF')
  const isValidTimeFormat = (val) => {
    if (!val || val.trim().toUpperCase() === 'OFF') return true;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(val.trim());
  };

  // Auto format shorthand time inputs (e.g. "8" -> "08:00", "800" -> "08:00", "1730" -> "17:30")
  const formatTimeOnBlur = (val) => {
    let clean = val.trim().toUpperCase();
    if (clean === 'OFF' || !clean) return clean;

    // Direct match HH:MM
    if (/^\d{1,2}:\d{2}$/.test(clean)) {
      const parts = clean.split(':');
      const h = String(parts[0]).padStart(2, '0');
      const m = String(parts[1]).padStart(2, '0');
      return `${h}:${m}`;
    }

    // Number digits like 8 -> 08:00, 17 -> 17:00
    if (/^\d{1,2}$/.test(clean)) {
      const h = String(clean).padStart(2, '0');
      return `${h}:00`;
    }

    // Number digits like 830 -> 08:30, 1730 -> 17:30
    if (/^\d{3,4}$/.test(clean)) {
      const pad = clean.padStart(4, '0');
      const h = pad.slice(0, 2);
      const m = pad.slice(2, 4);
      return `${h}:${m}`;
    }

    return clean;
  };

  const handleSave = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedEmpId) {
      setErrorMsg('Vui lòng chọn nhân viên!');
      return;
    }

    if (selectedDay > maxAllowedDay) {
      setErrorMsg(`⚠️ Không thể chấm công trước cho ngày tương lai (Ngày ${selectedDay})!`);
      return;
    }

    // Validate Time Formats
    const formattedStart = formatTimeOnBlur(shiftStart);
    const formattedEnd = shiftStart.toUpperCase() === 'OFF' ? '' : formatTimeOnBlur(shiftEnd);

    if (!isValidTimeFormat(formattedStart)) {
      setErrorMsg(`⚠️ Giờ lên ca "${shiftStart}" không đúng định dạng! Vui lòng nhập dạng 08:00 hoặc OFF.`);
      return;
    }

    if (formattedStart.toUpperCase() !== 'OFF' && !isValidTimeFormat(formattedEnd)) {
      setErrorMsg(`⚠️ Giờ xuống ca "${shiftEnd}" không đúng định dạng! Vui lòng nhập dạng 17:00.`);
      return;
    }

    setShiftStart(formattedStart);
    setShiftEnd(formattedEnd);

    const formattedDay = String(selectedDay).padStart(2, '0');
    const dateKey = `${year}-${formattedMonthStr}-${formattedDay}`;

    onSaveShift(selectedEmpId, dateKey, formattedStart, formattedEnd);

    const empName = selectedEmp ? selectedEmp.name : 'Nhân viên';
    const timeStr = formattedStart === 'OFF' ? 'Nghỉ (OFF)' : `${formattedStart} - ${formattedEnd}`;
    setSuccessMsg(`✅ Đã lưu ca làm việc cho ${empName} (Ngày ${selectedDay}/${month}): ${timeStr}`);

    setTimeout(() => {
      setSuccessMsg('');
    }, 3500);
  };

  // Existing shift info for currently selected day
  const currentFormattedDay = String(selectedDay).padStart(2, '0');
  const currentDateKey = `${year}-${formattedMonthStr}-${currentFormattedDay}`;
  const empAttMap = attendance[selectedEmpId] || {};
  const currentExistingRec = empAttMap[currentDateKey];
  const hasExistingShift = currentExistingRec && (currentExistingRec.start || currentExistingRec.end);

  return (
    <div className="main-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Title */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Clock size={28} className="text-cyan" />
          <span>Trang Nhập Ca Làm Việc Cho Nhân Viên</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Chỉ cho phép chấm công từ ngày hôm nay (Ngày {currentRealDay}) trở về trước. Các ngày tương lai đã được khóa an toàn.
        </p>
      </div>

      {errorMsg && (
        <div style={{
          padding: '1rem 1.25rem',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid var(--accent-rose)',
          color: 'var(--accent-rose)',
          borderRadius: 'var(--radius-lg)',
          fontWeight: 600,
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <AlertCircle size={22} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          padding: '1rem 1.25rem',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid var(--accent-emerald)',
          color: 'var(--accent-emerald)',
          borderRadius: 'var(--radius-lg)',
          fontWeight: 600,
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <CheckCircle2 size={22} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Entry Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        boxShadow: 'var(--shadow-md)'
      }}>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Step 1: Choose Employee */}
          <div className="form-group">
            <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={18} />
              <span>1. Chọn Nhân Viên:</span>
            </label>
            <select
              className="form-control"
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              style={{ fontSize: '1rem', padding: '0.8rem' }}
            >
              {visibleEmployees.map(emp => {
                const br = branches.find(b => b.id === emp.branchId);
                return (
                  <option key={emp.id} value={emp.id}>
                    {emp.stt}. {emp.name} ({br ? br.name : emp.branchId})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Step 2: Choose Date */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={18} />
                <span>2. Chọn Ngày Chấm Công (Tháng {month}/{year}):</span>
              </label>

              {/* Live Info Banner for Selected Day */}
              <div style={{
                fontSize: '0.88rem',
                color: hasExistingShift ? 'var(--accent-cyan)' : 'var(--text-muted)',
                background: 'var(--bg-input)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <Info size={15} />
                <span>
                  {hasExistingShift
                    ? `Ca ngày ${selectedDay}/${month}: ${currentExistingRec.start === 'OFF' ? 'Nghỉ (OFF)' : `${currentExistingRec.start} - ${currentExistingRec.end}`}`
                    : `Ngày ${selectedDay}/${month}: Chưa có ca`}
                </span>
              </div>
            </div>

            {/* Days Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat( auto-fill, minmax(52px, 1fr) )', gap: '0.45rem', marginTop: '0.65rem' }}>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const isSelected = selectedDay === day;
                const isFutureDay = day > maxAllowedDay;
                const formattedDay = String(day).padStart(2, '0');
                const dateKey = `${year}-${formattedMonthStr}-${formattedDay}`;
                const dayRec = empAttMap[dateKey];
                const dayHasShift = dayRec && (dayRec.start || dayRec.end);

                return (
                  <button
                    type="button"
                    key={day}
                    disabled={isFutureDay}
                    onClick={() => !isFutureDay && setSelectedDay(day)}
                    title={isFutureDay ? `Ngày ${day} chưa tới (Không thể chấm trước)` : `Chấm công ngày ${day}`}
                    style={{
                      padding: '0.55rem 0.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected
                        ? '2px solid var(--accent-blue)'
                        : (isFutureDay ? '1px dashed var(--border-color)' : (dayHasShift ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)')),
                      background: isSelected
                        ? 'var(--accent-blue)'
                        : (isFutureDay ? 'rgba(255, 255, 255, 0.03)' : (dayHasShift ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)')),
                      color: isSelected
                        ? '#fff'
                        : (isFutureDay ? 'var(--text-dim)' : (dayHasShift ? 'var(--accent-cyan)' : 'var(--text-main)')),
                      opacity: isFutureDay ? 0.45 : 1,
                      cursor: isFutureDay ? 'not-allowed' : 'pointer',
                      fontWeight: isSelected || dayHasShift ? 700 : 500,
                      fontSize: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      position: 'relative'
                    }}
                  >
                    <span>N{day}</span>
                    {isFutureDay ? (
                      <Lock size={10} style={{ opacity: 0.6 }} />
                    ) : dayHasShift && (
                      <span style={{ fontSize: '0.62rem', opacity: isSelected ? 0.9 : 0.8, whiteSpace: 'nowrap' }}>
                        {dayRec.start === 'OFF' ? 'OFF' : dayRec.start}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Choose Shift Preset */}
          <div className="form-group">
            <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={18} />
              <span>3. Nút Chọn Ca Nhanh:</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.4rem' }}>
              {presets.map((p, idx) => {
                const isCurrent = shiftStart === p.start && shiftEnd === p.end;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleApplyPreset(p)}
                    style={{
                      padding: '0.65rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: isCurrent ? '2px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                      background: isCurrent ? 'rgba(16, 185, 129, 0.2)' : (p.start === '08:00' && p.end === '22:00' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-input)'),
                      color: isCurrent ? 'var(--accent-emerald)' : (p.start === '08:00' && p.end === '22:00' ? 'var(--accent-amber)' : 'var(--text-main)'),
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Inputs with Constraints & Auto Format */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label>Giờ Lên Ca (Định dạng HH:MM hoặc OFF):</label>
              <input
                type="text"
                className="form-control"
                placeholder="VD: 08:00 hoặc OFF"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                onBlur={() => setShiftStart(formatTimeOnBlur(shiftStart))}
                style={{ fontSize: '1rem', padding: '0.75rem' }}
              />
              <small style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                💡 Gõ số 8 ➔ tự chuyển 08:00 | Gõ 1730 ➔ tự chuyển 17:30
              </small>
            </div>

            <div className="form-group">
              <label>Giờ Xuống Ca (Định dạng HH:MM):</label>
              <input
                type="text"
                className="form-control"
                placeholder="VD: 17:00"
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                onBlur={() => setShiftEnd(formatTimeOnBlur(shiftEnd))}
                disabled={shiftStart.toUpperCase() === 'OFF'}
                style={{ fontSize: '1rem', padding: '0.75rem' }}
              />
              <small style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                💡 Gõ số 22 ➔ tự chuyển 22:00 | Gõ 1300 ➔ tự chuyển 13:00
              </small>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0.9rem', fontSize: '1.05rem', fontWeight: 700, marginTop: '0.5rem', width: '100%' }}
          >
            <Check size={20} />
            <span>Lưu Ca Làm Việc</span>
          </button>
        </form>
      </div>
    </div>
  );
}
