import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
        style={{ background: '#F4EED8' }}
      >
        <div className="game-card p-8 max-w-sm w-full">
          <p className="text-5xl mb-4">😔</p>
          <h1
            className="text-2xl font-black mb-2"
            style={{ background: 'linear-gradient(135deg,#B07D1A,#D4A94A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            جاوب
          </h1>
          <p className="text-jawwib-text font-bold mb-1">حدث خطأ غير متوقع</p>
          <p className="text-jawwib-text-dim text-sm mb-6">حاول تحديث الصفحة</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            className="btn-gold w-full py-3"
          >
            تحديث الصفحة 🔄
          </button>
        </div>
      </div>
    );
  }
}
