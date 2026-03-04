import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { Plus, RefreshCw, Download, Send, Trash2, Copy, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;
      const res = await api.get('/invoices', { params });
      setInvoices(res.data.data);
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await api.delete(`/invoices/${id}`);
      toast.success('Invoice deleted');
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleMarkPaid = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/invoices/${id}/mark-paid`);
      toast.success('Marked as paid');
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      await api.post(`/invoices/${id}/duplicate`);
      toast.success('Invoice duplicated');
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDownloadPDF = async (id, num, e) => {
    e.stopPropagation();
    try {
      const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `Invoice-${num}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('PDF generation failed');
    }
  };

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #',
      render: (val) => <span className="font-semibold text-red-600">{val}</span> },
    { key: 'customer', label: 'Customer',
      render: (val) => val?.name || '—' },
    { key: 'issueDate', label: 'Date',
      render: (val) => val ? format(new Date(val), 'MMM d, yyyy') : '—' },
    { key: 'dueDate', label: 'Due',
      render: (val) => val ? format(new Date(val), 'MMM d, yyyy') : '—' },
    { key: 'total', label: 'Amount',
      render: (val) => <span className="font-semibold">${val?.toFixed(2) || '0.00'}</span> },
    { key: 'status', label: 'Status',
      render: (val) => <Badge status={val} /> },
    { key: '_id', label: 'Actions',
      render: (id, row) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={(e) => handleDownloadPDF(id, row.invoiceNumber, e)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700" title="Download PDF">
            <Download className="w-4 h-4" />
          </button>
          {row.status !== 'paid' && (
            <button onClick={(e) => handleMarkPaid(id, e)}
              className="p-1.5 hover:bg-green-50 rounded-lg text-gray-500 hover:text-green-600" title="Mark Paid">
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button onClick={(e) => handleDuplicate(id, e)}
            className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-500 hover:text-blue-600" title="Duplicate">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={(e) => handleDelete(id, e)}
            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )},
  ];

  const FILTERS = ['all','draft','sent','paid','overdue'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500">{invoices.length} total invoices</p>
        </div>
        <Button onClick={() => navigate('/invoices/create')}>
          <Plus className="w-4 h-4" /> New Invoice
        </Button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {FILTERS.map(f => (
              <button key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === f ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>{f}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by invoice #..." className="input-field w-56" />
            <button onClick={fetchInvoices} className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={invoices}
          loading={loading}
          emptyMessage="No invoices yet. Create your first invoice!"
          onRowClick={(row) => navigate(`/invoices/${row._id}`)}
        />
      </div>
    </div>
  );
}