import React from 'react';

const Toggle = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${
        checked ? '' : 'bg-gray-300'
      }`}
      style={checked ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out"
        style={{ transform: checked ? 'translateX(24px)' : 'translateX(4px)' }}
      />
    </button>
  );
};

export default Toggle;
