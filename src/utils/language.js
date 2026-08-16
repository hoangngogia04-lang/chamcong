/**
 * Bilingual Translations Dictionary (Vietnamese 🇻🇳 & Traditional Chinese 🇹🇼 - Tiếng Đài Loan)
 */

export const translations = {
  vi: {
    // Navbar & Common
    appTitle: 'Hệ Thống Chấm Công 5 Chi Nhánh',
    attendanceTab: 'Bảng Chấm Công',
    shiftEntryTab: '✍️ Nhập Ca Làm Việc',
    weeklyRosterTab: '📅 Bảng Sắp Ca Tuần',
    employeesTab: 'Quản Lý Nhân Viên',
    usersTab: 'Tài Khoản Quản Lý',
    exportExcel: 'Xuất Excel',
    logout: 'Thoát',
    login: 'Đăng Nhập',
    username: 'Tên Đăng Nhập',
    password: 'Mật Khẩu',
    month: 'Tháng',
    year: 'Năm',
    week: 'Tuần',
    branch: 'Chi Nhánh',
    allBranches: 'Tất Cả Chi Nhánh',
    adminMode: '👑 Admin Mode',

    // Weekly Roster
    rosterPageTitle: 'Trang Sắp Ca Theo Tuần (Weekly Shift Roster)',
    rosterPageSub: 'Sắp xếp lịch phân ca tuần cho các chi nhánh (Ca 8h-13h, 13h-17h, 17h-22h). Nhân viên sẽ xem được bảng ca này khi đăng nhập.',
    branchRosterTitle: 'Bảng Sắp Ca Chi Nhánh',
    swipeHint: '👉 Vuốt sang phải để xem đủ Thứ 2 ➔ Chủ Nhật',
    clickToEdit: '💡 Nhấp vào ô để xếp/sửa ca',
    clearWeekBtn: 'Xóa Lịch Ca Tuần Này',
    clearDayBtn: 'Xóa ngày',
    clearCellBtn: 'Xóa trắng ô này',
    saveRosterBtn: 'Lưu Phân Ca',
    cancelBtn: 'Hủy',
    forEmployeesOnly: '(Dành Riêng Cho Nhân Viên)',
    selectWeek: 'Chọn Tuần:',

    // Days of week
    Mon: 'Thứ 2',
    Tue: 'Thứ 3',
    Wed: 'Thứ 4',
    Thu: 'Thứ 5',
    Fri: 'Thứ 6',
    Sat: 'Thứ 7',
    Sun: 'Chủ Nhật',

    // Shifts
    shiftMorning: '8h - 13h',
    shiftAfternoon: '13h - 17h',
    shiftEvening: '17h - 22h',
    fullTime: 'Full-Time',
    partTime: 'Part-Time',

    // Employee Portal
    employeePortalTitle: 'Cổng Thông Tin Nhận Ca Cá Nhân',
    employeePortalSub: 'Dành riêng cho Nhân viên',
    myBranchRosterTab: '📅 Bảng Sắp Ca Chi Nhánh',
    myListViewTab: '📱 Dạng Danh Sách',
    myMatrixViewTab: '📊 Dạng Matrix',
    workingDaysCount: 'Số Ca Đi Làm',
    offDaysCount: 'Số Ngày Nghỉ (OFF)',
    totalHoursCount: 'Tổng Giờ Làm',
    editAccountBtn: 'Sửa Tài Khoản',
    shiftUnit: 'ca',
    dayUnit: 'ngày',
    hourUnit: 'tiếng',
    today: 'Hôm nay',
    notYet: 'Chưa tới',
    dayOff: 'Nghỉ (OFF)',
    scheduled: 'Đã Xếp Ca',
    splitShift: 'Ca Gãy',
    notScheduled: 'Chưa phân ca',

    // Language Toggle
    langName: '🇻🇳 Tiếng Việt',
    switchLang: '🇹🇼 繁體中文 (Đài Loan)'
  },

  zh: {
    // Navbar & Common
    appTitle: '5 門市考勤打卡管理系統',
    attendanceTab: '考勤打卡表',
    shiftEntryTab: '✍️ 班表輸入',
    weeklyRosterTab: '📅 週排班表',
    employeesTab: '員工管理',
    usersTab: '管理員帳號',
    exportExcel: '匯出 Excel',
    logout: '登出',
    login: '登入',
    username: '帳號',
    password: '密碼',
    month: '月',
    year: '年',
    week: '週',
    branch: '門市 / 分店',
    allBranches: '所有門市',
    adminMode: '👑 最高管理員模式',

    // Weekly Roster
    rosterPageTitle: '門市週排班表管理 (Weekly Shift Roster)',
    rosterPageSub: '安排各門市每週班表（早班 8h-13h、中班 13h-17h、晚班 17h-22h）。員工登入後可即時查看本門市班表。',
    branchRosterTitle: '門市週排班表',
    swipeHint: '👉 向右滑動查看完整週一至週日',
    clickToEdit: '💡 點擊儲存格進行排班/編輯',
    clearWeekBtn: '清除本週排班',
    clearDayBtn: '清除此日',
    clearCellBtn: '清除此時段',
    saveRosterBtn: '儲存排班',
    cancelBtn: '取消',
    forEmployeesOnly: '(員工專用看班表)',
    selectWeek: '選擇週次:',

    // Days of week
    Mon: '星期一',
    Tue: '星期二',
    Wed: '星期三',
    Thu: '星期四',
    Fri: '星期五',
    Sat: '星期六',
    Sun: '星期日',

    // Shifts
    shiftMorning: '8h - 13h (早班)',
    shiftAfternoon: '13h - 17h (中班)',
    shiftEvening: '17h - 22h (晚班)',
    fullTime: '正職',
    partTime: '兼職',

    // Employee Portal
    employeePortalTitle: '員工個人排班打卡中心',
    employeePortalSub: '員工專用頁面',
    myBranchRosterTab: '📅 門市週排班表',
    myListViewTab: '📱 列表模式',
    myMatrixViewTab: '📊 網格模式',
    workingDaysCount: '出勤班次',
    offDaysCount: '休假天數 (OFF)',
    totalHoursCount: '總工時',
    editAccountBtn: '修改帳號',
    shiftUnit: '班',
    dayUnit: '天',
    hourUnit: '小時',
    today: '今天',
    notYet: '未到期',
    dayOff: '休假 (OFF)',
    scheduled: '已排班',
    splitShift: '兩段班',
    notScheduled: '未排班',

    // Language Toggle
    langName: '🇹🇼 繁體中文',
    switchLang: '🇻🇳 Tiếng Việt'
  }
};
