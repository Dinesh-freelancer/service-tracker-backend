import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  PlusCircle,
  UserPlus,
  CreditCard,
  ShoppingCart,
  Briefcase,
  Hammer,
  Truck,
  MessageCircle,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock Data
const statsData = [
    { title: 'Total Jobs', value: 154, icon: Briefcase, color: 'bg-blue-500' },
    { title: 'Revenue (₹)', value: 1250000, icon: TrendingUp, color: 'bg-green-500' },
    { title: 'Active Workers', value: 12, icon: Users, color: 'bg-purple-500' },
    { title: 'Pending Approval', value: 8, icon: Clock, color: 'bg-orange-500' },
];

const revenueData = [
  { name: 'Jan', revenue: 40000 },
  { name: 'Feb', revenue: 30000 },
  { name: 'Mar', revenue: 55000 },
  { name: 'Apr', revenue: 80000 },
  { name: 'May', revenue: 65000 },
  { name: 'Jun', revenue: 95000 },
];

const jobStatusData = [
  { name: 'In Progress', value: 40 },
  { name: 'Completed', value: 30 },
  { name: 'Pending', value: 20 },
  { name: 'Delivered', value: 10 },
];

const COLORS = ['#3b82f6', '#22c55e', '#f97316', '#a855f7'];

// Reusable Components
const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between"
  >
    <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            <CountUp end={value} separator="," duration={2.5} />
        </h3>
    </div>
    <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-white`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
  </motion.div>
);

const QuickActionBtn = ({ icon: Icon, label, onClick, colorClass = "bg-blue-50 text-blue-600 hover:bg-blue-100" }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 ${colorClass} dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600`}
    >
        <div className="mb-2 p-2 rounded-full bg-white/50 dark:bg-slate-600/50">
            <Icon size={24} />
        </div>
        <span className="text-sm font-medium">{label}</span>
    </button>
);

const Dashboard = () => {
    const role = localStorage.getItem('role') || 'Admin';

    // Handlers (Mock)
    const handleAction = (action) => {
        toast.success(`Action Triggered: ${action}`);
    };

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Role-Based Quick Actions */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">

                    {(role === 'Admin' || role === 'Owner') && (
                        <>
                            <QuickActionBtn icon={PlusCircle} label="New Job" onClick={() => handleAction('Create Job')} />
                            <QuickActionBtn icon={UserPlus} label="Add Customer" onClick={() => handleAction('Add Customer')} colorClass="bg-green-50 text-green-600 hover:bg-green-100" />
                            <QuickActionBtn icon={CreditCard} label="Payment" onClick={() => handleAction('Record Payment')} colorClass="bg-purple-50 text-purple-600 hover:bg-purple-100" />
                            <QuickActionBtn icon={ShoppingCart} label="Purchase" onClick={() => handleAction('Create PO')} colorClass="bg-orange-50 text-orange-600 hover:bg-orange-100" />
                        </>
                    )}

                    {role === 'Worker' && (
                        <>
                            <QuickActionBtn icon={Hammer} label="Update Job" onClick={() => handleAction('Update Status')} />
                            <QuickActionBtn icon={CheckCircle2} label="Log Work" onClick={() => handleAction('Log Work')} colorClass="bg-green-50 text-green-600 hover:bg-green-100" />
                        </>
                    )}

                    {role === 'Customer' && (
                        <>
                            <QuickActionBtn icon={Truck} label="Pickup" onClick={() => handleAction('Request Pickup')} />
                            <QuickActionBtn icon={MessageCircle} label="WhatsApp" onClick={() => window.open('https://wa.me/919876543210', '_blank')} colorClass="bg-green-50 text-green-600 hover:bg-green-100" />
                        </>
                    )}
                </div>
            </div>

            {/* Admin Stats & Charts */}
            {(role === 'Admin' || role === 'Owner') && (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statsData.map((stat, index) => (
                            <StatCard key={index} {...stat} />
                        ))}
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Revenue Chart */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-semibold mb-6 text-slate-800 dark:text-slate-200">Revenue Trend</h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} tickFormatter={(value) => `₹${value/1000}k`} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Job Status Chart */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-semibold mb-6 text-slate-800 dark:text-slate-200">Job Status Distribution</h3>
                            <div className="h-80 w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={jobStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {jobStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Worker View: My Active Jobs */}
            {role === 'Worker' && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">My Active Jobs</h3>
                    <div className="space-y-4">
                         {[1, 2, 3].map((job) => (
                             <div key={job} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                <div>
                                    <h4 className="font-medium text-slate-900 dark:text-white">Job #202310{job}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Rewinding - 5HP Motor</p>
                                </div>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-medium rounded-full">
                                    In Progress
                                </span>
                             </div>
                         ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
