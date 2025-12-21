import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Jobs List Component
 * Displays a paginated list of service requests (jobs) with filtering and searching capabilities.
 * Implements role-based visibility for sensitive columns (Customer, Amount).
 * @component
 */
const JobsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0
  });

  // State from URL or defaults
  const page = parseInt(searchParams.get('page') || '1');
  const statusFilter = searchParams.get('status') || '';
  const searchQuery = searchParams.get('search') || '';

  const role = localStorage.getItem('role') || 'Worker';
  const isAdminOrOwner = role === 'Admin' || role === 'Owner';

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');

      const query = new URLSearchParams({
        page,
        limit: 10,
        ...(statusFilter && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }), // Assuming backend supports generic search param or we filter by date/id
        hideSensitive: !isAdminOrOwner // Workers get masked data by default
      });

      const response = await fetch(`${apiUrl}/jobs?${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch jobs');

      const data = await response.json();
      setJobs(data.data || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, totalItems: 0 });

    } catch (error) {
      console.error(error);
      toast.error('Error loading jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, statusFilter, searchQuery]);

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    const term = e.target.elements.search.value;
    setSearchParams({ page: 1, status: statusFilter, search: term });
  };

  const handleStatusChange = (e) => {
    setSearchParams({ page: 1, status: e.target.value, search: searchQuery });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setSearchParams({ page: newPage, status: statusFilter, search: searchQuery });
    }
  };

  const statusColors = {
    'Received': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Estimated': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'Approved By Customer': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    'Work In Progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    'Completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'Delivered': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    'Declined By Customer': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Service Requests</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage and track all repair jobs.</p>
        </div>
        {/* Placeholder for "Create Job" button if we add it later */}
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">

        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
            <input
                name="search"
                defaultValue={searchQuery}
                type="text"
                placeholder="Search by Job # or Brand..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
        </form>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter size={18} className="text-slate-500" />
            <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="w-full md:w-48 p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All Statuses</option>
                <option value="Received">Received</option>
                <option value="Estimated">Estimated</option>
                <option value="Approved By Customer">Approved</option>
                <option value="Work In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Delivered">Delivered</option>
            </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
                        <th className="p-4 font-semibold">Job #</th>
                        {isAdminOrOwner && <th className="p-4 font-semibold">Customer</th>}
                        <th className="p-4 font-semibold">Device</th>
                        <th className="p-4 font-semibold">Date Received</th>
                        <th className="p-4 font-semibold text-center">Status</th>
                        {isAdminOrOwner && <th className="p-4 font-semibold text-right">Amount (₹)</th>}
                        <th className="p-4 font-semibold text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                    {loading ? (
                         <tr>
                            <td colSpan="7" className="p-8 text-center text-slate-500">
                                <div className="flex justify-center items-center space-x-2">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Loading jobs...</span>
                                </div>
                            </td>
                         </tr>
                    ) : jobs.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="p-8 text-center text-slate-500">
                                No jobs found matching your criteria.
                            </td>
                        </tr>
                    ) : (
                        jobs.map((job) => (
                            <tr key={job.JobNumber} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                <td className="p-4 font-medium text-slate-900 dark:text-white">
                                    {job.JobNumber}
                                </td>
                                {isAdminOrOwner && (
                                    <td className="p-4 text-slate-600 dark:text-slate-300">
                                        <div className="font-medium">{job.CustomerName}</div>
                                        {/* <div className="text-xs text-slate-400">{job.Phone1 || 'No Phone'}</div> */}
                                    </td>
                                )}
                                <td className="p-4 text-slate-600 dark:text-slate-300">
                                    <div>{job.PumpBrand || job.MotorBrand}</div>
                                    <div className="text-xs text-slate-400">{job.PumpModel || job.MotorModel} - {job.HP}HP</div>
                                </td>
                                <td className="p-4 text-slate-500 dark:text-slate-400">
                                    {new Date(job.DateReceived).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[job.Status] || 'bg-slate-100 text-slate-600'}`}>
                                        {job.Status}
                                    </span>
                                </td>
                                {isAdminOrOwner && (
                                    <td className="p-4 text-right font-medium text-slate-700 dark:text-slate-200">
                                        {job.EstimatedAmount ? `₹${job.EstimatedAmount}` : '-'}
                                    </td>
                                )}
                                <td className="p-4 text-center">
                                    <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="View Details">
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination */}
        {!loading && jobs.length > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                    Page {pagination.currentPage || pagination.page || 1} of {pagination.totalPages}
                </span>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                        className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                         onClick={() => handlePageChange(page + 1)}
                         disabled={page >= pagination.totalPages}
                         className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default JobsList;
