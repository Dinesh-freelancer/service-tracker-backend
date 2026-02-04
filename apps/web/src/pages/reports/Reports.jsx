import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Loader2 } from 'lucide-react';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState([]);
  const [financialData, setFinancialData] = useState(null);

  const role = localStorage.getItem('role');
  const isOwner = role === 'Owner';
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Operational Data
        const resStatus = await fetch(`${apiUrl}/reports/job-status-summary`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        const statusJson = await resStatus.json();
        // Transform: [{Status: "Completed", count: 5}, ...]
        const transformedStatus = Array.isArray(statusJson)
            ? statusJson.map(item => ({ name: item.Status, value: parseInt(item.count || item.Count || 0) }))
            : [];
        setStatusData(transformedStatus);

        if (isOwner) {
            // Financial Data
            const resFin = await fetch(`${apiUrl}/financial-reports/totals`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const finJson = await resFin.json();
            setFinancialData(finJson);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isOwner]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff0000', '#0000ff'];

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="text-blue-600" />
                Reports & Analytics
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Operational and financial insights.</p>
        </div>

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
    </div>
  );
};

export default Reports;
