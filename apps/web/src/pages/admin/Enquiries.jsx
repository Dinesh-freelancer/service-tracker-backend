import React, { useState, useEffect } from 'react';
import { MessageSquare, Loader2, Edit, Save, X, Phone, Calendar } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Enquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEnquiry, setEditingEnquiry] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;
    const { register, handleSubmit, reset, setValue } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/enquiries`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch enquiries');
            const data = await res.json();
            setEnquiries(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (enquiry) => {
        setEditingEnquiry(enquiry);
        reset({
            Status: enquiry.Status || 'New',
            FollowUpNotes: enquiry.FollowUpNotes || '',
            NextFollowUpDate: enquiry.NextFollowUpDate ? enquiry.NextFollowUpDate.split('T')[0] : '',
        });
        setIsEditModalOpen(true);
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            // Ensure empty dates are sent as null rather than empty string for MySQL Date field
            if (!data.NextFollowUpDate) data.NextFollowUpDate = null;

            const res = await fetch(`${apiUrl}/enquiries/${editingEnquiry.EnquiryId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Failed to update enquiry');

            toast.success('Enquiry updated successfully');
            setIsEditModalOpen(false);
            fetchEnquiries();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <MessageSquare className="text-blue-600" /> Enquiries Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage public and sales enquiries</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Customer Details</th>
                                <th className="p-4 font-semibold">Nature of Query</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Follow Up Date</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" /></td>
                                </tr>
                            ) : enquiries.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500">No enquiries found.</td>
                                </tr>
                            ) : (
                                enquiries.map((enquiry) => (
                                    <tr key={enquiry.EnquiryId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                            {format(new Date(enquiry.EnquiryDate), 'dd MMM yyyy')}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900 dark:text-white">{enquiry.CustomerName}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                                <Phone size={12} /> {enquiry.ContactNumber}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-700 dark:text-slate-300">
                                            {enquiry.NatureOfQuery}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                enquiry.Status === 'Resolved' || enquiry.Status === 'Closed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                enquiry.Status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                                {enquiry.Status || 'New'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                            {enquiry.NextFollowUpDate ? (
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={12} className="text-blue-500" />
                                                    {format(new Date(enquiry.NextFollowUpDate), 'dd MMM yyyy')}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleEdit(enquiry)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded transition-colors">
                                                <Edit size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Update Enquiry Status"
                size="md"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 mb-4 text-sm">
                        <div className="mb-2"><span className="font-semibold text-slate-700 dark:text-slate-300">Customer:</span> {editingEnquiry?.CustomerName} ({editingEnquiry?.ContactNumber})</div>
                        <div className="mb-2"><span className="font-semibold text-slate-700 dark:text-slate-300">Query:</span> {editingEnquiry?.NatureOfQuery}</div>
                        {editingEnquiry?.QueryDetails && (
                             <div><span className="font-semibold text-slate-700 dark:text-slate-300">Details:</span> <span className="text-slate-600 dark:text-slate-400">{editingEnquiry.QueryDetails}</span></div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Status</label>
                        <select
                            {...register('Status')}
                            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    <Input type="date" label="Next Follow Up Date" {...register('NextFollowUpDate')} />

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Follow Up Notes</label>
                        <textarea
                            {...register('FollowUpNotes')}
                            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="Add notes about your follow-up here..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                            Update
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Enquiries;
