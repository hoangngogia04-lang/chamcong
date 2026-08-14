import React, { useState } from 'react';
import { LogIn, Lock, User, ShieldCheck, Building } from 'lucide-react';

export default function LoginPage({
  users,
  branches,
  onLoginSuccess
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!');
      return;
    }

    const targetUser = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!targetUser) {
      setErrorMsg('Tên đăng nhập hoặc mật khẩu không chính xác!');
      return;
    }

    // Verify password
    const validPassword = targetUser.password || '123';
    if (validPassword !== password) {
      setErrorMsg('Tên đăng nhập hoặc mật khẩu không chính xác!');
      return;
    }

    onLoginSuccess(targetUser, rememberMe);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      padding: '1.5rem'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '440px',
        padding: '2.25rem 2rem',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
          <div className="brand-icon" style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-lg)' }}>
            <Building size={32} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Hệ Thống Chấm Công
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Vui lòng đăng nhập tài khoản Quản lý hoặc Admin
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMsg && (
            <div style={{
              padding: '0.75rem 0.9rem',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid var(--accent-rose)',
              color: 'var(--accent-rose)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Username Input */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={15} />
              <span>Tên Đăng Nhập (Username):</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập tên đăng nhập..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ fontSize: '0.95rem', padding: '0.75rem' }}
              autoFocus
            />
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={15} />
              <span>Mật Khẩu:</span>
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ fontSize: '0.95rem', padding: '0.75rem' }}
            />
          </div>

          {/* Remember me checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="remember" style={{ cursor: 'pointer', userSelect: 'none' }}>
              Ghi nhớ đăng nhập trên thiết bị này
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0.8rem', fontSize: '1rem', marginTop: '0.5rem', width: '100%' }}
          >
            <LogIn size={20} />
            <span>Đăng Nhập Hàng Ngày</span>
          </button>
        </form>
      </div>
    </div>
  );
}
