import React, { useState } from 'react';
import { X, UserPlus, Trash2, Edit2, Check, ShieldCheck, KeyRound, Building } from 'lucide-react';

export default function UserManageModal({
  isOpen,
  onClose,
  users,
  branches,
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

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !fullName.trim()) {
      alert('Vui lòng điền đầy đủ Tên đăng nhập, Mật khẩu và Họ tên!');
      return;
    }

    // Check duplicate username
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

    // Reset form
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <KeyRound size={20} className="text-cyan" />
            <span>Quản Lý Tài Khoản Quản Lý Chi Nhánh</span>
          </div>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Add New Manager Form */}
          <form onSubmit={handleAdd} style={{ background: 'var(--bg-input)', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UserPlus size={16} />
              <span>Tạo Tài Khoản Quản Lý Mới</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label>Họ & Tên Quản Lý:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: Nguyễn Văn A"
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label>Mật Khẩu:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: 123456"
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
                <label>Phụ Trách Chi Nhánh:</label>
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
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '0.25rem' }}>
              <UserPlus size={16} />
              <span>Tạo Tài Khoản Mới</span>
            </button>
          </form>

          {/* Manager Accounts List */}
          <div className="form-group">
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              👥 Danh Sách Tài Khoản Hiện Tại ({users.length}):
            </label>

            <div className="emp-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {users.map((u) => {
                const branchObj = branches.find(b => b.id === u.branchId);
                const isEditing = editingUserId === u.id;

                return (
                  <div key={u.id} className="emp-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-focus)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Họ và Tên"
                            value={editFullName}
                            onChange={(e) => setEditFullName(e.target.value)}
                          />
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Mật khẩu mới"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem' }}>
                          <select
                            className="form-control"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                          >
                            <option value="manager">Quản Lý Chi Nhánh</option>
                            <option value="admin">Quản Trị Viên (Admin)</option>
                          </select>
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
                          <button className="btn btn-primary" onClick={() => saveEdit(u.id)} style={{ padding: '0.4rem 0.75rem' }}>
                            <Check size={16} />
                            <span>Lưu</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="emp-item-info">
                          <span style={{ fontWeight: 700, color: u.role === 'admin' ? 'var(--accent-purple)' : 'var(--accent-cyan)' }}>
                            {u.role === 'admin' ? '👑' : '🏬'}
                          </span>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                              {u.fullName} <small style={{ color: 'var(--text-dim)', fontWeight: 500 }}>(@{u.username})</small>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Mật khẩu: <code style={{ color: 'var(--accent-amber)' }}>{u.password || '***'}</code> • Phụ trách: <strong>{u.role === 'admin' ? 'Toàn bộ 5 Chi nhánh' : (branchObj?.name || u.branchId)}</strong>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                            onClick={() => startEdit(u)}
                            title="Sửa / Đổi mật khẩu tài khoản này"
                          >
                            <Edit2 size={14} />
                            <span>Đổi MK</span>
                          </button>
                          {u.username !== 'admin' && (
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem', color: 'var(--accent-rose)' }}
                              onClick={() => onDeleteUser(u.id)}
                              title="Xóa tài khoản này"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Hoàn Tất</button>
        </div>
      </div>
    </div>
  );
}
