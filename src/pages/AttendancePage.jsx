import React from 'react';
import { Search } from 'lucide-react';
import BranchTabs from '../components/BranchTabs';
import StatsCards from '../components/StatsCards';
import AttendanceGrid from '../components/AttendanceGrid';

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
  handleCellClick
}) {
  return (
    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 5 Branches Tab Bar */}
      <BranchTabs
        branches={branches}
        activeBranchId={activeBranchId}
        setActiveBranchId={setActiveBranchId}
        employeeCounts={employeeCounts}
        currentUser={currentUser}
      />

      {/* 2 Stats Cards (Tổng số nhân viên & Chi nhánh đang chọn) */}
      <StatsCards
        employees={visibleEmployees}
        activeBranchId={activeBranchId}
        branches={branches}
      />

      {/* Search Toolbar */}
      <div className="table-toolbar">
        <div className="search-box" style={{ width: '320px' }}>
          <Search size={18} className="text-dim" />
          <input
            type="text"
            placeholder="Tìm kiếm tên nhân viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Hiển thị: <strong>{visibleEmployees.length}</strong> nhân viên
        </div>
      </div>

      {/* Matrix Schedule Grid */}
      <AttendanceGrid
        year={year}
        month={month}
        employees={visibleEmployees}
        attendance={attendance}
        branches={branches}
        isAdmin={true}
        searchQuery={searchQuery}
        onCellClick={handleCellClick}
      />
    </div>
  );
}
