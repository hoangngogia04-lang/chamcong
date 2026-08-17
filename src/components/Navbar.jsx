import React from 'react';
import { Calendar, Download, Sun, Moon, Building2, User, LogOut, KeyRound, CalendarDays, Users, Clock, Globe } from 'lucide-react';
import { translations } from '../utils/language';

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
  lang = 'vi',
  setLang,
  onExport,
  onOpenSalaryModal,
  onLogout
}) {
  const isAdmin = currentUser?.role === 'admin';
  const t = translations[lang] || translations.vi;

  return (
    <header className="navbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem', paddingBottom: 0 }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="brand-section">
          <div className="brand-icon">
            <Building2 size={24} />
          </div>
          <div className="brand-title">
            <span>{t.appTitle}</span>
            <small>
              {currentUser ? currentUser.fullName : t.appTitle}
              <span className="mode-badge" style={{ background: isAdmin ? 'rgba(139, 92, 246, 0.2)' : 'rgba(6, 182, 212, 0.2)', color: isAdmin ? 'var(--accent-purple)' : 'var(--accent-cyan)' }}>
                {isAdmin ? t.adminMode : `${t.branch} ${currentUser?.branchId}`}
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
                <option key={m} value={m}>{t.month} {m}</option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>{t.year} {y}</option>
              ))}
            </select>
          </div>

          {/* Export Excel (Download Excel) */}
          <button
            className="btn btn-excel"
            onClick={onExport}
            title="Tải bảng Excel về máy / 匯出 Excel"
          >
            <Download size={16} />
            <span>{t.exportExcel}</span>
          </button>

          {/* Salary Advance Button (Ứng Lương) */}
          <button
            className="btn btn-secondary"
            onClick={onOpenSalaryModal}
            title="Quản Lý Ứng Lương Nhân Viên"
            style={{
              borderColor: 'var(--accent-amber)',
              color: 'var(--accent-amber)',
              background: 'rgba(245, 158, 11, 0.1)',
              fontWeight: 700
            }}
          >
            <span>{t.salaryAdvanceBtn}</span>
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
              title="Đăng xuất tài khoản / 登出"
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem', color: 'var(--accent-rose)', border: 'none' }}
            >
              <LogOut size={14} />
              <span>{t.logout}</span>
            </button>
          </div>

          {/* Language Switcher Toggle Button (🇻🇳 Tiếng Việt ↔ 🇹🇼 繁體中文) */}
          <button
            className="btn btn-secondary"
            onClick={() => setLang(lang === 'vi' ? 'zh' : 'vi')}
            title="Chuyển đổi Ngôn ngữ / 切換語言 (Việt / 繁體中文)"
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              borderColor: 'var(--accent-cyan)',
              background: 'rgba(6, 182, 212, 0.1)'
            }}
          >
            <Globe size={16} />
            <span>{lang === 'vi' ? '🇹🇼 繁體中文' : '🇻🇳 Tiếng Việt'}</span>
          </button>

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
          <span>{t.attendanceTab}</span>
        </button>

        <button
          className={`branch-tab ${activePage === 'shiftEntry' ? 'active' : ''}`}
          onClick={() => setActivePage('shiftEntry')}
          style={{ fontSize: '0.9rem', padding: '0.65rem 1.1rem' }}
        >
          <Clock size={18} />
          <span>{t.shiftEntryTab}</span>
        </button>

        <button
          className={`branch-tab ${activePage === 'weeklyRoster' ? 'active' : ''}`}
          onClick={() => setActivePage('weeklyRoster')}
          style={{ fontSize: '0.9rem', padding: '0.65rem 1.1rem' }}
        >
          <Calendar size={18} />
          <span>{t.weeklyRosterTab}</span>
        </button>

        <button
          className={`branch-tab ${activePage === 'employees' ? 'active' : ''}`}
          onClick={() => setActivePage('employees')}
          style={{ fontSize: '0.9rem', padding: '0.65rem 1.1rem' }}
        >
          <Users size={18} />
          <span>{t.employeesTab}</span>
        </button>

        {isAdmin && (
          <button
            className={`branch-tab ${activePage === 'users' ? 'active' : ''}`}
            onClick={() => setActivePage('users')}
            style={{ fontSize: '0.9rem', padding: '0.65rem 1.1rem' }}
          >
            <KeyRound size={18} />
            <span>{t.usersTab}</span>
          </button>
        )}
      </div>
    </header>
  );
}
