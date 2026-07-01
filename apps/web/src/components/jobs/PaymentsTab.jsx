import React, { useState, useEffect } from 'react';
import { IndianRupee, Plus, Save, Edit, Trash2, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentsTab = ({ jobNumber, billedAmount, paymentStatus, onJobUpdate }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formBilledAmount, setFormBilledAmount] = useState(billedAmount || '');
    const [formPaymentStatus, setFormPaymentStatus] = useState(paymentStatus || 'Unpaid');
    const [isSavingJob, setIsSavingJob] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingPaymentId, setEditingPaymentId] = useState(null);

    const [paymentForm, setPaymentForm] = useState({
        Amount: '',
        PaymentDate: new Date().toISOString().slice(0, 16),
        PaymentType: 'Final',
        PaymentMode: 'Cash'
    });

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');

    const fetchPayments = async () => {
        try {
            const res = await fetch(`${apiUrl}/payments?jobNumber=${jobNumber}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPayments(data || []);
            }
        } catch (err) {
            console.error('Failed to load payments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [jobNumber]);

    const handleSaveJobFinancials = async () => {
        try {
            setIsSavingJob(true);
            const payload = {
                BilledAmount: formBilledAmount === '' ? null : parseFloat(formBilledAmount),
                PaymentStatus: formPaymentStatus
            };

            const res = await fetch(`${apiUrl}/jobs/${jobNumber}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to update financial details');

            toast.success('Financial details saved');
            if (onJobUpdate) onJobUpdate();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSavingJob(false);
        }
    };

    const openAddModal = () => {
        setModalMode('add');
        setPaymentForm({
            Amount: '',
            PaymentDate: new Date().toISOString().slice(0, 16), // Use slice(0,16) for datetime-local
            PaymentType: 'Final',
            PaymentMode: 'Cash'
        });
        setShowModal(true);
    };

    const openEditModal = (payment) => {
        setModalMode('edit');
        setEditingPaymentId(payment.PaymentId);

        // Convert to local datetime-local string format
        let localDateStr = payment.PaymentDate;
        if (localDateStr) {
           const d = new Date(!localDateStr.endsWith('Z') ? localDateStr + 'Z' : localDateStr);
           localDateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        }

        setPaymentForm({
            Amount: payment.Amount,
            PaymentDate: localDateStr,
            PaymentType: payment.PaymentType,
            PaymentMode: payment.PaymentMode
        });
        setShowModal(true);
    };

    const handleDeletePayment = async (paymentId) => {
        if (!window.confirm('Are you sure you want to delete this payment?')) return;
        try {
            const res = await fetch(`${apiUrl}/payments/${paymentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete payment');
            toast.success('Payment deleted');
            fetchPayments();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleSavePayment = async (e) => {
        e.preventDefault();
        try {
            let url = `${apiUrl}/payments`;
            let method = 'POST';

            const payload = {
                ...paymentForm,
                JobNumber: jobNumber,
                Amount: parseFloat(paymentForm.Amount)
            };

            // Fix PaymentDate formatting (append :00.000Z if needed, or pass as ISO)
            const dateObj = new Date(paymentForm.PaymentDate);
            payload.PaymentDate = dateObj.toISOString();

            if (modalMode === 'edit') {
                url = `${apiUrl}/payments/${editingPaymentId}`;
                method = 'PUT';
            }

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(`Failed to ${modalMode} payment`);

            toast.success(`Payment ${modalMode === 'add' ? 'added' : 'updated'} successfully`);
            setShowModal(false);
            fetchPayments();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const getBadgeColor = (status) => {
        switch(status) {
            case 'Paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'Partial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Unpaid': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <IndianRupee size={18} className="text-emerald-600" />
                        Job Financial Details
                    </h3>
                    <button
                        onClick={handleSaveJobFinancials}
                        disabled={isSavingJob}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
                    >
                        <Save size={16} /> Save Details
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Billed Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                            <input
                                type="number"
                                className="w-full pl-8 p-2 border rounded dark:bg-slate-700 dark:border-slate-600 bg-white text-slate-800 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formBilledAmount}
                                onChange={(e) => setFormBilledAmount(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Status</label>
                        <select
                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 bg-white text-slate-800 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formPaymentStatus}
                            onChange={(e) => setFormPaymentStatus(e.target.value)}
                        >
                            <option value="Unpaid">Unpaid</option>
                            <option value="Partial">Partial</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-slate-900 dark:text-white">Payment Records</h3>
                    <button onClick={openAddModal} className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 font-medium">
                        <Plus size={16} /> Add Payment
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-slate-500">Loading payments...</div>
                ) : payments.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                        <IndianRupee size={32} className="mx-auto mb-2 text-slate-400 opacity-50" />
                        <p className="text-slate-500">No payments recorded yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-4 py-3">Sl No.</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Mode</th>
                                    <th className="px-4 py-3 text-right">Amount (₹)</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p, index) => (
                                    <tr key={p.PaymentId} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-4 py-3">{index + 1}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {new Date(!p.PaymentDate.endsWith('Z') ? p.PaymentDate + 'Z' : p.PaymentDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900/30 dark:text-blue-300">
                                                {p.PaymentType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{p.PaymentMode}</td>
                                        <td className="px-4 py-3 text-right font-medium">{parseFloat(p.Amount).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => openEditModal(p)} className="text-blue-500 hover:text-blue-700 transition-colors" title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDeletePayment(p.PaymentId)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-semibold">
                                <tr>
                                    <td colSpan="4" className="px-4 py-3 text-right">Total Paid:</td>
                                    <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">
                                        ₹{payments.reduce((sum, p) => sum + parseFloat(p.Amount || 0), 0).toFixed(2)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full shadow-xl">
                        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                                {modalMode === 'add' ? 'Add Payment' : 'Edit Payment'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSavePayment} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹) *</label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    min="0"
                                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 bg-white text-slate-800 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    value={paymentForm.Amount}
                                    onChange={(e) => setPaymentForm({...paymentForm, Amount: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 bg-white text-slate-800 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    value={paymentForm.PaymentDate}
                                    onChange={(e) => setPaymentForm({...paymentForm, PaymentDate: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Type</label>
                                    <select
                                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 bg-white text-slate-800 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        value={paymentForm.PaymentType}
                                        onChange={(e) => setPaymentForm({...paymentForm, PaymentType: e.target.value})}
                                    >
                                        <option value="Advance">Advance</option>
                                        <option value="Partial">Partial</option>
                                        <option value="Final">Final</option>
                                        <option value="Refund">Refund</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Mode</label>
                                    <select
                                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 bg-white text-slate-800 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        value={paymentForm.PaymentMode}
                                        onChange={(e) => setPaymentForm({...paymentForm, PaymentMode: e.target.value})}
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Online">Online</option>
                                        <option value="Credit">Credit</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t dark:border-slate-700 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                    Save Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentsTab;
