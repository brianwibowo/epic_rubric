import React from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <Card variant="glass" padding="lg" style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--color-error, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Terjadi Kesalahan pada Halaman
            </h2>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
              Sistem mendeteksi kendala saat memuat komponen ini. Anda dapat mencoba memuat ulang atau kembali ke beranda.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre style={{
                textAlign: 'left',
                background: 'var(--bg-canvas, #f8fafc)',
                border: '1px solid var(--border-color, #e2e8f0)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#dc2626',
                overflowX: 'auto',
                marginBottom: '20px',
                maxHeight: '150px'
              }}>
                {this.state.error.toString()}
              </pre>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                <Home size={16} /> Ke Beranda
              </Button>
              <Button variant="primary" onClick={this.handleReset}>
                <RefreshCw size={16} /> Muat Ulang
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
