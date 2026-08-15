import React, { useState, useEffect } from 'react';
import { X, Check, Clock, Calendar, AlertCircle, Calculator } from 'lucide-react';
import { calculateFulltimeCombinedShift } from '../pages/ShiftEntryPage';

export default function ShiftEditModal({
  isOpen,
  onClose,
  employee,
  dateKey,
  initialStart = '',
  initialEnd = '',
  initialStart2 = '',
  initialEnd2 = '',
  onSave
}) {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [start2, setStart2] = useState(initialStart2);
  const [end2, setEnd2] = useState(initialEnd2);
  const [errorMsg, setErrorMsg] = useState('');

  const isPartTime = (employee?.type || 'fulltime') === 'parttime';

  useEffect(() => {
    setStart(initialStart);
    setEnd(initialEnd);
    setStart2(initialStart2);
    setEnd2(initialEnd2);
    setErrorMsg('');
  }, [initialStart, initialEnd, initialStart2, initialEnd2, isOpen]);

  if (!isOpen || !employee) return null;

  // Presets matching ShiftEntryPage
  const presets = [
    { label: 'Ca Full (8h - 22h)', start: '08:00', end: '22:00', icon: '⚡' },
    { label: 'Ca Sáng (8h - 17h)', start: '08:00', end: '17:00', icon: '☀️' },
    { label: 'Ca Tối (13h - 22h)', start: '13:00', end: '22:00', icon: '🌙' },
    { label: 'Sáng Ngắn (8h - 13h)', start: '08:00', end: '13:00', icon: '🌅' },
    { label: 'Tối Ngắn (17h - 22h)', start: '17:00', end: '22:00', icon: '🌆' },
    { label: 'Ca Gãy (8h-12h & 17h-22h)', start: '08:00', end: '12:00', start2: '17:00', end2: '22:00', icon: '🔄' },
    { label: 'Ca Gãy (8h-13h & 17h-22h)', start: '08:00', end: '13:00', start2: '17:00', end2: '22:00', icon: '🔄' },
    { label: 'Nghỉ (OFF)', start: 'OFF', end: '', icon: '☕' }
  ];

  const handlePresetClick = (p) => {
    setStart(p.start);
    setEnd(p.end);
    setStart2(p.start2 || '');
    setEnd2(p.end2 || '');
    if (p.start === 'OFF') {
      setStart2('');
      setEnd2('');
    }
    setErrorMsg('');
  };

  // Helper to validate & format time (e.g., '08:00', '8:00', 'OFF')
  const isValidTimeFormat = (val) => {
    if (!val || val.trim().toUpperCase() === 'OFF') return true;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(val.trim());
  };

  // Auto format shorthand time inputs (e.g. "8" -> "08:00", "300" -> "03:00", "1730" -> "17:30")
  const formatTimeOnBlur = (val) => {
    if (!val) return '';
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

    // Number digits like 300 -> 03:00, 1730 -> 17:30
    if (/^\d{3,4}$/.test(clean)) {
      const pad = clean.padStart(4, '0');
      const h = pad.slice(0, 2);
      const m = pad.slice(2, 4);
      return `${h}:${m}`;
    }

    return clean;
  };

  // Live calculation preview for Full-Time combined shift
  const fulltimeCalc = calculateFulltimeCombinedShift(start, end, start2, end2);

  const handleSave = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const formattedStart = formatTimeOnBlur(start);
    const formattedEnd = start.toUpperCase() === 'OFF' ? '' : formatTimeOnBlur(end);
    const formattedStart2 = formatTimeOnBlur(start2);
    const formattedEnd2 = formatTimeOnBlur(end2);

    if (!isValidTimeFormat(formattedStart)) {
      setErrorMsg(`⚠️ Giờ lên ca "${start}" không đúng định dạng! Vui lòng nhập dạng 08:00 hoặc OFF.`);
      return;
    }

    if (formattedStart.toUpperCase() !== 'OFF' && !isValidTimeFormat(formattedEnd)) {
      setErrorMsg(`⚠️ Giờ xuống ca "${end}" không đúng định dạng! Vui lòng nhập dạng 17:00.`);
      return;
    }

    if (formattedStart2 && !isValidTimeFormat(formattedStart2)) {
      setErrorMsg(`⚠️ Giờ lên ca 2 "${start2}" không đúng định dạng!`);
      return;
    }

    if (formattedEnd2 && !isValidTimeFormat(formattedEnd2)) {
      setErrorMsg(`⚠️ Giờ xuống ca 2 "${end2}" không đúng định dạng!`);
      return;
    }

    let saveStart1 = formattedStart;
    let saveEnd1 = formattedEnd;
    let saveStart2 = formattedStart2;
    let saveEnd2 = formattedEnd2;

    // For Full-time split shifts: auto-combine total hours into single shift on main table!
    if (!isPartTime && formattedStart2 && formattedEnd2) {
      const calc = calculateFulltimeCombinedShift(formattedStart, formattedEnd, formattedStart2, formattedEnd2);
      saveStart1 = calc.start;
      saveEnd1 = calc.end;
    }

    onSave(employee.id, dateKey, saveStart1, saveEnd1, saveStart2, saveEnd2);
    onClose();
  };

  const parts = dateKey.split('-');
  const dateFormatted = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateKey;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} className="text-cyan" />
            <span>Chỉnh Sửa Ca - {employee.name}</span>
          </h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', background: 'var(--bg-input)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} className="text-cyan" />
              <span>Ngày: <strong>{dateFormatted}</strong></span>
            </span>

            <span className={`shift-tag ${isPartTime ? 'shift-afternoon' : 'shift-morning'}`}>
              {isPartTime ? '⏱️ Part-Time (Ca Gãy)' : '👔 Full-Time (Chính thức)'}
            </span>
          </div>

          {errorMsg && (
            <div style={{
              padding: '0.75rem 0.9rem',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid var(--accent-rose)',
              color: 'var(--accent-rose)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
              ⚡ Mẫu Ca Nhập Nhanh:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="preset-btn"
                  onClick={() => handlePresetClick(p)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.65rem',
                    fontSize: '0.82rem',
                    background: p.start2 ? 'rgba(139, 92, 246, 0.15)' : undefined,
                    color: p.start2 ? 'var(--accent-purple)' : undefined
                  }}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ca 1 Inputs */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.4rem' }}>
              {isPartTime ? '🟢 Ca 1 (Phần Trước):' : '🟢 Ca 1 / Ca Sáng:'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.82rem' }}>Giờ Lên Ca 1:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: 08:00 hoặc OFF"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  onBlur={() => setStart(formatTimeOnBlur(start))}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.82rem' }}>Giờ Xuống Ca 1:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: 12:00"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  onBlur={() => setEnd(formatTimeOnBlur(end))}
                  disabled={start.toUpperCase() === 'OFF'}
                />
              </div>
            </div>
          </div>

          {/* Ca 2 Inputs */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>🟣 Ca 2 / Ca Gãy:</span>
              {!isPartTime && start2 && end2 && (
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                  💡 Gộp: <strong>{fulltimeCalc.start} - {fulltimeCalc.end}</strong> ({fulltimeCalc.totalHours}h)
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.82rem' }}>Giờ Lên Ca 2 (Tùy chọn):</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: 17:00"
                  value={start2}
                  onChange={(e) => setStart2(e.target.value)}
                  onBlur={() => setStart2(formatTimeOnBlur(start2))}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.82rem' }}>Giờ Xuống Ca 2:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: 22:00"
                  value={end2}
                  onChange={(e) => setEnd2(e.target.value)}
                  onBlur={() => setEnd2(formatTimeOnBlur(end2))}
                />
              </div>
            </div>
          </div>

          {/* Live Full-time Banner */}
          {!isPartTime && start2 && end2 && (
            <div style={{
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid var(--accent-cyan)',
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Calculator size={18} className="text-cyan" />
              <span>
                Full-Time tự động tính <strong>tổng {fulltimeCalc.totalHours} tiếng</strong> ➔ Gộp ca: <strong>{fulltimeCalc.start} - {fulltimeCalc.end}</strong>
              </span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>Lưu Ca Làm</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
