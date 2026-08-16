import React from 'react';
import { Search } from 'lucide-react';
import BranchTabs from '../components/BranchTabs';
import StatsCards from '../components/StatsCards';
import AttendanceGrid from '../components/AttendanceGrid';
import { translations } from '../utils/language';

export default function AttendancePage({
  year,
  month,
  employees,
  visibleEmployees,
  attendance,
  branches,
  activeBranchId,
  setActiveBranchId,
  employeeCounts,
  currentUser,
  searchQuery,
  setSearchQuery,
  handleCellClick,
  onSelectEmpDetail,
  lang = 'vi'
}) {
  const t = translations[lang] || translations.vi;

  return (
    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 5 Branches Tab Bar */}
      <BranchTabs
        branches={branches}
        activeBranchId={activeBranchId}
        setActiveBranchId={setActiveBranchId}
        employeeCounts={employeeCounts}
        currentUser={currentUser}
        lang={lang}
      />

      {/* 2 Stats Cards (Tổng số nhân viên & Chi nhánh đang chọn) */}
      <StatsCards
        employees={visibleEmployees}
        activeBranchId={activeBranchId}
        branches={branches}
        lang={lang}
      />

      {/* Search Toolbar */}
      <div className="table-toolbar">
        <div className="search-box" style={{ width: '320px' }}>
          <Search size={18} className="text-dim" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Attendance Matrix Grid */}
      <AttendanceGrid
        year={year}
        month={month}
        visibleEmployees={visibleEmployees}
        attendance={attendance}
        currentUser={currentUser}
        searchQuery={searchQuery}
        handleCellClick={handleCellClick}
        onSelectEmpDetail={onSelectEmpDetail}
        lang={lang}
      />
    </div>
  );
}
