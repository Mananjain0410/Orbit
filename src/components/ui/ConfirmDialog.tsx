import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}: ConfirmDialogProps) {
  
  const getIcon = () => {
    switch (variant) {
      case 'danger': return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case 'info': return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case 'danger': return 'bg-red-100';
      case 'warning': return 'bg-amber-100';
      case 'info': return 'bg-blue-100';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center pt-4">
        <div className={`w-12 h-12 rounded-full ${getIconBg()} flex items-center justify-center mb-4`}>
          {getIcon()}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-8">{description}</p>
        
        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'destructive' : 'default'} 
            className="flex-1" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
