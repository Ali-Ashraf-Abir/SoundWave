import React from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

// Base Modal Component
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function BaseModal({ isOpen, onClose, children }: BaseModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div 
        className="relative bg-[#282828] rounded-2xl shadow-2xl max-w-md w-full animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// Success Modal
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  title, 
  message,
  buttonText = "Got it"
}: SuccessModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-[#1DB954]/20 flex items-center justify-center animate-scaleIn">
              <CheckCircle className="w-7 h-7 text-[#1DB954]" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-[#B3B3B3] leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-[#B3B3B3] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#1DB954] text-white font-medium rounded-full hover:bg-[#1ed760] hover:scale-105 transition-all duration-200"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// Error Modal
interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

export function ErrorModal({ 
  isOpen, 
  onClose, 
  title, 
  message,
  buttonText = "Dismiss"
}: ErrorModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-[#E22134]/20 flex items-center justify-center animate-scaleIn">
              <XCircle className="w-7 h-7 text-[#E22134]" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-[#B3B3B3] leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-[#B3B3B3] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#E22134] text-white font-medium rounded-full hover:bg-[#ff2d42] hover:scale-105 transition-all duration-200"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// Confirmation Modal
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'primary'
}: ConfirmModalProps) {
  const variantStyles = {
    danger: {
      iconBg: 'bg-[#E22134]/20',
      iconColor: 'text-[#E22134]',
      buttonBg: 'bg-[#E22134] hover:bg-[#ff2d42]',
    },
    warning: {
      iconBg: 'bg-[#FFA500]/20',
      iconColor: 'text-[#FFA500]',
      buttonBg: 'bg-[#FFA500] hover:bg-[#ffb733]',
    },
    primary: {
      iconBg: 'bg-[#1DB954]/20',
      iconColor: 'text-[#1DB954]',
      buttonBg: 'bg-[#1DB954] hover:bg-[#1ed760]',
    },
  };

  const styles = variantStyles[variant];

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center animate-scaleIn`}>
              <AlertCircle className={`w-7 h-7 ${styles.iconColor}`} />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-[#B3B3B3] leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-[#B3B3B3] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#181818] text-[#B3B3B3] font-medium rounded-full hover:bg-[#282828] hover:text-white transition-all duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2.5 text-white font-medium rounded-full hover:scale-105 transition-all duration-200 ${styles.buttonBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// Info Modal (bonus component)
interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

export function InfoModal({ 
  isOpen, 
  onClose, 
  title, 
  message,
  buttonText = "Okay"
}: InfoModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-[#3B82F6]/20 flex items-center justify-center animate-scaleIn">
              <AlertCircle className="w-7 h-7 text-[#3B82F6]" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-[#B3B3B3] leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-[#B3B3B3] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#3B82F6] text-white font-medium rounded-full hover:bg-[#60a5fa] hover:scale-105 transition-all duration-200"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}