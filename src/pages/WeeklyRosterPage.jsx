import React, { useState } from 'react';
import { Calendar, Building, ChevronLeft, ChevronRight, Save, CheckCircle2 } from 'lucide-react';
import WeeklyRosterView from '../components/WeeklyRosterView';

export default function WeeklyRosterPage({
  year,
  setYear,
  month,
  setMonth,
  branches = [],
  employees = [],
  currentUser,
  weeklyRosters = {},
  onSaveRoster
}) {
  const isAdmin = currentUser?.role === 'admin';

  // Active Branch state
  const [activeBranchId, setActiveBranchId] = useState(
    isAdmin ? branches[0]?.id || 'CN1' : currentUser?.branchId || 'CN1'
  );

  // Active Week state (Week 1..5)
  const [weekNum, setWeekNum] = useState(1);

  const activeBranch = branches.find(b => b.id === activeBranchId) || branches[0];

  // Roster key: `${branchId}_${year}_${month}_W${weekNum}`
  const rosterKey = `${activeBranchId}_${year}_${month}_W${weekNum}`;
  const currentRosterData = weeklyRosters[rosterKey] || {};

  return (
    <div className="main-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Title */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Calendar size={28} className="text-cyan" />
          <span>Trang Sắp Ca Theo Tuần (Weekly Shift Roster)</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Sắp xếp lịch phân ca tuần cho các chi nhánh (Ca 8h-13h, 13h-17h, 17h-22h). Nhân viên sẽ xem được bảng ca này khi đăng nhập.
        </p>
      </div>

      {/* Control Bar: Branch + Month/Year + Week Picker */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* Branch Selector for Admin */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Building size={20} className="text-cyan" />
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Chi Nhánh:</span>
          {isAdmin ? (
            <select
              className="form-control"
              value={activeBranchId}
              onChange={e => setActiveBranchId(e.target.value)}
              style={{ fontSize: '0.95rem', padding: '0.5rem 0.85rem' }}
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          ) : (
            <span className="shift-tag shift-full" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
              {activeBranch?.name || activeBranchId}
            </span>
          )}
        </div>

        {/* Month / Year & Week Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Interactive Month & Year Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-input)', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <Calendar size={16} className="text-cyan" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tháng:</span>
            <select
              className="form-control"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem', fontWeight: 700, width: 'auto' }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>

            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '0.3rem' }}>Năm:</span>
            <select
              className="form-control"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem', fontWeight: 700, width: 'auto' }}
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>
          </div>

          {/* Week Buttons (Tuần 1 .. Tuần 5) */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {[1, 2, 3, 4, 5].map(w => (
              <button
                key={w}
                type="button"
                onClick={() => setWeekNum(w)}
                className={`btn ${weekNum === w ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem', fontWeight: 700 }}
              >
                Tuần {w}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Roster View */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <WeeklyRosterView
          year={year}
          month={month}
          weekNum={weekNum}
          branchId={activeBranchId}
          branchObj={activeBranch}
          employees={employees}
          rosterData={currentRosterData}
          onSaveRoster={onSaveRoster}
          readOnly={false}
        />
      </div>
    </div>
  );
}
