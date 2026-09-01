import React from 'react';
import { Link } from 'react-router-dom';
import { ICONS } from '../constants/icons';
import { ROUTES } from '../constants/routes';
import { THEME } from '../theme';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#090b15] flex flex-col items-center justify-center p-6 selection:bg-[#E94B4B]/30 relative">
      <div className="w-full max-w-lg bg-[#0f1117] border border-white/10 rounded-3xl shadow-xl p-10 md:p-14 text-center mt-16 md:mt-0">

        {/* 404 Text */}
        <div className="relative inline-block mb-4">
          <h1 className="text-[120px] leading-none font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#E94B4B] to-[#911616] select-none tracking-tighter">
            404
          </h1>
          <ICONS.ExclamationTriangle className="w-12 h-12 text-[#E94B4B] absolute -top-4 -right-8 -rotate-12" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
          Page Not Found
        </h2>

        <p className="text-white/60 mb-10 text-[15px] leading-relaxed max-w-sm mx-auto">
          Oops! It looks like you've wandered off the track. The page you are looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
          <button
            onClick={() => window.history.back()}
            className="group w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 text-white/80 font-semibold text-sm transition-all duration-300 ease-out hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <ICONS.ArrowLeft className="w-5 h-5 stroke-[2] transition-transform duration-300 group-hover:-translate-x-1" />
            Go Back
          </button>

          <Link
            to={ROUTES.ADMIN.DASHBOARD}
            style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-300 ease-out shadow-md hover:opacity-90 hover:-translate-y-0.5 cursor-pointer"
          >
            <ICONS.Home className="w-5 h-5 stroke-[2]" />
            Back to Dashboard
          </Link>
        </div>

      </div>

      {/* Decorative footer text */}
      <p className="text-white/40 text-xs font-medium mt-10 tracking-wider uppercase">
        &copy; {new Date().getFullYear()} KnowChamp. All rights reserved.
      </p>
    </div>
  );
};

export default NotFound;
