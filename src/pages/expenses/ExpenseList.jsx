import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Plus, RefreshCw, TrendingDown, Lock, Zap, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['travel','food','utilities','software','hardware','marketing','salary','other'];

const EMPTY_FORM = {
  category: 'software', description: '', amount: '',
  currency: 'USD', date: new Date().toISOString().split('T')[0],
  vendor: '', notes: '',
};

const CATEGORY_COLORS = {
  travel:    'bg-blue-100 text-blue-700',
  food:      'bg-orange-100 text-orange-700',
  utilities: 'bg-yellow-100 text-yellow-700',
  software:  'bg-purple-100 text-purple-700',
  hardware:  'bg-gray-100 text-gray-700',
  marketing: 'bg-pink-100 text-pink-700',
  salary:    'bg-green-100 text-green-700',
  other:     'bg-gray-100 text-gray-600',
};

// ─── Upgrade Wall ─────────────────────────────────────────────────────────────
function UpgradeWall({ currentPlan }) {
  const navigate = useNavigate();
  const PLAN_FEATURES = {
    pro:      ['Unlimited invoices', 'Expense tracking', 'Custom branding', 'Recurring invoices', '5 team members', 'Priority support'],
    business: ['Everything in Pro', 'Unlimited team members', 'API access', 'White-label', 'Dedicated support'],
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Expenses</h1>
        <p className="text-xs md:text-sm text-gray-500">Track your business spending</p>
      </div>

      {/* Lock Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-6 md:p-8 text-white text-center">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 md:w-8 md:h-8 text-white" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold mb-2">Upgrade to Access Expenses</h2>
        <p className="text-red-100 mb-1 text-sm md:text-base">
          You're on the <span className="font-bold uppercase text-white">{currentPlan}</span> plan.
        </p>
        <p className="text-red-100 text-xs md:text-sm mb-6">
          Expense tracking is available on Pro and Business plans.
        </p>
        <button
          onClick={() => navigate('/billing')}
          className="inline-flex items-center gap-2 bg-white text-red-600 font-bold py-2.5 md:py-3 px-6 md:px-8 rounded-xl hover:bg-red-50 transition-colors shadow-lg text-sm md:text-base">
          <Zap className="w-4 h-4 md:w-5 md:h-5" />
          Upgrade Now
        </button>
      </div>

      {/* Plan Cards — stacked on mobile, side by side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(PLAN_FEATURES).map(([plan, features]) => (
          <div key={plan}
            className={`card border-2 ${plan === 'pro' ? 'border-red-200' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg capitalize">{plan}</h3>
                <p className="text-sm text-gray-500">
                  {plan === 'pro' ? 'From $29/month' : 'From $79/month'}
                </p>
              </div>
              {plan === 'pro' && (
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </span>
              )}
            </div>
            <ul className="space-y-2 mb-4">
              {features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500 font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/billing')}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                plan === 'pro'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'border-2 border-red-600 text-red-600 hover:bg-red-50'
              }`}>
              Get {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ExpenseList() {
  const [expenses, setExpenses]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [planState, setPlanState]   = useState({ blocked: false, currentPlan: 'free' });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/expenses?limit=50');
      setExpenses(r.data.data);
      setPlanState({ blocked: false, currentPlan: 'business' });
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.code === 'PLAN_UPGRADE_REQUIRED') {
        setPlanState({ blocked: true, currentPlan: err.response.data.currentPlan || 'free' });
      } else {
        toast.error('Failed to load expenses');
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  if (!loading && planState.blocked) {
    return <UpgradeWall currentPlan={planState.currentPlan} />;
  }

  const totalExpenses  = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const thisMonthTotal = expenses
    .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
    .reduce((s, e) => s + e.amount, 0);
  const byCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
    return acc;
  }, {});

  const handleSave = async () => {
    if (!form.description)          return toast.error('Description is required');
    if (!form.amount || +form.amount <= 0) return toast.error('Enter a valid amount');
    setSaving(true);
    try {
      await api.post('/expenses', { ...form, amount: +form.amount });
      toast.success('Expense recorded!');
      setModal(false); setForm(EMPTY_FORM); fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Deleted'); fetchExpenses();
    } catch { toast.error('Delete failed'); }
  };

  const closeModal = () => { setModal(false); setForm(EMPTY_FORM); };

  return (
    <div className="space-y-4 md:space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-xs md:text-sm text-gray-500">{expenses.length} records</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchExpenses}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <Button onClick={() => setModal(true)} className="text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────── */}
      {/* Mobile: 2-col grid for first two + full width for categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {/* Total Expenses */}
        <div className="card p-3 md:p-6">
          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
            </div>
            <p className="text-xs md:text-sm text-gray-500">Total</p>
          </div>
          <p className="text-lg md:text-2xl font-bold text-red-600 truncate">
            -${totalExpenses.toFixed(2)}
          </p>
        </div>

        {/* This Month */}
        <div className="card p-3 md:p-6">
          <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">This Month</p>
          <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">
            ${thisMonthTotal.toFixed(2)}
          </p>
        </div>

        {/* Top Categories — full width on mobile */}
        <div className="card p-3 md:p-6 col-span-2 md:col-span-1">
          <p className="text-xs md:text-sm text-gray-500 mb-2">Top Categories</p>
          <div className="space-y-1.5">
            {Object.entries(byCategory)
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([cat, amt]) => (
                <div key={cat} className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${CATEGORY_COLORS[cat]}`}>
                    {cat}
                  </span>
                  <span className="text-xs font-semibold text-gray-700">${amt.toFixed(2)}</span>
                </div>
              ))}
            {Object.values(byCategory).every(v => v === 0) && (
              <p className="text-xs text-gray-400">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop Table (md and above) ─────────────────────────────── */}
      <div className="hidden md:block card">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : expenses.length === 0 ? (
          <EmptyState
            message="No expenses recorded yet. Add your first expense!"
            action={<Button onClick={() => setModal(true)}><Plus className="w-4 h-4" /> Add Expense</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Date', 'Category', 'Description', 'Vendor', 'Amount', ''].map(h => (
                    <th key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.map(row => (
                  <tr key={row._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {row.date ? format(new Date(row.date), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_COLORS[row.category] || 'bg-gray-100 text-gray-600'}`}>
                        {row.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900">
                      {row.description}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{row.vendor || '—'}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-red-600">
                      -{row.currency} {(row.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={e => handleDelete(row._id, e)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
        ) : expenses.length === 0 ? (
          <EmptyState
            message="No expenses recorded yet."
            action={<Button onClick={() => setModal(true)}><Plus className="w-4 h-4" /> Add Expense</Button>}
          />
        ) : (
          <div className="space-y-3">
            {expenses.map(row => (
              <div key={row._id}
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">

                {/* Top: category badge + amount */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${CATEGORY_COLORS[row.category] || 'bg-gray-100 text-gray-600'}`}>
                    {row.category}
                  </span>
                  <span className="font-bold text-red-600 text-sm">
                    -{row.currency} {(row.amount || 0).toFixed(2)}
                  </span>
                </div>

                {/* Description */}
                <p className="font-semibold text-gray-900 text-sm mb-1 truncate">
                  {row.description}
                </p>

                {/* Vendor + date + delete */}
                <div className="flex items-center justify-between mt-2">
                  <div className="space-y-0.5">
                    {row.vendor && (
                      <p className="text-xs text-gray-500">{row.vendor}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {row.date ? format(new Date(row.date), 'MMM d, yyyy') : '—'}
                    </p>
                  </div>
                  <button onClick={e => handleDelete(row._id, e)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add Expense Modal ──────────────────────────────────────────── */}
      <Modal open={modal} onClose={closeModal} title="Add Expense" size="md">
        <div className="space-y-4">

          {/* Category + Date — stacked on mobile, side by side on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="input-field">
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <Input label="Date *" type="date" value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          </div>

          <Input label="Description *" value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="e.g. Adobe Creative Cloud subscription" />

          {/* Amount + Currency — side by side always */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <Input label="Amount *" type="number" min="0" step="0.01"
              value={form.amount} prefix="$"
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              placeholder="0.00" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select value={form.currency}
                onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                className="input-field">
                {['USD','EUR','GBP','INR','CAD','AUD'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <Input label="Vendor" value={form.vendor}
            onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))}
            placeholder="e.g. Adobe, AWS, Uber" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={2} value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="input-field resize-none w-full" placeholder="Optional notes..." />
          </div>

          {/* Buttons — full width on mobile */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={closeModal}
              className="w-full sm:w-auto justify-center">
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}
              className="w-full sm:w-auto justify-center">
              Save Expense
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}