import React, { useState } from 'react';
import { KeyRound, UserPlus, Edit2, Trash2, Check, Shield, Building, User } from 'lucide-react';

export default function UsersPage({
  users,
  branches,
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

  const [editingUserId, setEditingUserId] = useState(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('manager');
  const [editBranchId, setEditBranchId] = useState('CN1');

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

    onAddUser({
      username: username.trim().toLowerCase(),
      password: password.trim(),
      fullName: fullName.trim(),
      role,
      branchId: role === 'admin' ? 'ALL' : branchId
    });

    setUsername('');
    setPassword('');
    setFullName('');
  };

  const startEdit = (user) => {
    setEditingUserId(user.id);
    setEditFullName(user.fullName);
    setEditPassword(user.password || '');
    setEditRole(user.role);
    setEditBranchId(user.branchId || 'CN1');
  };

  const saveEdit = (userId) => {
    if (!editFullName.trim() || !editPassword.trim()) {
      alert('Mật khẩu và Họ tên không được để trống!');
      return;
    }

    onUpdateUser(userId, {
      fullName: editFullName.trim(),
      password: editPassword.trim(),
      role: editRole,
      branchId: editRole === 'admin' ? 'ALL' : editBranchId
    });
    setEditingUserId(null);
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <KeyRound size={28} className="text-purple" />
          <span>Trang Quản Lý Tài Khoản Quản Lý</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Tạo tài khoản phân quyền cho các Quản lý của từng chi nhánh nhập ca làm việc
        </p>
      </div>

      <div className="admin-page-grid">
        {/* Form Create Account */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} />
            <span>Tạo Tài Khoản Quản Lý Mới</span>
          </h3>

          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Họ & Tên Quản Lý:</label>
              <input
                type="text"
                className="form-control"
                placeholder="VD: Nguyễn Văn B"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Tên Đăng Nhập (Username):</label>
              <input
                type="text"
                className="form-control"
                placeholder="VD: quanly_cn6"
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

            <div className="form-group">
              <label>Quyền Hạn:</label>
              <select
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="manager">Quản Lý Chi Nhánh</option>
                <option value="admin">Quản Trị Viên (Admin)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Chi Nhánh Phân Công:</label>
              <select
                className="form-control"
                value={branchId}
                disabled={role === 'admin'}
                onChange={(e) => setBranchId(e.target.value)}
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

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
                  <th style={{ width: '140px' }}>QUYỀN HẠN</th>
                  <th style={{ width: '180px' }}>CHI NHÁNH</th>
                  <th style={{ width: '140px' }}>THAO TÁC</th>
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
                          </select>
                        ) : (
                          <span className={`shift-tag ${u.role === 'admin' ? 'shift-night' : 'shift-full'}`}>
                            {u.role === 'admin' ? '👑 Admin' : '🏬 Quản Lý'}
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
