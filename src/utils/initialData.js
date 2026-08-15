// Default 5 Branches
export const DEFAULT_BRANCHES = [
  { id: 'CN1', name: 'Biên Hoà', code: 'CN1' },
  { id: 'CN2', name: 'Long Thành', code: 'CN2' },
  { id: 'CN3', name: 'Long Khánh', code: 'CN3' },
  { id: 'CN4', name: 'Xuân Lộc', code: 'CN4' },
  { id: 'CN5', name: 'Lê Duẩn', code: 'CN5' }
];

// Presets for Shift Entry & Modal Edit
export const DEFAULT_SHIFT_PRESETS = [
  { label: 'Ca Full (8h - 22h)', start: '08:00', end: '22:00', icon: '⚡' },
  { label: 'Ca Sáng (8h - 17h)', start: '08:00', end: '17:00', icon: '☀️' },
  { label: 'Ca Tối (13h - 22h)', start: '13:00', end: '22:00', icon: '🌙' },
  { label: 'Sáng Ngắn (8h - 13h)', start: '08:00', end: '13:00', icon: '🌅' },
  { label: 'Tối Ngắn (17h - 22h)', start: '17:00', end: '22:00', icon: '🌆' },
  { label: 'Ca Gãy Part-Time (8h-13h & 17h-22h)', start: '08:00', end: '13:00', start2: '17:00', end2: '22:00', icon: '🔄' },
  { label: 'Nghỉ (OFF)', start: 'OFF', end: '', icon: '☕' }
];

// Initial default 23 Employees with type ('fulltime' | 'parttime')
export const DEFAULT_EMPLOYEES = [
  { id: 'emp_1', stt: 1, name: 'Hoàng(P)', branchId: 'CN1', type: 'fulltime' },
  { id: 'emp_2', stt: 2, name: 'Trúc Anh', branchId: 'CN1', type: 'parttime' },
  { id: 'emp_3', stt: 3, name: 'Vân', branchId: 'CN1', type: 'parttime' },
  { id: 'emp_4', stt: 4, name: 'Dung', branchId: 'CN1', type: 'fulltime' },
  { id: 'emp_5', stt: 5, name: 'Nhi', branchId: 'CN1', type: 'parttime' },
  { id: 'emp_6', stt: 6, name: 'Trang(LT)', branchId: 'CN2', type: 'parttime' },
  { id: 'emp_7', stt: 7, name: 'Huỳnh (LT)', branchId: 'CN2', type: 'fulltime' },
  { id: 'emp_8', stt: 8, name: 'L.Anh (Lt)', branchId: 'CN2', type: 'parttime' },
  { id: 'emp_9', stt: 9, name: 'Nhiệm', branchId: 'CN1', type: 'fulltime' },
  { id: 'emp_10', stt: 10, name: 'Hân', branchId: 'CN1', type: 'fulltime' },
  { id: 'emp_11', stt: 11, name: 'Châu', branchId: 'CN1', type: 'fulltime' },
  { id: 'emp_12', stt: 12, name: 'Tuyền', branchId: 'CN1', type: 'fulltime' },
  { id: 'emp_13', stt: 13, name: 'Long', branchId: 'CN1', type: 'fulltime' },
  { id: 'emp_14', stt: 14, name: 'Hằng', branchId: 'CN1', type: 'fulltime' },
  { id: 'emp_15', stt: 15, name: 'Diễm (LK)', branchId: 'CN3', type: 'fulltime' },
  { id: 'emp_16', stt: 16, name: 'Ly (LK)', branchId: 'CN3', type: 'fulltime' },
  { id: 'emp_17', stt: 17, name: 'Quỳnh (LK)', branchId: 'CN3', type: 'fulltime' },
  { id: 'emp_18', stt: 18, name: 'Nhật (LK)', branchId: 'CN3', type: 'fulltime' },
  { id: 'emp_19', stt: 19, name: 'Thảo (XL)', branchId: 'CN4', type: 'fulltime' },
  { id: 'emp_20', stt: 20, name: 'Vy (XL)', branchId: 'CN4', type: 'fulltime' },
  { id: 'emp_21', stt: 21, name: 'Nhi (XL)', branchId: 'CN4', type: 'fulltime' },
  { id: 'emp_22', stt: 22, name: 'Ngân (XL)', branchId: 'CN4', type: 'fulltime' },
  { id: 'emp_23', stt: 23, name: 'Hoàng(LD)', branchId: 'CN5', type: 'fulltime' }
];

export const DEFAULT_ATTENDANCE = {};
