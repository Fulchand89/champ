import React from 'react';
import { Link } from 'react-router-dom';
import { ICONS } from '../constants/icons';
import { ROUTES } from '../constants/routes';
import { THEME } from '../theme';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 selection:bg-[#E94B4B]/30 relative ">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-md    p-10 md:p-14 text-center mt-16 md:mt-0">

        {/* 404 Text */}
        <div className="relative inline-block mb-4">
          <h1 className="text-[120px] leading-none font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#E94B4B] to-[#911616] select-none tracking-tighter">
            404
          </h1>
          <ICONS.ExclamationTriangle className="w-12 h-12 text-[#E94B4B] absolute -top-4 -right-8 -rotate-12" />
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-4 tracking-tight">
          Page Not Found
        </h2>

        <p className="text-gray-500 mb-10 text-[15px] leading-relaxed max-w-sm mx-auto">
          Oops! It looks like you've wandered off the track. The page you are looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
          <button
            onClick={() => window.history.back()}
            className="group w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-gray-100 text-gray-600 font-semibold text-sm transition-all duration-300 ease-out hover:bg-gray-50 hover:border-gray-200 hover:text-gray-900 hover:shadow-sm"
          >
            <ICONS.ArrowLeft className="w-5 h-5 stroke-[2] transition-transform duration-300 group-hover:-translate-x-1" />
            Go Back
          </button>

          <Link
            to={ROUTES.HOME}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-300 ease-out shadow-[0_8px_20px_rgba(210,152,78,0.25)] hover:shadow-[0_8px_25px_rgba(210,152,78,0.35)] hover:-translate-y-0.5 hover:brightness-105 ${THEME.classes.sidebarBg}`}
          >
            <ICONS.Home className="w-5 h-5 stroke-[2]" />
            Back to Home
          </Link>
        </div>

      </div>

      {/* Decorative footer text */}
      <p className="text-gray-400 text-xs font-medium mt-10 tracking-wider uppercase">
        &copy; {new Date().getFullYear()} KnowChamp. All rights reserved.
      </p>
    </div>
  );
};

export default NotFound;
