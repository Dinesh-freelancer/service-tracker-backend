import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { Eye, EyeOff, CheckCircle2, UserCircle2, HardHat, Home } from 'lucide-react';
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
// Assets / Illustrations (SVGs as Components for now)
// -----------------------------------------------------------------------------
const StaffIllustration = () => (
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

const CustomerIllustration = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="transparent" />
    <circle cx="200" cy="150" r="100" className="fill-green-100 dark:fill-green-900/30" />
    <g transform="translate(120, 80)">
       <path d="M80 0 L160 60 L0 60 Z" className="fill-slate-700 dark:fill-slate-500" />
       <rect x="20" y="60" width="120" height="100" className="fill-white dark:fill-slate-200" />
       <rect x="60" y="100" width="40" height="60" className="fill-blue-400" />
    </g>
  </svg>
);

// -----------------------------------------------------------------------------
// Login Page Component
// -----------------------------------------------------------------------------
const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('staff'); // 'staff' | 'customer'
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Username: data.username,
          Password: data.password,
        }),
      });

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
      toast.error(err.message || 'Invalid credentials');
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
        className={clsx(
            "hidden lg:flex w-1/2 flex-col justify-center items-center relative overflow-hidden",
            selectedRole === 'staff'
                ? "bg-gradient-to-br from-blue-900 to-slate-900"
                : "bg-gradient-to-br from-emerald-900 to-slate-900"
        )}
      >
        <div className="relative z-10 w-full max-w-md p-10 text-center text-white">
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedRole}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="w-64 h-64 mx-auto mb-8 drop-shadow-2xl">
                        {selectedRole === 'staff' ? <StaffIllustration /> : <CustomerIllustration />}
                    </div>

                    <h1 className="text-4xl font-bold mb-4 tracking-tight">
                        {selectedRole === 'staff' ? 'Master Operations' : 'Track Your Repairs'}
                    </h1>
                    <p className="text-lg text-white/80 leading-relaxed">
                        {selectedRole === 'staff'
                            ? 'Efficiently manage service requests, inventory, and workflows from one central hub.'
                            : 'Real-time updates, instant quotes, and seamless payments for your peace of mind.'}
                    </p>
                </motion.div>
            </AnimatePresence>
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

            {/* Role Switcher Tabs */}
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex">
                <button
                    onClick={() => setSelectedRole('staff')}
                    className={clsx(
                        "flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        selectedRole === 'staff'
                            ? "bg-white dark:bg-slate-700 shadow text-blue-700 dark:text-blue-300"
                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    )}
                >
                    <HardHat size={18} />
                    <span>Staff / Admin</span>
                </button>
                <button
                    onClick={() => setSelectedRole('customer')}
                    className={clsx(
                        "flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        selectedRole === 'customer'
                            ? "bg-white dark:bg-slate-700 shadow text-emerald-700 dark:text-emerald-300"
                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    )}
                >
                    <UserCircle2 size={18} />
                    <span>Customer</span>
                </button>
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
                    className={clsx(
                        "h-12 text-lg shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40",
                        selectedRole === 'customer' && "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 focus:ring-emerald-500"
                    )}
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
