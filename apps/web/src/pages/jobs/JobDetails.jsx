import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Image, PenTool, Calendar, User, Box, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const JobDetails = () => {
    const { jobNumber } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('job-docs'); // 'job-docs' or 'asset-docs'

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${apiUrl}/jobs/${jobNumber}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) throw new Error('Job not found');

                const data = await res.json();
                setJob(data);
            } catch (err) {
                toast.error('Failed to load job details');
                navigate('/dashboard/jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [jobNumber, navigate]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!job) return null;

    // Filter documents based on active tab
    const documents = job.Documents || [];
    const displayedDocs = activeTab === 'job-docs'
        ? documents.filter(d => d.JobNumber === job.JobNumber)
        : documents.filter(d => d.AssetId === job.AssetId || d.JobNumber !== job.JobNumber); // Show all asset history? Or just linked to AssetId specifically?
        // Logic: 'asset-docs' usually implies "History".
        // If we want purely Asset-level docs (manuals), we check d.AssetId and !d.JobNumber (maybe).
        // But user said: "Job-specific documents AND the Asset's permanent documents".
        // Let's make "Job Docs" = Linked to Job. "Asset Docs" = Linked to Asset (Permanent).

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/dashboard/jobs')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Job #{job.JobNumber}</h1>
                        <p className="text-sm text-slate-500">{job.Status} &bull; Received {new Date(job.DateReceived).toLocaleDateString()}</p>
                    </div>
                </div>
                {/* Actions like Edit could go here */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Info Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Asset Details Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Box size={20} className="text-blue-500" />
                            Asset Details
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase">Internal Tag</div>
                                <div className="font-mono font-medium text-slate-900 dark:text-white">{job.InternalTag || 'N/A'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase">Pump</div>
                                <div className="font-medium text-slate-900 dark:text-white">{job.PumpBrand} {job.PumpModel}</div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase">Motor</div>
                                <div className="font-medium text-slate-900 dark:text-white">{job.MotorBrand} {job.MotorModel}</div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase">Serial #</div>
                                <div className="font-medium text-slate-900 dark:text-white">{job.SerialNumber || 'N/A'}</div>
                            </div>
                             <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase">HP</div>
                                <div className="font-medium text-slate-900 dark:text-white">{job.HP || 'N/A'}</div>
                            </div>
                             <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase">Warranty</div>
                                <div className="font-medium text-slate-900 dark:text-white">{job.WarrantyExpiry || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Job Details Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <PenTool size={20} className="text-purple-500" />
                            Job Information
                        </h2>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Issue / Notes</label>
                                <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg text-slate-700 dark:text-slate-300 min-h-[60px]">
                                    {job.Notes || 'No notes provided.'}
                                </div>
                            </div>
                             {job.ResolutionType && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Resolution</label>
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg border border-green-100 dark:border-green-800">
                                        {job.ResolutionType}
                                    </div>
                                </div>
                             )}
                        </div>
                    </div>

                    {/* Documents Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="border-b border-slate-100 dark:border-slate-700">
                            <div className="flex">
                                <button
                                    onClick={() => setActiveTab('job-docs')}
                                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'job-docs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Job Documents
                                </button>
                                <button
                                    onClick={() => setActiveTab('asset-docs')}
                                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'asset-docs' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Asset History & Manuals
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {displayedDocs.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <FileText size={32} className="mx-auto mb-2 opacity-50" />
                                    No documents found in this section.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {displayedDocs.map(doc => (
                                        <div key={doc.DocumentId} className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                                                <Image size={20} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="font-medium text-slate-900 dark:text-white truncate">{doc.DocumentType}</div>
                                                <div className="text-xs text-slate-500">{new Date(doc.CreatedAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <User size={20} className="text-indigo-500" />
                            Customer
                        </h2>
                        {job.CustomerName === '*****' ? (
                            <div className="text-slate-500 italic">Hidden (Sensitive)</div>
                        ) : (
                            <div className="space-y-3">
                                <div className="font-medium text-slate-900 dark:text-white">{job.CustomerName}</div>
                                {job.OrganizationName && <div className="text-sm text-slate-500">{job.OrganizationName}</div>}
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                                    {job.PrimaryContact}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;
