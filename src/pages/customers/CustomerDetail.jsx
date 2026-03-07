import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  ArrowLeft, Mail, Phone, Plus, FileText,
  TrendingUp, Clock, CheckCircle, Edit2, Save, X
} from 'lucide-react';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer]   = useState(null);
  const [invoices, setInvoices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(false);
  const [editForm, setEditForm]   = useState({});
  const [saving, setSaving]       = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [custRes, invRes] = await Promise.all([
        api.get(`/customers/${id}`),
        api.get(`/invoices?customer=${id}&limit=100`),
      ]);
      setCustomer(custRes.data.data);
      setEditForm(custRes.data.data);
      setInvoices(invRes.data.data);
    } catch {
      toast.error('Failed to load customer');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleSave = async () => {
    if (!editForm.name) return toast.error('Name is required');
    setSaving(true);
    try {
      await api.patch(`/customers/${id}`, editForm);
      toast.success('Customer updated!');
      setEditing(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  );
  if (!customer) return null;

  // ── Stats ──────────────────────────────────────────────────────────────
  const totalInvoiced    = invoices.reduce((s, i) => s + (i.total || 0), 0);
  const totalPaid        = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0);
  const totalOutstanding = totalInvoiced - totalPaid;
  const overdueCount     = invoices.filter(i =>
    i.status !== 'paid' && new Date(i.dueDate) < new Date()
  ).length;

  const stats = [
    { label: 'Total Invoiced',  value: `$${totalInvoiced.toFixed(2)}`,    icon: TrendingUp,   color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Paid',      value: `$${totalPaid.toFixed(2)}`,         icon: CheckCircle,  color: 'bg-green-50 text-green-600' },
    { label: 'Outstanding',     value: `$${totalOutstanding.toFixed(2)}`,  icon: Clock,        color: 'bg-red-50 text-red-600' },
    { label: 'Invoices',        value: invoices.length,                    icon: FileText,     color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/customers')}
            className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
              {customer.name}
            </h1>
            <p className="text-xs md:text-sm text-gray-500">Customer Profile</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="secondary"
            onClick={() => setEditing(true)}
            className="text-sm">
            <Edit2 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            onClick={() => navigate(`/invoices/create?customer=${id}`)}
            className="text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Invoice</span>
            <span className="sm:hidden">Invoice</span>
          </Button>
        </div>
      </div>

      {/* ── Profile Card ───────────────────────────────────────────────── */}
      <div className="card p-4 md:p-6">
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
          {/* Avatar */}
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <span className="text-red-600 font-bold text-xl md:text-2xl">
              {customer.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 text-base md:text-lg truncate">
              {customer.name}
            </h2>
            {customer.email && (
              <div className="flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-xs md:text-sm text-gray-500 truncate">
                  {customer.email}
                </span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-xs md:text-sm text-gray-500">
                  {customer.phone}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Currency */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Default Currency</span>
          <span className="font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg text-xs">
            {customer.currency || 'USD'}
          </span>
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-3 md:p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
              <p className="font-bold text-gray-900 text-sm md:text-base truncate">
                {s.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Invoices List ──────────────────────────────────────────────── */}
      <div className="card p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Invoice History</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
            {invoices.length} total
          </span>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm mb-3">No invoices yet</p>
            <Button onClick={() => navigate(`/invoices/create?customer=${id}`)}>
              <Plus className="w-4 h-4" /> Create First Invoice
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Invoice #', 'Date', 'Due', 'Amount', 'Status'].map(h => (
                      <th key={h}
                        className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.map(inv => (
                    <tr key={inv._id}
                      onClick={() => navigate(`/invoices/${inv._id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-3 py-3 text-sm font-semibold text-red-600">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {format(new Date(inv.issueDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {format(new Date(inv.dueDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold">
                        ${(inv.total || 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-3">
                        <Badge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {invoices.map(inv => (
                <div key={inv._id}
                  onClick={() => navigate(`/invoices/${inv._id}`)}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="min-w-0">
                    <p className="font-semibold text-red-600 text-sm">
                      {inv.invoiceNumber}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Due {format(new Date(inv.dueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        ${(inv.total || 0).toFixed(2)}
                      </p>
                    </div>
                    <Badge status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Edit Customer Modal ────────────────────────────────────────── */}
      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Customer">
        <div className="space-y-4">
          <Input label="Name *" value={editForm.name || ''}
            onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
            placeholder="John Doe" />
          <Input label="Email" type="email" value={editForm.email || ''}
            onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
            placeholder="john@example.com" />
          <Input label="Phone" value={editForm.phone || ''}
            onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
            placeholder="+91 98765 43210" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select value={editForm.currency || 'USD'}
              onChange={e => setEditForm(p => ({ ...p, currency: e.target.value }))}
              className="input-field">
              {['USD','EUR','GBP','INR','CAD','AUD'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setEditing(false)}
              className="w-full sm:w-auto justify-center">
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}
              className="w-full sm:w-auto justify-center">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}