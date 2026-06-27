import React, { useState, useEffect } from 'react';
import { Save, Plus, X, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const WarrantyClaimTab = ({ jobNumber }) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [loading, setLoading] = useState(true);
    const [claimData, setClaimData] = useState({
        OEMManufacturer: '',
        WarrantyStatus: 'Pending SR Completion',
        ClaimReferenceNumber: '',
        OEMCreditNoteAmount: '',
        PartReplacementDetails: []
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchClaim();
    }, [jobNumber]);

    const fetchClaim = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/warranty-claims/${jobNumber}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load warranty claim');
            const data = await res.json();

            setClaimData({
                OEMManufacturer: data.OEMManufacturer || '',
                WarrantyStatus: data.WarrantyStatus || 'Pending SR Completion',
                ClaimReferenceNumber: data.ClaimReferenceNumber || '',
                OEMCreditNoteAmount: data.OEMCreditNoteAmount || '',
                PartReplacementDetails: data.PartReplacementDetails || []
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const payload = { ...claimData };

            // Format array properly before sending
            payload.PartReplacementDetails = payload.PartReplacementDetails;

            const res = await fetch(`${apiUrl}/warranty-claims/${jobNumber}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to update warranty claim');
            toast.success('Warranty claim updated successfully');
            fetchClaim();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const addPartRow = () => {
        setClaimData(prev => ({
            ...prev,
            PartReplacementDetails: [
                ...prev.PartReplacementDetails,
                { part_name: '', part_number: '', quantity: '', unit_of_measure: '', unit_cost: '', coverage_type: 'Chargeable to Customer' }
            ]
        }));
    };

    const removePartRow = (index) => {
        setClaimData(prev => {
            const newParts = [...prev.PartReplacementDetails];
            newParts.splice(index, 1);
            return { ...prev, PartReplacementDetails: newParts };
        });
    };

    const updatePartRow = (index, field, value) => {
        setClaimData(prev => {
            const newParts = [...prev.PartReplacementDetails];
            newParts[index] = { ...newParts[index], [field]: value };
            return { ...prev, PartReplacementDetails: newParts };
        });
    };

    if (loading) return <div className="text-sm text-slate-500">Loading warranty claim...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">OEM Warranty Claim Details</h3>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Claim'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">OEM Manufacturer</label>
                    <input
                        type="text"
                        placeholder="e.g., WEG, Siemens, ABB"
                        className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={claimData.OEMManufacturer}
                        onChange={(e) => setClaimData({ ...claimData, OEMManufacturer: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Warranty Status</label>
                    <select
                        className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={claimData.WarrantyStatus}
                        onChange={(e) => setClaimData({ ...claimData, WarrantyStatus: e.target.value })}
                    >
                        <option value="Pending SR Completion">Pending SR Completion</option>
                        <option value="Claim Submitted">Claim Submitted</option>
                        <option value="FOC Approved">FOC Approved</option>
                        <option value="FOC Annexure sent through Post">FOC Annexure sent through Post</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Claim Reference Number</label>
                    <input
                        type="text"
                        placeholder="Manufacturer Tracking #"
                        className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={claimData.ClaimReferenceNumber}
                        onChange={(e) => setClaimData({ ...claimData, ClaimReferenceNumber: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">OEM Credit Note Amount</label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Reimbursed Amount"
                        className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={claimData.OEMCreditNoteAmount}
                        onChange={(e) => setClaimData({ ...claimData, OEMCreditNoteAmount: e.target.value })}
                    />
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2 mt-6">
                    <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200">Part Replacement Details</h4>
                    <button
                        onClick={addPartRow}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        <Plus size={16} /> Add Part
                    </button>
                </div>

                <div className="overflow-x-auto border rounded-lg border-slate-200 dark:border-slate-700">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-2">Part Name</th>
                                <th className="px-4 py-2">Part No.</th>
                                <th className="px-4 py-2 w-20">Qty</th>
                                <th className="px-4 py-2 w-24">UOM</th>
                                <th className="px-4 py-2 w-28">Unit Cost</th>
                                <th className="px-4 py-2">Coverage Type</th>
                                <th className="px-4 py-2 w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {claimData.PartReplacementDetails.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500 italic">No parts added yet.</td>
                                </tr>
                            ) : (
                                claimData.PartReplacementDetails.map((part, index) => (
                                    <tr key={index} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="p-2">
                                            <input type="text" className="w-full p-1.5 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent text-slate-800 dark:text-white" value={part.part_name} onChange={(e) => updatePartRow(index, 'part_name', e.target.value)} placeholder="Name" />
                                        </td>
                                        <td className="p-2">
                                            <input type="text" className="w-full p-1.5 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent text-slate-800 dark:text-white" value={part.part_number} onChange={(e) => updatePartRow(index, 'part_number', e.target.value)} placeholder="Number" />
                                        </td>
                                        <td className="p-2">
                                            <input type="number" step="0.1" className="w-full p-1.5 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent text-slate-800 dark:text-white" value={part.quantity} onChange={(e) => updatePartRow(index, 'quantity', e.target.value)} placeholder="0" />
                                        </td>
                                        <td className="p-2">
                                            <input type="text" className="w-full p-1.5 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent text-slate-800 dark:text-white" value={part.unit_of_measure} onChange={(e) => updatePartRow(index, 'unit_of_measure', e.target.value)} placeholder="Nos" />
                                        </td>
                                        <td className="p-2">
                                            <input type="number" step="0.01" className="w-full p-1.5 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent text-slate-800 dark:text-white" value={part.unit_cost} onChange={(e) => updatePartRow(index, 'unit_cost', e.target.value)} placeholder="0.00" />
                                        </td>
                                        <td className="p-2">
                                            <select
                                                className="w-full p-1.5 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent text-slate-800 dark:text-white dark:bg-slate-800"
                                                value={part.coverage_type}
                                                onChange={(e) => updatePartRow(index, 'coverage_type', e.target.value)}
                                            >
                                                <option value="Chargeable to Customer">Chargeable to Customer</option>
                                                <option value="FOC Approved">FOC Approved</option>
                                            </select>
                                        </td>
                                        <td className="p-2 text-center">
                                            <button onClick={() => removePartRow(index)} className="text-red-400 hover:text-red-600 transition-colors p-1" title="Remove part">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WarrantyClaimTab;
