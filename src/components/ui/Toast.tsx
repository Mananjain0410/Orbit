import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (title: string, description?: string, type?: ToastType) => void;
  showToast: (title: string, typeOrDesc?: ToastType | string, descOrType?: string | ToastType) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((title: string, description?: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, typeOrDesc?: ToastType | string, descOrType?: string | ToastType) => {
    let type: ToastType = 'info';
    let description: string | undefined = undefined;

    if (typeOrDesc === 'success' || typeOrDesc === 'error' || typeOrDesc === 'info' || typeOrDesc === 'warning') {
      type = typeOrDesc;
      if (typeof descOrType === 'string') description = descOrType;
    } else if (typeof typeOrDesc === 'string') {
      description = typeOrDesc;
      if (descOrType === 'success' || descOrType === 'error' || descOrType === 'info' || descOrType === 'warning') {
        type = descOrType;
      }
    }

    addToast(title, description, type);
  }, [addToast]);

  const value = {
    toast: addToast,
    showToast,
    success: (title: string, description?: string) => addToast(title, description, 'success'),
    error: (title: string, description?: string) => addToast(title, description, 'error'),
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="bg-card border border-border shadow-lg rounded-lg p-4 flex gap-3 w-80 pointer-events-auto"
            >
              {getIcon(t.type)}
              <div className="flex-1">
                <h4 className="text-sm font-medium">{t.title}</h4>
                {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
              </div>
              <button onClick={() => removeToast(t.id)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
