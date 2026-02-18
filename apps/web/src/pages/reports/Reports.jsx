import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Loader2, Calendar, FileText } from 'lucide-react';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  const [jobDetails, setJobDetails] = useState([]);

  // Date Filters
  const [dateRange, setDateRange] = useState({
      startDate: '',
      endDate: ''
  });

  const role = localStorage.getItem('role');
  const isOwner = role === 'Owner';
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
      if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);
      const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';

      // Operational Data
      const resStatus = await fetch(`${apiUrl}/reports/job-status-summary${queryStr}`, {
           headers: { Authorization: `Bearer ${token}` }
      });
      const statusJson = await resStatus.json();
      const transformedStatus = Array.isArray(statusJson)
          ? statusJson.map(item => ({ name: item.Status, value: parseInt(item.count || item.Count || 0) }))
          : [];
      setStatusData(transformedStatus);

      if (isOwner) {
          // Financial Totals
          const resFin = await fetch(`${apiUrl}/financial-reports/totals${queryStr}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          const finJson = await resFin.json();
          setFinancialData(finJson);

          // Detailed Job Report
          const resJobs = await fetch(`${apiUrl}/financial-reports/all-jobs${queryStr}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          const jobsJson = await resJobs.json();
          setJobDetails(jobsJson);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isOwner, dateRange]);

  const handleDateChange = (e) => {
      const { name, value } = e.target;
      setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff0000', '#0000ff'];

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="text-blue-600" />
                    Reports & Analytics
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Operational and financial insights.</p>
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                <Calendar size={18} className="text-slate-400 ml-2" />
                <input
                    type="date"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                    className="bg-transparent border-none text-sm text-slate-600 dark:text-slate-300 focus:ring-0"
                />
                <span className="text-slate-400">-</span>
                <input
                    type="date"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                    className="bg-transparent border-none text-sm text-slate-600 dark:text-slate-300 focus:ring-0"
                />
            </div>
        </div>

        {loading ? (
             <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
        ) : (
            <>
                {/* Financial Cards (Owner Only) */}
                {isOwner && financialData && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600">
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500">Total Billed</div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{financialData.TotalAmountBilled?.toLocaleString() || 0}</div>
                                </div>
                            </div>
                        </div>
                         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600">
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500">Payments Received</div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{financialData.TotalPaymentsReceived?.toLocaleString() || 0}</div>
                                </div>
                            </div>
                        </div>
                         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500">Outstanding</div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{financialData.TotalOutstanding?.toLocaleString() || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Operational Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Job Status Distribution</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                     <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Job Volume</h3>
                        <div className="h-64">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#8884d8" name="Count" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Detailed Job Report Table (Owner Only) */}
                {isOwner && jobDetails.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FileText size={20} className="text-blue-600"/>
                                Detailed Financial Report
                            </h3>
                            <div className="text-xs text-slate-500">
                                Showing {jobDetails.length} records
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-semibold">Job #</th>
                                        <th className="p-4 font-semibold">Date Received</th>
                                        <th className="p-4 font-semibold">Customer</th>
                                        <th className="p-4 font-semibold">Device</th>
                                        <th className="p-4 font-semibold text-right">Billed (₹)</th>
                                        <th className="p-4 font-semibold text-right">Paid (₹)</th>
                                        <th className="p-4 font-semibold text-right">Balance (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                                    {jobDetails.map((job) => (
                                        <tr key={job.JobNumber} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="p-4 font-medium text-slate-900 dark:text-white">{job.JobNumber}</td>
                                            <td className="p-4 text-slate-500 dark:text-slate-400">
                                                {job.DateReceived ? new Date(job.DateReceived).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-300">
                                                {job.CustomerName || `ID: ${job.CustomerId}`}
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-300 text-xs">
                                                {job.PumpBrand} - {job.PumpModel}
                                            </td>
                                            <td className="p-4 text-right font-medium text-slate-900 dark:text-white">
                                                {job.BilledAmount > 0 ? job.BilledAmount.toLocaleString() : (job.EstimatedAmount ? `~${job.EstimatedAmount.toLocaleString()}` : '-')}
                                            </td>
                                            <td className="p-4 text-right text-green-600 font-medium">
                                                {job.TotalPaid > 0 ? job.TotalPaid.toLocaleString() : '-'}
                                            </td>
                                            <td className={`p-4 text-right font-bold ${job.Outstanding > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                {job.Outstanding > 0 ? job.Outstanding.toLocaleString() : '0'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </>
        )}
    </div>
  );
};

export default Reports;
