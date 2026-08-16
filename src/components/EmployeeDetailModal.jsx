import React, { useState } from 'react';
import { X, Calendar, Clock, User, CheckCircle, Coffee, Award, Sparkles, Building, ChevronLeft, ChevronRight, Grid } from 'lucide-react';
import { getDaysInMonth } from '../utils/excelHelper';
import { calculateEmployeeMonthlyStats } from '../utils/calcUtils';
import { translations } from '../utils/language';

export default function EmployeeDetailModal({
  isOpen,
  onClose,
  employee,
  year,
  month,
  attendance = {},
  branches = [],
  lang = 'vi'
}) {
  const t = translations[lang] || translations.vi;
  const [selectedView, setSelectedView] = useState('list'); // 'list' or 'table'

  if (!isOpen || !employee) return null;

  const branchObj = branches.find(b => b.id === employee.branchId) || { name: 'Chi Nhánh' };
  const isPartTime = (employee?.type || 'fulltime') === 'parttime';

  const daysInMonth = getDaysInMonth(year, month);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const formattedMonthStr = String(month).padStart(2, '0');

  const empAttMap = (attendance && attendance[employee.id]) || {};

  // Calculate Monthly Stats (Full-Time Overtime vs Part-Time Hours)
  const stats = calculateEmployeeMonthlyStats(employee, attendance, daysArray, year, month);

  const getDayOfWeekStr = (day) => {
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay();
    const dayNames = lang === 'zh'
      ? ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      : ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return { name: dayNames[dayOfWeek], isWeekend: dayOfWeek === 0 || dayOfWeek === 6 };
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--accent-blue)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              fontSize: '1.3rem',
              fontWeight: 700
            }}>
              {employee.name ? employee.name.charAt(0).toUpperCase() : 'N'}
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{employee.name}</span>
                <span className={`shift-tag ${isPartTime ? 'shift-afternoon' : 'shift-morning'}`} style={{ fontSize: '0.75rem' }}>
                  {isPartTime ? '⏱️ Part-Time' : '👔 Full-Time'}
                </span>
              </h3>
              <small style={{ color: 'var(--text-muted)' }}>
                STT: <strong>#{employee.stt || 1}</strong> | {branchObj.name} | {t.month} {month}/{year}
              </small>
            </div>
          </div>

          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
          {/* Monthly Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
            {!isPartTime ? (
              <>
                {/* Full-Time Stat 1: Số Ngày Công */}
                <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {lang === 'zh' ? '出勤工作日' : 'Số Ngày Công'}
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {stats.totalWorkingDays} <small style={{ fontSize: '0.78rem', fontWeight: 500 }}>{lang === 'zh' ? '天' : 'ngày công'}</small>
                    </div>
                  </div>
                </div>

                {/* Full-Time Stat 2: Số Giờ Tăng Ca (Dôi ra trên 9h/ngày) */}
                <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {lang === 'zh' ? '加班時數 (>9h/天)' : 'Số Giờ Tăng Ca (>9h/ngày)'}
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                      {stats.totalOvertimeHours} <small style={{ fontSize: '0.78rem', fontWeight: 500 }}>{lang === 'zh' ? '小時' : 'tiếng'}</small>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Part-Time Stat 1: Số Ca Đi Làm */}
                <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {lang === 'zh' ? '出勤班次' : 'Số Ca Đi Làm'}
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {stats.totalWorkingDays} <small style={{ fontSize: '0.78rem', fontWeight: 500 }}>{t.shiftUnit}</small>
                    </div>
                  </div>
                </div>

                {/* Part-Time Stat 2: Tổng Giờ Làm */}
                <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {lang === 'zh' ? '總工時' : 'Tổng Giờ Làm'}
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {stats.totalHoursWorked} <small style={{ fontSize: '0.78rem', fontWeight: 500 }}>{t.hourUnit}</small>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Stat 3: Số Ngày Nghỉ (OFF) */}
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Coffee size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {lang === 'zh' ? '休假天數 (OFF)' : 'Số Ngày Nghỉ (OFF)'}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {stats.totalOffDays} <small style={{ fontSize: '0.78rem', fontWeight: 500 }}>{t.dayUnit}</small>
                </div>
              </div>
            </div>
          </div>

          {/* List of Shift Cards Per Day */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={18} className="text-cyan" />
              <span>{lang === 'zh' ? `每日詳細出勤班次表 - ${month}月/${year}` : `Chi Tiết Các Ca Đi Làm Hàng Ngày - Tháng ${month}/${year}`}</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {daysArray.map(day => {
                const { name: dayName, isWeekend } = getDayOfWeekStr(day);
                const dayStr = String(day).padStart(2, '0');
                const dateKey = `${year}-${formattedMonthStr}-${dayStr}`;
                const rec = empAttMap[dateKey] || {};

                const startVal = rec.start || '';
                const endVal = rec.end || '';
                const start2Val = rec.start2 || '';
                const end2Val = rec.end2 || '';

                const isOff = startVal === 'OFF';
                const hasShift = Boolean(startVal || endVal);

                let dayOvertime = 0;
                let dayDurationHours = 0;

                if (hasShift && !isOff) {
                  let dMins = 0;
                  if (startVal && endVal && startVal.includes(':') && endVal.includes(':')) {
                    const [h1, m1] = startVal.split(':').map(Number);
                    const [h2, m2] = endVal.split(':').map(Number);
                    dMins += Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1));
                  }
                  if (start2Val && end2Val && start2Val.includes(':') && end2Val.includes(':')) {
                    const [h1, m1] = start2Val.split(':').map(Number);
                    const [h2, m2] = end2Val.split(':').map(Number);
                    dMins += Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1));
                  }
                  dayDurationHours = Math.round((dMins / 60) * 10) / 10;
                  if (!isPartTime && dMins > 540) {
                    dayOvertime = Math.round(((dMins - 540) / 60) * 10) / 10;
                  }
                }

                return (
                  <div
                    key={day}
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: isWeekend ? 'var(--accent-rose)' : 'var(--text-main)' }}>
                        {dayName} ({dayStr}/{formattedMonthStr})
                      </span>

                      {isOff ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-rose)', background: 'rgba(244, 63, 94, 0.15)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)' }}>
                          OFF
                        </span>
                      ) : hasShift ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)' }}>
                          {dayDurationHours}h {dayOvertime > 0 ? `(+${dayOvertime}h OT)` : ''}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>-</span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {isOff ? (
                        <span style={{ color: 'var(--accent-rose)' }}>{t.dayOff}</span>
                      ) : hasShift ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ color: 'var(--accent-cyan)' }}>
                            Ca 1: {startVal} - {endVal}
                          </div>
                          {start2Val && end2Val && (
                            <div style={{ color: 'var(--accent-purple)' }}>
                              Ca 2: {start2Val} - {end2Val}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>{t.notScheduled}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
