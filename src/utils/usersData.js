// Default User Accounts for Login (Admin, Managers & Employees)
export const DEFAULT_USERS = [
  { id: 'usr_admin', username: 'admin', password: 'admin123', fullName: 'Quản Trị Viên (Admin)', role: 'admin', branchId: 'ALL' },
  { id: 'usr_cn1', username: 'quanly_cn1', password: '123', fullName: 'Quản lý Chi Nhánh 1 (Biên Hoà)', role: 'manager', branchId: 'CN1' },
  { id: 'usr_cn2', username: 'quanly_cn2', password: '123', fullName: 'Quản lý Chi Nhánh 2 (Long Thành)', role: 'manager', branchId: 'CN2' },
  { id: 'usr_cn3', username: 'quanly_cn3', password: '123', fullName: 'Quản lý Chi Nhánh 3 (Long Khánh)', role: 'manager', branchId: 'CN3' },
  { id: 'usr_cn4', username: 'quanly_cn4', password: '123', fullName: 'Quản lý Chi Nhánh 4 (Xuân Lộc)', role: 'manager', branchId: 'CN4' },
  { id: 'usr_cn5', username: 'quanly_cn5', password: '123', fullName: 'Quản lý Chi Nhánh 5 (Lê Duẩn)', role: 'manager', branchId: 'CN5' },

  // Sample Employee Accounts (Quyền Nhân Viên xem lịch cá nhân)
  { id: 'usr_emp_1', username: 'hoangp', password: '123', fullName: 'Hoàng(P)', role: 'employee', branchId: 'CN1', employeeId: 'emp_1' },
  { id: 'usr_emp_2', username: 'trucanh', password: '123', fullName: 'Trúc Anh', role: 'employee', branchId: 'CN1', employeeId: 'emp_2' },
  { id: 'usr_emp_3', username: 'van', password: '123', fullName: 'Vân', role: 'employee', branchId: 'CN1', employeeId: 'emp_3' },
  { id: 'usr_emp_4', username: 'dung', password: '123', fullName: 'Dung', role: 'employee', branchId: 'CN1', employeeId: 'emp_4' },
  { id: 'usr_emp_5', username: 'nhi', password: '123', fullName: 'Nhi', role: 'employee', branchId: 'CN1', employeeId: 'emp_5' }
];
