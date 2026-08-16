/**
 * Comprehensive Bilingual Dictionary (Vietnamese 🇻🇳 & Traditional Chinese 繁體中文 🇹🇼 - Tiếng Đài Loan)
 */

export const translations = {
  vi: {
    // Navbar & App Titles
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
    searchPlaceholder: 'Tìm kiếm nhân viên theo tên hoặc STT...',
    totalEmployees: 'Tổng Nhân Viên',
    workingToday: 'Đi Làm Hôm Nay',
    offToday: 'Nghỉ (OFF) Hôm Nay',
    totalHoursMonth: 'Tổng Giờ Làm Tháng',
    stt: 'STT',
    employeeName: 'NHÂN VIÊN',
    shiftType: 'CA',
    shiftStart: 'Lên Ca',
    shiftEnd: 'Xuống Ca',
    editShift: 'Sửa Ca',
    save: 'Lưu',
    cancel: 'Hủy',
    delete: 'Xóa',
    edit: 'Sửa',
    add: 'Thêm',

    // Shift Entry Page
    shiftEntryTitle: 'Trang Nhập Ca Làm Việc Nhân Viên',
    shiftEntrySub: 'Nhập giờ lên ca / xuống ca hàng ngày cho nhân viên của 5 chi nhánh',
    selectEmployee: 'Chọn Nhân Viên:',
    selectDate: 'Chọn Ngày Làm Việc:',
    shift1Title: 'Ca 1 (Lên ca / Xuống ca chính):',
    shift2Title: 'Ca 2 (Dành cho Part-Time / Ca Gãy phụ):',
    startTime: 'Giờ Lên Ca:',
    endTime: 'Giờ Xuống Ca:',
    presetTitle: 'Chọn Nhanh Ca Mẫu (Presets):',
    markOff: 'Đánh Dấu Nghỉ (OFF)',
    saveShiftBtn: 'Lưu Ca Làm Việc',

    // Weekly Roster Page
    rosterPageTitle: 'Trang Sắp Ca Theo Tuần (Weekly Shift Roster)',
    rosterPageSub: 'Sắp xếp lịch phân ca tuần cho các chi nhánh (Ca 8h-13h, 13h-17h, 17h-22h). Nhân viên sẽ xem được bảng ca này khi đăng nhập.',
    branchRosterTitle: 'Bảng Sắp Ca Chi Nhánh',
    swipeHint: '👉 Vuốt sang phải để xem đủ Thứ 2 ➔ Chủ Nhật',
    clickToEdit: '💡 Nhấp vào ô để xếp/sửa ca',
    clearWeekBtn: 'Xóa Lịch Ca Tuần Này',
    clearDayBtn: 'Xóa ngày',
    clearCellBtn: 'Xóa trắng ô này',
    saveRosterBtn: 'Lưu Phân Ca',
    forEmployeesOnly: '(Dành Riêng Cho Nhân Viên)',
    selectWeek: 'Chọn Tuần:',

    // Days of Week
    Mon: 'Thứ 2',
    Tue: 'Thứ 3',
    Wed: 'Thứ 4',
    Thu: 'Thứ 5',
    Fri: 'Thứ 6',
    Sat: 'Thứ 7',
    Sun: 'Chủ Nhật',

    // Shifts & Types
    shiftMorning: '8h - 13h',
    shiftAfternoon: '13h - 17h',
    shiftEvening: '17h - 22h',
    fullTime: 'Full-Time',
    partTime: 'Part-Time',

    // Employees Management Page
    empListTitle: 'Danh Sách Nhân Viên 5 Chi Nhánh',
    addNewEmp: 'Thêm Nhân Viên Mới',
    empTypeLabel: 'Loại Hình Làm Việc:',

    // Users Management Page
    userListTitle: 'Quản Lý Tài Khoản Quản Lý & Admin',
    addNewUser: 'Thêm Tài Khoản Mới',
    fullName: 'Họ và Tên:',
    role: 'Quyền Hạn:',

    // Login Page
    loginTitle: 'Đăng Nhập Hệ Thống Chấm Công',
    loginSub: 'Nhập tài khoản để quản lý chấm công hoặc xem ca làm việc cá nhân',
    loginBtn: 'Đăng Nhập Hệ Thống',
    rememberMe: 'Ghi nhớ đăng nhập',

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
    switchLang: '🇹🇼 繁體中文'
  },

  zh: {
    // Navbar & App Titles
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
    searchPlaceholder: '搜尋員工姓名或編號...',
    totalEmployees: '總員工人數',
    workingToday: '今日出勤',
    offToday: '今日休假 (OFF)',
    totalHoursMonth: '本月總工時',
    stt: '序號',
    employeeName: '員工姓名',
    shiftType: '班次',
    shiftStart: '上班',
    shiftEnd: '下班',
    editShift: '修改班次',
    save: '儲存',
    cancel: '取消',
    delete: '刪除',
    edit: '編輯',
    add: '新增',

    // Shift Entry Page
    shiftEntryTitle: '員工每日班次輸入頁面',
    shiftEntrySub: '輸入 5 家門市員工的每日上班與下班時間',
    selectEmployee: '選擇員工:',
    selectDate: '選擇工作日期:',
    shift1Title: '第一班 (主要上班/下班):',
    shift2Title: '第二班 (兼職/兩段班):',
    startTime: '上班時間:',
    endTime: '下班時間:',
    presetTitle: '快速選擇預設班次 (Presets):',
    markOff: '標記休假 (OFF)',
    saveShiftBtn: '儲存工作班次',

    // Weekly Roster Page
    rosterPageTitle: '門市週排班表管理 (Weekly Shift Roster)',
    rosterPageSub: '安排各門市每週班表（早班 8h-13h、中班 13h-17h、晚班 17h-22h）。員工登入後可即時查看本門市班表。',
    branchRosterTitle: '門市週排班表',
    swipeHint: '👉 向右滑動查看完整週一至週日',
    clickToEdit: '💡 點擊儲存格進行排班/編輯',
    clearWeekBtn: '清除本週排班',
    clearDayBtn: '清除此日',
    clearCellBtn: '清除此時段',
    saveRosterBtn: '儲存排班',
    forEmployeesOnly: '(員工專用看班表)',
    selectWeek: '選擇週次:',

    // Days of Week
    Mon: '星期一',
    Tue: '星期二',
    Wed: '星期三',
    Thu: '星期四',
    Fri: '星期五',
    Sat: '星期六',
    Sun: '星期日',

    // Shifts & Types
    shiftMorning: '8h - 13h (早班)',
    shiftAfternoon: '13h - 17h (中班)',
    shiftEvening: '17h - 22h (晚班)',
    fullTime: '正職',
    partTime: '兼職',

    // Employees Management Page
    empListTitle: '5 家門市員工名單',
    addNewEmp: '新增員工',
    empTypeLabel: '工作類型:',

    // Users Management Page
    userListTitle: '店長與管理員帳號管理',
    addNewUser: '新增帳號',
    fullName: '姓名:',
    role: '權限等級:',

    // Login Page
    loginTitle: '考勤打卡管理系統登入',
    loginSub: '請輸入帳號密碼以管理考勤或查看個人班表',
    loginBtn: '登入系統',
    rememberMe: '記住登入狀態',

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
