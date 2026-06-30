import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Loader2, Eye, FileText, Calendar, Building, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const Purchases = () => {
    const navigate = useNavigate();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    // Details Modal State
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [purchaseDetails, setPurchaseDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/purchases`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load purchases');
            const data = await res.json();
            setPurchases(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (purchase) => {
        setSelectedPurchase(purchase);
        setLoadingDetails(true);
        try {
            const res = await fetch(`${apiUrl}/purchases/${purchase.PurchaseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load purchase details');
            const data = await res.json();
            setPurchaseDetails(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoadingDetails(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Paid': return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium">Paid</span>;
            case 'Partial': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs font-medium">Partial</span>;
            case 'Pending': return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium">Pending</span>;
            default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 rounded text-xs font-medium">{status || 'Unknown'}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShoppingCart className="text-indigo-600" />
                        Purchases & Receipts
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">View purchase history and supplier invoices.</p>
                </div>
                <Button onClick={() => navigate('/dashboard/purchases/create')} className="flex items-center gap-2">
                    <Plus size={18} /> Record Purchase
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold">PO #</th>
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Supplier</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-right">Amount</th>
                                <th className="p-4 font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" /></td>
                                </tr>
                            ) : purchases.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500">No purchases recorded yet.</td>
                                </tr>
                            ) : (
                                purchases.map((purchase) => (
                                    <tr key={purchase.PurchaseId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                        <td className="p-4 font-medium text-slate-900 dark:text-white">
                                            PO-{purchase.PurchaseId.toString().padStart(4, '0')}
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(purchase.PurchaseDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-900 dark:text-white font-medium">
                                            {purchase.SupplierName}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(purchase.PaymentStatus)}
                                        </td>
                                        <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                                            ₹{parseFloat(purchase.TotalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            <div className="text-xs font-normal text-slate-500 dark:text-slate-400">{purchase.ItemCount} items</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleViewDetails(purchase)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium"
                                            >
                                                <Eye size={16} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Purchase Details Modal */}
            <Modal
                isOpen={!!selectedPurchase}
                onClose={() => { setSelectedPurchase(null); setPurchaseDetails(null); }}
                title={`Purchase Order PO-${selectedPurchase?.PurchaseId.toString().padStart(4, '0')}`}
                size="lg"
            >
                {loadingDetails || !purchaseDetails ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : (
                    <div className="space-y-6">
                        {/* Meta Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div>
                                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Building size={12}/> Supplier</div>
                                <div className="font-semibold text-slate-900 dark:text-white">{purchaseDetails.SupplierName}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Calendar size={12}/> Date</div>
                                <div className="font-semibold text-slate-900 dark:text-white">{new Date(purchaseDetails.PurchaseDate).toLocaleDateString()}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><FileText size={12}/> Status</div>
                                <div>{getStatusBadge(purchaseDetails.PaymentStatus)}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><DollarSign size={12}/> Total Amount</div>
                                <div className="font-bold text-blue-600 dark:text-blue-400">
                                     ₹{purchaseDetails.Items.reduce((acc, item) => acc + (parseFloat(item.TotalPrice) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {purchaseDetails.Notes && (
                            <div className="text-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Notes: </span>
                                <span className="text-slate-600 dark:text-slate-400">{purchaseDetails.Notes}</span>
                            </div>
                        )}

                        {/* Items Table */}
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-3">Received Items</h3>
                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        <tr>
                                            <th className="p-3 font-semibold">Part Name</th>
                                            <th className="p-3 font-semibold text-right">Qty</th>
                                            <th className="p-3 font-semibold text-right">Unit Price</th>
                                            <th className="p-3 font-semibold text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {purchaseDetails.Items.map(item => (
                                            <tr key={item.PurchaseItemId}>
                                                <td className="p-3 font-medium text-slate-900 dark:text-white">{item.PartName}</td>
                                                <td className="p-3 text-right text-slate-600 dark:text-slate-400">{item.Qty} {item.Unit || 'Units'}</td>
                                                <td className="p-3 text-right text-slate-600 dark:text-slate-400">₹{parseFloat(item.UnitPrice).toLocaleString()}</td>
                                                <td className="p-3 text-right font-medium text-slate-900 dark:text-white">₹{parseFloat(item.TotalPrice).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button variant="outline" onClick={() => setSelectedPurchase(null)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Purchases;
