import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

const EMPTY = { name: '', email: '', phone: '', currency: 'USD' };

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const r = await api.get('/customers?limit=100');
      setCustomers(r.data.data);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (!form.name) return toast.error('Name is required');
    setSaving(true);
    try {
      await api.post('/customers', form);
      toast.success('Customer added!');
      setModal(false); setForm(EMPTY); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete customer?')) return;
    try { await api.delete(`/customers/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  const columns = [
    { key: 'name', label: 'Name', render: v => <span className="font-semibold text-gray-900">{v}</span> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: v => v || '—' },
    { key: 'totalInvoiced', label: 'Invoiced', render: v => `$${(v||0).toFixed(2)}` },
    { key: 'totalOutstanding', label: 'Outstanding',
      render: v => <span className={v > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>${(v||0).toFixed(2)}</span> },
    { key: '_id', label: '',
      render: (id) => (
        <button onClick={e => handleDelete(id, e)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
      )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">{customers.length} total</p>
        </div>
        <Button onClick={() => setModal(true)}><Plus className="w-4 h-4" /> Add Customer</Button>
      </div>

      <div className="card">
        <Table columns={columns} data={customers} loading={loading} emptyMessage="No customers yet." />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Customer">
        <div className="space-y-4">
          <Input label="Name *" value={form.name} onChange={e => setForm(p=>({...p, name: e.target.value}))} placeholder="John Doe" />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(p=>({...p, email: e.target.value}))} placeholder="john@example.com" />
          <Input label="Phone" value={form.phone} onChange={e => setForm(p=>({...p, phone: e.target.value}))} placeholder="+1 234 567 8900" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Add Customer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}