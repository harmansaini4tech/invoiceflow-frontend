import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import {
  Plus, RefreshCw, Download, Trash2,
  Copy, CheckCircle, ChevronRight, Filter
} from 'lucide-react';
import { format } from 'date-fns';

const FILTERS = ['all', 'draft', 'sent', 'paid', 'overdue'];

export default function InvoiceList() {
  const [invoices, setInvoices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');
  const [showFilters, setShowFilters] = useState(false);
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

  return (
    <div className="space-y-4 md:space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-xs md:text-sm text-gray-500">{invoices.length} total invoices</p>
        </div>
        <Button onClick={() => navigate('/invoices/create')} className="text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Invoice</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* ── Card ───────────────────────────────────────────────────────── */}
      <div className="card p-4 md:p-6">

        {/* ── Filters + Search ─────────────────────────────────────────── */}
        <div className="space-y-3 mb-4 md:mb-6">

          {/* Top row: search + refresh + mobile filter toggle */}
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by invoice #..."
              className="input-field flex-1 min-w-0"
            />
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(p => !p)}
              className={`md:hidden p-2.5 rounded-lg border transition-colors flex-shrink-0 ${
                showFilters || filter !== 'all'
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}>
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={fetchInvoices}
              className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 border border-gray-200">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Filter pills — always visible on desktop, toggle on mobile */}
          <div className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-wrap items-center gap-1 bg-gray-100 rounded-xl p-1`}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setShowFilters(false); }}
                className={`flex-1 min-w-0 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Desktop Table (md and above) ─────────────────────────────── */}
        <div className="hidden md:block">
          {loading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : invoices.length === 0 ? (
            <EmptyState
              message="No invoices yet. Create your first invoice!"
              action={
                <Button onClick={() => navigate('/invoices/create')}>
                  <Plus className="w-4 h-4" /> New Invoice
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Invoice #', 'Customer', 'Date', 'Due', 'Amount', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.map(row => (
                    <tr key={row._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/invoices/${row._id}`)}>
                      <td className="px-4 py-3.5 text-sm">
                        <span className="font-semibold text-red-600">{row.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">
                        {row.customer?.name || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">
                        {row.issueDate ? format(new Date(row.issueDate), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">
                        {row.dueDate ? format(new Date(row.dueDate), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-sm">
                        <span className="font-semibold">${row.total?.toFixed(2) || '0.00'}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm">
                        <Badge status={row.status} />
                      </td>
                      <td className="px-4 py-3.5 text-sm">
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={e => handleDownloadPDF(row._id, row.invoiceNumber, e)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
                            title="Download PDF">
                            <Download className="w-4 h-4" />
                          </button>
                          {row.status !== 'paid' && (
                            <button onClick={e => handleMarkPaid(row._id, e)}
                              className="p-1.5 hover:bg-green-50 rounded-lg text-gray-500 hover:text-green-600"
                              title="Mark Paid">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={e => handleDuplicate(row._id, e)}
                            className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-500 hover:text-blue-600"
                            title="Duplicate">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button onClick={e => handleDelete(row._id, e)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600"
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
          ) : invoices.length === 0 ? (
            <EmptyState
              message="No invoices yet. Create your first invoice!"
              action={
                <Button onClick={() => navigate('/invoices/create')}>
                  <Plus className="w-4 h-4" /> New Invoice
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {invoices.map(row => (
                <div key={row._id}
                  className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-red-50 transition-colors"
                  onClick={() => navigate(`/invoices/${row._id}`)}>

                  {/* Top row: invoice # + amount */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-red-600 text-sm">{row.invoiceNumber}</span>
                    <span className="font-bold text-gray-900">${row.total?.toFixed(2)}</span>
                  </div>

                  {/* Middle row: customer + status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600 truncate max-w-[180px]">
                      {row.customer?.name || '—'}
                    </span>
                    <Badge status={row.status} />
                  </div>

                  {/* Bottom row: due date + actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Due: {row.dueDate ? format(new Date(row.dueDate), 'MMM d, yyyy') : '—'}
                    </span>
                    {/* Quick actions */}
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => handleDownloadPDF(row._id, row.invoiceNumber, e)}
                        className="p-1.5 bg-white rounded-lg text-gray-500 hover:text-gray-700 shadow-sm">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {row.status !== 'paid' && (
                        <button
                          onClick={e => handleMarkPaid(row._id, e)}
                          className="p-1.5 bg-white rounded-lg text-gray-500 hover:text-green-600 shadow-sm">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={e => handleDelete(row._id, e)}
                        className="p-1.5 bg-white rounded-lg text-gray-500 hover:text-red-600 shadow-sm">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-300 ml-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}