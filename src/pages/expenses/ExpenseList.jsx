import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Plus, RefreshCw, TrendingDown, Lock, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['travel','food','utilities','software','hardware','marketing','salary','other'];

const EMPTY_FORM = {
  category: 'software',
  description: '',
  amount: '',
  currency: 'USD',
  date: new Date().toISOString().split('T')[0],
  vendor: '',
  notes: '',
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

// ─── Upgrade Wall Component ───────────────────────────────────────────────────
function UpgradeWall({ currentPlan }) {
  const navigate = useNavigate();

  const PLAN_FEATURES = {
    pro: ['Unlimited invoices', 'Expense tracking', 'Custom branding', 'Recurring invoices', '5 team members', 'Priority support'],
    business: ['Everything in Pro', 'Unlimited team members', 'API access', 'White-label', 'Dedicated support'],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <p className="text-sm text-gray-500">Track your business spending</p>
      </div>

      {/* Lock Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-8 text-white text-center">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Upgrade to Access Expenses</h2>
        <p className="text-red-100 mb-1">
          You're on the <span className="font-bold uppercase text-white">{currentPlan}</span> plan.
        </p>
        <p className="text-red-100 text-sm mb-6">
          Expense tracking is available on Pro and Business plans.
        </p>
        <button
          onClick={() => navigate('/billing')}
          className="inline-flex items-center gap-2 bg-white text-red-600 font-bold py-3 px-8 rounded-xl hover:bg-red-50 transition-colors shadow-lg">
          <Zap className="w-5 h-5" />
          Upgrade Now
        </button>
      </div>

      {/* Plan Cards */}
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

// ─── Main Expense List ────────────────────────────────────────────────────────
export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [planState, setPlanState] = useState({ blocked: false, currentPlan: 'free' });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/expenses?limit=50');
      setExpenses(r.data.data);
      setPlanState({ blocked: false, currentPlan: 'business' });
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.code === 'PLAN_UPGRADE_REQUIRED') {
        setPlanState({
          blocked: true,
          currentPlan: err.response.data.currentPlan || 'free',
        });
      } else {
        toast.error('Failed to load expenses');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const thisMonthTotal = expenses
    .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
    .reduce((s, e) => s + e.amount, 0);

  const byCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
    return acc;
  }, {});

  const handleSave = async () => {
    if (!form.description) return toast.error('Description is required');
    if (!form.amount || +form.amount <= 0) return toast.error('Enter a valid amount');
    setSaving(true);
    try {
      await api.post('/expenses', { ...form, amount: +form.amount });
      toast.success('Expense recorded!');
      setModal(false);
      setForm(EMPTY_FORM);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Deleted');
      fetchExpenses();
    } catch { toast.error('Delete failed'); }
  };

  // Show upgrade wall for non-pro users
  if (!loading && planState.blocked) {
    return <UpgradeWall currentPlan={planState.currentPlan} />;
  }

  const columns = [
    { key: 'date', label: 'Date',
      render: v => v ? format(new Date(v), 'MMM d, yyyy') : '—' },
    { key: 'category', label: 'Category',
      render: v => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_COLORS[v] || 'bg-gray-100 text-gray-600'}`}>
          {v}
        </span>
      )},
    { key: 'description', label: 'Description',
      render: v => <span className="font-medium text-gray-900">{v}</span> },
    { key: 'vendor', label: 'Vendor', render: v => v || '—' },
    { key: 'amount', label: 'Amount',
      render: (v, row) => (
        <span className="font-semibold text-red-600">
          -{row.currency} {(v || 0).toFixed(2)}
        </span>
      )},
    { key: '_id', label: '',
      render: id => (
        <button onClick={e => handleDelete(id, e)}
          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )},
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500">{expenses.length} records</p>
        </div>
        <Button onClick={() => setModal(true)}>
          <Plus className="w-4 h-4" /> Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-sm text-gray-500">Total Expenses</p>
          </div>
          <p className="text-2xl font-bold text-red-600">-${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">This Month</p>
          <p className="text-2xl font-bold text-gray-900">${thisMonthTotal.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-2">Top Categories</p>
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

      {/* Table */}
      <div className="card">
        <div className="flex justify-end mb-4">
          <button onClick={fetchExpenses} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <Table
          columns={columns}
          data={expenses}
          loading={loading}
          emptyMessage="No expenses recorded yet. Add your first expense!"
        />
      </div>

      {/* Add Modal */}
      <Modal open={modal} onClose={() => { setModal(false); setForm(EMPTY_FORM); }}
        title="Add Expense" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
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
              className="input-field resize-none" placeholder="Optional notes..." />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => { setModal(false); setForm(EMPTY_FORM); }}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save Expense
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}