import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowRight, RefreshCw } from 'lucide-react';
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
      await api.post('/quotes', {
        ...form,
        subtotal,
        taxAmount: 0,
        discountAmount: 0,
        total: subtotal,
      });
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

  const columns = [
    { key: 'quoteNumber', label: 'Quote #',
      render: v => <span className="font-semibold text-red-600">{v}</span> },
    { key: 'customer', label: 'Customer', render: v => v?.name || '—' },
    { key: 'issueDate', label: 'Date',
      render: v => v ? format(new Date(v), 'MMM d, yyyy') : '—' },
    { key: 'expiryDate', label: 'Expires',
      render: v => v ? format(new Date(v), 'MMM d, yyyy') : '—' },
    { key: 'total', label: 'Amount',
      render: v => <span className="font-semibold">${(v || 0).toFixed(2)}</span> },
    { key: 'status', label: 'Status', render: v => <Badge status={v} /> },
    { key: 'convertedToInvoice', label: 'Converted',
      render: v => v
        ? <span className="text-xs text-green-600 font-semibold">✓ Yes</span>
        : <span className="text-xs text-gray-400">No</span> },
    { key: '_id', label: 'Actions',
      render: (id, row) => (
        <div className="flex items-center gap-1">
          {!row.convertedToInvoice && (
            <button onClick={e => handleConvert(id, e)}
              className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
              title="Convert to Invoice">
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button onClick={e => handleDelete(id, e)}
            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
            title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )},
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-sm text-gray-500">{quotes.length} total quotes</p>
        </div>
        <Button onClick={() => setModal(true)}>
          <Plus className="w-4 h-4" /> New Quote
        </Button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex justify-end mb-4">
          <button onClick={fetchQuotes} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <Table
          columns={columns}
          data={quotes}
          loading={loading}
          emptyMessage="No quotes yet. Create your first quote!"
        />
      </div>

      {/* Create Modal */}
      <Modal open={modal} onClose={() => { setModal(false); setForm(EMPTY_FORM); }}
        title="Create New Quote" size="lg">
        <div className="space-y-5">
          {/* Customer + Expiry */}
          <div className="grid grid-cols-2 gap-4">
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
              <button onClick={() => setForm(p => ({ ...p, lineItems: [...p.lineItems, { ...EMPTY_LINE }] }))}
                className="text-xs text-red-600 font-semibold flex items-center gap-1 hover:text-red-700">
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 uppercase gap-2">
                <div className="col-span-6">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-2">Amount</div>
              </div>
              {form.lineItems.map((item, i) => (
                <div key={i} className="grid grid-cols-12 px-3 py-2 border-t border-gray-50 gap-2 items-center">
                  <input className="col-span-6 input-field text-sm py-1.5" placeholder="Description"
                    value={item.description} onChange={e => updateLine(i, 'description', e.target.value)} />
                  <input type="number" min="0" className="col-span-2 input-field text-sm py-1.5"
                    value={item.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} />
                  <input type="number" min="0" className="col-span-2 input-field text-sm py-1.5"
                    value={item.rate} onChange={e => updateLine(i, 'rate', e.target.value)} />
                  <div className="col-span-2 text-sm font-semibold">${(item.amount || 0).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-2 pr-3">
              <span className="text-sm font-bold text-gray-900">
                Total: <span className="text-red-600">${subtotal.toFixed(2)}</span>
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea rows={2} value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="input-field resize-none" placeholder="Optional notes..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Terms</label>
              <textarea rows={2} value={form.terms}
                onChange={e => setForm(p => ({ ...p, terms: e.target.value }))}
                className="input-field resize-none" placeholder="Optional terms..." />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => { setModal(false); setForm(EMPTY_FORM); }}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save Quote
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}