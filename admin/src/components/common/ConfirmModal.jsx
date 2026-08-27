import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

const ConfirmModal = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info'
  isLoading = false
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      iconBg: 'bg-red-100 text-red-600',
      buttonBg: 'text-white shadow-xs',
      buttonStyle: { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' },
    },
    warning: {
      iconBg: 'bg-amber-100 text-amber-600',
      buttonBg: 'text-white shadow-xs',
      buttonStyle: { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' },
    },
    info: {
      iconBg: 'bg-blue-100 text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs',
      buttonStyle: {},
    }
  };

  const style = typeStyles[type] || typeStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#0f1117] text-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/10 relative animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-3">
          <div className={`p-3 rounded-xl shrink-0 ${style.iconBg}`}>
            <AlertTriangle className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{title}</h3>
          </div>
        </div>

        {/* Modal Body */}
        <p className="text-xs text-gray-400 leading-relaxed mb-6 font-medium">
          {message}
        </p>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-bold border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={style.buttonStyle}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${style.buttonBg}`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;