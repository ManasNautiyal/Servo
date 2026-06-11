import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, GraduationCap, KeyRound, AlertCircle, Loader } from 'lucide-react';
import logo from '../assets/logo.svg';
import api from '../services/api';

const Register = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpMessage, setOtpMessage] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const passwordVal = watch('password');
  const emailVal = watch('email');

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const handleSendOtp = async () => {
    if (!emailVal || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailVal)) {
      setError('Please enter a valid college email address first.');
      return;
    }
    setError('');
    setOtpMessage('');
    setSendingOtp(true);
    try {
      const res = await api.post('/api/auth/send-otp', { email: emailVal });
      setOtpSent(true);
      setOtpMessage(res.data.message || 'Verification code sent to your email.');
      setOtpCountdown(60); // 60s resend cooldown
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to send verification code. Please try again.';
      setError(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const onSubmit = async (data) => {
    setError('');
    setSubmitting(true);
    
    // Package registry payload
    const payload = {
      name: data.name,
      email: data.email,
      college_id: data.college_id,
      branch: data.branch,
      year: parseInt(data.year),
      password: data.password,
      otp: data.otp
    };
    
    const res = await registerAuth(payload);
    setSubmitting(false);
    
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12 dark:bg-darkBg sm:px-6 lg:px-8">
      <div className="w-full max-w-xl space-y-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-darkBorder dark:bg-darkCard">
        <div className="text-center">
          <img className="mx-auto h-12 w-auto" src={logo} alt="Servo Logo" />
          <h2 className="mt-6 font-sans text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Create your student account
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400">
              Sign in here
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
          <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
            
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Full Name
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: 'Full name is required', minLength: { value: 2, message: 'Name too short' } })}
                  className={`block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white ${
                    errors.name ? 'border-red-300 focus:border-red-500' : ''
                  }`}
                  placeholder="Rahul Verma"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                College Email Address
              </label>
              <div className="mt-1 flex gap-2">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    {...register('email', {
                      required: 'College email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email format'
                      }
                    })}
                    className={`block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white ${
                      errors.email ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                    placeholder="name@college.edu"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || otpCountdown > 0}
                  className="rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-500 disabled:opacity-60 transition-all"
                >
                  {sendingOtp ? 'Sending...' : otpCountdown > 0 ? `Resend (${otpCountdown}s)` : 'Send OTP'}
                </button>
              </div>
              {otpMessage && (
                <p className="mt-1.5 text-xs text-green-600 dark:text-green-400 font-medium">{otpMessage}</p>
              )}
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* OTP Verification Code */}
            {otpSent && (
              <div className="sm:col-span-2">
                <label htmlFor="otp" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  OTP Verification Code
                </label>
                <div className="relative mt-1">
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    {...register('otp', {
                      required: 'Verification code is required',
                      minLength: { value: 6, message: 'OTP must be 6 digits' }
                    })}
                    className={`block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-3 text-sm focus:border-brand-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white ${
                      errors.otp ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                    placeholder="Enter 6-digit code"
                  />
                </div>
                {errors.otp && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.otp.message}</p>
                )}
              </div>
            )}

            {/* College ID / Roll Number */}
            <div>
              <label htmlFor="college_id" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                College ID / Roll No.
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <GraduationCap className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="college_id"
                  type="text"
                  {...register('college_id', { required: 'College ID is required' })}
                  className={`block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white ${
                    errors.college_id ? 'border-red-300 focus:border-red-500' : ''
                  }`}
                  placeholder="CS-2023-045"
                />
              </div>
              {errors.college_id && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.college_id.message}</p>
              )}
            </div>

            {/* Branch */}
            <div>
              <label htmlFor="branch" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Branch / Discipline
              </label>
              <input
                id="branch"
                type="text"
                {...register('branch', { required: 'Branch is required' })}
                className={`mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-3 text-sm focus:border-brand-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white ${
                  errors.branch ? 'border-red-300 focus:border-red-500' : ''
                }`}
                placeholder="Computer Science"
              />
              {errors.branch && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.branch.message}</p>
              )}
            </div>

            {/* Study Year */}
            <div className="sm:col-span-2">
              <label htmlFor="year" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Year of Study
              </label>
              <select
                id="year"
                {...register('year', { required: 'Year selection is required' })}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-3 text-sm focus:border-brand-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
              >
                <option value="1">1st Year (Freshman)</option>
                <option value="2">2nd Year (Sophomore)</option>
                <option value="3">3rd Year (Junior)</option>
                <option value="4">4th Year (Senior)</option>
                <option value="5">5th Year (Dual Degree/Integrated)</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Must be at least 6 characters' }
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm_password" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm_password"
                  type="password"
                  {...register('confirm_password', {
                    required: 'Please confirm your password',
                    validate: (val) => val === passwordVal || 'Passwords do not match'
                  })}
                  className={`block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white ${
                    errors.confirm_password ? 'border-red-300 focus:border-red-500' : ''
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.confirm_password.message}</p>
              )}
            </div>

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
                'Register Student'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
