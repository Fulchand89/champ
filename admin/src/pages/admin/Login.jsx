import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import images from '../../constants/images';
import { useAuth } from '../../hooks/useAuth';
import { systemSettingsService } from '../../api/services/systemSettingsService';
import { getImageUrl } from '../../utils/image';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [logoUrl, setLogoUrl] = useState(images.logo);
  const [logoLoading, setLogoLoading] = useState(true);
  const navigate = useNavigate();

  const { login, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Fetch dynamic platform logo from backend system settings
    const fetchLogo = async () => {
      try {
        const res = await systemSettingsService.getSettings();
        if (res?.data?.logoUrl) {
          setLogoUrl(getImageUrl(res.data.logoUrl));
        }
      } catch (err) {
        console.error('Error fetching logo for login:', err);
      }
    };
    fetchLogo();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({ email: '', password: '' });

    const result = await login({ email, password });
    if (result.type.endsWith('/fulfilled')) {
      navigate(ROUTES.ADMIN.DASHBOARD);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#090b15] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-[#0f1117] rounded-2xl shadow-xl border border-white/10 p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center">
          <div className="relative mx-auto h-16 w-auto flex items-center justify-center overflow-hidden">
            {logoLoading && (
              <div className="absolute inset-0 bg-slate-800/80 animate-pulse rounded-lg flex items-center justify-center">
                <div className="w-20 h-8 bg-slate-700/50 rounded animate-pulse" />
              </div>
            )}
            <img 
              src={logoUrl || '/logo_knowchamp.png'} 
              alt="KnowChamp" 
              onLoad={() => setLogoLoading(false)}
              onError={(e) => {
                setLogoLoading(false);
                e.target.onerror = null;
                e.target.src = '/logo_knowchamp.png';
              }}
              className={`h-16 w-auto object-contain mx-auto transition-all duration-300 ${logoLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`} 
            />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white tracking-tight">Admin Portal</h2>
          <p className="mt-2 text-[14px] text-gray-400 font-medium">Log in to manage KnowChamp</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          <div>
            <label className="block text-[13px] font-bold text-gray-300 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`block w-full pl-10 pr-4 py-2.5 bg-[#1a1d29] border ${
                  errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-white/10 focus:ring-[#E94B4B] focus:border-[#E94B4B]'
                } rounded-lg text-[14px] text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors`}
                placeholder="admin@quizapp.com"
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500 font-medium animate-in fade-in">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                className={`block w-full pl-10 pr-10 py-2.5 bg-[#1a1d29] border ${
                  errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-white/10 focus:ring-[#E94B4B] focus:border-[#E94B4B]'
                } rounded-lg text-[14px] text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors`}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500 font-medium animate-in fade-in">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-[14px] font-bold text-white focus:outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
