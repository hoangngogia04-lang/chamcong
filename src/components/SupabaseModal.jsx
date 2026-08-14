import React, { useState } from 'react';
import { X, Database, Check, RefreshCw, Key, Link as LinkIcon } from 'lucide-react';
import { getSupabaseUrl, getSupabaseKey, saveSupabaseConfig } from '../utils/supabaseClient';

export default function SupabaseModal({
  isOpen,
  onClose,
  onSyncData
}) {
  const [url, setUrl] = useState(getSupabaseUrl());
  const [key, setKey] = useState(getSupabaseKey());
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    saveSupabaseConfig(url.trim(), key.trim());
    setStatusMsg('✅ Đã lưu cấu hình Supabase! Đang làm mới kết nối...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} className="text-cyan" />
            <span>Cấu Hình Đồng Bộ Cloud Supabase</span>
          </div>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {statusMsg && (
            <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600 }}>
              {statusMsg}
            </div>
          )}

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Điền URL dự án Supabase của bạn bên dưới để bật tự động đồng bộ dữ liệu chấm công giữa 5 chi nhánh trực tiếp qua Cloud database.
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <LinkIcon size={14} />
              <span>Supabase Project URL:</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: https://xxxx.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Key size={14} />
              <span>Publishable / Anon Key:</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="sb_publishable_..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.35rem' }}>
              📝 Hướng dẫn khởi tạo Bảng dữ liệu trên Supabase:
            </div>
            <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li>Truy cập trang quản trị Supabase Dashboard của bạn.</li>
              <li>Mở mục <strong>SQL Editor</strong>.</li>
              <li>Mở file <code>E:\chamcong\supabase_schema.sql</code>, copy toàn bộ nội dung SQL và dán vào SQL Editor rồi bấm <strong>RUN</strong>.</li>
            </ol>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Check size={16} />
            <span>Lưu & Kết Nối Cloud</span>
          </button>
        </div>
      </div>
    </div>
  );
}
