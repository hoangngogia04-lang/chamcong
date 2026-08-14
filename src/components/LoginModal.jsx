import React, { useState } from 'react';
import { X, LogIn, Lock, User, Building, ShieldCheck } from 'lucide-react';

export default function LoginModal({
  isOpen,
  onClose,
  users,
  branches,
  onLoginSuccess
}) {
  const [selectedUsername, setSelectedUsername] = useState(users[0]?.username || 'admin');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const targetUser = users.find(u => u.username === selectedUsername);
    if (!targetUser) {
      setErrorMsg('Tài khoản không tồn tại!');
      return;
    }

    if (targetUser.password && targetUser.password !== password) {
      setErrorMsg('Mật khẩu không chính xác! (Mật khẩu mặc định: 123)');
      return;
    }

    onLoginSuccess(targetUser);
    onClose();
  };

  const selectedUserObj = users.find(u => u.username === selectedUsername);
  const branchObj = branches.find(b => b.id === selectedUserObj?.branchId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogIn size={20} className="text-cyan" />
            <span>Đăng Nhập Tài Khoản</span>
          </div>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <div className="modal-body">
            {errorMsg && (
              <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600 }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="form-group">
              <label>👤 Chọn Tài Khoản Quản Lý / Admin:</label>
              <select
                className="form-control"
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
              >
                {users.map(u => (
                  <option key={u.id} value={u.username}>
                    {u.role === 'admin' ? '👑 Admin - Quản Trị Viên' : `🏬 ${u.fullName}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Info Badge */}
            <div style={{ padding: '0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {selectedUserObj?.role === 'admin' ? <ShieldCheck size={16} /> : <Building size={16} />}
                <span>Quyền hạn: {selectedUserObj?.role === 'admin' ? 'Quản trị viên toàn hệ thống (Xem & sửa 5 chi nhánh)' : `Quản lý ${branchObj?.name || selectedUserObj?.branchId}`}</span>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                Mã tài khoản: <code>{selectedUserObj?.username}</code>
              </div>
            </div>

            <div className="form-group">
              <label>🔒 Mật khẩu:</label>
              <input
                type="password"
                className="form-control"
                placeholder="Nhập mật khẩu (Mặc định: 123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary">
              <LogIn size={16} />
              <span>Đăng Nhập</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
