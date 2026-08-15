import React, { useState } from 'react';
import { KeyRound, UserPlus, Edit2, Trash2, Check, Shield, Building, User } from 'lucide-react';

export default function UsersPage({
  users,
  branches,
  employees = [],
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) {
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
      alert('Vui lòng điền đầy đủ Tên đăng nhập, Mật khẩu và Họ tên!');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      alert('⚠️ Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!');
      return;
    }

    const selectedEmp = employees.find(emp => emp.id === employeeId);
    const finalBranchId = role === 'admin' ? 'ALL' : (role === 'employee' ? (selectedEmp?.branchId || branchId) : branchId);

    onAddUser({
      username: username.trim().toLowerCase(),
      password: password.trim(),
      fullName: role === 'employee' && selectedEmp ? selectedEmp.name : fullName.trim(),
      role,
      branchId: finalBranchId,
      employeeId: role === 'employee' ? employeeId : null
    });

    setUsername('');
    setPassword('');
    setFullName('');
    setEmployeeId('');
  };

  const startEdit = (user) => {
    setEditingUserId(user.id);
    setEditFullName(user.fullName);
    setEditPassword(user.password || '');
    setEditRole(user.role || 'manager');
    setEditBranchId(user.branchId || 'CN1');
    setEditEmployeeId(user.employeeId || '');
  };

  const saveEdit = (userId) => {
    if (!editFullName.trim() || !editPassword.trim()) {
      alert('Mật khẩu và Họ tên không được để trống!');
      return;
    }

    const selectedEmp = employees.find(emp => emp.id === editEmployeeId);
    const finalBranchId = editRole === 'admin' ? 'ALL' : (editRole === 'employee' ? (selectedEmp?.branchId || editBranchId) : editBranchId);

    onUpdateUser(userId, {
      fullName: editRole === 'employee' && selectedEmp ? selectedEmp.name : editFullName.trim(),
      password: editPassword.trim(),
      role: editRole,
      branchId: finalBranchId,
      employeeId: editRole === 'employee' ? editEmployeeId : null
    });
    setEditingUserId(null);
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <KeyRound size={28} className="text-purple" />
          <span>Trang Quản Lý Tài Khoản Đăng Nhập</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Tạo tài khoản phân quyền cho Admin, Quản Lý Chi Nhánh và Nhân Viên tự xem ca làm cá nhân.
        </p>
      </div>

      <div className="admin-page-grid">
        {/* Form Create Account */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} />
            <span>Tạo Tài Khoản Đăng Nhập Mới</span>
          </h3>

          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Quyền Hạn Hợp Đồng:</label>
              <select
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="manager">🏬 Quản Lý Chi Nhánh</option>
                <option value="admin">👑 Quản Trị Viên (Admin)</option>
                <option value="employee">👤 Nhân Viên (Xem lịch cá nhân)</option>
              </select>
            </div>

            {/* If Employee Role, Select Employee to Link */}
            {role === 'employee' ? (
              <div className="form-group">
                <label>Liên Kết Hồ Sơ Nhân Viên:</label>
                <select
                  className="form-control"
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value);
                    const emp = employees.find(x => x.id === e.target.value);
                    if (emp) {
                      setFullName(emp.name);
                      if (!username) {
                        setUsername(emp.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
                      }
                    }
                  }}
                >
                  <option value="">-- Chọn Nhân Viên --</option>
                  {employees.map(emp => {
                    const br = branches.find(b => b.id === emp.branchId);
                    return (
                      <option key={emp.id} value={emp.id}>
                        #{emp.stt} {emp.name} ({br?.name || emp.branchId})
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label>Họ & Tên Người Dùng:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: Nguyễn Văn B"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label>Tên Đăng Nhập (Username):</label>
              <input
                type="text"
                className="form-control"
                placeholder="VD: quanly_cn1 hoặc trucanh"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Mật Khẩu:</label>
              <input
                type="password"
                className="form-control"
                placeholder="Nhập mật khẩu tài khoản..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {role !== 'admin' && role !== 'employee' && (
              <div className="form-group">
                <label>Chi Nhánh Phân Công:</label>
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              <UserPlus size={18} />
              <span>Tạo Tài Khoản</span>
            </button>
          </form>
        </div>

        {/* User Accounts List Table */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              👥 Danh Sách Tài Khoản ({users.length})
            </h3>
          </div>

          <div className="table-responsive">
            <table className="attendance-table" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>STT</th>
                  <th style={{ textAlign: 'left', paddingLeft: '1rem' }}>HỌ & TÊN / USERNAME</th>
                  <th style={{ width: '120px' }}>MẬT KHẨU</th>
                  <th style={{ width: '150px' }}>QUYỀN HẠN</th>
                  <th style={{ width: '160px' }}>CHI NHÁNH</th>
                  <th style={{ width: '130px' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => {
                  const branchObj = branches.find(b => b.id === u.branchId);
                  const isEditing = editingUserId === u.id;

                  return (
                    <tr key={u.id} style={{ background: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)' }}>
                      <td style={{ fontWeight: 700, color: 'var(--text-dim)' }}>
                        {index + 1}
                      </td>

                      <td style={{ textAlign: 'left', paddingLeft: '1rem' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-control"
                            value={editFullName}
                            onChange={(e) => setEditFullName(e.target.value)}
                          />
                        ) : (
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                              {u.fullName}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              @{u.username}
                            </div>
                          </div>
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-control"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                          />
                        ) : (
                          <code style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>
                            {u.password || '***'}
                          </code>
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <select
                            className="form-control"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                          >
                            <option value="manager">Quản Lý</option>
                            <option value="admin">Admin</option>
                            <option value="employee">Nhân Viên</option>
                          </select>
                        ) : (
                          <span className={`shift-tag ${u.role === 'admin' ? 'shift-night' : (u.role === 'employee' ? 'shift-afternoon' : 'shift-full')}`}>
                            {u.role === 'admin' ? '👑 Admin' : (u.role === 'employee' ? '👤 Nhân Viên' : '🏬 Quản Lý')}
                          </span>
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <select
                            className="form-control"
                            value={editBranchId}
                            disabled={editRole === 'admin'}
                            onChange={(e) => setEditBranchId(e.target.value)}
                          >
                            {branches.map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {u.role === 'admin' ? 'Tất cả 5 Chi nhánh' : (branchObj?.name || u.branchId)}
                          </span>
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <button className="btn btn-primary" onClick={() => saveEdit(u.id)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                            <Check size={16} />
                            <span>Lưu</span>
                          </button>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                              onClick={() => startEdit(u)}
                              title="Sửa / Đổi mật khẩu"
                            >
                              <Edit2 size={14} />
                              <span>Sửa</span>
                            </button>
                            {u.username !== 'admin' && (
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.35rem', color: 'var(--accent-rose)' }}
                                onClick={() => onDeleteUser(u.id)}
                                title="Xóa tài khoản"
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
      </div>
    </div>
  );
}
