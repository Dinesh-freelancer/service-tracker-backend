import React, { useState, useEffect } from 'react';
import { Save, Loader2, Database, Plus, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SlotTurnsBuilder = ({ title, data, onChange }) => {
    // data is expected to be an object: { "1-8": "50", "1-10": "50" }
    const [rows, setRows] = useState(
        data && Object.keys(data).length > 0 ? Object.entries(data).map(([pitch, turns]) => ({ pitch, turns })) : [{ pitch: '', turns: '' }]
    );

    useEffect(() => {
        // Sync internal state if external data changes (e.g. initial load)
        if (data && Object.keys(data).length > 0) {
             setRows(Object.entries(data).map(([pitch, turns]) => ({ pitch, turns })));
        }
    }, [data]);

    const handleRowChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
        updateParent(newRows);
    };

    const addRow = () => {
        setRows([...rows, { pitch: '', turns: '' }]);
    };

    const removeRow = (index) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows.length ? newRows : [{ pitch: '', turns: '' }]);
        updateParent(newRows);
    };

    const updateParent = (currentRows) => {
        const jsonObj = {};
        currentRows.forEach(row => {
            if (row.pitch && row.turns) {
                jsonObj[row.pitch] = row.turns;
            }
        });
        onChange(jsonObj);
    };

    return (
        <div className="space-y-2 mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{title}</label>
            <div className="space-y-2">
                {rows.map((row, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Pitch (e.g. 1-8)"
                            value={row.pitch}
                            onChange={(e) => handleRowChange(index, 'pitch', e.target.value)}
                            className="w-1/2 p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white"
                        />
                        <input
                            type="number"
                            placeholder="Turns"
                            value={row.turns}
                            onChange={(e) => handleRowChange(index, 'turns', e.target.value)}
                            className="w-1/2 p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white"
                        />
                        <button
                            type="button"
                            onClick={() => removeRow(index)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={addRow}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
            >
                <Plus size={14} /> Add Row
            </button>
        </div>
    );
};

const WindingDetails = ({ assetId, phase, defaultHp }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Default structure based on DDL
    const [formData, setFormData] = useState({
        hp: defaultHp || '',
        kw: '',
        phase: phase || '3-PHASE',
        connection_type: 'NONE',
        swg_run: '', swg_start: '', swg_3phase: '',
        wire_id_run: '', wire_od_run: '',
        wire_id_start: '', wire_od_start: '',
        wire_id_3phase: '', wire_od_3phase: '',
        turns_run: '', turns_start: '', turns_3phase: '',
        slot_turns_run: {}, slot_turns_start: {}, slot_turns_3phase: {},
        notes: ''
    });

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchDetails = async () => {
            if (!assetId) {
                setLoading(false);
                return; // Early return, but loading is set to false
            }
            try {
                const res = await fetch(`${apiUrl}/winding-details/asset/${assetId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && Object.keys(data).length > 0) {
                        setFormData(prev => ({
                            ...prev,
                            ...data,
                            // Ensure JSON fields are objects even if null from DB
                            slot_turns_run: data.slot_turns_run || {},
                            slot_turns_start: data.slot_turns_start || {},
                            slot_turns_3phase: data.slot_turns_3phase || {},
                        }));
                    }
                }
            } catch (err) {
                console.error('Failed to load winding details', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [assetId, token, apiUrl]);

    // Keep internal phase state synced with prop if prop changes
    useEffect(() => {
        if (phase) {
            setFormData(prev => ({ ...prev, phase }));
        }
    }, [phase]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleJsonChange = (name, jsonObj) => {
        setFormData(prev => ({ ...prev, [name]: jsonObj }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Clean up payload based on phase to avoid saving irrelevant data
            const payload = { ...formData };
            if (payload.phase === '1-PHASE') {
                payload.swg_3phase = null; payload.wire_id_3phase = null; payload.wire_od_3phase = null;
                payload.turns_3phase = null; payload.slot_turns_3phase = null;
            } else {
                payload.swg_run = null; payload.swg_start = null;
                payload.wire_id_run = null; payload.wire_od_run = null;
                payload.wire_id_start = null; payload.wire_od_start = null;
                payload.turns_run = null; payload.turns_start = null;
                payload.slot_turns_run = null; payload.slot_turns_start = null;
            }

            const res = await fetch(`${apiUrl}/winding-details/asset/${assetId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
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

    if (!assetId) {
        return (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <AlertCircle className="mx-auto text-amber-500 mb-2" size={32} />
                <p className="text-slate-600 dark:text-slate-300">Winding details cannot be loaded because no Asset is linked to this job.</p>
            </div>
        );
    }

    const is1Phase = formData.phase === '1-PHASE';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Database className="text-pink-500" size={20} />
                        Winding Specifications <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded ml-2">{formData.phase}</span>
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Technical details for motor rewinding.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">

                {/* General Specs */}
                <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">HP</label>
                        <input type="number" step="0.01" name="hp" value={formData.hp} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">KW</label>
                        <input type="number" step="0.01" name="kw" value={formData.kw} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Connection Type</label>
                        <select name="connection_type" value={formData.connection_type} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                            <option value="NONE">None</option>
                            <option value="STAR">Star</option>
                            <option value="DELTA">Delta</option>
                        </select>
                    </div>
                </div>

                {/* Phase Specific Fields */}
                {is1Phase ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Run Winding */}
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 space-y-4">
                            <h4 className="font-semibold text-blue-800 dark:text-blue-300 border-b border-blue-200 dark:border-blue-800/50 pb-2">Main / Run Winding</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">SWG</label>
                                    <input type="number" name="swg_run" value={formData.swg_run} onChange={handleChange} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Total Turns</label>
                                    <input type="number" name="turns_run" value={formData.turns_run} onChange={handleChange} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Wire ID (mm)</label>
                                    <input type="number" step="0.001" name="wire_id_run" value={formData.wire_id_run} onChange={handleChange} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Wire OD (mm)</label>
                                    <input type="number" step="0.001" name="wire_od_run" value={formData.wire_od_run} onChange={handleChange} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700" />
                                </div>
                            </div>
                            <SlotTurnsBuilder title="Slot Pitch & Turns" data={formData.slot_turns_run} onChange={(val) => handleJsonChange('slot_turns_run', val)} />
                        </div>

                        {/* Start Winding */}
                        <div className="bg-orange-50/50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-800/30 space-y-4">
                            <h4 className="font-semibold text-orange-800 dark:text-orange-300 border-b border-orange-200 dark:border-orange-800/50 pb-2">Auxiliary / Start Winding</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">SWG</label>
                                    <input type="number" name="swg_start" value={formData.swg_start} onChange={handleChange} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Total Turns</label>
                                    <input type="number" name="turns_start" value={formData.turns_start} onChange={handleChange} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Wire ID (mm)</label>
                                    <input type="number" step="0.001" name="wire_id_start" value={formData.wire_id_start} onChange={handleChange} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700" />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Wire OD (mm)</label>
                                    <input type="number" step="0.001" name="wire_od_start" value={formData.wire_od_start} onChange={handleChange} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700" />
                                </div>
                            </div>
                            <SlotTurnsBuilder title="Slot Pitch & Turns" data={formData.slot_turns_start} onChange={(val) => handleJsonChange('slot_turns_start', val)} />
                        </div>
                    </div>
                ) : (
                    <div className="bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30 max-w-2xl space-y-4">
                        <h4 className="font-semibold text-purple-800 dark:text-purple-300 border-b border-purple-200 dark:border-purple-800/50 pb-2">3-Phase Winding Details</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">SWG</label>
                                <input type="number" name="swg_3phase" value={formData.swg_3phase} onChange={handleChange} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Total Turns</label>
                                <input type="number" name="turns_3phase" value={formData.turns_3phase} onChange={handleChange} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Wire ID (mm)</label>
                                <input type="number" step="0.001" name="wire_id_3phase" value={formData.wire_id_3phase} onChange={handleChange} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Wire OD (mm)</label>
                                <input type="number" step="0.001" name="wire_od_3phase" value={formData.wire_od_3phase} onChange={handleChange} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700" />
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <SlotTurnsBuilder title="Slot Pitch & Turns" data={formData.slot_turns_3phase} onChange={(val) => handleJsonChange('slot_turns_3phase', val)} />
                        </div>
                    </div>
                )}

                {/* Notes */}
                <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl">
                     <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Additional Notes</label>
                     <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Any special remarks..."
                    />
                </div>

                <div className="flex justify-end">
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
