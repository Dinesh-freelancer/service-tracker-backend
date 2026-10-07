import React, { useState, useEffect } from 'react';
import { Search, Database, Upload, RefreshCw, Loader2, ChevronLeft, ChevronRight, Filter, PackageSearch, Layers, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const SparesSearch = () => {
    const [searchMode, setSearchMode] = useState('spare'); // 'spare' | 'pump'
    const [spares, setSpares] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [query, setQuery] = useState('');
    const [pumpCategory, setPumpCategory] = useState('');
    const [pumpType, setPumpType] = useState('');
    const [pumpSize, setPumpSize] = useState('');
    const [spareName, setSpareName] = useState('');
    const [partNo, setPartNo] = useState('');
    const [sapMaterial, setSapMaterial] = useState('');

    // Pump options for dropdowns
    const [pumpOptions, setPumpOptions] = useState({ categories: [], types: [], sizes: [] });

    // Pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Sync Modal State
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [syncFile, setSyncFile] = useState(null);
    const [syncDataPreview, setSyncDataPreview] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchPumpOptions(pumpCategory, pumpType);
    }, [pumpCategory, pumpType]);

    useEffect(() => {
        setPage(1);
        fetchSpares(1);
    }, [searchMode, pumpCategory, pumpType, pumpSize, limit]);

    const fetchPumpOptions = async (category = pumpCategory, type = pumpType) => {
        try {
            const params = new URLSearchParams({
                pumpCategory: category || '',
                pumpType: type || ''
            });
            const res = await fetch(`${apiUrl}/spares/pump-options?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPumpOptions(prev => ({
                    categories: data.categories || prev.categories,
                    types: data.types || [],
                    sizes: data.sizes || []
                }));
            }
        } catch (err) {
            console.error('Failed to load pump options', err);
        }
    };

    const fetchSpares = async (currentPage = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                mode: searchMode,
                query: query.trim(),
                pumpCategory,
                pumpType,
                pumpSize,
                spareName: spareName.trim(),
                partNo: partNo.trim(),
                sapMaterial: sapMaterial.trim(),
                page: currentPage.toString(),
                limit: limit.toString()
            });

            const res = await fetch(`${apiUrl}/spares/search?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch spares');
            const data = await res.json();
            setSpares(data.data || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalRecords(data.pagination?.total || 0);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchSpares(1);
    };

    const handleResetFilters = () => {
        setQuery('');
        setPumpCategory('');
        setPumpType('');
        setPumpSize('');
        setSpareName('');
        setPartNo('');
        setSapMaterial('');
        setPage(1);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            toast.error('Please upload a valid JSON file.');
            return;
        }

        setSyncFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                const items = Array.isArray(parsed) ? parsed : (parsed.spares || []);
                if (items.length === 0) {
                    toast.error('No items found in JSON file.');
                    setSyncDataPreview(null);
                } else {
                    setSyncDataPreview({
                        count: items.length,
                        sample: items.slice(0, 3),
                        rawItems: items
                    });
                }
            } catch (err) {
                toast.error('Invalid JSON file format.');
                setSyncDataPreview(null);
            }
        };
        reader.readAsText(file);
    };

    const handleStartSync = async () => {
        if (!syncDataPreview || !syncDataPreview.rawItems) {
            toast.error('No valid JSON data loaded.');
            return;
        }

        setIsSyncing(true);
        try {
            const res = await fetch(`${apiUrl}/spares/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(syncDataPreview.rawItems)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to sync JSON');

            toast.success(data.message || 'JSON sync completed successfully!');
            setIsSyncModalOpen(false);
            setSyncFile(null);
            setSyncDataPreview(null);
            fetchPumpOptions();
            fetchSpares(1);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <PackageSearch className="text-blue-600" />
                        Spares Search & Catalog
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Search spare parts database, filter by pump specifications, and sync price list JSON.
                    </p>
                </div>

                <Button
                    onClick={() => setIsSyncModalOpen(true)}
                    className="w-auto flex items-center justify-center gap-2 text-sm"
                >
                    <Upload size={16} /> Sync JSON File
                </Button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 w-fit">
                <button
                    onClick={() => setSearchMode('spare')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        searchMode === 'spare'
                            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <Search size={16} />
                    Spare Search (Search by DB Fields)
                </button>
                <button
                    onClick={() => setSearchMode('pump')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        searchMode === 'pump'
                            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <Layers size={16} />
                    Pump Search (Search Pump to Get Spares)
                </button>
            </div>

            {/* Filters Form */}
            <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {searchMode === 'spare' ? (
                        <>
                            <div className="col-span-1 sm:col-span-2">
                                <Input
                                    label="Search Spare / Material"
                                    placeholder="Part No, Spare Name, SAP Material..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Pump Category</label>
                                <select
                                    value={pumpCategory}
                                    onChange={(e) => {
                                        setPumpCategory(e.target.value);
                                        setPumpType('');
                                        setPumpSize('');
                                    }}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200"
                                >
                                    <option value="">All Categories</option>
                                    {pumpOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Pump Type</label>
                                <input
                                    list="pump-types-list-spare-mode"
                                    type="text"
                                    placeholder="Type or select Pump Type..."
                                    value={pumpType}
                                    onChange={(e) => {
                                        setPumpType(e.target.value);
                                        setPumpSize('');
                                    }}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                                />
                                <datalist id="pump-types-list-spare-mode">
                                    <option value="">All Types</option>
                                    {pumpOptions.types.map(t => <option key={t} value={t} />)}
                                </datalist>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Pump Category</label>
                                <select
                                    value={pumpCategory}
                                    onChange={(e) => {
                                        setPumpCategory(e.target.value);
                                        setPumpType('');
                                        setPumpSize('');
                                    }}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200"
                                >
                                    <option value="">All Categories</option>
                                    {pumpOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Pump Type</label>
                                <input
                                    list="pump-types-list-pump-mode"
                                    type="text"
                                    placeholder="Type or select Pump Type..."
                                    value={pumpType}
                                    onChange={(e) => {
                                        setPumpType(e.target.value);
                                        setPumpSize('');
                                    }}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                                />
                                <datalist id="pump-types-list-pump-mode">
                                    <option value="">All Types</option>
                                    {pumpOptions.types.map(t => <option key={t} value={t} />)}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Pump Size</label>
                                <select
                                    value={pumpSize}
                                    onChange={(e) => setPumpSize(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200"
                                >
                                    <option value="">All Sizes</option>
                                    {pumpOptions.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <Input
                                    label="Pump Search Query"
                                    placeholder="Filter pump details..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <Button type="button" variant="outline" onClick={handleResetFilters} className="w-auto text-xs">
                        Reset Filters
                    </Button>
                    <Button type="submit" className="w-auto flex items-center gap-2 text-xs">
                        <Search size={14} /> Search
                    </Button>
                </div>
            </form>

            {/* Results Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden space-y-4">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div>
                        Found <span className="font-bold text-slate-900 dark:text-white">{totalRecords}</span> spares
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Show</span>
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>per page</span>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                    <th className="p-3 font-semibold">Part No</th>
                                    <th className="p-3 font-semibold">Spare Name</th>
                                    <th className="p-3 font-semibold">Basic Material</th>
                                    <th className="p-3 font-semibold">Pump Specs</th>
                                    <th className="p-3 font-semibold">SAP Material</th>
                                    <th className="p-3 font-semibold text-right">Unit Price</th>
                                    <th className="p-3 font-semibold text-center">UOM</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {spares.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-500">
                                            No spare parts found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    spares.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="p-3 font-mono text-slate-800 dark:text-slate-200 font-medium">
                                                {item.part_no || '-'}
                                            </td>
                                            <td className="p-3 font-semibold text-slate-900 dark:text-white max-w-[260px] truncate" title={item.spare_name}>
                                                {item.spare_name}
                                            </td>
                                            <td className="p-3 text-slate-600 dark:text-slate-400">
                                                {item.basic_material || '-'}
                                            </td>
                                            <td className="p-3 text-xs text-slate-500">
                                                <div className="font-semibold text-slate-700 dark:text-slate-300">{item.pump_category}</div>
                                                <div>{item.pump_type} • {item.pump_size}</div>
                                            </td>
                                            <td className="p-3 font-mono text-xs text-slate-500">
                                                {item.sap_material || '-'}
                                            </td>
                                            <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                ₹{parseFloat(item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-3 text-center text-xs text-slate-500 font-mono">
                                                {item.uom}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1 || loading}
                            onClick={() => {
                                const newPage = page - 1;
                                setPage(newPage);
                                fetchSpares(newPage);
                            }}
                            className="w-auto py-1 px-3 text-xs flex items-center gap-1"
                        >
                            <ChevronLeft size={14} /> Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages || loading}
                            onClick={() => {
                                const newPage = page + 1;
                                setPage(newPage);
                                fetchSpares(newPage);
                            }}
                            className="w-auto py-1 px-3 text-xs flex items-center gap-1"
                        >
                            Next <ChevronRight size={14} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sync Modal */}
            <Modal
                isOpen={isSyncModalOpen}
                onClose={() => !isSyncing && setIsSyncModalOpen(false)}
                title="Sync Spare Prices (JSON File Upload)"
            >
                <div className="space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                        <Info size={16} className="shrink-0 mt-0.5" />
                        <div>
                            Upload a JSON price list containing pump spare parts. The system automatically decodes URL-encoded spare names and material strings, upserting ~20,000 records in database-safe batches.
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Select JSON File</label>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            disabled={isSyncing}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    {syncDataPreview && (
                        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                            <div className="font-semibold text-slate-900 dark:text-white flex justify-between">
                                <span>Total Spares Detected:</span>
                                <span className="text-blue-600 font-bold">{syncDataPreview.count.toLocaleString()}</span>
                            </div>
                            <div className="text-slate-500">Sample Item Preview:</div>
                            <pre className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-x-auto font-mono text-[11px]">
                                {JSON.stringify(syncDataPreview.sample[0], null, 2)}
                            </pre>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSyncing}
                            onClick={() => setIsSyncModalOpen(false)}
                            className="w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={!syncDataPreview || isSyncing}
                            onClick={handleStartSync}
                            className="w-auto flex items-center justify-center gap-2"
                        >
                            {isSyncing ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} /> Syncing in Batches...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={16} /> Start Sync
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SparesSearch;
