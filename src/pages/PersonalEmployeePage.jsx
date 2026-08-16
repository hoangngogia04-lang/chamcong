import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, LogOut, Sun, Moon, CheckCircle, Coffee, Shield, Building, Award, Sparkles, AlertCircle, ChevronLeft, ChevronRight, Lock, Settings, Key, Edit3, X, Check, Grid } from 'lucide-react';
import { getDaysInMonth } from '../utils/excelHelper';
import WeeklyRosterView from '../components/WeeklyRosterView';

export default function PersonalEmployeePage({
  year,
  setYear,
  month,
  setMonth,
  currentUser,
  employees = [],
  attendance = {},
  branches = [],
  weeklyRosters = {},
  theme,
  setTheme,
  onLogout,
  onUpdateUser,
  onUpdateEmployee
}) {
  const getCurrentWeekOfMonth = (d = new Date().getDate()) => {
    if (d <= 7) return 1;
    if (d <= 14) return 2;
    if (d <= 21) return 3;
    if (d <= 28) return 4;
    return 5;
  };

  const [selectedView, setSelectedView] = useState('weeklyRoster'); // Mặc định vào thẳng Bảng Sắp Ca Chi Nhánh khi nhân viên đăng nhập!
  const [weekNum, setWeekNum] = useState(() => getCurrentWeekOfMonth()); // Mặc định tự động chọn Tuần hiện tại!

  // Find linked employee record safely
  const matchedEmp = employees.find(e => e.id === currentUser?.employeeId || (e.name && currentUser?.fullName && e.name.toLowerCase() === currentUser.fullName.toLowerCase()));
  const employee = matchedEmp || {
    id: currentUser?.employeeId || 'emp_1',
    name: currentUser?.fullName || 'Nhân Viên',
    branchId: currentUser?.branchId || 'CN1',
    type: 'fulltime',
    stt: 1
  };

  const branchObj = branches.find(b => b.id === employee.branchId) || { name: 'Chi Nhánh' };

  // Profile Settings Modal States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState(employee?.name || currentUser?.fullName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  useEffect(() => {
    setEditName(employee?.name || currentUser?.fullName || '');
  }, [employee, currentUser]);

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

  const isPartTime = (employee?.type || 'fulltime') === 'parttime';

  // Calculate monthly stats for this employee
  const empAttMap = (attendance && attendance[employee.id]) || {};
  let totalWorkingDays = 0;
  let totalOffDays = 0;
  let totalMinutesWorked = 0;

  daysArray.forEach(day => {
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${year}-${formattedMonthStr}-${dayStr}`;
    const rec = empAttMap[dateKey];

    if (rec && rec.start) {
      if (rec.start === 'OFF') {
        totalOffDays++;
      } else {
        totalWorkingDays++;

        // Calculate hours
        if (rec.start && rec.end && rec.start.includes(':') && rec.end.includes(':')) {
          const [h1, m1] = rec.start.split(':').map(Number);
          const [h2, m2] = rec.end.split(':').map(Number);
          const dur1 = Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1));
          totalMinutesWorked += dur1;
        }

        if (isPartTime && rec.start2 && rec.end2 && rec.start2.includes(':') && rec.end2.includes(':')) {
          const [h1, m1] = rec.start2.split(':').map(Number);
          const [h2, m2] = rec.end2.split(':').map(Number);
          const dur2 = Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1));
          totalMinutesWorked += dur2;
        }
      }
    }
  });

  const totalHoursWorked = (totalMinutesWorked / 60).toFixed(1);

  const getDayOfWeekStr = (day) => {
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay();
    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return { name: dayNames[dayOfWeek], isWeekend: dayOfWeek === 0 || dayOfWeek === 6 };
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileErrorMsg('');
    setProfileSuccessMsg('');

    if (!editName.trim()) {
      setProfileErrorMsg('Họ tên không được để trống!');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setProfileErrorMsg('Mật khẩu mới và Nhập lại mật khẩu không khớp!');
      return;
    }

    const updatedPass = newPassword.trim() ? newPassword.trim() : (currentUser?.password || '123');

    if (onUpdateUser && currentUser?.id) {
      onUpdateUser(currentUser.id, {
        fullName: editName.trim(),
        password: updatedPass
      });
    }

    if (onUpdateEmployee && employee?.id) {
      onUpdateEmployee(employee.id, {
        name: editName.trim()
      });
    }

    setProfileSuccessMsg('✅ Đã cập nhật Tên hiển thị và Mật khẩu thành công!');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => {
      setProfileSuccessMsg('');
      setIsProfileModalOpen(false);
    }, 1800);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header className="navbar" style={{ padding: '0.85rem 1.5rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="brand-icon" style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)' }}>
            <Building size={24} />
          </div>
          <div>
            <h1 className="brand-title" style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Cổng Thông Tin Nhận Ca Cá Nhân
            </h1>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Dành riêng cho Nhân viên {employee?.name || currentUser?.fullName}
            </small>
          </div>
        </div>

        {/* Date Selector & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="date-selector" style={{ background: 'var(--bg-input)', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button onClick={handlePrevMonth} className="btn btn-secondary" style={{ padding: '0.2rem 0.4rem' }} title="Tháng trước">
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', padding: '0 0.4rem' }}>
              Tháng {month} / {year}
            </span>
            <button onClick={handleNextMonth} className="btn btn-secondary" style={{ padding: '0.2rem 0.4rem' }} title="Tháng sau">
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => setIsProfileModalOpen(true)}
            title="Đổi tên hoặc mật khẩu cá nhân"
            style={{ padding: '0.45rem 0.75rem', color: 'var(--accent-purple)', fontWeight: 600 }}
          >
            <Settings size={16} />
            <span>Sửa Tài Khoản</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Đổi giao diện Sáng / Tối"
            style={{ padding: '0.45rem 0.75rem' }}
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber" /> : <Moon size={18} className="text-cyan" />}
          </button>

          <button
            className="btn btn-secondary"
            onClick={onLogout}
            style={{ padding: '0.45rem 0.85rem', color: 'var(--accent-rose)', fontWeight: 600 }}
          >
            <LogOut size={16} />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Employee Profile Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--accent-blue)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              fontSize: '1.8rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              {employee?.name ? employee.name.charAt(0).toUpperCase() : 'N'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  {employee?.name || currentUser?.fullName}
                </h2>
                <span className="shift-tag shift-full" style={{ fontSize: '0.8rem' }}>
                  {branchObj?.name || 'Chi nhánh'}
                </span>
                <span className={`shift-tag ${isPartTime ? 'shift-afternoon' : 'shift-morning'}`} style={{ fontSize: '0.8rem' }}>
                  {isPartTime ? '⏱️ Part-Time (Ca Gãy)' : '👔 Full-Time (Chính Thức)'}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.35rem', margin: 0 }}>
                STT: <strong>#{employee?.stt || 1}</strong> | Mã Tài Khoản: <code>@{currentUser?.username}</code>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedView('weeklyRoster')}
              className={`btn ${selectedView === 'weeklyRoster' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem', fontWeight: 700 }}
            >
              📅 Bảng Sắp Ca Chi Nhánh
            </button>
            <button
              onClick={() => setSelectedView('list')}
              className={`btn ${selectedView === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
            >
              📱 Dạng Danh Sách
            </button>
            <button
              onClick={() => setSelectedView('table')}
              className={`btn ${selectedView === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
            >
              📊 Dạng Matrix
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Số Ca Đi Làm</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>{totalWorkingDays} <small style={{ fontSize: '0.8rem', fontWeight: 500 }}>ca</small></div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coffee size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Số Ngày Nghỉ (OFF)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>{totalOffDays} <small style={{ fontSize: '0.8rem', fontWeight: 500 }}>ngày</small></div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Tổng Giờ Làm</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>{totalHoursWorked} <small style={{ fontSize: '0.8rem', fontWeight: 500 }}>tiếng</small></div>
            </div>
          </div>
        </div>

        {/* View 0: Branch Weekly Roster View */}
        {selectedView === 'weeklyRoster' && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                Bảng Sắp Ca Chi Nhánh {branchObj?.name} (Dành Riêng Cho Nhân Viên)
              </span>

              {/* Week Picker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chọn Tuần:</span>
                {[1, 2, 3, 4, 5].map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeekNum(w)}
                    className={`btn ${weekNum === w ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', fontWeight: 700 }}
                  >
                    Tuần {w}
                  </button>
                ))}
              </div>
            </div>

            <WeeklyRosterView
              year={year}
              month={month}
              weekNum={weekNum}
              branchId={employee.branchId}
              branchObj={branchObj}
              employees={employees}
              rosterData={(weeklyRosters && weeklyRosters[`${employee.branchId}_${year}_${month}_W${weekNum}`]) || {}}
              readOnly={true}
            />
          </div>
        )}

        {/* View 1: Mobile-friendly List Card View */}
        {selectedView === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} className="text-cyan" />
              <span>Lịch Ca Làm Việc Chi Tiết - Tháng {month}/{year}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
              {daysArray.map(day => {
                const { name: dayName, isWeekend } = getDayOfWeekStr(day);
                const isLocked = day > maxAllowedDay;
                const isToday = year === currentRealYear && month === currentRealMonth && day === currentRealDay;
                const dayStr = String(day).padStart(2, '0');
                const dateKey = `${year}-${formattedMonthStr}-${dayStr}`;
                const rec = empAttMap[dateKey] || {};

                const startVal = rec.start || '';
                const endVal = rec.end || '';
                const start2Val = rec.start2 || '';
                const end2Val = rec.end2 || '';

                const isOff = startVal === 'OFF';
                const hasShift = Boolean(startVal || endVal);

                return (
                  <div
                    key={day}
                    style={{
                      background: isToday ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-card)',
                      border: isToday ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                      opacity: isLocked ? 0.6 : 1,
                      boxShadow: 'var(--shadow-sm)',
                      position: 'relative'
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: isWeekend ? 'var(--accent-rose)' : 'var(--text-main)'
                        }}>
                          Ngày {day} ({dayName})
                        </span>
                        {isToday && (
                          <span style={{ background: 'var(--accent-cyan)', color: '#fff', fontSize: '0.68rem', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
                            Hôm nay
                          </span>
                        )}
                      </div>

                      {isLocked ? (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Lock size={12} /> Chưa tới
                        </span>
                      ) : isOff ? (
                        <span className="shift-tag shift-night" style={{ background: 'rgba(244, 63, 94, 0.2)', color: 'var(--accent-rose)' }}>
                          ☕ Nghỉ (OFF)
                        </span>
                      ) : hasShift ? (
                        <span className="shift-tag shift-morning">
                          {start2Val ? '🔄 Ca Gãy' : '☀️ Đã Xếp Ca'}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          Chưa phân ca
                        </span>
                      )}
                    </div>

                    {/* Shift Time Content */}
                    {!isLocked && (
                      <div style={{ background: 'var(--bg-input)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {isOff ? (
                          <div style={{ color: 'var(--accent-rose)', fontWeight: 600, fontSize: '0.9rem' }}>
                            Nghỉ không làm việc (OFF)
                          </div>
                        ) : hasShift ? (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Ca 1 (Chính):</span>
                              <strong style={{ color: 'var(--accent-cyan)' }}>{startVal} - {endVal}</strong>
                            </div>

                            {start2Val && end2Val && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.35rem', marginTop: '0.2rem' }}>
                                <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>Ca 2 (Phụ):</span>
                                <strong style={{ color: 'var(--accent-purple)' }}>{start2Val} - {end2Val}</strong>
                              </div>
                            )}
                          </>
                        ) : (
                          <div style={{ color: 'var(--text-dim)', fontSize: '0.88rem' }}>
                            Chưa có lịch ca cho ngày này
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View 2: Compact Matrix Table View */}
        {selectedView === 'table' && (
          <div className="matrix-card">
            <div className="table-responsive">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>STT</th>
                    <th style={{ width: '180px', textAlign: 'left', paddingLeft: '1rem' }}>NHÂN VIÊN</th>
                    <th style={{ width: '80px' }}>CA</th>
                    {daysArray.map(d => {
                      const { name: dayName, isWeekend } = getDayOfWeekStr(d);
                      const isLocked = d > maxAllowedDay;
                      return (
                        <th key={d} style={{ color: isWeekend ? 'var(--accent-rose)' : undefined, opacity: isLocked ? 0.4 : 1 }}>
                          <div>{d}</div>
                          <small>{dayName}</small>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  <tr className="row-start">
                    <td rowSpan={2} style={{ fontWeight: 700 }}>#{employee?.stt || 1}</td>
                    <td rowSpan={2} style={{ textAlign: 'left', paddingLeft: '1rem', fontWeight: 700 }}>
                      {employee?.name}
                    </td>
                    <td style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>Lên Ca</td>
                    {daysArray.map(d => {
                      const dayStr = String(d).padStart(2, '0');
                      const dateKey = `${year}-${formattedMonthStr}-${dayStr}`;
                      const rec = empAttMap[dateKey] || {};
                      const isLocked = d > maxAllowedDay;
                      const isOff = rec.start === 'OFF';
                      return (
                        <td key={d} style={{ opacity: isLocked ? 0.35 : 1 }}>
                          {isOff ? <span className="text-off">OFF</span> : (rec.start || '-')}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="row-end">
                    <td style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>Xuống Ca</td>
                    {daysArray.map(d => {
                      const dayStr = String(d).padStart(2, '0');
                      const dateKey = `${year}-${formattedMonthStr}-${dayStr}`;
                      const rec = empAttMap[dateKey] || {};
                      const isLocked = d > maxAllowedDay;
                      const isOff = rec.start === 'OFF';
                      return (
                        <td key={d} style={{ opacity: isLocked ? 0.35 : 1 }}>
                          {isOff ? <span className="text-off" style={{ opacity: 0.3 }}>-</span> : (rec.end || '-')}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Account Edit Modal */}
      {isProfileModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={20} className="text-purple" />
                <span>Chỉnh Sửa Tài Khoản Cá Nhân</span>
              </h3>
              <button className="modal-close" onClick={() => setIsProfileModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '0.5rem' }}>
              {profileErrorMsg && (
                <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600 }}>
                  ⚠️ {profileErrorMsg}
                </div>
              )}

              {profileSuccessMsg && (
                <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600 }}>
                  {profileSuccessMsg}
                </div>
              )}

              <div className="form-group">
                <label style={{ fontSize: '0.88rem' }}>Tên Đăng Nhập (Username - Cố định):</label>
                <input
                  type="text"
                  className="form-control"
                  value={`@${currentUser?.username}`}
                  disabled
                  style={{ opacity: 0.7, background: 'var(--bg-input)' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                  Họ & Tên Hiển Thị Nhân Viên:
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập tên mới của bạn..."
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{ fontSize: '0.95rem' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-purple)' }}>
                  Mật Khẩu Mới (Để trống nếu không đổi):
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Nhập mật khẩu mới..."
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>

              {newPassword && (
                <div className="form-group">
                  <label style={{ fontSize: '0.88rem' }}>Nhập Lại Mật Khẩu Mới:</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Xác nhận lại mật khẩu mới..."
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}

              <div className="modal-footer" style={{ marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsProfileModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
