import React from 'react';
import { logError } from '../../utils/errorTracker';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorId: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    const id = logError(
      'react:' + (this.props.name || 'component'),
      error.message,
      info.componentStack?.slice(0, 500) || '',
      error.stack || ''
    );
    this.setState({ errorId: id });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    const isDark = this.props.isDark !== false;
    return (
      <div style={{
        padding: '24px', margin: '12px', borderRadius: 12,
        background: 'rgba(255,64,64,0.07)', border: '1px solid rgba(255,64,64,0.2)',
        color: isDark ? '#F0EFFF' : '#111',
      }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#FF4040', marginBottom: 6 }}>
          ⚠ Component Error
        </div>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 12 }}>
          {this.props.name || 'A component'} crashed. Check Settings → Error Log for details.
        </div>
        <button onClick={() => this.setState({ hasError: false })}
          style={{ fontSize: 11, padding: '5px 14px', borderRadius: 8, cursor: 'pointer',
            background: 'rgba(255,64,64,0.1)', border: '1px solid rgba(255,64,64,0.3)', color: '#FF4040' }}>
          ↻ Retry
        </button>
      </div>
    );
  }
}
