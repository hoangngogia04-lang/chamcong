import React, { useState, useEffect } from 'react';
import { X, Check, Clock, Calendar, AlertCircle, Calculator } from 'lucide-react';
import { calculateFulltimeCombinedShift } from '../pages/ShiftEntryPage';
import { translations } from '../utils/language';

export default function ShiftEditModal({
  isOpen,
  onClose,
  employee,
  dateKey,
  initialStart = '',
  initialEnd = '',
  initialStart2 = '',
  initialEnd2 = '',
  onSave,
  lang = 'vi'
}) {
  const t = translations[lang] || translations.vi;
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
    { label: lang === 'zh' ? '全天班 (8h - 22h)' : 'Ca Full (8h - 22h)', start: '08:00', end: '22:00', icon: '⚡' },
    { label: lang === 'zh' ? '早班 (8h - 17h)' : 'Ca Sáng (8h - 17h)', start: '08:00', end: '17:00', icon: '☀️' },
    { label: lang === 'zh' ? '晚班 (13h - 22h)' : 'Ca Tối (13h - 22h)', start: '13:00', end: '22:00', icon: '🌙' },
    { label: lang === 'zh' ? '早短班 (8h - 13h)' : 'Sáng Ngắn (8h - 13h)', start: '08:00', end: '13:00', icon: '🌅' },
    { label: lang === 'zh' ? '晚短班 (17h - 22h)' : 'Tối Ngắn (17h - 22h)', start: '17:00', end: '22:00', icon: '🌆' },
    { label: lang === 'zh' ? '兩段班 (8h-12h & 17h-22h)' : 'Ca Gãy (8h-12h & 17h-22h)', start: '08:00', end: '12:00', start2: '17:00', end2: '22:00', icon: '🔄' },
    { label: lang === 'zh' ? '兩段班 (8h-13h & 17h-22h)' : 'Ca Gãy (8h-13h & 17h-22h)', start: '08:00', end: '13:00', start2: '17:00', end2: '22:00', icon: '🔄' },
    { label: lang === 'zh' ? '休假 (OFF)' : 'Nghỉ (OFF)', start: 'OFF', end: '', icon: '☕' }
  ];

  const handlePresetClick = (p) => {
    setStart(p.start);
    setEnd(p.end);
    setStart2(p.start2 || '');
    setEnd2(p.end2 || '');
    setErrorMsg('');
  };

  const formatTimeOnBlur = (val) => {
    if (!val) return '';
    const trimmed = val.trim();
    if (trimmed.toUpperCase() === 'OFF') return 'OFF';

    const numbersOnly = trimmed.replace(/\D/g, '');
    if (numbersOnly.length === 1 || numbersOnly.length === 2) {
      const h = parseInt(numbersOnly, 10);
      if (h >= 0 && h <= 23) {
        return `${String(h).padStart(2, '0')}:00`;
      }
    } else if (numbersOnly.length === 3) {
      const h = parseInt(numbersOnly.substring(0, 1), 10);
      const m = parseInt(numbersOnly.substring(1, 3), 10);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
    } else if (numbersOnly.length === 4) {
      const h = parseInt(numbersOnly.substring(0, 2), 10);
      const m = parseInt(numbersOnly.substring(2, 4), 10);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
    }
    return val;
  };

  const handleSave = () => {
    setErrorMsg('');
    const fStart = formatTimeOnBlur(start);
    const fEnd = start.toUpperCase() === 'OFF' ? '' : formatTimeOnBlur(end);
    const fStart2 = formatTimeOnBlur(start2);
    const fEnd2 = formatTimeOnBlur(end2);

    let finalStart1 = fStart;
    let finalEnd1 = fEnd;

    // For Full-time split shifts: auto-combine total hours into single shift on main table!
    if (!isPartTime && fStart2 && fEnd2) {
      const calc = calculateFulltimeCombinedShift(fStart, fEnd, fStart2, fEnd2);
      finalStart1 = calc.start;
      finalEnd1 = calc.end;
    }

    onSave(employee.id, dateKey, finalStart1, finalEnd1, fStart2, fEnd2);
    onClose();
  };

  const formattedDateStr = dateKey ? dateKey.split('-').reverse().join('/') : '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} className="text-cyan" />
            <span>{t.editShift}: {employee.name} ({formattedDateStr})</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
          {errorMsg && (
            <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Preset Buttons */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>
              {t.presetTitle}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetClick(p)}
                  style={{
                    padding: '0.45rem 0.6rem',
                    fontSize: '0.8rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontWeight: 600
                  }}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Shift Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {t.shift1Title}
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>{t.shiftStart}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="08:00 hoặc OFF"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  onBlur={() => setStart(formatTimeOnBlur(start))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>{t.shiftEnd}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="17:00"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  onBlur={() => setEnd(formatTimeOnBlur(end))}
                  disabled={start.toUpperCase() === 'OFF'}
                />
              </div>
            </div>

            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-purple)', marginTop: '0.3rem' }}>
              {t.shift2Title}
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>{t.shiftStart} 2</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="17:00"
                  value={start2}
                  onChange={(e) => setStart2(e.target.value)}
                  onBlur={() => setStart2(formatTimeOnBlur(start2))}
                  disabled={start.toUpperCase() === 'OFF'}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>{t.shiftEnd} 2</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="22:00"
                  value={end2}
                  onChange={(e) => setEnd2(e.target.value)}
                  onBlur={() => setEnd2(formatTimeOnBlur(end2))}
                  disabled={start.toUpperCase() === 'OFF'}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              <Check size={16} />
              <span>{t.save}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
