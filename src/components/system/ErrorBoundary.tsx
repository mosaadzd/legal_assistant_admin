import React from 'react';

interface ErrorBoundaryState { hasError: boolean; error?: any; }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError(error: any): ErrorBoundaryState { return { hasError: true, error }; }
  componentDidCatch(error: any, info: any) { console.error('ErrorBoundary caught', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-xl mx-auto">
          <div className="border rounded-md bg-red-50 border-red-200 p-4 space-y-2">
            <h2 className="text-sm font-semibold text-red-700">Something went wrong</h2>
            <pre className="text-[10px] whitespace-pre-wrap text-red-700/80 max-h-40 overflow-auto">{String(this.state.error)}</pre>
            <button onClick={()=> location.reload()} className="text-xs px-3 py-1 rounded bg-red-600 text-white">Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
