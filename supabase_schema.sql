-- =========================================================
-- SCRIPT TẠO & CẬP NHẬT BẢNG HỆ THỐNG CHẤM CÔNG 5 CHI NHÁNH TÊN SUPABASE
-- Copy toàn bộ đoạn mã này và dán vào Supabase SQL Editor rồi nhấn RUN
-- =========================================================

-- 1. Tạo bảng Chi nhánh
CREATE TABLE IF NOT EXISTS public.branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL
);

-- Thêm dữ liệu 5 chi nhánh mặc định
INSERT INTO public.branches (id, name, code) VALUES
  ('CN1', 'Chi nhánh 1 (Biên Hoà)', 'CN1'),
  ('CN2', 'Chi nhánh 2 (Long Thành)', 'CN2'),
  ('CN3', 'Chi nhánh 3 (Long Khánh)', 'CN3'),
  ('CN4', 'Chi nhánh 4 (Xuân Lộc)', 'CN4'),
  ('CN5', 'Chi nhánh 5 (Lê Duẩn)', 'CN5')
ON CONFLICT (id) DO NOTHING;

-- 2. Tạo bảng Nhân viên
CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY,
  stt INT,
  name TEXT NOT NULL,
  branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'fulltime' -- 'fulltime' (Chính thức) hoặc 'parttime' (Ca gãy)
);

-- Bổ sung cột type nếu bảng đã tồn tại sẵn từ trước
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'fulltime';

-- 3. Tạo bảng Chấm công
CREATE TABLE IF NOT EXISTS public.attendance (
  id TEXT PRIMARY KEY,
  employee_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  shift_start TEXT,
  shift_end TEXT,
  shift_start_2 TEXT, -- Giờ lên ca 2 (Ca gãy Part-Time)
  shift_end_2 TEXT,   -- Giờ xuống ca 2 (Ca gãy Part-Time)
  UNIQUE(employee_id, work_date)
);

-- Bổ sung cột shift_start_2 và shift_end_2 cho ca gãy nếu bảng đã tồn tại từ trước
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS shift_start_2 TEXT;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS shift_end_2 TEXT;

-- 4. Tạo bảng Tài khoản Quản lý Chi nhánh
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'manager', -- 'admin' hoặc 'manager'
  branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
  employee_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL
);

-- Bổ sung cột employee_id nếu bảng đã tồn tại từ trước
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS employee_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL;

-- Thêm tài khoản mẫu mặc định
INSERT INTO public.user_profiles (id, username, password_hash, full_name, role, branch_id) VALUES
  ('usr_admin', 'admin', 'admin123', 'Quản Trị Viên (Admin)', 'admin', NULL),
  ('usr_cn1', 'quanly_cn1', '123456', 'Quản lý Chi Nhánh 1', 'manager', 'CN1'),
  ('usr_cn2', 'quanly_cn2', '123456', 'Quản lý Chi Nhánh 2', 'manager', 'CN2'),
  ('usr_cn3', 'quanly_cn3', '123456', 'Quản lý Chi Nhánh 3', 'manager', 'CN3'),
  ('usr_cn4', 'quanly_cn4', '123456', 'Quản lý Chi Nhánh 4', 'manager', 'CN4'),
  ('usr_cn5', 'quanly_cn5', '123456', 'Quản lý Chi Nhánh 5', 'manager', 'CN5')
ON CONFLICT (username) DO NOTHING;
