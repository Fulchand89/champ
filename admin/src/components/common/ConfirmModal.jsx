import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

const ConfirmModal = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info'
  isLoading = false,
  icon: CustomIcon,
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      iconBg: 'bg-red-500/10 border-red-500/20 text-[#E94B4B]',
      buttonStyle: { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' },
      Icon: CustomIcon || Trash2,
    },
    warning: {
      iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      buttonStyle: { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' },
      Icon: CustomIcon || AlertTriangle,
    },
    info: {
      iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      buttonStyle: { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' },
      Icon: CustomIcon || AlertTriangle,
    }
  };

  const style = typeStyles[type] || typeStyles.danger;
  const IconComponent = style.Icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#12141e] text-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/10 relative text-center animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Circular Centered Icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${style.iconBg}`}>
          <IconComponent className="w-7 h-7 stroke-[1.8]" />
        </div>

        {/* Modal Title */}
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>

        {/* Modal Message */}
        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6 font-medium whitespace-pre-line">
          {message}
        </p>

        {/* Modal Actions */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold border border-gray-700 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={style.buttonStyle}
            className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold text-white rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-50 shadow-md"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              type === 'danger' && <Trash2 size={16} />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;