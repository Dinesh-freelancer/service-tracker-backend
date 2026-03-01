import React, { useState, useEffect } from 'react';
import { Save, Loader2, Database } from 'lucide-react';
import toast from 'react-hot-toast';

const WindingDetails = ({ jobNumber }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        WireGauge: '',
        TurnCount: '',
        CoilWeight: '',
        ConnectionType: '',
        CoreLength: '',
        CoreDiameter: '',
        SlotCount: '',
        Pitch: ''
    });

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`${apiUrl}/winding-details/${jobNumber}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && Object.keys(data).length > 0) {
                        setFormData({
                            WireGauge: data.WireGauge || '',
                            TurnCount: data.TurnCount || '',
                            CoilWeight: data.CoilWeight || '',
                            ConnectionType: data.ConnectionType || '',
                            CoreLength: data.CoreLength || '',
                            CoreDiameter: data.CoreDiameter || '',
                            SlotCount: data.SlotCount || '',
                            Pitch: data.Pitch || ''
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to load winding details', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [jobNumber]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${apiUrl}/winding-details/${jobNumber}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to save details');

            toast.success('Winding details saved successfully');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Database className="text-pink-500" size={20} />
                        Winding Specifications
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Technical details for motor rewinding.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Electrical Specs */}
                <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl space-y-4">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide border-b border-slate-200 dark:border-slate-600 pb-2">Electrical</h4>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Wire Gauge (SWG)</label>
                        <input
                            type="text"
                            name="WireGauge"
                            value={formData.WireGauge}
                            onChange={handleChange}
                            placeholder="e.g. 24"
                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Turn Count</label>
                        <input
                            type="number"
                            name="TurnCount"
                            value={formData.TurnCount}
                            onChange={handleChange}
                            placeholder="e.g. 150"
                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Connection Type</label>
                        <select
                            name="ConnectionType"
                            value={formData.ConnectionType}
                            onChange={handleChange}
                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                        >
                            <option value="">-- Select --</option>
                            <option value="Star">Star</option>
                            <option value="Delta">Delta</option>
                            <option value="Star-Delta">Star-Delta</option>
                            <option value="Series">Series</option>
                            <option value="Parallel">Parallel</option>
                        </select>
                    </div>

                     <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Pitch</label>
                        <input
                            type="text"
                            name="Pitch"
                            value={formData.Pitch}
                            onChange={handleChange}
                            placeholder="e.g. 1-8-10-12"
                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                        />
                    </div>
                </div>

                {/* Mechanical Specs */}
                <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl space-y-4">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide border-b border-slate-200 dark:border-slate-600 pb-2">Mechanical / Physical</h4>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Coil Weight (kg)</label>
                        <input
                            type="number"
                            step="0.01"
                            name="CoilWeight"
                            value={formData.CoilWeight}
                            onChange={handleChange}
                            placeholder="e.g. 2.5"
                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Core Length (mm)</label>
                        <input
                            type="number"
                            name="CoreLength"
                            value={formData.CoreLength}
                            onChange={handleChange}
                            placeholder="e.g. 120"
                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Core Diameter (mm)</label>
                        <input
                            type="number"
                            name="CoreDiameter"
                            value={formData.CoreDiameter}
                            onChange={handleChange}
                            placeholder="e.g. 90"
                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Slot Count</label>
                        <input
                            type="number"
                            name="SlotCount"
                            value={formData.SlotCount}
                            onChange={handleChange}
                            placeholder="e.g. 24"
                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                        />
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Winding Details
                    </button>
                </div>
            </form>
        </div>
    );
};

export default WindingDetails;
