import React, { useState, useEffect } from 'react';
import { FileText, Image, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { parseJwt } from '../../utils/auth';

const MyDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem('token');
            const decoded = parseJwt(token);
            if (!decoded || !decoded.CustomerId) {
                // If checking as admin or owner, this might fail if logic assumes customer context only.
                // But this page is for "My Documents" usually for Customers.
                // If no CustomerId, maybe show empty or error?
                // Let's assume this page is only used by Customers.
                // If used by Admin, they see nothing or need a different page.
                // For now, fail gracefully.
                if (decoded && (decoded.Role === 'Admin' || decoded.Role === 'Owner')) {
                     // Admin viewing this page? Maybe redirection error.
                     // Just show empty.
                     setDocuments([]);
                     return;
                }
                throw new Error('Customer ID not found in session');
            }

            const apiUrl = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${apiUrl}/documents/customer/${decoded.CustomerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to load documents');

            const data = await res.json();
            setDocuments(data);
        } catch (err) {
            // Don't toast if it's just missing customer ID for non-customers testing the page
            if (err.message !== 'Customer ID not found in session') {
                toast.error(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="text-blue-600" />
                    My Documents
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Access invoices, quotes, and photos.</p>
            </div>

            {documents.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center text-slate-500">
                    No documents found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map(doc => (
                        <div key={doc.DocumentId} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                    {doc.DocumentType === 'Photo' ? <Image size={24} /> : <FileText size={24} />}
                                </div>
                                <span className="text-xs text-slate-400">{new Date(doc.CreatedAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="font-medium text-slate-900 dark:text-white mb-1">{doc.DocumentType}</h3>
                            <p className="text-xs text-slate-500 mb-4">Job #{doc.JobNumber || 'N/A'}</p>
                            <a
                                href={doc.EmbedTag}
                                target="_blank"
                                rel="noreferrer"
                                className="block w-full text-center py-2 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm text-blue-600 dark:text-blue-400 transition-colors"
                            >
                                View Document
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyDocuments;
