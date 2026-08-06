import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  onResetFilters?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onResetFilters) {
      this.props.onResetFilters();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 my-6 text-center shadow-xs">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-red-900 uppercase tracking-wide">
            Ocurrió un problema al aplicar la selección
          </h3>
          <p className="text-xs text-red-700 mt-1 max-w-lg mx-auto">
            {this.state.error?.message || 'Incompatibilidad de datos al filtrar el listado.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar Filtros y Reintentar
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
