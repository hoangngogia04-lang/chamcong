import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AttendancePage from './pages/AttendancePage';
import ShiftEntryPage from './pages/ShiftEntryPage';
import EmployeesPage from './pages/EmployeesPage';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';
import ShiftEditModal from './components/ShiftEditModal';

import PersonalEmployeePage from './pages/PersonalEmployeePage';

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
  saveShiftToSupabase,
  saveEmployeeToSupabase,
  deleteEmployeeFromSupabase,
  saveUserToSupabase,
  deleteUserFromSupabase
} from './utils/supabaseClient';

export default function App() {
  const [activePage, setActivePage] = useState('attendance'); // 'attendance', 'shiftEntry', 'employees', 'users'
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

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('quan_ly_cham_cong_theme') || 'light';
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
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất tài khoản?')) {
      setCurrentUser(null);
      localStorage.removeItem('quan_ly_cham_cong_current_user');
    }
  };

  // User Accounts Handlers
  const handleAddUser = (newUserData) => {
    const newUser = {
      id: `usr_${Date.now()}`,
      ...newUserData
    };
    setUsers(prev => [...prev, newUser]);
    saveUserToSupabase(newUser);
  };

  const handleUpdateUser = (userId, updatedData) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const merged = { ...u, ...updatedData };
        saveUserToSupabase(merged);
        return merged;
      }
      return u;
    }));
    if (currentUser?.id === userId) {
      const merged = { ...currentUser, ...updatedData };
      setCurrentUser(merged);
      localStorage.setItem('quan_ly_cham_cong_current_user', JSON.stringify(merged));
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Bạn có chắc muốn xóa tài khoản quản lý này?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      deleteUserFromSupabase(userId);
    }
  };

  // Export Excel
  const handleExport = () => {
    let branchPrefix = '';
    let targetBranchId = activeBranchId;

    if (!isAdmin && currentUser?.branchId) {
      targetBranchId = currentUser.branchId;
    }

    if (targetBranchId !== 'ALL') {
      const bObj = branches.find(b => b.id === targetBranchId);
      if (bObj) {
        branchPrefix = bObj.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .replace(/\s+/g, "_");
      }
    }

    exportToExcel(year, month, visibleEmployees, attendance, branchPrefix);
  };

  // Cell click -> Open Shift Edit Modal
  const handleCellClick = (employee, dateKey, currentStart, currentEnd, currentStart2 = '', currentEnd2 = '') => {
    if (!isAdmin && currentUser?.branchId !== employee.branchId) {
      alert('⚠️ Bạn chỉ có quyền chỉnh sửa ca làm việc thuộc Chi nhánh của bạn!');
      return;
    }

    setSelectedCell({
      employee,
      dateKey,
      start: currentStart || '',
      end: currentEnd || '',
      start2: currentStart2 || '',
      end2: currentEnd2 || ''
    });
    setIsShiftModalOpen(true);
  };

  // Save Shift Record (supporting Ca 1 & Ca 2 for Part-Time split shifts)
  const handleSaveShift = (empId, dateKey, startVal, endVal, start2Val = '', end2Val = '') => {
    setAttendance(prev => {
      const empAtt = prev[empId] ? { ...prev[empId] } : {};
      empAtt[dateKey] = {
        start: startVal,
        end: endVal,
        start2: start2Val,
        end2: end2Val
      };
      return {
        ...prev,
        [empId]: empAtt
      };
    });

    saveShiftToSupabase(empId, dateKey, startVal, endVal, start2Val, end2Val);
  };

  // Add Employee
  const handleAddEmployee = (newEmpData) => {
    const newEmp = {
      id: `emp_${Date.now()}`,
      stt: employees.length + 1,
      name: newEmpData.name,
      branchId: newEmpData.branchId,
      type: newEmpData.type || 'fulltime'
    };
    setEmployees(prev => [...prev, newEmp]);
    saveEmployeeToSupabase(newEmp);
  };

  // Update Employee
  const handleUpdateEmployee = (empId, updatedData) => {
    setEmployees(prev => prev.map(e => {
      if (e.id === empId) {
        const merged = { ...e, ...updatedData };
        saveEmployeeToSupabase(merged);
        return merged;
      }
      return e;
    }));
  };

  // Delete Employee
  const handleDeleteEmployee = (empId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      setEmployees(prev => prev.filter(e => e.id !== empId));
      setAttendance(prev => {
        const copy = { ...prev };
        delete copy[empId];
        return copy;
      });
      deleteEmployeeFromSupabase(empId);
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
        theme={theme}
        setTheme={setTheme}
        onLogout={handleLogout}
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
