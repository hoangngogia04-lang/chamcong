import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase URL & Key provided by user
export const SUPABASE_URL = 'https://zhkjjakzqaghosayaeqi.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_5ey2J_CdnPIeeAR0vkPyWA_cEicyX42';

// Always initialize Supabase client directly
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const getSupabaseClient = () => supabase;

// ========================================================
// Supabase Data Fetching & Syncing APIs
// ========================================================

/**
 * Fetch all branches from Supabase
 */
export const fetchBranchesFromSupabase = async () => {
  try {
    const { data, error } = await supabase.from('branches').select('*');
    if (error || !data || data.length === 0) return null;
    return data.map(b => ({
      id: b.id,
      name: b.name,
      code: b.code || b.id
    }));
  } catch (err) {
    console.error('Error fetching branches:', err);
    return null;
  }
};

/**
 * Fetch all employees from Supabase (including type: 'fulltime' | 'parttime')
 */
export const fetchEmployeesFromSupabase = async () => {
  try {
    const { data, error } = await supabase.from('employees').select('*').order('stt', { ascending: true });
    if (error || !data || data.length === 0) return null;
    return data.map(e => ({
      id: e.id,
      stt: e.stt,
      name: e.name,
      branchId: e.branch_id,
      type: e.type || 'fulltime'
    }));
  } catch (err) {
    console.error('Error fetching employees:', err);
    return null;
  }
};

/**
 * Fetch all attendance for a month from Supabase (including Ca 2: start2, end2)
 */
export const fetchAttendanceFromSupabase = async (year, month) => {
  const formattedMonthStr = String(month).padStart(2, '0');
  const startDate = `${year}-${formattedMonthStr}-01`;
  const endDate = `${year}-${formattedMonthStr}-31`;

  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .gte('work_date', startDate)
      .lte('work_date', endDate);

    if (error || !data || data.length === 0) return null;

    const attendanceMap = {};
    data.forEach(row => {
      const empId = row.employee_id;
      const dateKey = row.work_date;
      if (!attendanceMap[empId]) attendanceMap[empId] = {};
      attendanceMap[empId][dateKey] = {
        start: row.shift_start || '',
        end: row.shift_end || '',
        start2: row.shift_start_2 || row.start2 || '',
        end2: row.shift_end_2 || row.end2 || ''
      };
    });

    return attendanceMap;
  } catch (err) {
    console.error('Error fetching attendance:', err);
    return null;
  }
};

/**
 * Fetch user profiles / managers & employees from Supabase
 */
export const fetchUsersFromSupabase = async () => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('*');
    if (error || !data || data.length === 0) return null;

    return data.map(u => ({
      id: u.id,
      username: u.username,
      password: u.password_hash || u.password || '123',
      fullName: u.full_name,
      role: u.role || 'manager',
      branchId: u.branch_id || 'ALL',
      employeeId: u.employee_id || null
    }));
  } catch (err) {
    console.error('Error fetching users:', err);
    return null;
  }
};

/**
 * Upsert a shift entry to Supabase (supporting Ca 1 & Ca 2)
 */
export const saveShiftToSupabase = async (empId, dateKey, startVal, endVal, start2Val = '', end2Val = '') => {
  const recordId = `${empId}_${dateKey}`;
  const { error } = await supabase.from('attendance').upsert({
    id: recordId,
    employee_id: empId,
    work_date: dateKey,
    shift_start: startVal,
    shift_end: endVal,
    shift_start_2: start2Val,
    shift_end_2: end2Val
  });

  if (error) {
    console.error('Error saving shift to Supabase:', error);
  }
};

/**
 * Save / Upsert an employee to Supabase
 */
export const saveEmployeeToSupabase = async (emp) => {
  const { error } = await supabase.from('employees').upsert({
    id: emp.id,
    stt: emp.stt,
    name: emp.name,
    branch_id: emp.branchId,
    type: emp.type || 'fulltime'
  });

  if (error) console.error('Error saving employee to Supabase:', error);
};

/**
 * Delete an employee from Supabase
 */
export const deleteEmployeeFromSupabase = async (empId) => {
  const { error } = await supabase.from('employees').delete().eq('id', empId);
  if (error) console.error('Error deleting employee from Supabase:', error);
};

/**
 * Save / Upsert a user account to Supabase
 */
export const saveUserToSupabase = async (user) => {
  const { error } = await supabase.from('user_profiles').upsert({
    id: user.id,
    username: user.username,
    password_hash: user.password,
    full_name: user.fullName,
    role: user.role,
    branch_id: user.branchId === 'ALL' ? null : user.branchId,
    employee_id: user.employeeId || null
  });

  if (error) console.error('Error saving user to Supabase:', error);
};

/**
 * Delete a user account from Supabase
 */
export const deleteUserFromSupabase = async (userId) => {
  const { error } = await supabase.from('user_profiles').delete().eq('id', userId);
  if (error) console.error('Error deleting user from Supabase:', error);
};
