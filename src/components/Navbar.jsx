import React from 'react';
import { Calendar, Download, Sun, Moon, Building2, User, LogOut, KeyRound, CalendarDays, Users, Clock } from 'lucide-react';

export default function Navbar({
  year,
  setYear,
  month,
  setMonth,
  currentUser,
  activePage,
  setActivePage,
  theme,
  setTheme,
  onExport,
  onLogout
}) {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="navbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem', paddingBottom: 0 }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="brand-section">
          <div className="brand-icon">
            <Building2 size={24} />
          </div>
          <div className="brand-title">
            <span>Hệ Thống Chấm Công 5 Chi Nhánh</span>
            <small>
              {currentUser ? currentUser.fullName : 'Hệ thống Quản lý Chấm công'}
              <span className="mode-badge" style={{ background: isAdmin ? 'rgba(139, 92, 246, 0.2)' : 'rgba(6, 182, 212, 0.2)', color: isAdmin ? 'var(--accent-purple)' : 'var(--accent-cyan)' }}>
                {isAdmin ? '👑 Admin Mode' : `🏬 Chi nhánh ${currentUser?.branchId}`}
              </span>
            </small>
          </div>
        </div>

        <div className="nav-controls">
          {/* Date Selector */}
          <div className="date-selector">
            <Calendar size={16} className="text-muted" />
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>
          </div>

          {/* Export Excel (Download Excel) */}
          <button
            className="btn btn-excel"
            onClick={onExport}
            title="Tải bảng Excel về máy"
          >
            <Download size={16} />
            <span>Xuất Excel</span>
          </button>

          {/* User Account Info & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-input)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={15} />
              <span>{currentUser?.username}</span>
            </span>
            <button
              className="btn btn-secondary"
              onClick={onLogout}
              title="Đăng xuất tài khoản"
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem', color: 'var(--accent-rose)', border: 'none' }}
            >
              <LogOut size={14} />
              <span>Thoát</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            className="btn btn-secondary"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Đổi giao diện Sáng / Tối"
            style={{ padding: '0.5rem 0.65rem' }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* Main Pages Navigation Bar Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', overflowX: 'auto' }}>
        <button
          className={`branch-tab ${activePage === 'attendance' ? 'active' : ''}`}
          onClick={() => setActivePage('attendance')}
          style={{ fontSize: '0.9rem', padding: '0.65rem 1.1rem' }}
        >
          <CalendarDays size={18} />
          <span>Bảng Chấm Công</span>
        </button>

        <button
          className={`branch-tab ${activePage === 'shiftEntry' ? 'active' : ''}`}
          onClick={() => setActivePage('shiftEntry')}
          style={{ fontSize: '0.9rem', padding: '0.65rem 1.1rem' }}
        >
          <Clock size={18} />
          <span>✍️ Nhập Ca Làm Việc</span>
        </button>

        <button
          className={`branch-tab ${activePage === 'weeklyRoster' ? 'active' : ''}`}
          onClick={() => setActivePage('weeklyRoster')}
          style={{ fontSize: '0.9rem', padding: '0.65rem 1.1rem' }}
        >
          <Calendar size={18} />
          <span>📅 Bảng Sắp Ca Tuần</span>
        </button>

        <button
          className={`branch-tab ${activePage === 'employees' ? 'active' : ''}`}
          onClick={() => setActivePage('employees')}
          style={{ fontSize: '0.9rem', padding: '0.65rem 1.1rem' }}
        >
          <Users size={18} />
          <span>Quản Lý Nhân Viên</span>
        </button>

        {isAdmin && (
          <button
            className={`branch-tab ${activePage === 'users' ? 'active' : ''}`}
            onClick={() => setActivePage('users')}
            style={{ fontSize: '0.9rem', padding: '0.65rem 1.1rem' }}
          >
            <KeyRound size={18} />
            <span>Tài Khoản Quản Lý</span>
          </button>
        )}
      </div>
    </header>
  );
}
