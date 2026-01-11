import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  Hammer,
  ShoppingBag,
  Bell,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import toast, { Toaster } from 'react-hot-toast';

/**
 * Dashboard Layout Component
 * Provides the main application shell with a responsive sidebar and top navbar.
 * Handles navigation, user profile, and global notifications (Toaster).
 * @component
 */
const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role') || 'Worker'; // Default to Worker if not found
  const username = localStorage.getItem('rememberedUsername') || 'User';

  const isAdminOrOwner = role === 'Admin' || role === 'Owner';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Navigation Items based on Role
  const getNavItems = (role) => {
    const commonItems = [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ];

    const adminItems = [
      { name: 'Jobs', icon: Briefcase, path: '/dashboard/jobs' },
      { name: 'Customers', icon: Users, path: '/dashboard/customers' },
      { name: 'Inventory', icon: ShoppingBag, path: '/dashboard/inventory' },
      { name: 'Reports', icon: FileText, path: '/dashboard/reports' },
      { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
    ];

    const workerItems = [
      { name: 'My Jobs', icon: Briefcase, path: '/dashboard/jobs' },
      { name: 'Work Logs', icon: Hammer, path: '/dashboard/work-logs' },
    ];

    const customerItems = [
      { name: 'My Jobs', icon: Briefcase, path: '/dashboard/my-jobs' },
      { name: 'Documents', icon: FileText, path: '/dashboard/documents' },
    ];

    if (role === 'Owner') {
        return [...commonItems, ...adminItems, { name: 'Users', icon: Shield, path: '/dashboard/users' }];
    }
    if (role === 'Admin') return [...commonItems, ...adminItems];
    if (role === 'Worker') return [...commonItems, ...workerItems];
    if (role === 'Customer') return [...commonItems, ...customerItems];
    return commonItems;
  };

  const navItems = getNavItems(role);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Toaster position="top-right" />

      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:sticky top-0 left-0 z-30 h-screen bg-white dark:bg-slate-800 shadow-xl border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 overflow-x-hidden ${isSidebarOpen ? 'w-64' : 'w-20'}`}
        initial={false}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-700">
            {isSidebarOpen ? (
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                    ServicePortal
                </span>
            ) : (
                <span className="text-2xl font-bold text-blue-600 mx-auto">S</span>
            )}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hidden lg:block"
            >
                {isSidebarOpen ? <Menu size={20} /> : <Menu size={20} />}
            </button>
             {/* Mobile Close Button */}
             <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 lg:hidden text-slate-500"
            >
                <X size={24} />
            </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 px-3 custom-scrollbar">
            {navItems.map((item) => (
                <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) => `
                        flex items-center px-3 py-3 rounded-lg transition-colors group relative
                        ${isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }
                    `}
                >
                    <item.icon size={22} className="min-w-[22px]" />

                    {isSidebarOpen && (
                        <span className="ml-3 font-medium truncate">
                            {item.name}
                        </span>
                    )}

                    {!isSidebarOpen && (
                         <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                            {item.name}
                        </div>
                    )}
                </NavLink>
            ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
            <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
                {isSidebarOpen && (
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-200 font-bold text-sm">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col truncate">
                            <span className="text-sm font-semibold truncate">{username}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{role}</span>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6 z-10">

            {/* Mobile Menu Toggle */}
            <div className="flex items-center lg:hidden">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Breadcrumb / Title Placeholder */}
            <div className="flex-1 px-4">
                 {/* Can add breadcrumbs here later */}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                    onClick={() => toast('No new notifications', { icon: '🔔' })}
                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full relative"
                >
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
                </button>
                <ThemeToggle />
            </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
            <Outlet />
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
