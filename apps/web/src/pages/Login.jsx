import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ThemeToggle from '../components/ThemeToggle';

// -----------------------------------------------------------------------------
// Validation Schema
// -----------------------------------------------------------------------------
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// -----------------------------------------------------------------------------
// Assets / Illustrations (Generic Service Center)
// -----------------------------------------------------------------------------
const GenericIllustration = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="transparent" />
    <circle cx="200" cy="150" r="100" className="fill-blue-100 dark:fill-blue-900/30" />
    <g transform="translate(150, 100)">
        <path d="M50 0 C22.4 0 0 22.4 0 50 L0 80 L100 80 L100 50 C100 22.4 77.6 0 50 0 Z" className="fill-blue-600" />
        <circle cx="50" cy="40" r="20" className="fill-white" />
        <rect x="20" y="80" width="60" height="80" className="fill-slate-700" />
        <rect x="0" y="80" width="100" height="10" className="fill-yellow-500" />
    </g>
  </svg>
);

// -----------------------------------------------------------------------------
// Login Page Component
// -----------------------------------------------------------------------------

/**
 * Login Page Component
 * Handles user authentication, form validation, and session management.
 * Redirects to dashboard upon successful login.
 * @component
 */
const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form Setup
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Check for remembered user on mount
  React.useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUsername');
    if (rememberedUser) {
      setValue('username', rememberedUser);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  // Handle Login
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Use VITE_API_URL from environment variables
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Username: data.username,
          Password: data.password,
        }),
      });

      // Check if response is JSON (avoiding 'Unexpected end of JSON input')
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response. Please check API URL.");
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Login failed');
      }

      // Handle Remember Me
      if (data.rememberMe) {
        localStorage.setItem('rememberedUsername', data.username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }

      // Success
      localStorage.setItem('token', result.token);
      localStorage.setItem('role', result.Role);

      toast.success(`Welcome back, ${result.Role}!`);

      // Artificial delay for smooth UX transition
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Invalid credentials or server error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
      <Toaster position="top-right" />

      {/* -------------------------------------------------------------------------
          LEFT SPLIT: VISUALS
         ------------------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex w-1/2 flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-blue-900 to-slate-900"
      >
        <div className="relative z-10 w-full max-w-md p-10 text-center text-white">
            <div className="w-64 h-64 mx-auto mb-8 drop-shadow-2xl">
                <GenericIllustration />
            </div>

            <h1 className="text-4xl font-bold mb-4 tracking-tight">
                Service Center Portal
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
                Seamlessly manage operations, track repairs, and view real-time status updates from one central hub.
            </p>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </motion.div>

      {/* -------------------------------------------------------------------------
          RIGHT SPLIT: FORM
         ------------------------------------------------------------------------- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="absolute top-6 right-6">
            <ThemeToggle />
        </div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-full max-w-md space-y-8"
        >
            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Welcome back! Please enter your details.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
                <Input
                    label="Username"
                    id="username"
                    placeholder="Enter your username"
                    {...register('username')}
                    error={errors.username?.message}
                    className="h-12"
                />

                <div className="relative">
                    <Input
                        label="Password"
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...register('password')}
                        error={errors.password?.message}
                        className="h-12 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            {...register('rememberMe')}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                    </label>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    >
                        Forgot password?
                    </button>
                </div>

                <Button
                    type="submit"
                    isLoading={isLoading}
                    className="h-12 text-lg shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40"
                >
                    Sign in
                </Button>
            </form>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
                Don't have an account?{' '}
                <a href="/#contact" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Contact us to register
                </a>
            </p>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Reset Password"
      >
        <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start space-x-3">
                <div className="p-1 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-300">
                    <CheckCircle2 size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Contact Administrator</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        For security reasons, password resets must be processed by the system administrator.
                    </p>
                </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
                Please visit the service center or call our support line at <strong>+91-9876543210</strong> to request a password reset.
            </p>
            <div className="pt-2">
                <Button onClick={() => setIsModalOpen(false)} variant="outline" className="w-full">
                    Close
                </Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
