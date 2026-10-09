import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, Plus, Trash2, Printer, CheckCircle, XCircle, RefreshCw, Send } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

const QuoteTab = ({ job }) => {
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companySettings, setCompanySettings] = useState({});

  // DB Options for items
  const [partsList, setPartsList] = useState([]);
  const [servicesList, setServicesList] = useState([]);

  // Form state for creating a new quote
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [dismantlingCharge, setDismantlingCharge] = useState(500);
  const [taxRate, setTaxRate] = useState(18);
  const [validityDays, setValidityDays] = useState(15);
  const [terms, setTerms] = useState('');

  // Quick Inline Creation States
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceRate, setNewServiceRate] = useState('');

  const role = localStorage.getItem('role') || 'Admin';
  const isCustomer = role === 'Customer';
  const isAdminOrOwner = ['Admin', 'Owner'].includes(role);

  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/quotes/job/${job.JobNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuotes(data);
        if (data.length > 0) {
          fetchSingleQuote(data[0].QuoteId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSingleQuote = async (quoteId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/quotes/${quoteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedQuote(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCatalogData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');

      // Fetch parts
      const partsRes = await fetch(`${apiUrl}/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (partsRes.ok) {
        const pData = await partsRes.json();
        setPartsList(pData.data || pData || []);
      }

      // Fetch services
      const servRes = await fetch(`${apiUrl}/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (servRes.ok) {
        const sData = await servRes.json();
        setServicesList(sData || []);
      }

      // Fetch global settings for company letterhead
      const settingsRes = await fetch(`${apiUrl}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setCompanySettings(settingsData || {});
        if (!terms && settingsData.QuoteTerms) {
          setTerms(settingsData.QuoteTerms);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (job?.JobNumber) {
      fetchQuotes();
      fetchCatalogData();
    }
  }, [job?.JobNumber]);

  // Pre-populate items based on Job's Parts Used or Services Needed
  const handleOpenCreateModal = () => {
    const initialItems = [];

    // 1. Pre-fill parts if job has parts used
    if (job.partsUsed && job.partsUsed.length > 0) {
      job.partsUsed.forEach((p) => {
        initialItems.push({
          ItemType: 'Part',
          ReferenceId: p.PartId || null,
          Description: p.PartName,
          HSNSAC: p.HSNCode || '8413',
          Qty: Number(p.Qty) || 1,
          UnitPrice: Number(p.SellingPrice || p.CostPrice || 0),
        });
      });
    }

    // 2. Pre-fill services if ServicesNeeded exist
    if (job.ServicesNeeded && Array.isArray(job.ServicesNeeded)) {
      job.ServicesNeeded.forEach((s) => {
        initialItems.push({
          ItemType: 'Service',
          ReferenceId: null,
          Description: typeof s === 'string' ? s : s.name || 'Service Labor',
          HSNSAC: '998719',
          Qty: 1,
          UnitPrice: Number(s.rate || 0),
        });
      });
    }

    if (initialItems.length === 0) {
      initialItems.push({
        ItemType: 'Service',
        ReferenceId: null,
        Description: 'Inspection and Servicing Charge',
        HSNSAC: '998719',
        Qty: 1,
        UnitPrice: 500,
      });
    }

    setItems(initialItems);
    setDiscount(0);
    setDismantlingCharge(Number(companySettings.DefaultDismantlingCharge) || 500);
    setTaxRate(Number(companySettings.TaxRate) || 18);
    setValidityDays(Number(companySettings.DefaultValidityDays) || 15);
    setTerms(companySettings.QuoteTerms || '1. Quotation is valid for 15 days from date of issue.\n2. Dismantling charges applicable on cancellation.');
    setIsModalOpen(true);
  };

  const handleAddItem = (type = 'Custom') => {
    setItems([
      ...items,
      {
        ItemType: type,
        ReferenceId: null,
        Description: type === 'Part' ? 'Spare Part' : type === 'Service' ? 'Labor / Service' : 'Additional Item',
        HSNSAC: type === 'Part' ? '8413' : '998719',
        Qty: 1,
        UnitPrice: 0,
      },
    ]);
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    // Auto update price/code if catalog item selected
    if (field === 'ReferenceId') {
      if (updated[index].ItemType === 'Part') {
        const selected = partsList.find((p) => p.PartId === Number(value));
        if (selected) {
          updated[index].Description = selected.PartName;
          updated[index].UnitPrice = Number(selected.DefaultSellingPrice || selected.DefaultCostPrice || 0);
          updated[index].HSNSAC = selected.HSNCode || '8413';
        }
      } else if (updated[index].ItemType === 'Service') {
        const selected = servicesList.find((s) => s.ServiceId === Number(value));
        if (selected) {
          updated[index].Description = selected.ServiceName;
          updated[index].UnitPrice = Number(selected.DefaultRate || 0);
          updated[index].HSNSAC = selected.SACCode || '998719';
        }
      }
    }

    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Quick inline creation for service rate
  const handleCreateNewService = async () => {
    if (!newServiceName) return toast.error('Service Name is required');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ServiceName: newServiceName, DefaultRate: newServiceRate || 0, SACCode: '998719' })
      });
      if (res.ok) {
        toast.success('New Service rate added');
        setShowAddService(false);
        setNewServiceName('');
        setNewServiceRate('');
        fetchCatalogData();
      }
    } catch (e) {
      toast.error('Failed to create service rate');
    }
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.Qty) || 0) * (Number(item.UnitPrice) || 0), 0);
  const taxableAmount = Math.max(0, subtotal - Number(discount) + Number(dismantlingCharge));
  const taxAmount = (taxableAmount * Number(taxRate)) / 100;
  const grandTotal = taxableAmount + taxAmount;

  const handleSaveQuote = async (status = 'Sent') => {
    if (items.length === 0) return toast.error('Please add at least one line item');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          JobNumber: job.JobNumber,
          Status: status,
          Subtotal: subtotal,
          Discount: Number(discount),
          DismantlingCharge: Number(dismantlingCharge),
          TaxRate: Number(taxRate),
          TaxAmount: taxAmount,
          GrandTotal: grandTotal,
          ValidityDays: Number(validityDays),
          TermsAndConditions: terms,
          items,
        })
      });

      if (res.ok) {
        toast.success(`Quotation ${status === 'Draft' ? 'saved as Draft' : 'created & sent'}`);
        setIsModalOpen(false);
        fetchQuotes();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to create quote');
      }
    } catch (e) {
      toast.error('Failed to save quotation');
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedQuote) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/quotes/${selectedQuote.QuoteId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        toast.success(`Quotation marked as ${status}`);
        fetchQuotes();
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="text-blue-600" size={20} />
            Job Quotation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage cost estimates, generate printable letterheads, and track approval status.
          </p>
        </div>

        {isAdminOrOwner && (
          <Button onClick={handleOpenCreateModal} className="w-auto flex items-center gap-2">
            <Plus size={16} />
            {quotes.length > 0 ? 'Create Revision' : 'Create Quote'}
          </Button>
        )}
      </div>

      {/* Quote Selector & Details */}
      {quotes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Revision History Sidebar */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Revisions ({quotes.length})
            </h4>
            <div className="space-y-2">
              {quotes.map((q) => (
                <button
                  key={q.QuoteId}
                  onClick={() => fetchSingleQuote(q.QuoteId)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedQuote?.QuoteId === q.QuoteId
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{q.QuoteNumber} (Rev {q.Revision})</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      q.Status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      q.Status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {q.Status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex justify-between">
                    <span>₹{Number(q.GrandTotal).toLocaleString('en-IN')}</span>
                    <span>{new Date(q.CreatedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quotation Printable Letterhead View */}
          <div className="lg:col-span-3">
            {selectedQuote ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-md print:shadow-none print:border-none print:p-0">
                {/* Print Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 print:hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Status:</span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-100 text-blue-800">
                      {selectedQuote.Status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handlePrint} className="w-auto flex items-center gap-1.5 text-xs">
                      <Printer size={14} /> Print / Save PDF
                    </Button>

                    {isCustomer && selectedQuote.Status !== 'Approved' && (
                      <>
                        <Button onClick={() => handleUpdateStatus('Approved')} className="w-auto bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 text-xs">
                          <CheckCircle size={14} /> Approve Estimate
                        </Button>
                        <Button onClick={() => handleUpdateStatus('Rejected')} variant="outline" className="w-auto text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1 text-xs">
                          <XCircle size={14} /> Reject Estimate
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* --- PRINTABLE LETTERHEAD CONTENT --- */}
                <div className="space-y-6 text-slate-800 dark:text-slate-200 text-sm">
                  {/* Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                    <div>
                      <h1 className="text-2xl font-black uppercase text-slate-900 dark:text-white tracking-wider">
                        {companySettings.CompanyName || 'SRI VARI PUMPS & ELECTRICALS'}
                      </h1>
                      <p className="text-xs font-medium text-slate-500 italic">
                        {companySettings.CompanyTagline || 'Sales & Service Center for Motors & Submersible Pumps'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {companySettings.CompanyAddress || 'Coimbatore, Tamil Nadu'} <br />
                        Phone: {companySettings.CompanyPhone || '+91-9876543210'} | Email: {companySettings.CompanyEmail || 'support@srivaripumps.com'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-slate-900 text-white font-bold text-xs px-3 py-1 uppercase tracking-widest rounded mb-2">
                        QUOTATION
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">#{selectedQuote.QuoteNumber}</p>
                      <p className="text-xs text-slate-500">Rev: {selectedQuote.Revision}</p>
                      <p className="text-xs text-slate-500">Date: {new Date(selectedQuote.CreatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Customer & Asset Info */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <h5 className="font-bold uppercase text-slate-500 mb-1">Customer Details</h5>
                      <p className="font-semibold text-slate-900 dark:text-white">{job.CustomerName || 'N/A'}</p>
                      <p>{job.CustomerPhone || 'N/A'}</p>
                      <p>{job.CustomerAddress || ''}</p>
                    </div>
                    <div>
                      <h5 className="font-bold uppercase text-slate-500 mb-1">Equipment Details</h5>
                      <p><span className="font-semibold">Job #:</span> {job.JobNumber}</p>
                      <p><span className="font-semibold">Asset Tag:</span> {job.AssetTag || job.InternalTag || 'N/A'}</p>
                      <p><span className="font-semibold">Motor/Pump:</span> {job.Brand || ''} {job.PowerRating || ''} {job.PowerUnit || ''}</p>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-300">
                          <th className="py-2 px-3 font-bold">#</th>
                          <th className="py-2 px-3 font-bold">Description</th>
                          <th className="py-2 px-3 font-bold text-center">HSN/SAC</th>
                          <th className="py-2 px-3 font-bold text-center">Qty</th>
                          <th className="py-2 px-3 font-bold text-right">Unit Price (₹)</th>
                          <th className="py-2 px-3 font-bold text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {selectedQuote.items?.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">{item.Description}</td>
                            <td className="py-2 px-3 text-center text-slate-500">{item.HSNSAC || '-'}</td>
                            <td className="py-2 px-3 text-center">{Number(item.Qty)}</td>
                            <td className="py-2 px-3 text-right">₹{Number(item.UnitPrice).toLocaleString('en-IN')}</td>
                            <td className="py-2 px-3 text-right font-semibold">₹{Number(item.Amount).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals Breakdown */}
                  <div className="flex justify-end pt-2">
                    <div className="w-full max-w-xs space-y-1 text-xs border-t border-slate-200 dark:border-slate-800 pt-2">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Subtotal:</span>
                        <span>₹{Number(selectedQuote.Subtotal).toLocaleString('en-IN')}</span>
                      </div>
                      {Number(selectedQuote.Discount) > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount:</span>
                          <span>- ₹{Number(selectedQuote.Discount).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {Number(selectedQuote.DismantlingCharge) > 0 && (
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Dismantling Charge:</span>
                          <span>+ ₹{Number(selectedQuote.DismantlingCharge).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>GST ({Number(selectedQuote.TaxRate)}%):</span>
                        <span>+ ₹{Number(selectedQuote.TaxAmount).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-800">
                        <span>Grand Total:</span>
                        <span>₹{Number(selectedQuote.GrandTotal).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Footer Clause */}
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <h5 className="font-bold text-slate-700 dark:text-slate-300">Terms & Conditions</h5>
                    <p className="whitespace-pre-line text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-3 rounded border border-slate-100 dark:border-slate-800">
                      {selectedQuote.TermsAndConditions || companySettings.QuoteTerms || '1. Quotation valid for 15 days.'}
                    </p>

                    <div className="pt-8 flex justify-between items-end text-slate-500">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">GSTIN: {companySettings.GSTIN || '33AAAAA0000A1Z5'}</p>
                        <p>Bank: {companySettings.BankName} | A/C: {companySettings.BankAccountNo}</p>
                      </div>
                      <div className="text-right">
                        <div className="h-10"></div>
                        <p className="font-bold text-slate-900 dark:text-white">Authorized Signatory</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">Select a quotation to view details.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <FileText size={48} className="mx-auto text-slate-300 mb-3" />
          <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300">No Quotation Created Yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Create an official estimate for this job with auto-populated parts, standard service rates, and 18% GST.
          </p>
          {isAdminOrOwner && (
            <Button onClick={handleOpenCreateModal} className="w-auto mx-auto flex items-center gap-2">
              <Plus size={16} /> Create Quotation
            </Button>
          )}
        </div>
      )}

      {/* --- CREATE / REVISE QUOTE MODAL --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Quotation Estimate" maxWidth="max-w-4xl">
        <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1 text-sm">
          {/* Quick Line Items Header */}
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Line Items Breakdown</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAddItem('Part')}
                className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-medium transition-colors"
              >
                + Part
              </button>
              <button
                type="button"
                onClick={() => handleAddItem('Service')}
                className="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded font-medium transition-colors"
              >
                + Service
              </button>
              <button
                type="button"
                onClick={() => handleAddItem('Custom')}
                className="text-xs px-2.5 py-1 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded font-medium transition-colors"
              >
                + Custom
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50/50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="col-span-2">
                  <select
                    className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    value={item.ItemType}
                    onChange={(e) => handleUpdateItem(idx, 'ItemType', e.target.value)}
                  >
                    <option value="Part">Part</option>
                    <option value="Service">Service</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div className="col-span-4">
                  {item.ItemType === 'Part' ? (
                    <select
                      className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      value={item.ReferenceId || ''}
                      onChange={(e) => handleUpdateItem(idx, 'ReferenceId', e.target.value)}
                    >
                      <option value="">-- Select Inventory Part --</option>
                      {partsList.map((p) => (
                        <option key={p.PartId} value={p.PartId}>
                          {p.PartName} (₹{p.DefaultSellingPrice || p.DefaultCostPrice})
                        </option>
                      ))}
                    </select>
                  ) : item.ItemType === 'Service' ? (
                    <select
                      className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      value={item.ReferenceId || ''}
                      onChange={(e) => handleUpdateItem(idx, 'ReferenceId', e.target.value)}
                    >
                      <option value="">-- Select Service Labor --</option>
                      {servicesList.map((s) => (
                        <option key={s.ServiceId} value={s.ServiceId}>
                          {s.ServiceName} (₹{s.DefaultRate})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Custom description"
                      className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      value={item.Description}
                      onChange={(e) => handleUpdateItem(idx, 'Description', e.target.value)}
                    />
                  )}
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    value={item.Qty}
                    onChange={(e) => handleUpdateItem(idx, 'Qty', e.target.value)}
                  />
                </div>

                <div className="col-span-3">
                  <input
                    type="number"
                    placeholder="Rate ₹"
                    className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    value={item.UnitPrice}
                    onChange={(e) => handleUpdateItem(idx, 'UnitPrice', e.target.value)}
                  />
                </div>

                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Inline Quick Add Service Rate Option */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            {!showAddService ? (
              <button
                type="button"
                onClick={() => setShowAddService(true)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                + Add new standard service rate to database
              </button>
            ) : (
              <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Service Name (e.g. Rewinding 5HP)"
                  className="flex-1 text-xs p-1.5 rounded border bg-white dark:bg-slate-900"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Rate ₹"
                  className="w-24 text-xs p-1.5 rounded border bg-white dark:bg-slate-900"
                  value={newServiceRate}
                  onChange={(e) => setNewServiceRate(e.target.value)}
                />
                <Button onClick={handleCreateNewService} className="w-auto text-xs py-1 px-3">
                  Save Service
                </Button>
                <button
                  type="button"
                  onClick={() => setShowAddService(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Pricing Adjustments */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Input
              label="Discount (₹)"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
            <Input
              label="Dismantling Charge (₹)"
              type="number"
              value={dismantlingCharge}
              onChange={(e) => setDismantlingCharge(e.target.value)}
            />
            <Input
              label="GST Tax Rate (%)"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
            />
          </div>

          {/* Terms & Conditions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Terms & Conditions Clause
            </label>
            <textarea
              rows={3}
              className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
            />
          </div>

          {/* Live Summary Calculation */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center text-xs">
            <div>
              <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
              <p>GST ({taxRate}%): ₹{taxAmount.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Estimated Grand Total</span>
              <span className="text-xl font-black text-emerald-400">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Modal Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="outline" onClick={() => handleSaveQuote('Draft')} className="w-auto text-xs">
              Save Draft
            </Button>
            <Button onClick={() => handleSaveQuote('Sent')} className="w-auto text-xs flex items-center gap-1.5">
              <Send size={14} /> Send & Set Awaiting Approval
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuoteTab;
