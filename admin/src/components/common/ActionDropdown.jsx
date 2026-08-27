import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Edit, UserCheck, UserX, Trash2, Loader2, KeyRound } from 'lucide-react';

const ActionDropdown = ({ onEdit, onChangePassword, onToggleStatus, isActive = true, isLoading = false, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({});
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (isLoading) return;
    if (!isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 150;

      const pos = {
        right: window.innerWidth - rect.right,
      };

      if (spaceBelow < menuHeight) {
        pos.bottom = window.innerHeight - rect.top + 5;
      } else {
        pos.top = rect.bottom + 5;
      }
      
      setPosition(pos);
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target) &&
        menuRef.current && !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', () => setIsOpen(false), true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', () => setIsOpen(false), true);
    };
  }, [isOpen]);

  const menu = isOpen ? createPortal(
    <div 
      ref={menuRef}
      style={position}
      className="fixed w-44 bg-[#0f1117] border border-white/10 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()}
    >
      {onEdit && (
        <button 
          disabled={isLoading}
          onClick={() => {
            setIsOpen(false);
            if (onEdit) onEdit();
          }}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white hover:bg-gray-800 hover:text-[#E94B4B] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Edit className="w-4 h-4 text-gray-400" />
          <span className="font-medium">Edit Profile</span>
        </button>
      )}

      {onChangePassword && (
        <button 
          disabled={isLoading}
          onClick={() => {
            setIsOpen(false);
            if (onChangePassword) onChangePassword();
          }}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white hover:bg-gray-800 hover:text-[#E94B4B] transition-colors border-t border-gray-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <KeyRound className="w-4 h-4 text-amber-600" />
          <span className="font-medium">Change Password</span>
        </button>
      )}
      
      {onToggleStatus && (
        <button 
          disabled={isLoading}
          onClick={() => {
            if (isLoading) return;
            setIsOpen(false);
            if (onToggleStatus) onToggleStatus(!isActive);
          }}
          className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors border-t border-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            isActive 
              ? 'text-[#E03137] hover:bg-[#FCEAEB]' 
              : 'text-[#2F9B4D] hover:bg-gray-800'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isActive ? (
            <UserX className="w-4 h-4 text-[#E03137]" />
          ) : (
            <UserCheck className="w-4 h-4 text-[#2F9B4D]" />
          )}
          <span>{isLoading ? 'Updating...' : isActive ? 'Deactivate' : 'Activate'}</span>
        </button>
      )}

      {onDelete && (
        <button 
          disabled={isLoading}
          onClick={() => {
            setIsOpen(false);
            if (onDelete) onDelete();
          }}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-[#E03137] hover:bg-[#FCEAEB] transition-colors border-t border-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          <span className="font-medium">Delete</span>
        </button>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative inline-block text-left">
      <button 
        ref={buttonRef}
        disabled={isLoading}
        onClick={toggleDropdown}
        className="text-[#E94B4B] hover:bg-[#E94B4B]/10 p-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#E94B4B]" />
        ) : (
          <MoreVertical className="w-4 h-4" />
        )}
      </button>
      {menu}
    </div>
  );
};

export default ActionDropdown;
