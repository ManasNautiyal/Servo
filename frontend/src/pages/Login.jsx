import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, AlertCircle, Loader, X, Lock, ShieldCheck } from 'lucide-react';
import logo from '../assets/logo.svg';
import api from '../services/api';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Forgot password flow states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data) => {
    setError('');
    setSubmitting(true);
    const res = await login(data.email, data.password);
    setSubmitting(false);
    
    if (res.success) {
      if (data.rememberMe) {
        localStorage.setItem('remembered_email', data.email);
      } else {
        localStorage.removeItem('remembered_email');
      }
      navigate(redirectPath, { replace: true });
    } else {
      setError(res.error);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotError('');
    setForgotSuccess('');
    setForgotSubmitting(true);
    try {
      await api.post('/api/auth/forgot-password/send-otp', { email: forgotEmail });
      setForgotStep(2);
      setForgotSuccess('A verification code has been sent to your email.');
    } catch (err) {
      setForgotError(err.response?.data?.detail || 'Failed to send verification code.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    
    if (!forgotOtp || !forgotNewPassword || !forgotConfirmPassword) {
      setForgotError('All fields are required.');
      return;
    }
    
    if (forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }
    
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotSubmitting(true);
    try {
      await api.post('/api/auth/forgot-password/reset', {
        email: forgotEmail,
        otp: forgotOtp,
        new_password: forgotNewPassword
      });
      setForgotSuccess('Password reset successfully! Redirecting...');
      setTimeout(() => {
        setShowForgotModal(false);
        // Reset states
        setForgotStep(1);
        setForgotEmail('');
        setForgotOtp('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        setForgotError('');
        setForgotSuccess('');
      }, 2500);
    } catch (err) {
      setForgotError(err.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12 dark:bg-darkBg sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-darkBorder dark:bg-darkCard">
        <div className="text-center">
          <img className="mx-auto h-12 w-auto" src={logo} alt="Servo Logo" />
          <h2 className="mt-6 font-sans text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Welcome back to Servo
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Or{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400">
              create a free student account
            </Link>
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md">
            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                College Email Address
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address format'
                    }
                  })}
                  className={`block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white ${
                    errors.email ? 'border-red-300 focus:border-red-500' : ''
                  }`}
                  placeholder="name@college.edu"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Password
                </label>
              </div>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className={`block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white ${
                    errors.password ? 'border-red-300 focus:border-red-500' : ''
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                {...register('rememberMe')}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-darkBorder dark:bg-darkBg"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-xs text-gray-600 dark:text-gray-400">
                Remember my email
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 focus:outline-none"
            >
              Forgot password?
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative flex w-full justify-center rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-brand-500 focus:outline-none disabled:opacity-70 dark:bg-brand-700 dark:hover:bg-brand-600 transition-all duration-200"
            >
              {submitting ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal Overlay */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-6 shadow-2xl dark:bg-darkCard dark:border-darkBorder space-y-4 relative">
            <button
              type="button"
              onClick={() => {
                setShowForgotModal(false);
                setForgotStep(1);
                setForgotEmail('');
                setForgotOtp('');
                setForgotNewPassword('');
                setForgotConfirmPassword('');
                setForgotError('');
                setForgotSuccess('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950/20">
                <KeyRound className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-950 dark:text-white">
                {forgotStep === 1 ? 'Reset Your Password' : 'Verify & Set Password'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                {forgotStep === 1 
                  ? 'Enter your registered college email and we will send you a verification code.'
                  : 'Enter the code sent to your email and set your new password.'}
              </p>
            </div>

            {forgotError && (
              <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/20 dark:text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="flex items-center space-x-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="forgotEmail" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    College Email Address
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="forgotEmail"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@college.edu"
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="w-full flex justify-center items-center rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-500 focus:outline-none disabled:opacity-70 dark:bg-brand-700 dark:hover:bg-brand-600 transition-all"
                >
                  {forgotSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : 'Send Verification Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* OTP Input */}
                <div>
                  <label htmlFor="forgotOtp" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Verification Code (OTP)
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="forgotOtp"
                      type="text"
                      required
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-3 text-sm tracking-wider focus:border-brand-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white font-mono"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="forgotNewPassword" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    New Password
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <KeyRound className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="forgotNewPassword"
                      type="password"
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="forgotConfirmPassword" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Confirm New Password
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <KeyRound className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="forgotConfirmPassword"
                      type="password"
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setForgotError('');
                      setForgotSuccess('');
                    }}
                    className="w-1/3 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 focus:outline-none dark:bg-darkBg dark:border-darkBorder dark:text-gray-300 dark:hover:bg-darkCard transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="w-2/3 flex justify-center items-center rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-500 focus:outline-none disabled:opacity-70 dark:bg-brand-700 dark:hover:bg-brand-600 transition-all"
                  >
                    {forgotSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
