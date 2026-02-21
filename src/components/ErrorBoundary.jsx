import React from 'react';
import { Hammer, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // This lifecycle method catches the error and updates state
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // This lifecycle method logs the error
  componentDidCatch(error, errorInfo) {
    console.error("Critical App Crash Caught by Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // The Fallback "Under Construction" UI
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#FAFAFA] text-gray-900 p-6">
          <div className="bg-white border border-gray-200/75 p-10 rounded-3xl shadow-lg max-w-md w-full text-center flex flex-col items-center animate-in zoom-in duration-300">
            
            {/* Animated Construction Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-20"></div>
              <div className="relative bg-amber-100 text-amber-600 p-4 rounded-full shadow-inner">
                <Hammer className="h-10 w-10 animate-bounce" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold tracking-tight mb-3">We're working on it!</h1>
            <p className="text-[14px] text-gray-500 mb-8 leading-relaxed">
              Our system encountered an unexpected UI error. Don't worry, our engineers have been notified and are actively patching the system.
            </p>
            
            {/* Hard Reload Button */}
            <button
              onClick={() => window.location.href = '/companies'}
              className="flex items-center justify-center gap-2 w-full bg-[#0A0A0B] text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition-colors text-[14px] font-medium shadow-md"
            >
              <RotateCcw className="h-4 w-4" /> Refresh & Restart
            </button>
           
            <p className="mt-4 text-[10px] text-red-400 font-mono break-all text-left w-full bg-red-50 p-2 rounded">{this.state.error?.toString()}</p>

          </div>
        </div>
      );
    }

    // If no error, render the app normally
    return this.props.children;
  }
}

export default ErrorBoundary;