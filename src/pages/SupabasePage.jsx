import React, { useState, useEffect } from 'react';
import { Database, Check, Key, Link as LinkIcon, FileSpreadsheet, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';
import { getSupabaseUrl, getSupabaseKey, saveSupabaseConfig, testSupabaseConnection } from '../utils/supabaseClient';

export default function SupabasePage() {
  const [url, setUrl] = useState(getSupabaseUrl());
  const [key, setKey] = useState(getSupabaseKey());
  const [statusMsg, setStatusMsg] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (url && key) {
      handleTestConnection();
    }
  }, []);

  const handleTestConnection = async () => {
    setLoading(true);
    setTestResult(null);
    saveSupabaseConfig(url.trim(), key.trim());

    const res = await testSupabaseConnection();
    setTestResult(res);
    setLoading(false);
  };

  const handleSave = async () => {
    saveSupabaseConfig(url.trim(), key.trim());
    setStatusMsg('✅ Đã lưu cấu hình Supabase! Đang tải lại dữ liệu...');
    await handleTestConnection();
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Database size={28} className="text-emerald" />
          <span>Cấu Hình Kết Nối Live Database Supabase</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Đảm bảo điền chính xác Supabase Project URL và anon API Key từ trang Supabase Dashboard của bạn
        </p>
      </div>

      {statusMsg && (
        <div style={{ padding: '0.85rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: 600 }}>
          {statusMsg}
        </div>
      )}

      {/* Connection Test Banner */}
      {testResult && (
        <div style={{
          padding: '1rem 1.25rem',
          background: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
          border: `1px solid ${testResult.success ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
          color: testResult.success ? 'var(--accent-emerald)' : 'var(--accent-rose)',
          borderRadius: 'var(--radius-lg)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          {testResult.success ? <Check size={24} /> : <ShieldAlert size={24} />}
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>
              {testResult.success ? '🟢 ĐÃ KẾT NỐI SUPABASE THÀNH CÔNG!' : '🔴 CHƯA KẾT NỐI ĐƯỢC VỚI SUPABASE!'}
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.2rem', opacity: 0.9 }}>
              {testResult.message}
            </div>
          </div>
        </div>
      )}

      {/* Config Card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: 'var(--shadow-md)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
          🔑 Thông Tin API Key & Project URL
        </h3>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <LinkIcon size={16} />
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
            <Key size={16} />
            <span>Publishable / Anon API Key (Khóa API):</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            <Check size={18} />
            <span>Lưu & Kết Nối Tự Động</span>
          </button>
          <button className="btn btn-secondary" onClick={handleTestConnection} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
            <span>Kiểm Tra Kết Nối</span>
          </button>
        </div>
      </div>

      {/* Where to find URL & Key guide */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--shadow-md)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={22} />
          <span>📍 Lấy Project URL & Anon Key ở đâu trên Supabase?</span>
        </h3>

        <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
          <li>Mở **Supabase Dashboard** dự án của bạn: <code>https://supabase.com/dashboard</code></li>
          <li>Bấm vào biểu tượng bánh răng **Project Settings (⚙️)** ở menu góc dưới bên trái.</li>
          <li>Chọn mục **API**.</li>
          <li>Copy **Project URL** (dạng <code>https://xxxx.supabase.co</code>) và dán vào ô **Supabase Project URL** bên trên.</li>
          <li>Copy khóa **Project API keys** dòng **`anon` `public`** (chuỗi chữ dài bắt đầu bằng <code>eyJhbGci...</code>) và dán vào ô **Publishable / Anon API Key**.</li>
        </ol>
      </div>
    </div>
  );
}
