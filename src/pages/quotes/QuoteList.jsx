import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import { format } from 'date-fns';

const EMPTY_LINE = { description: '', quantity: 1, rate: 0, amount: 0 };
const EMPTY_FORM = {
  customer: '', expiryDate: '', currency: 'USD',
  notes: '', terms: '', lineItems: [{ ...EMPTY_LINE }],
};

export default function QuoteList() {
  const [quotes, setQuotes]       = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const navigate = useNavigate();

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/quotes?limit=50');
      setQuotes(r.data.data);
    } catch { toast.error('Failed to load quotes'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchQuotes();
    api.get('/customers?limit=200').then(r => setCustomers(r.data.data)).catch(() => {});
  }, [fetchQuotes]);

  const updateLine = (i, field, value) => {
    const items = [...form.lineItems];
    items[i] = { ...items[i], [field]: value };
    items[i].amount = (+(items[i].quantity) || 0) * (+(items[i].rate) || 0);
    setForm(p => ({ ...p, lineItems: items }));
  };

  const subtotal = form.lineItems.reduce((s, i) => s + (i.amount || 0), 0);

  const handleSave = async () => {
    if (!form.customer) return toast.error('Please select a customer');
    setSaving(true);
    try {
      await api.post('/quotes', { ...form, subtotal, taxAmount: 0, discountAmount: 0, total: subtotal });
      toast.success('Quote created!');
      setModal(false);
      setForm(EMPTY_FORM);
      fetchQuotes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quote');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this quote?')) return;
    try {
      await api.delete(`/quotes/${id}`);
      toast.success('Quote deleted');
      fetchQuotes();
    } catch { toast.error('Delete failed'); }
  };

  const handleConvert = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Convert this quote to an invoice?')) return;
    try {
      const res = await api.post(`/quotes/${id}/convert`, {
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      toast.success('Converted to invoice!');
      navigate(`/invoices/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Conversion failed');
    }
  };

  const closeModal = () => { setModal(false); setForm(EMPTY_FORM); };

  return (
    <div className="space-y-4 md:space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-xs md:text-sm text-gray-500">{quotes.length} total quotes</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchQuotes}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <Button onClick={() => setModal(true)} className="text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Quote</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* ── Desktop Table (md and above) ─────────────────────────────── */}
      <div className="hidden md:block card">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : quotes.length === 0 ? (
          <EmptyState
            message="No quotes yet. Create your first quote!"
            action={
              <Button onClick={() => setModal(true)}>
                <Plus className="w-4 h-4" /> New Quote
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Quote #', 'Customer', 'Date', 'Expires', 'Amount', 'Status', 'Converted', 'Actions'].map(h => (
                    <th key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quotes.map(row => (
                  <tr key={row._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-red-600 text-sm">{row.quoteNumber}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{row.customer?.name || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {row.issueDate ? format(new Date(row.issueDate), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {row.expiryDate ? format(new Date(row.expiryDate), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      <span className="font-semibold">${(row.total || 0).toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3.5"><Badge status={row.status} /></td>
                    <td className="px-4 py-3.5 text-sm">
                      {row.convertedToInvoice
                        ? <span className="text-green-600 font-semibold text-xs">✓ Yes</span>
                        : <span className="text-gray-400 text-xs">No</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        {!row.convertedToInvoice && (
                          <button onClick={e => handleConvert(row._id, e)}
                            className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                            title="Convert to Invoice">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={e => handleDelete(row._id, e)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Mobile Card List (below md) ───────────────────────────────── */}
      <div className="md:hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : quotes.length === 0 ? (
          <EmptyState
            message="No quotes yet. Create your first quote!"
            action={
              <Button onClick={() => setModal(true)}>
                <Plus className="w-4 h-4" /> New Quote
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {quotes.map(row => (
              <div key={row._id}
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">

                {/* Top: quote # + amount */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-red-600">{row.quoteNumber}</span>
                  <span className="font-bold text-gray-900">${(row.total || 0).toFixed(2)}</span>
                </div>

                {/* Customer + status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate">
                      {row.customer?.name || '—'}
                    </span>
                  </div>
                  <Badge status={row.status} />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400 mb-0.5">Created</p>
                    <p className="text-xs font-semibold text-gray-700">
                      {row.issueDate ? format(new Date(row.issueDate), 'MMM d, yyyy') : '—'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400 mb-0.5">Expires</p>
                    <p className="text-xs font-semibold text-gray-700">
                      {row.expiryDate ? format(new Date(row.expiryDate), 'MMM d, yyyy') : '—'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  {row.convertedToInvoice ? (
                    <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-lg">
                      ✓ Converted to Invoice
                    </span>
                  ) : (
                    <button
                      onClick={e => handleConvert(row._id, e)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                      Convert to Invoice
                    </button>
                  )}
                  <button
                    onClick={e => handleDelete(row._id, e)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Create Quote Modal ─────────────────────────────────────────── */}
      <Modal open={modal} onClose={closeModal} title="Create New Quote" size="lg">
        <div className="space-y-4 md:space-y-5">

          {/* Customer + Expiry — stacked on mobile, side by side on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <select value={form.customer}
                onChange={e => setForm(p => ({ ...p, customer: e.target.value }))}
                className="input-field">
                <option value="">Select customer...</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <Input label="Expiry Date" type="date" value={form.expiryDate}
              onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))} />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Line Items</label>
              <button
                onClick={() => setForm(p => ({ ...p, lineItems: [...p.lineItems, { ...EMPTY_LINE }] }))}
                className="text-xs text-red-600 font-semibold flex items-center gap-1 hover:text-red-700">
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>

            {/* Desktop line item table */}
            <div className="hidden md:block rounded-xl border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 uppercase gap-2">
                <div className="col-span-6">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-2">Amount</div>
              </div>
              {form.lineItems.map((item, i) => (
                <div key={i}
                  className="grid grid-cols-12 px-3 py-2 border-t border-gray-50 gap-2 items-center">
                  <input className="col-span-6 input-field text-sm py-1.5" placeholder="Description"
                    value={item.description} onChange={e => updateLine(i, 'description', e.target.value)} />
                  <input type="number" min="0" className="col-span-2 input-field text-sm py-1.5"
                    value={item.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} />
                  <input type="number" min="0" className="col-span-2 input-field text-sm py-1.5"
                    value={item.rate} onChange={e => updateLine(i, 'rate', e.target.value)} />
                  <div className="col-span-2 text-sm font-semibold">
                    ${(item.amount || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile line item cards */}
            <div className="md:hidden space-y-3">
              {form.lineItems.map((item, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-3 bg-gray-50">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                    <input className="input-field text-sm w-full" placeholder="Item description"
                      value={item.description} onChange={e => updateLine(i, 'description', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Quantity</label>
                      <input type="number" min="0" className="input-field text-sm w-full"
                        value={item.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Rate ($)</label>
                      <input type="number" min="0" className="input-field text-sm w-full"
                        value={item.rate} onChange={e => updateLine(i, 'rate', e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500">Amount: </span>
                      <span className="font-bold text-sm text-gray-900">
                        ${(item.amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => setForm(p => ({
                        ...p, lineItems: p.lineItems.filter((_, j) => j !== i)
                      }))}
                      disabled={form.lineItems.length === 1}
                      className="flex items-center gap-1 text-xs text-red-500 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg disabled:opacity-30 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-end mt-2 pr-1">
              <span className="text-sm font-bold text-gray-900">
                Total: <span className="text-red-600">${subtotal.toFixed(2)}</span>
              </span>
            </div>
          </div>

          {/* Notes + Terms — stacked on mobile, side by side on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea rows={2} value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="input-field resize-none w-full" placeholder="Optional notes..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Terms</label>
              <textarea rows={2} value={form.terms}
                onChange={e => setForm(p => ({ ...p, terms: e.target.value }))}
                className="input-field resize-none w-full" placeholder="Optional terms..." />
            </div>
          </div>

          {/* Actions — full width on mobile */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={closeModal}
              className="w-full sm:w-auto justify-center">
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}
              className="w-full sm:w-auto justify-center">
              Save Quote
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}