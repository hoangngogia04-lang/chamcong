import React, { useState } from 'react';
import { Calendar, Users, Plus, Trash2, Check, X, Edit3, Shield, Clock } from 'lucide-react';

export default function WeeklyRosterView({
  year,
  month,
  weekNum,
  branchId,
  branchObj,
  employees = [],
  attendance = {},
  rosterData = {},
  onSaveRoster,
  readOnly = false
}) {
  // Filter employees belonging to this branch
  const branchEmployees = employees.filter(e => e.branchId === branchId);

  // Modal for editing employees in a specific slot
  const [editingSlot, setEditingSlot] = useState(null); // { slotKey: '8h - 13h', dayKey: 'Mon', dayName: 'Thứ 2' }
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);

  const daysList = [
    { key: 'Mon', label: 'Thứ 2' },
    { key: 'Tue', label: 'Thứ 3' },
    { key: 'Wed', label: 'Thứ 4' },
    { key: 'Thu', label: 'Thứ 5' },
    { key: 'Fri', label: 'Thứ 6' },
    { key: 'Sat', label: 'Thứ 7' },
    { key: 'Sun', label: 'Chủ Nhật' }
  ];

  const shiftSlots = [
    { key: '8h - 13h', label: '8h - 13h', bg: '#D32F2F' },
    { key: '13h - 17h', label: '13h - 17h', bg: '#C62828' },
    { key: '17h - 22h', label: '17h - 22h', bg: '#B71C1C' }
  ];

  // Auto-derive roster from attendance data if no custom roster exists for this week
  const hasCustomRoster = Object.values(rosterData).some(slotMap =>
    Object.values(slotMap || {}).some(arr => Array.isArray(arr) && arr.length > 0)
  );

  let effectiveRosterData = rosterData;

  if (!hasCustomRoster && attendance && Object.keys(attendance).length > 0) {
    const derived = {
      '8h - 13h': {},
      '13h - 17h': {},
      '17h - 22h': {}
    };

    const daysInMonth = new Date(year, month, 0).getDate();
    const startDay = (weekNum - 1) * 7 + 1;
    const endDay = Math.min(daysInMonth, weekNum * 7);

    const daysListKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const formattedMonthStr = String(month).padStart(2, '0');

    for (let day = startDay; day <= endDay; day++) {
      const d = new Date(year, month - 1, day);
      const dayOfWeek = d.getDay();
      const dayKey = daysListKeys[dayOfWeek === 0 ? 6 : dayOfWeek - 1];

      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${year}-${formattedMonthStr}-${dayStr}`;

      branchEmployees.forEach(emp => {
        const empAttMap = attendance[emp.id] || {};
        const rec = empAttMap[dateKey];
        if (!rec || !rec.start || rec.start === 'OFF') return;

        const startH = parseInt(rec.start.split(':')[0], 10);
        const endH = parseInt(rec.end.split(':')[0], 10);

        const start2H = rec.start2 ? parseInt(rec.start2.split(':')[0], 10) : null;
        const end2H = rec.end2 ? parseInt(rec.end2.split(':')[0], 10) : null;

        // 8h - 13h slot
        if ((startH < 13 && endH > 8) || (start2H !== null && start2H < 13 && end2H > 8)) {
          if (!derived['8h - 13h'][dayKey]) derived['8h - 13h'][dayKey] = [];
          if (!derived['8h - 13h'][dayKey].includes(emp.id)) derived['8h - 13h'][dayKey].push(emp.id);
        }

        // 13h - 17h slot
        if ((startH < 17 && endH > 13) || (start2H !== null && start2H < 17 && end2H > 13)) {
          if (!derived['13h - 17h'][dayKey]) derived['13h - 17h'][dayKey] = [];
          if (!derived['13h - 17h'][dayKey].includes(emp.id)) derived['13h - 17h'][dayKey].push(emp.id);
        }

        // 17h - 22h slot
        if ((startH >= 17 || endH > 17) || (start2H !== null && (start2H >= 17 || end2H > 17))) {
          if (!derived['17h - 22h'][dayKey]) derived['17h - 22h'][dayKey] = [];
          if (!derived['17h - 22h'][dayKey].includes(emp.id)) derived['17h - 22h'][dayKey].push(emp.id);
        }
      });
    }

    effectiveRosterData = derived;
  }

  const handleOpenEdit = (slotKey, dayKey, dayName) => {
    if (readOnly) return;
    const currentEmpIds = (effectiveRosterData[slotKey] && effectiveRosterData[slotKey][dayKey]) || [];
    setSelectedEmpIds([...currentEmpIds]);
    setEditingSlot({ slotKey, dayKey, dayName });
  };

  const handleToggleEmp = (empId) => {
    if (selectedEmpIds.includes(empId)) {
      setSelectedEmpIds(selectedEmpIds.filter(id => id !== empId));
    } else {
      setSelectedEmpIds([...selectedEmpIds, empId]);
    }
  };

  const handleSaveSlot = () => {
    if (!editingSlot) return;
    const { slotKey, dayKey } = editingSlot;

    const newRosterData = { ...effectiveRosterData };
    if (!newRosterData[slotKey]) newRosterData[slotKey] = {};
    newRosterData[slotKey][dayKey] = selectedEmpIds;

    onSaveRoster(branchId, year, month, weekNum, newRosterData);
    setEditingSlot(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Roster Header Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Calendar size={22} className="text-cyan" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Bảng Sắp Ca Chi Nhánh {branchObj?.name || branchId} (Tuần {weekNum} – Tháng {month}/{year})
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', background: 'var(--bg-input)', padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontWeight: 600 }}>
            👉 Vuốt sang phải để xem đủ Thứ 2 ➔ Chủ Nhật
          </span>

          {!readOnly && (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              💡 Nhấp vào ô để xếp/sửa ca
            </span>
          )}
        </div>
      </div>

      {/* Main Roster Matrix Table - Exactly matching screenshot design */}
      <div className="table-responsive" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid #30363D', overflowX: 'auto', WebkitOverflowScrolling: 'touch', boxShadow: 'var(--shadow-md)' }}>
        <table className="roster-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#0D1117', color: '#FFFFFF', fontFamily: 'sans-serif' }}>
          <thead>
            <tr>
              {/* Top Left Empty Cell - Fixed Sticky */}
              <th style={{ width: '100px', minWidth: '100px', background: '#161B22', border: '1px solid #30363D', position: 'sticky', left: 0, zIndex: 20, boxShadow: '3px 0 8px rgba(0,0,0,0.5)' }}></th>
              {/* Day Headers (Cyan/Teal background #2B7A78) */}
              {daysList.map(d => (
                <th
                  key={d.key}
                  style={{
                    background: '#2B7A78',
                    color: '#FFFFFF',
                    padding: '0.75rem 0.5rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    border: '1px solid #30363D',
                    minWidth: '100px'
                  }}
                >
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {shiftSlots.map(slot => (
              <tr key={slot.key}>
                {/* Left Header Column (Red Background #D32F2F) - STICKY ON HORIZONTAL SCROLL! */}
                <td
                  style={{
                    background: '#D32F2F',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '1rem',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    padding: '0.85rem 0.4rem',
                    border: '1px solid #30363D',
                    whiteSpace: 'nowrap',
                    position: 'sticky',
                    left: 0,
                    zIndex: 10,
                    boxShadow: '3px 0 8px rgba(0,0,0,0.5)',
                    width: '100px',
                    minWidth: '100px'
                  }}
                >
                  {slot.label}
                </td>

                {/* Day Cells */}
                {daysList.map(d => {
                  const empIds = (effectiveRosterData[slot.key] && effectiveRosterData[slot.key][d.key]) || [];
                  const scheduledEmps = empIds.map(id => branchEmployees.find(e => e.id === id)).filter(Boolean);

                  return (
                    <td
                      key={d.key}
                      onClick={() => handleOpenEdit(slot.key, d.key, d.label)}
                      title={readOnly ? undefined : `Sắp ca ${slot.label} - ${d.label}`}
                      style={{
                        background: '#0D1117',
                        border: '1px solid #30363D',
                        verticalAlign: 'top',
                        padding: '0.65rem 0.5rem',
                        cursor: readOnly ? 'default' : 'pointer',
                        transition: 'background 0.2s',
                        height: '110px'
                      }}
                      onMouseEnter={(e) => { if (!readOnly) e.currentTarget.style.background = '#161B22'; }}
                      onMouseLeave={(e) => { if (!readOnly) e.currentTarget.style.background = '#0D1117'; }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minHeight: '100%' }}>
                        {scheduledEmps.length > 0 ? (
                          scheduledEmps.map(emp => (
                            <div
                              key={emp.id}
                              style={{
                                background: '#161B22',
                                color: '#E6EDF3',
                                padding: '0.35rem 0.55rem',
                                borderRadius: '4px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                border: '1px solid #30363D',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <span>{emp.name}</span>
                              <span style={{ fontSize: '0.7rem', color: emp.type === 'parttime' ? '#A371F7' : '#3FB950' }}>
                                {emp.type === 'parttime' ? 'PT' : 'FT'}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: '#484F58', fontSize: '0.8rem', textAlign: 'center', margin: 'auto 0' }}>
                            {readOnly ? '-' : '+ Xếp ca'}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Edit Slot Employees */}
      {editingSlot && (
        <div className="modal-overlay" onClick={() => setEditingSlot(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} className="text-cyan" />
                <span>Sắp Ca {editingSlot.slotKey} ({editingSlot.dayName})</span>
              </h3>
              <button className="modal-close" onClick={() => setEditingSlot(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                Chọn nhân viên của <strong>{branchObj?.name}</strong> cho ca <strong>{editingSlot.slotKey}</strong> vào <strong>{editingSlot.dayName}</strong>:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {branchEmployees.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                    Chi nhánh chưa có nhân viên nào!
                  </div>
                ) : (
                  branchEmployees.map(emp => {
                    const isSelected = selectedEmpIds.includes(emp.id);
                    return (
                      <div
                        key={emp.id}
                        onClick={() => handleToggleEmp(emp.id)}
                        style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                          background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)',
                          color: isSelected ? 'var(--accent-emerald)' : 'var(--text-main)',
                          fontWeight: 600,
                          fontSize: '0.92rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>#{emp.stt} {emp.name}</span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                            [{emp.type === 'parttime' ? 'Part-Time' : 'Full-Time'}]
                          </span>
                        </div>

                        {isSelected && <Check size={18} />}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="modal-footer" style={{ marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingSlot(null)}>
                  Hủy
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSaveSlot}>
                  <Check size={16} />
                  <span>Lưu Phân Ca</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
