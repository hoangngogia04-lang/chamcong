import React, { useState } from 'react';
import { KeyRound, UserPlus, Edit2, Trash2, Check, Shield, Building, User } from 'lucide-react';
import { translations } from '../utils/language';

export default function UsersPage({
  users,
  branches,
  employees = [],
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  lang = 'vi'
}) {
  const t = translations[lang] || translations.vi;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('manager');
  const [branchId, setBranchId] = useState(branches[0]?.id || 'CN1');
  const [employeeId, setEmployeeId] = useState('');

  const [editingUserId, setEditingUserId] = useState(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('manager');
  const [editBranchId, setEditBranchId] = useState('CN1');
  const [editEmployeeId, setEditEmployeeId] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !fullName.trim()) {
      alert(lang === 'zh' ? '請填寫完整的帳號、密碼與姓名！' : 'Vui lòng điền đầy đủ Tên đăng nhập, Mật khẩu và Họ tên!');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      alert(lang === 'zh' ? '⚠️ 帳號已存在，請選擇其他帳號！' : '⚠️ Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!');
      return;
    }

    const selectedEmp = employees.find(emp => emp.id === employeeId);
    const finalBranchId = role === 'admin' ? 'ALL' : (role === 'employee' ? (selectedEmp?.branchId || branchId) : branchId);

    onAddUser({
      username: username.trim(),
      password: password.trim(),
      fullName: fullName.trim(),
      role,
      branchId: finalBranchId,
      employeeId: role === 'employee' ? employeeId : null
    });

    setUsername('');
    setPassword('');
    setFullName('');
    setEmployeeId('');
  };

  const handleStartEdit = (u) => {
    setEditingUserId(u.id);
    setEditFullName(u.fullName || '');
    setEditPassword(u.password || '');
    setEditRole(u.role || 'manager');
    setEditBranchId(u.branchId || 'CN1');
    setEditEmployeeId(u.employeeId || '');
  };

  const handleSaveEdit = (uId) => {
    if (!editFullName.trim() || !editPassword.trim()) {
      alert(lang === 'zh' ? '請輸入姓名與密碼！' : 'Vui lòng nhập Họ tên và Mật khẩu!');
      return;
    }
    const selectedEmp = employees.find(emp => emp.id === editEmployeeId);
    const finalBranchId = editRole === 'admin' ? 'ALL' : (editRole === 'employee' ? (selectedEmp?.branchId || editBranchId) : editBranchId);

    onUpdateUser(uId, {
      fullName: editFullName.trim(),
      password: editPassword.trim(),
      role: editRole,
      branchId: finalBranchId,
      employeeId: editRole === 'employee' ? editEmployeeId : null
    });
    setEditingUserId(null);
  };

  return (
    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <KeyRound size={26} className="text-cyan" />
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            {t.userListTitle}
          </h2>
          <small style={{ color: 'var(--text-muted)' }}>
            {lang === 'zh' ? '設定與發放帳號權限（最高管理員 Admin、門市店長 Manager、員工 Employee）' : 'Cấu hình và phân quyền tài khoản đăng nhập (Admin, Quản lý chi nhánh, Nhân viên)'}
          </small>
        </div>
      </div>

      {/* Form Add User */}
      <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={18} className="text-emerald" />
          <span>{t.addNewUser}</span>
        </h4>

        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', alignItems: 'end' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.username}:</label>
            <input
              type="text"
              className="form-control"
              placeholder={t.userPlaceholder}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.password}:</label>
            <input
              type="text"
              className="form-control"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.fullName}</label>
            <input
              type="text"
              className="form-control"
              placeholder={t.fullNamePlaceholder}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.roleLabel}</label>
            <select
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="manager">🏬 {t.branchManagerRole}</option>
              <option value="employee">👤 {t.employeeRole}</option>
              <option value="admin">👑 {t.adminRole}</option>
            </select>
          </div>

          {role === 'manager' && (
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.branch}:</label>
              <select
                className="form-control"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {role === 'employee' && (
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Liên Kết Nhân Viên:</label>
              <select
                className="form-control"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              >
                <option value="">-- Chọn nhân viên --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>#{emp.stt} {emp.name} ({emp.branchId})</option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.2rem', height: '42px' }}>
            <UserPlus size={16} />
            <span>{t.add}</span>
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="table-responsive" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <table className="roster-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '0.85rem', textAlign: 'left' }}>{t.username}</th>
              <th style={{ padding: '0.85rem', textAlign: 'left' }}>{t.fullName}</th>
              <th style={{ padding: '0.85rem', textAlign: 'left' }}>{t.password}</th>
              <th style={{ padding: '0.85rem', textAlign: 'left' }}>{t.role}</th>
              <th style={{ padding: '0.85rem', textAlign: 'left' }}>{t.branch}</th>
              <th style={{ padding: '0.85rem', textAlign: 'center', width: '120px' }}>{t.edit} / {t.delete}</th>
            </tr>
          </thead>

          <tbody>
            {users.map(u => {
              const isEditing = editingUserId === u.id;
              const branchObj = branches.find(b => b.id === u.branchId);

              return (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {u.username}
                  </td>

                  <td style={{ padding: '0.75rem' }}>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                      />
                    ) : (
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.fullName}</span>
                    )}
                  </td>

                  <td style={{ padding: '0.75rem' }}>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                      />
                    ) : (
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{u.password}</span>
                    )}
                  </td>

                  <td style={{ padding: '0.75rem' }}>
                    {isEditing ? (
                      <select
                        className="form-control"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                      >
                        <option value="manager">🏬 Quản Lý Chi Nhánh</option>
                        <option value="employee">👤 Nhân Viên</option>
                        <option value="admin">👑 Admin</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)', background: u.role === 'admin' ? 'rgba(244, 63, 94, 0.15)' : (u.role === 'employee' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(245, 158, 11, 0.15)'), color: u.role === 'admin' ? 'var(--accent-rose)' : (u.role === 'employee' ? 'var(--accent-cyan)' : 'var(--accent-amber)') }}>
                        {u.role === 'admin' ? '👑 Admin' : (u.role === 'employee' ? '👤 Nhân Viên' : '🏬 Quản Lý')}
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '0.75rem' }}>
                    {isEditing ? (
                      <select
                        className="form-control"
                        value={editBranchId}
                        onChange={(e) => setEditBranchId(e.target.value)}
                        disabled={editRole === 'admin'}
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        {u.role === 'admin' ? 'Tất cả 5 Chi Nhánh' : (branchObj?.name || u.branchId)}
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    {isEditing ? (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleSaveEdit(u.id)}
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                      >
                        <Check size={14} />
                        <span>{t.save}</span>
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleStartEdit(u)}
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}
                          title={t.edit}
                        >
                          <Edit2 size={14} />
                        </button>

                        {u.username !== 'admin' && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              if (window.confirm(`${lang === 'zh' ? '確定要刪除帳號' : 'Bạn có chắc muốn xóa tài khoản'} "${u.username}"?`)) {
                                onDeleteUser(u.id);
                              }
                            }}
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', color: 'var(--accent-rose)' }}
                            title={t.delete}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
