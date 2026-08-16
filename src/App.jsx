import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AttendancePage from './pages/AttendancePage';
import ShiftEntryPage from './pages/ShiftEntryPage';
import EmployeesPage from './pages/EmployeesPage';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';
import ShiftEditModal from './components/ShiftEditModal';

import PersonalEmployeePage from './pages/PersonalEmployeePage';
import WeeklyRosterPage from './pages/WeeklyRosterPage';

import {
  DEFAULT_BRANCHES,
  DEFAULT_EMPLOYEES,
  DEFAULT_ATTENDANCE,
  DEFAULT_SHIFT_PRESETS
} from './utils/initialData';
import { DEFAULT_USERS } from './utils/usersData';
import { exportToExcel } from './utils/excelHelper';
import {
  fetchBranchesFromSupabase,
  fetchEmployeesFromSupabase,
  fetchAttendanceFromSupabase,
  fetchUsersFromSupabase,
  fetchWeeklyRostersFromSupabase,
  saveShiftToSupabase,
  saveEmployeeToSupabase,
  deleteEmployeeFromSupabase,
  saveUserToSupabase,
  deleteUserFromSupabase,
  saveWeeklyRosterToSupabase
} from './utils/supabaseClient';

export default function App() {
  const [activePage, setActivePage] = useState('attendance'); // 'attendance', 'shiftEntry', 'weeklyRoster', 'employees', 'users'
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);

  const [users, setUsers] = useState(DEFAULT_USERS);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('quan_ly_cham_cong_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [branches, setBranches] = useState(DEFAULT_BRANCHES);
  const [activeBranchId, setActiveBranchId] = useState('ALL');
  const [employees, setEmployees] = useState(DEFAULT_EMPLOYEES);
  const [attendance, setAttendance] = useState(DEFAULT_ATTENDANCE);

  // Weekly Shift Rosters State (Key: `${branch_id}_${year}_${month}_W${week_num}`)
  // Preset sample matching user's screenshot for CN1 (Biên Hoà) Week 1 August 2026!
  const [weeklyRosters, setWeeklyRosters] = useState({
    'CN1_2026_8_W1': {
      '8h - 13h': {
        'Mon': ['emp_3', 'emp_1'],
        'Tue': ['emp_2', 'emp_5'],
        'Wed': ['emp_2', 'emp_4'],
        'Thu': ['emp_2', 'emp_5'],
        'Fri': ['emp_2', 'emp_4'],
        'Sat': ['emp_5', 'emp_3', 'emp_1'],
        'Sun': ['emp_5', 'emp_4', 'emp_1']
      },
      '13h - 17h': {
        'Mon': ['emp_3', 'emp_4'],
        'Tue': ['emp_2', 'emp_4'],
        'Wed': ['emp_5', 'emp_4'],
        'Thu': ['emp_2', 'emp_4'],
        'Fri': ['emp_3', 'emp_4'],
        'Sat': ['emp_3', 'emp_4'],
        'Sun': ['emp_3', 'emp_4']
      },
      '17h - 22h': {
        'Mon': ['emp_2', 'emp_5', 'emp_4'],
        'Tue': ['emp_2', 'emp_5', 'emp_4'],
        'Wed': ['emp_2', 'emp_5', 'emp_4'],
        'Thu': ['emp_2', 'emp_5', 'emp_4'],
        'Fri': ['emp_3', 'emp_5', 'emp_1'],
        'Sat': ['emp_4', 'emp_5', 'emp_1'],
        'Sun': ['emp_2', 'emp_3', 'emp_1']
      }
    }
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('quan_ly_cham_cong_theme') || 'light';
  });
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('quan_ly_cham_cong_lang') || 'vi';
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Shift Edit Modal
  const [selectedCell, setSelectedCell] = useState(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  // Auto-fetch data from Supabase Cloud on mount & when year/month changes
  useEffect(() => {
    async function loadSupabaseData() {
      try {
        const spBranches = await fetchBranchesFromSupabase();
        if (spBranches && spBranches.length > 0) {
          setBranches(spBranches);
        }

        const spUsers = await fetchUsersFromSupabase();
        if (spUsers && spUsers.length > 0) {
          setUsers(spUsers);
        }

        const spEmps = await fetchEmployeesFromSupabase();
        if (spEmps && spEmps.length > 0) {
          setEmployees(spEmps);
        }

        const spAtt = await fetchAttendanceFromSupabase(year, month);
        if (spAtt && Object.keys(spAtt).length > 0) {
          setAttendance(prev => ({ ...prev, ...spAtt }));
        }

        const spRosters = await fetchWeeklyRostersFromSupabase(year, month);
        if (spRosters && Object.keys(spRosters).length > 0) {
          setWeeklyRosters(prev => ({ ...prev, ...spRosters }));
        }
      } catch (err) {
        console.error('Failed loading data from Supabase:', err);
      }
    }

    loadSupabaseData();
  }, [year, month]);

  // Sync current user role & active branch
  useEffect(() => {
    if (currentUser?.role === 'manager' && currentUser?.branchId) {
      setActiveBranchId(currentUser.branchId);
    } else if (currentUser?.role === 'admin' && activeBranchId === 'CN1') {
      setActiveBranchId('ALL');
    }
  }, [currentUser]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quan_ly_cham_cong_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('quan_ly_cham_cong_lang', lang);
  }, [lang]);

  const isAdmin = currentUser?.role === 'admin';

  // Employee count per branch
  const employeeCounts = branches.reduce((acc, b) => {
    acc[b.id] = employees.filter(e => e.branchId === b.id).length;
    return acc;
  }, {});

  // Filter employees by branch permission
  let visibleEmployees = employees;
  if (!isAdmin && currentUser?.branchId) {
    visibleEmployees = employees.filter(e => e.branchId === currentUser.branchId);
  } else if (activeBranchId !== 'ALL') {
    visibleEmployees = employees.filter(e => e.branchId === activeBranchId);
  }

  // Handle Login Success
  const handleLoginSuccess = (user, rememberMe) => {
    setCurrentUser(user);
    if (rememberMe) {
      localStorage.setItem('quan_ly_cham_cong_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('quan_ly_cham_cong_current_user');
    }
    setActivePage('attendance');
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('quan_ly_cham_cong_current_user');
  };

  // Handle Shift Entry Save
  const handleSaveShift = (empId, dateKey, startVal, endVal, start2Val = '', end2Val = '') => {
    setAttendance(prev => {
      const empMap = { ...(prev[empId] || {}) };
      empMap[dateKey] = {
        start: startVal,
        end: endVal,
        start2: start2Val,
        end2: end2Val
      };
      return {
        ...prev,
        [empId]: empMap
      };
    });

    saveShiftToSupabase(empId, dateKey, startVal, endVal, start2Val, end2Val);
  };

  // Handle Weekly Roster Save
  const handleSaveRoster = (branchId, yr, mth, wkNum, rosterData) => {
    const key = `${branchId}_${yr}_${mth}_W${wkNum}`;
    setWeeklyRosters(prev => {
      const updated = { ...prev, [key]: rosterData };
      try {
        localStorage.setItem('quan_ly_cham_cong_weekly_rosters', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    saveWeeklyRosterToSupabase(branchId, yr, mth, wkNum, rosterData);
  };

  // Cell Click Handler to open modal
  const handleCellClick = (employeeObj, dateKey, currentStart = '', currentEnd = '', currentStart2 = '', currentEnd2 = '') => {
    setSelectedCell({
      employee: employeeObj,
      dateKey,
      start: currentStart,
      end: currentEnd,
      start2: currentStart2,
      end2: currentEnd2
    });
    setIsShiftModalOpen(true);
  };

  // Excel Export Handler
  const handleExport = () => {
    exportToExcel(year, month, employees, branches, attendance);
  };

  // Employee CRUD handlers
  const handleAddEmployee = (newEmp) => {
    const empId = `emp_${Date.now()}`;
    const fullEmp = { id: empId, ...newEmp };
    setEmployees(prev => [...prev, fullEmp]);
    saveEmployeeToSupabase(fullEmp);
  };

  const handleUpdateEmployee = (empId, updatedFields) => {
    setEmployees(prev => prev.map(e => e.id === empId ? { ...e, ...updatedFields } : e));
    const target = employees.find(e => e.id === empId);
    if (target) {
      saveEmployeeToSupabase({ ...target, ...updatedFields });
    }
  };

  const handleDeleteEmployee = (empId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      setEmployees(prev => prev.filter(e => e.id !== empId));
      deleteEmployeeFromSupabase(empId);
    }
  };

  // User CRUD handlers
  const handleAddUser = (newUser) => {
    const userId = `usr_${Date.now()}`;
    const fullUser = { id: userId, ...newUser };
    setUsers(prev => [...prev, fullUser]);
    saveUserToSupabase(fullUser);
  };

  const handleUpdateUser = (userId, updatedFields) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedFields } : u));
    const target = users.find(u => u.id === userId);
    if (target) {
      saveUserToSupabase({ ...target, ...updatedFields });
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      deleteUserFromSupabase(userId);
    }
  };

  // Mandatory Login Guard: If user is not logged in, render ONLY LoginPage
  if (!currentUser) {
    return (
      <LoginPage
        users={users}
        branches={branches}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Personal Employee Portal: Render dedicated personal shift view for Employee Role
  if (currentUser.role === 'employee') {
    return (
      <PersonalEmployeePage
        year={year}
        setYear={setYear}
        month={month}
        setMonth={setMonth}
        currentUser={currentUser}
        employees={employees}
        attendance={attendance}
        branches={branches}
        weeklyRosters={weeklyRosters}
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
        onUpdateEmployee={handleUpdateEmployee}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Top Navbar with Multi-Page Tabs */}
      <Navbar
        year={year}
        setYear={setYear}
        month={month}
        setMonth={setMonth}
        currentUser={currentUser}
        activePage={activePage}
        setActivePage={setActivePage}
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
        onExport={handleExport}
        onLogout={handleLogout}
      />

      {/* Render Active Full Page */}
      <main style={{ flex: 1 }}>
        {activePage === 'attendance' && (
          <AttendancePage
            year={year}
            month={month}
            employees={employees}
            visibleEmployees={visibleEmployees}
            attendance={attendance}
            branches={branches}
            activeBranchId={activeBranchId}
            setActiveBranchId={setActiveBranchId}
            employeeCounts={employeeCounts}
            currentUser={currentUser}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleCellClick={handleCellClick}
          />
        )}

        {activePage === 'shiftEntry' && (
          <ShiftEntryPage
            year={year}
            month={month}
            employees={employees}
            branches={branches}
            attendance={attendance}
            currentUser={currentUser}
            onSaveShift={handleSaveShift}
          />
        )}

        {activePage === 'weeklyRoster' && (
          <WeeklyRosterPage
            year={year}
            setYear={setYear}
            month={month}
            setMonth={setMonth}
            branches={branches}
            employees={employees}
            attendance={attendance}
            currentUser={currentUser}
            weeklyRosters={weeklyRosters}
            lang={lang}
            onSaveRoster={handleSaveRoster}
          />
        )}

        {activePage === 'employees' && (
          <EmployeesPage
            employees={employees}
            branches={branches}
            currentUser={currentUser}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        )}

        {activePage === 'users' && isAdmin && (
          <UsersPage
            users={users}
            branches={branches}
            employees={employees}
            currentUser={currentUser}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </main>

      {/* Shift Edit Modal */}
      {selectedCell && (
        <ShiftEditModal
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
          employee={selectedCell.employee}
          dateKey={selectedCell.dateKey}
          initialStart={selectedCell.start}
          initialEnd={selectedCell.end}
          initialStart2={selectedCell.start2}
          initialEnd2={selectedCell.end2}
          onSave={handleSaveShift}
        />
      )}
    </div>
  );
}
