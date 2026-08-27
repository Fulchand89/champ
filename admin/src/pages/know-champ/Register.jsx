import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, User, Phone, UserPlus, CheckCircle, Download, LayoutDashboard, ArrowLeft } from 'lucide-react';
import authService from '../../api/services/authService';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    agreeToTerms: false,
  });

  // Validation Errors
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10,15}$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Mobile number must be between 10 and 15 digits';
    } else if (!/^\d+$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Mobile number must contain only digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await authService.register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        password: formData.password,
      });

      if (res?.success) {
        toast.success(res.message || 'Registration successful!');
        setIsSuccess(true);
      } else {
        toast.error(res?.message || 'Registration failed.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to register account';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadApp = () => {
    toast.success('App download initiated successfully!');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#090b15] py-12 px-4 sm:px-6 lg:px-8 select-none">
        <div className="max-w-md w-full bg-[#0f1117] rounded-2xl shadow-2xl border border-white/10 p-8 space-y-8 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col items-center">
            {/* Confetti & Checkmark icon */}
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mb-6">
              <CheckCircle className="w-12 h-12 stroke-[2]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Registration Successful!
            </h2>
            <p className="mt-2 text-sm font-bold text-red-500">
              Welcome to QuizChamp 🏆
            </p>
            <p className="mt-4 text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm">
              Your account has been created successfully. You are now ready to explore and participate in live quizzes.
            </p>
          </div>

          <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
            <button
              onClick={handleDownloadApp}
              className="w-full h-[48px] flex items-center justify-center gap-2 rounded-xl btn-brand-primary text-white font-bold text-sm tracking-wide shadow-lg cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download App
            </button>

            <Link
              to="/"
              className="w-full h-[48px] flex items-center justify-center gap-2 rounded-xl border border-red-500/30 hover:border-red-500/60 bg-transparent text-white hover:bg-white/5 font-bold text-sm tracking-wide transition-all duration-300 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-red-500" />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-[#090b15] select-none">
      {/* Back Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="flex w-full max-w-[1420px] mx-auto min-h-screen md:p-6 lg:p-8 items-center justify-center">
        <div className="flex w-full max-w-[1000px] bg-[#0f1117] rounded-3xl overflow-hidden border border-white/10 shadow-2xl min-h-[580px] flex-col md:flex-row">

          {/* Left Column — Marketing Sidebar */}
          <div
            className="hidden md:flex w-1/2 p-8 flex-col justify-between relative overflow-hidden border-r border-white/5"
            style={{
              background:
                "linear-gradient(178.27deg, #df3d3d07 1.6%, #df3d3d07 126.9%)",
            }}
          >
            {/* Decorative Glow */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#EF4444]/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#EC4899]/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Logo */}
            <div className="flex items-center gap-2 relative z-10">
              <img
                src="/logo_knowchamp.png"
                alt="QuizChamp"
                className="h-16 w-auto object-contain drop-shadow-[0_2px_8px_rgba(239,68,68,0.25)]"
              />
            </div>

            {/* Text & Graphics */}
            <div className="space-y-6 relative z-10 my-auto py-12">
              <h1 className="text-3xl font-black leading-tight text-white font-['Montserrat']">
                Create Your Account
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Join QuizChamp and participate in exciting quizzes & win amazing rewards!
              </p>

              <div className="pt-4 flex justify-center">
                <img
                  src="/trophy-hero.png"
                  alt="Trophy"
                  className="w-[200px] h-auto object-contain drop-shadow-[0_15px_30px_rgba(239,68,68,0.25)] select-none"
                  draggable="false"
                />
              </div>
            </div>

            {/* Footer brand info */}
            <div className="text-[10px] text-gray-500 font-semibold relative z-10">
              © {new Date().getFullYear()} QuizChamp • Secure Registration
            </div>
          </div>

          {/* Right Column — Register Form */}
          <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-center" style={{
            background:
              "linear-gradient(178.27deg, #df3d3d07 91.6%, #df3d3d07 126.9%)",
          }}>
            <div className="max-w-md w-full mx-auto space-y-6">

              {/* Form Header */}
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-white tracking-tight">Register</h2>
                <p className="mt-1.5 text-xs sm:text-sm text-gray-400 font-medium">
                  Fill in the details to get started
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleRegister} className="space-y-4" noValidate>

                {/* Full Name */}
                <div>
                  <div className="relative">
                    <User className="h-4.5 w-4.5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full pl-11 pr-4 py-2.5 bg-[#1a1d29] border ${errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-white/10 focus:ring-[#E94B4B] focus:border-[#E94B4B]'
                        } rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors`}
                      placeholder="Full Name"
                      disabled={loading}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1.5 text-[11px] text-red-500 font-medium animate-in fade-in">{errors.name}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <div className="relative">
                    <Mail className="h-4.5 w-4.5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-11 pr-4 py-2.5 bg-[#1a1d29] border ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-white/10 focus:ring-[#E94B4B] focus:border-[#E94B4B]'
                        } rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors`}
                      placeholder="Email Address"
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-[11px] text-red-500 font-medium animate-in fade-in">{errors.email}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <div className="relative">
                    <Phone className="h-4.5 w-4.5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className={`block w-full pl-11 pr-4 py-2.5 bg-[#1a1d29] border ${errors.mobile ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-white/10 focus:ring-[#E94B4B] focus:border-[#E94B4B]'
                        } rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors`}
                      placeholder="Mobile Number"
                      disabled={loading}
                    />
                  </div>
                  {errors.mobile && (
                    <p className="mt-1.5 text-[11px] text-red-500 font-medium animate-in fade-in">{errors.mobile}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="relative">
                    <Lock className="h-4.5 w-4.5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-11 pr-10 py-2.5 bg-[#1a1d29] border ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-white/10 focus:ring-[#E94B4B] focus:border-[#E94B4B]'
                        } rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors`}
                      placeholder="Password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer text-gray-500 hover:text-gray-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-[11px] text-red-500 font-medium animate-in fade-in">{errors.password}</p>
                  )}
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="mt-0.5 rounded border-white/10 bg-[#1a1d29] text-red-500 focus:ring-red-500 focus:ring-opacity-25 h-4 w-4 transition duration-150"
                      disabled={loading}
                    />
                    <span className="text-[11px] sm:text-xs text-gray-400 font-medium leading-tight">
                      I agree to the <Link to="#" className="text-red-500 hover:text-red-400 hover:underline transition-colors font-bold">Terms & Conditions</Link>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium animate-in fade-in">{errors.agreeToTerms}</p>
                  )}
                </div>

                {/* Register Now Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[48px] flex items-center justify-center gap-2 rounded-xl btn-brand-primary text-white font-bold text-sm tracking-wide shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-102 hover:shadow-red-500/20 active:scale-98 cursor-pointer mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Register Now
                    </>
                  )}
                </button>
              </form>



            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
