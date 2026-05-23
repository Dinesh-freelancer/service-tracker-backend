import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Save, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const GlobalSettings = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');

  const [settings, setSettings] = useState({
    CompanyName: '',
    TaxRate: '',
    DefaultLabourCharge: '',
    Currency: '₹'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${apiUrl}/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load settings');
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
            setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [apiUrl, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/settings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to save settings');
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard/settings')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <SettingsIcon className="text-blue-600" />
                    Global Configuration
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">System-wide variables and preferences.</p>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Company Name</label>
                    <input
                        type="text"
                        name="CompanyName"
                        value={settings.CompanyName || ''}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-white"
                        placeholder="E.g., Submersible Services Inc."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Currency Symbol</label>
                    <input
                        type="text"
                        name="Currency"
                        value={settings.Currency || '₹'}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Tax Rate (%)</label>
                    <input
                        type="number"
                        name="TaxRate"
                        value={settings.TaxRate || ''}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-white"
                        placeholder="18"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Default Labour Charge</label>
                    <input
                        type="number"
                        name="DefaultLabourCharge"
                        value={settings.DefaultLabourCharge || ''}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-white"
                        placeholder="500"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>
        </div>
    </div>
  );
};

export default GlobalSettings;
