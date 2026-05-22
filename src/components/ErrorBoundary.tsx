import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; fallbackLabel?: string; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8, margin: 16 }}>
          <h3 style={{ color: '#cf1322', margin: '0 0 8px' }}>{this.props.fallbackLabel || '页面'} 渲染出错</h3>
          <pre style={{ fontSize: 12, color: '#666', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error.message}
            {'\n'}
            {this.state.error.stack}
          </pre>
          <button onClick={() => this.setState({ error: null })} style={{ marginTop: 8, padding: '4px 16px', cursor: 'pointer' }}>重试</button>
        </div>
      );
    }
    return this.props.children;
  }
}
