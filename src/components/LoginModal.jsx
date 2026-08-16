import React, { useState } from 'react';
import { X, LogIn, Lock, User, Building, ShieldCheck, Globe } from 'lucide-react';
import { translations } from '../utils/language';

export default function LoginModal({
  isOpen,
  onClose,
  users,
  branches,
  onLoginSuccess,
  lang = 'vi',
  setLang
}) {
  const t = translations[lang] || translations.vi;
  const [selectedUsername, setSelectedUsername] = useState(users[0]?.username || 'admin');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const targetUser = users.find(u => u.username === selectedUsername);
    if (!targetUser) {
      setErrorMsg(lang === 'zh' ? '帳號不存在！' : 'Tài khoản không tồn tại!');
      return;
    }

    if (targetUser.password && targetUser.password !== password) {
      setErrorMsg(lang === 'zh' ? '密碼錯誤！(預設密碼: 123)' : 'Mật khẩu không chính xác! (Mật khẩu mặc định: 123)');
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
            <span>{t.loginTitle}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {setLang && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setLang(lang === 'vi' ? 'zh' : 'vi')}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', color: 'var(--accent-cyan)' }}
                title="切換語言 / Đổi ngôn ngữ"
              >
                <Globe size={14} />
                <span>{lang === 'vi' ? '🇹🇼 TW' : '🇻🇳 VN'}</span>
              </button>
            )}
            <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.4rem' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="modal-body">
            {errorMsg && (
              <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600 }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <User size={15} />
                <span>{t.username}:</span>
              </label>
              <select
                className="form-control"
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
              >
                {users.map(u => (
                  <option key={u.id} value={u.username}>
                    {u.fullName} ({u.role === 'admin' ? t.adminMode : `${t.branch} ${u.branchId}`}) - [{u.username}]
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">
                <Lock size={15} />
                <span>{t.password}:</span>
              </label>
              <input
                type="password"
                className="form-control"
                placeholder={lang === 'zh' ? '請輸入密碼 (預設: 123)...' : 'Nhập mật khẩu (Mặc định: 123)...'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>

            {selectedUserObj && (
              <div style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.82rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  <ShieldCheck size={16} />
                  <span>{selectedUserObj.role === 'admin' ? t.adminMode : `${t.branch}: ${branchObj?.name || selectedUserObj.branchId}`}</span>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn btn-primary">
              <LogIn size={16} />
              <span>{t.loginBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
