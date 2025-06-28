import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, InfoCircle as Info } from '@untitled-ui/icons-react';
import { cn } from '@utils/cn';
import { theme } from '@styles/theme';

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  variant = 'default',
  action,
  onClose,
}) => {
  const icons = {
    default: null,
    success: <CheckCircle className="w-5 h-5 text-success-600" />,
    error: <AlertCircle className="w-5 h-5 text-error-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning-600" />,
    info: <Info className="w-5 h-5 text-primary-600" />,
  };

  const variantStyles = {
    default: 'bg-white border-gray-200',
    success: 'bg-success-50 border-success-200',
    error: 'bg-error-50 border-error-200',
    warning: 'bg-warning-50 border-warning-200',
    info: 'bg-primary-50 border-primary-200',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg',
        variantStyles[variant]
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          {icons[variant] && (
            <div className="flex-shrink-0 mr-3">
              {icons[variant]}
            </div>
          )}
          
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {title}
            </p>
            {description && (
              <p className="mt-1 text-sm text-gray-600">
                {description}
              </p>
            )}
            {action && (
              <button
                onClick={action.onClick}
                className="mt-3 text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                {action.label}
              </button>
            )}
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Toast Container
export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'bottom-right',
}) => {
  const positionStyles = {
    'top-left': 'top-0 left-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-0 right-0',
  };

  return (
    <div
      className={cn(
        'fixed z-50 pointer-events-none p-4',
        positionStyles[position]
      )}
      style={{ maxWidth: '420px' }}
    >
      <AnimatePresence mode="sync">
        <div className="space-y-2">
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};

// Toast Hook
let toastIdCounter = 0;

export interface UseToastOptions {
  duration?: number;
  position?: ToastContainerProps['position'];
}

export const useToast = (options?: UseToastOptions) => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const showToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = `toast-${++toastIdCounter}`;
    const duration = toast.duration || options?.duration || 5000;

    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: () => removeToast(id),
    };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }

    return id;
  }, [options?.duration]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useMemo(() => ({
    show: showToast,
    success: (title: string, description?: string) =>
      showToast({ title, description, variant: 'success' }),
    error: (title: string, description?: string) =>
      showToast({ title, description, variant: 'error' }),
    warning: (title: string, description?: string) =>
      showToast({ title, description, variant: 'warning' }),
    info: (title: string, description?: string) =>
      showToast({ title, description, variant: 'info' }),
    remove: removeToast,
  }), [showToast, removeToast]);

  return {
    toasts,
    toast,
    ToastContainer: () => <ToastContainer toasts={toasts} position={options?.position} />,
  };
};

// Styled version
export const getToastStyles = (variant: ToastProps['variant'] = 'default') => {
  const base = {
    width: '100%',
    maxWidth: '24rem',
    overflow: 'hidden',
    borderRadius: theme.borderRadius.lg,
    border: '1px solid',
    boxShadow: theme.boxShadow.lg,
    padding: theme.spacing[4],
  };

  const variants = {
    default: {
      backgroundColor: theme.colors.white,
      borderColor: theme.colors.gray[200],
    },
    success: {
      backgroundColor: theme.colors.success[50],
      borderColor: theme.colors.success[200],
    },
    error: {
      backgroundColor: theme.colors.error[50],
      borderColor: theme.colors.error[200],
    },
    warning: {
      backgroundColor: theme.colors.warning[50],
      borderColor: theme.colors.warning[200],
    },
    info: {
      backgroundColor: theme.colors.primary[50],
      borderColor: theme.colors.primary[200],
    },
  };

  return {
    ...base,
    ...variants[variant],
  };
};