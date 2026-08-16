import React from 'react';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('quan_ly_cham_cong_current_user');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0D1B2A',
          color: '#E0E1DD',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#1B263B',
            border: '1px solid #415A77',
            borderRadius: '16px',
            padding: '2.5rem',
            maxWidth: '520px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#F43F5E',
              display: 'flex',
              alignItems: 'center',
              justify: 'center'
            }}>
              <AlertCircle size={36} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
              Đã Xảy Ra Sự Cố Tải Giao Diện
            </h2>

            <p style={{ fontSize: '0.9rem', color: '#778DA9', margin: 0, lineHeight: 1.5 }}>
              Ứng dụng vừa gặp trục trặc hiển thị tạm thời. Bạn hãy nhấn nút bên dưới để khôi phục phiên đăng nhập và mở lại giao diện nhé!
            </p>

            {this.state.error && (
              <code style={{ fontSize: '0.75rem', color: '#F43F5E', background: '#0D1B2A', padding: '0.5rem 0.75rem', borderRadius: '6px', maxWidth: '100%', overflowX: 'auto' }}>
                {String(this.state.error.message || this.state.error)}
              </code>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#06B6D4',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <RefreshCw size={16} />
                <span>Tải Lại Trang (F5)</span>
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  background: '#F43F5E',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <LogOut size={16} />
                <span>Đăng Nhập Lại</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
