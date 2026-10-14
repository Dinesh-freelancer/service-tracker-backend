import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  Calendar,
  User,
  AlertTriangle,
  Info,
  CheckCircle,
  ExternalLink,
  Briefcase,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { extractUrlFromEmbed, isDirectImageLink } from '../../utils/helpers';

const IncidentLogs = () => {
  const [logs, setLogs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('');
  const [workerFilter, setWorkerFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  // Form State
  const [logType, setLogType] = useState('General');
  const [customType, setCustomType] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Info');
  const [jobNumber, setJobNumber] = useState('');
  const [embedTag, setEmbedTag] = useState('');
  const [selectedWorkerIds, setSelectedWorkerIds] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  const fetchWorkers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/workers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWorkers(data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      if (dateFrom) queryParams.append('dateFrom', dateFrom);
      if (dateTo) queryParams.append('dateTo', dateTo);
      if (logTypeFilter) queryParams.append('logType', logTypeFilter);
      if (workerFilter) queryParams.append('workerId', workerFilter);
      if (searchTerm) queryParams.append('search', searchTerm);

      const res = await fetch(`${apiUrl}/incident-logs?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setLogs(data || []);
      }
    } catch (e) {
      toast.error('Failed to load incident logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [dateFrom, dateTo, logTypeFilter, workerFilter, searchTerm]);

  const handleOpenModal = (log = null) => {
    if (log) {
      setEditingLog(log);
      if (['General', 'Labour'].includes(log.LogType)) {
        setLogType(log.LogType);
        setCustomType('');
      } else {
        setLogType('Custom');
        setCustomType(log.LogType);
      }
      setLogDate(log.LogDate ? log.LogDate.split('T')[0] : '');
      setTitle(log.Title || '');
      setDescription(log.Description || '');
      setSeverity(log.Severity || 'Info');
      setJobNumber(log.JobNumber || '');
      setEmbedTag(log.EmbedTag || '');
      setSelectedWorkerIds(log.WorkerIds || []);
    } else {
      setEditingLog(null);
      setLogType('General');
      setCustomType('');
      setLogDate(new Date().toISOString().split('T')[0]);
      setTitle('');
      setDescription('');
      setSeverity('Info');
      setJobNumber('');
      setEmbedTag('');
      setSelectedWorkerIds([]);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const finalLogType = logType === 'Custom' ? customType : logType;

    if (!finalLogType) return toast.error('Log Type is required');
    if (!logDate) return toast.error('Log Date is required');
    if (!title) return toast.error('Title is required');

    if (finalLogType === 'Labour' && selectedWorkerIds.length === 0) {
      return toast.error('Please select at least one worker for Labour logs');
    }

    const payload = {
      LogType: finalLogType,
      LogDate: logDate,
      Title: title,
      Description: description,
      Severity: severity,
      JobNumber: jobNumber || null,
      EmbedTag: embedTag || null,
      WorkerIds: selectedWorkerIds,
    };

    try {
      const token = localStorage.getItem('token');
      const url = editingLog ? `${apiUrl}/incident-logs/${editingLog.LogId}` : `${apiUrl}/incident-logs`;
      const method = editingLog ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`Incident log ${editingLog ? 'updated' : 'created'}`);
        setIsModalOpen(false);
        fetchLogs();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save log');
      }
    } catch (e) {
      toast.error('An error occurred while saving');
    }
  };

  const handleDelete = async (logId) => {
    if (!confirm('Are you sure you want to delete this log?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/incident-logs/${logId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Incident log deleted');
        fetchLogs();
      }
    } catch (e) {
      toast.error('Failed to delete log');
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return toast.error('No logs available to export');

    const headers = ['Log ID', 'Date', 'Log Type', 'Title', 'Severity', 'Workers', 'Job Number', 'Logged By', 'Description'];
    const rows = logs.map((l) => [
      l.LogId,
      new Date(l.LogDate).toLocaleDateString(),
      l.LogType,
      `"${(l.Title || '').replace(/"/g, '""')}"`,
      l.Severity,
      `"${(l.WorkerNames || 'N/A').replace(/"/g, '""')}"`,
      l.JobNumber || 'N/A',
      l.CreatedByName || 'N/A',
      `"${(l.Description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `incident_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleWorkerSelection = (wId) => {
    if (selectedWorkerIds.includes(wId)) {
      setSelectedWorkerIds(selectedWorkerIds.filter((id) => id !== wId));
    } else {
      setSelectedWorkerIds([...selectedWorkerIds, wId]);
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Critical':
        return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold">Critical</span>;
      case 'Major':
        return <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-1 rounded-full font-semibold">Major</span>;
      case 'Minor':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full font-semibold">Minor</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold">Info</span>;
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="text-blue-600" size={24} />
            Incident Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track daily workplace occurrences, labor feedback, and operational notes.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExportCSV} variant="outline" className="w-auto flex items-center gap-2 text-xs">
            <Download size={16} /> Export CSV
          </Button>
          <Button onClick={() => handleOpenModal()} className="w-auto flex items-center gap-2 text-xs">
            <Plus size={16} /> Create Incident Log
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">From Date</label>
          <input
            type="date"
            className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">To Date</label>
          <input
            type="date"
            className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Log Type</label>
          <input
            type="text"
            placeholder="All Types"
            className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
            value={logTypeFilter}
            onChange={(e) => setLogTypeFilter(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Worker</label>
          <select
            className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
            value={workerFilter}
            onChange={(e) => setWorkerFilter(e.target.value)}
          >
            <option value="">All Workers</option>
            {workers.map((w) => (
              <option key={w.WorkerId} value={w.WorkerId}>
                {w.WorkerName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search title, job..."
              className="w-full text-xs p-2 pl-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Logs Table / Cards */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading incident logs...</div>
      ) : logs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-xl border border-slate-200 dark:border-slate-700">
          <ClipboardList size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No Incident Logs Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing your filters or create a new daily log.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {logs.map((log) => {
            const attachmentUrl = log.EmbedTag ? extractUrlFromEmbed(log.EmbedTag) : null;
            const isImage = attachmentUrl ? isDirectImageLink(attachmentUrl) : false;

            return (
              <div
                key={log.LogId}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {log.LogType}
                    </span>
                    {getSeverityBadge(log.Severity)}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{log.Title}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {new Date(log.LogDate).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleOpenModal(log)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      title="Edit Log"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(log.LogId)}
                      className="text-red-600 hover:text-red-800 p-1 rounded"
                      title="Delete Log"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="py-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {log.Description || 'No description provided.'}
                </div>

                {/* Footer Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-4">
                    {log.WorkerNames && (
                      <span className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                        <User size={14} className="text-blue-500" /> Workers: {log.WorkerNames}
                      </span>
                    )}
                    {log.JobNumber && (
                      <span className="flex items-center gap-1 font-medium text-purple-600">
                        <Briefcase size={14} /> Job: #{log.JobNumber}
                      </span>
                    )}
                    <span>Logged by: {log.CreatedByName || 'Admin'}</span>
                  </div>

                  {attachmentUrl && (
                    <a
                      href={attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <ExternalLink size={14} /> View Attachment
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLog ? 'Edit Incident Log' : 'Create Incident Log'}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Log Type *
              </label>
              <select
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                value={logType}
                onChange={(e) => setLogType(e.target.value)}
              >
                <option value="General">General (Ideas, Company Feedback)</option>
                <option value="Labour">Labour (Behaviour, Daily Work Feedback)</option>
                <option value="Custom">Custom Type...</option>
              </select>
            </div>

            {logType === 'Custom' && (
              <div>
                <Input
                  label="Custom Log Type *"
                  placeholder="e.g. Safety, Maintenance"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                />
              </div>
            )}

            <div>
              <Input
                label="Log Date *"
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Input
              label="Title / Summary *"
              placeholder="Brief summary of the incident or feedback..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Severity / Impact
              </label>
              <select
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="Info">Info</option>
                <option value="Minor">Minor</option>
                <option value="Major">Major</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <Input
                label="Related Job Number (Optional)"
                placeholder="e.g. 20261009001"
                value={jobNumber}
                onChange={(e) => setJobNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Worker Multi-select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Associated Workers {logType === 'Labour' ? '*' : '(Optional)'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 max-h-36 overflow-y-auto">
              {workers.map((w) => (
                <label key={w.WorkerId} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedWorkerIds.includes(w.WorkerId)}
                    onChange={() => toggleWorkerSelection(w.WorkerId)}
                    className="rounded text-blue-600"
                  />
                  <span>{w.WorkerName}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Description
            </label>
            <textarea
              rows={4}
              placeholder="Full details of what happened, work performance notes, or suggestions..."
              className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Attachment / Embed Photo Link (Optional)"
              placeholder="Paste Google Drive embed link or photo URL..."
              value={embedTag}
              onChange={(e) => setEmbedTag(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-auto text-xs">
              Cancel
            </Button>
            <Button onClick={handleSave} className="w-auto text-xs">
              {editingLog ? 'Update Log' : 'Save Incident Log'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IncidentLogs;
