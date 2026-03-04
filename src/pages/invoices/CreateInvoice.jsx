import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

const EMPTY_LINE = { description: '', quantity: 1, rate: 0, discount: 0, taxRate: 0, amount: 0 };

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer: '', issueDate: new Date().toISOString().split('T')[0],
    dueDate: '', currency: 'USD', taxRate: 0, discountType: 'percent',
    discountValue: 0, shippingCharge: 0, notes: '', terms: '',
    lineItems: [{ ...EMPTY_LINE }],
  });

  useEffect(() => {
    api.get('/customers?limit=200').then(r => setCustomers(r.data.data)).catch(() => {});
  }, []);

  const updateLine = (i, field, value) => {
    const items = [...form.lineItems];
    items[i] = { ...items[i], [field]: value };
    const qty = +items[i].quantity || 0;
    const rate = +items[i].rate || 0;
    const disc = +items[i].discount || 0;
    items[i].amount = (qty * rate) * (1 - disc / 100);
    setForm(p => ({ ...p, lineItems: items }));
  };

  const subtotal = form.lineItems.reduce((s, i) => s + (i.amount || 0), 0);
  const discountAmt = form.discountType === 'percent' ? subtotal * (form.discountValue / 100) : +form.discountValue;
  const taxable = subtotal - discountAmt;
  const taxAmt = taxable * (form.taxRate / 100);
  const total = taxable + taxAmt + +form.shippingCharge;

  const handleSubmit = async (status = 'draft') => {
    if (!form.customer) return toast.error('Please select a customer');
    if (!form.dueDate) return toast.error('Please set a due date');
    setLoading(true);
    try {
      const res = await api.post('/invoices', { ...form, status });
      toast.success(`Invoice ${status === 'sent' ? 'sent' : 'saved'}!`);
      navigate(`/invoices/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">New Invoice</h1>
          <p className="text-sm text-gray-500">Create a professional invoice</p>
        </div>
      </div>

      <div className="card space-y-6">
        {/* Customer + Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
            <select value={form.customer} onChange={e => setForm(p => ({...p, customer: e.target.value}))}
              className="input-field">
              <option value="">Select customer...</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Issue Date" type="date" value={form.issueDate}
            onChange={e => setForm(p => ({...p, issueDate: e.target.value}))} />
          <Input label="Due Date *" type="date" value={form.dueDate}
            onChange={e => setForm(p => ({...p, dueDate: e.target.value}))} />
        </div>

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Line Items</h3>
            <button onClick={() => setForm(p => ({...p, lineItems: [...p.lineItems, {...EMPTY_LINE}]}))}
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase gap-2">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Rate</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-1"></div>
            </div>
            {form.lineItems.map((item, i) => (
              <div key={i} className="grid grid-cols-12 px-4 py-3 border-t border-gray-50 gap-2 items-center">
                <input className="col-span-5 input-field text-sm py-2" placeholder="Description"
                  value={item.description} onChange={e => updateLine(i, 'description', e.target.value)} />
                <input type="number" min="0" className="col-span-2 input-field text-sm py-2"
                  value={item.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} />
                <input type="number" min="0" className="col-span-2 input-field text-sm py-2"
                  value={item.rate} onChange={e => updateLine(i, 'rate', e.target.value)} />
                <div className="col-span-2 text-sm font-semibold text-gray-900">
                  ${item.amount.toFixed(2)}
                </div>
                <button onClick={() => setForm(p => ({...p, lineItems: p.lineItems.filter((_,j)=>j!==i)}))}
                  className="col-span-1 text-gray-400 hover:text-red-500 transition-colors" disabled={form.lineItems.length === 1}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm flex-1">Discount</span>
              <input type="number" min="0" value={form.discountValue}
                onChange={e => setForm(p=>({...p, discountValue: e.target.value}))}
                className="input-field w-20 py-1.5 text-sm" />
              <select value={form.discountType} onChange={e => setForm(p=>({...p, discountType: e.target.value}))}
                className="input-field w-20 py-1.5 text-sm">
                <option value="percent">%</option>
                <option value="fixed">$</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm flex-1">Tax %</span>
              <input type="number" min="0" max="100" value={form.taxRate}
                onChange={e => setForm(p=>({...p, taxRate: e.target.value}))}
                className="input-field w-24 py-1.5 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm flex-1">Shipping</span>
              <input type="number" min="0" value={form.shippingCharge}
                onChange={e => setForm(p=>({...p, shippingCharge: e.target.value}))}
                className="input-field w-24 py-1.5 text-sm" />
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-xl text-red-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm(p=>({...p, notes: e.target.value}))}
              className="input-field resize-none" placeholder="Thank you for your business!" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Terms</label>
            <textarea rows={3} value={form.terms} onChange={e => setForm(p=>({...p, terms: e.target.value}))}
              className="input-field resize-none" placeholder="Payment terms..." />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <Button variant="secondary" onClick={() => handleSubmit('draft')} loading={loading}>
            Save as Draft
          </Button>
          <Button onClick={() => handleSubmit('sent')} loading={loading}>
            Create & Send
          </Button>
        </div>
      </div>
    </div>
  );
}