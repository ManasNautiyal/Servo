import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, AlertCircle, Loader } from 'lucide-react';
import logo from '../assets/logo.svg';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    </div>
  );
};

export default Login;
