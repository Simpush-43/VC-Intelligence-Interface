import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message) => {
    const id = Date.now();
    
    // Add the new toast to the list
    setToasts((prev) => [...prev, { id, message }]);
    
    // Auto-remove it after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container - Fixed to the bottom right */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 bg-[#111113] border border-gray-800 text-white px-4 py-3.5 rounded-xl shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-300"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-[13px] font-medium tracking-wide">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-6 text-gray-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Custom hook so any component can easily fire a toast
export const useToast = () => useContext(ToastContext);