import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Plus,
  X,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

/**
 * Jobs List Component
 * Displays a paginated list of service requests (jobs) with filtering and searching capabilities.
 * Implements role-based visibility for sensitive columns (Customer, Amount).
 * @component
 */
const JobsList = ({ title = "Service Requests" }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });

  // State from URL or defaults
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const parsedLimit = parseInt(searchParams.get("limit") || "10", 10);
  const limit = [10, 25, 50].includes(parsedLimit) ? parsedLimit : 10;
  const statusFilter = searchParams.get("status") || "";
  const searchQuery = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "JobNumber";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const role = localStorage.getItem("role") || "Worker";
  const isAdminOrOwner = role === "Admin" || role === "Owner";
  const isCustomer = role === "Customer";

  const hasActiveFilters = Boolean(
    statusFilter ||
      searchQuery ||
      sortBy !== "JobNumber" ||
      sortOrder !== "desc",
  );

  const updateParams = (overrides = {}) => {
    const next = {
      page,
      limit,
      status: statusFilter,
      search: searchQuery,
      sortBy,
      sortOrder,
      ...overrides,
    };
    const params = {
      page: String(next.page),
      limit: String(next.limit),
      sortBy: next.sortBy,
      sortOrder: next.sortOrder,
    };
    if (next.status) params.status = next.status;
    if (next.search) params.search = next.search;
    setSearchParams(params);
  };

  const openJobDetails = (jobNumber) => {
    navigate(`/dashboard/jobs/${jobNumber}`, {
      state: {
        from: `${location.pathname}${location.search}`,
      },
    });
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const token = localStorage.getItem("token");

      const query = new URLSearchParams({
        page,
        limit,
        ...(statusFilter && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`${apiUrl}/jobs?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch jobs");

      const data = await response.json();
      setJobs(data.data || []);
      setPagination(
        data.pagination || {
          currentPage: 1,
          itemsPerPage: limit,
          totalPages: 1,
          totalItems: 0,
        },
      );
    } catch (error) {
      console.error(error);
      toast.error("Error loading jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, limit, statusFilter, searchQuery, sortBy, sortOrder]);

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ page: 1, search: searchInput.trim() });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    if (searchQuery) {
      updateParams({ page: 1, search: "" });
    }
  };

  const handleStatusChange = (e) => {
    updateParams({ page: 1, status: e.target.value });
  };

  const handleSortByChange = (e) => {
    updateParams({ page: 1, sortBy: e.target.value });
  };

  const toggleSortOrder = () => {
    updateParams({ page: 1, sortOrder: sortOrder === "desc" ? "asc" : "desc" });
  };

  const handleLimitChange = (e) => {
    updateParams({ page: 1, limit: parseInt(e.target.value, 10) });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchParams({
      page: "1",
      limit: String(limit),
      sortBy: "JobNumber",
      sortOrder: "desc",
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      updateParams({ page: newPage });
    }
  };

  const getPageNumbers = (current, total) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages = [1];
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  };

  const JOB_STATUSES = [
    "Intake",
    "Assessing",
    "Awaiting Approval",
    "Approved",
    "In Progress",
    "On Hold",
    "Completed",
    "Ready for Pickup",
    "Fulfilled",
    "Cancelled",
    "Closed",
  ];

  const statusColors = {
    Intake:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    Assessing:
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
    "Awaiting Approval":
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    Approved:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    "In Progress":
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    "On Hold":
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    Completed:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    "Ready for Pickup":
      "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    Fulfilled:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    Cancelled:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    Closed:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Manage and track all repair jobs.
          </p>
        </div>

        {isAdminOrOwner && (
          <button
            onClick={() => navigate("/dashboard/jobs/new")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm shadow-blue-500/20"
          >
            <Plus size={18} />
            Create Job
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full lg:w-96">
          <input
            name="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            type="text"
            placeholder="Search by Job # or Brand..."
            className="w-full pl-10 pr-9 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <Search
            size={18}
            className="absolute left-3 top-2.5 text-slate-400"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </form>

        {/* Status Filter & Sort */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          <Filter size={18} className="text-slate-500 hidden sm:block" />
          <div className="flex items-center gap-2">
            <select
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={handleSortByChange}
            >
              <option value="JobNumber">Sort: Job Number</option>
              <option value="DateReceived">Sort: Date Received</option>
            </select>
            <button
              type="button"
              onClick={toggleSortOrder}
              className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 shadow-sm"
              title={`Sort ${sortOrder === "desc" ? "Ascending" : "Descending"}`}
            >
              <span className="font-bold">
                {sortOrder === "desc" ? "↓" : "↑"}
              </span>
            </button>
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="w-full sm:w-48 p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {JOB_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Reset filters"
            >
              <RotateCcw size={15} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Job #</th>
                {!isCustomer && (
                  <th className="p-4 font-semibold">Internal Tag</th>
                )}
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Device</th>
                <th className="p-4 font-semibold">Date Received</th>
                <th className="p-4 font-semibold text-center">Status</th>
                {isAdminOrOwner && (
                  <th className="p-4 font-semibold text-center">
                    Payment Status
                  </th>
                )}
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    <div className="flex justify-center items-center space-x-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Loading jobs...</span>
                    </div>
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No jobs found matching your criteria.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job.JobNumber}
                    onClick={() => openJobDetails(job.JobNumber)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      {job.JobNumber}
                    </td>
                    {!isCustomer && (
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                        {job.InternalTag || "-"}
                      </td>
                    )}
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      <div className="font-medium">
                        {job.CustomerType === "OrganizationMember" &&
                        job.OrganizationName
                          ? `${job.OrganizationName} - ${job.CustomerName}`
                          : job.CustomerName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {job.PrimaryContact || "No Contact"}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      <div>{job.Brand}</div>
                      <div className="text-xs text-slate-400">
                        {job.PumpModel} / {job.MotorModel}
                        {job.PowerRating
                          ? ` - ${job.PowerRating} ${job.PowerUnit || "HP"}`
                          : ""}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {new Date(job.DateReceived).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[job.Status] || "bg-slate-100 text-slate-600"}`}
                      >
                        {job.Status}
                      </span>
                    </td>
                    {isAdminOrOwner && (
                      <td className="p-4 text-center font-medium text-slate-700 dark:text-slate-200">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium
                                            ${
                                              job.PaymentStatus === "Paid"
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                                : job.PaymentStatus ===
                                                    "Partial"
                                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                            }`}
                        >
                          {job.PaymentStatus || "Unpaid"}
                        </span>
                      </td>
                    )}
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openJobDetails(job.JobNumber);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View Details"
                      >
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
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span>
                {pagination.totalItems > 0 ? (
                  <>
                    Showing{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {(page - 1) * limit + 1}
                    </span>
                    –
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {Math.min(page * limit, pagination.totalItems)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {pagination.totalItems}
                    </span>{" "}
                    jobs
                  </>
                ) : (
                  <>
                    Page {pagination.currentPage || pagination.page || 1} of{" "}
                    {pagination.totalPages}
                  </>
                )}
              </span>
              <select
                value={limit}
                onChange={handleLimitChange}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Items per page"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                title="Previous page"
              >
                <ChevronLeft size={18} />
              </button>
              {getPageNumbers(page, pagination.totalPages || 1).map(
                (item, idx) =>
                  item === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-slate-400 select-none"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handlePageChange(item)}
                      className={`min-w-[36px] px-2.5 py-1.5 text-sm rounded-lg border transition-colors ${
                        item === page
                          ? "bg-blue-600 border-blue-600 text-white font-medium"
                          : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      {item}
                    </button>
                  ),
              )}
              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.totalPages}
                className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                title="Next page"
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
