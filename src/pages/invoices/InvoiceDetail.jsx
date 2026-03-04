import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Send, CheckCircle, Copy, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    api.get(`/invoices/${id}`)
      .then(r => setInvoice(r.data.data))
      .catch(() => toast.error('Invoice not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (action) => {
    setActionLoading(action);
    try {
      if (action === 'send') {
        await api.post(`/invoices/${id}/send`);
        toast.success('Invoice sent!');
      } else if (action === 'paid') {
        await api.patch(`/invoices/${id}/mark-paid`);
        toast.success('Marked as paid!');
      } else if (action === 'pdf') {
        const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
        const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        const a = document.createElement('a');
        a.href = url; a.download = `Invoice-${invoice.invoiceNumber}.pdf`; a.click();
        URL.revokeObjectURL(url);
      } else if (action === 'delete') {
        if (!window.confirm('Delete this invoice?')) return;
        await api.delete(`/invoices/${id}`);
        toast.success('Deleted');
        navigate('/invoices');
        return;
      }
      // Refresh
      const r = await api.get(`/invoices/${id}`);
      setInvoice(r.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!invoice) return <div className="text-center py-24 text-gray-500">Invoice not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/invoices')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
              <Badge status={invoice.status} />
            </div>
            <p className="text-sm text-gray-500">
              Due {format(new Date(invoice.dueDate), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => handleAction('pdf')} loading={actionLoading === 'pdf'}>
            <Download className="w-4 h-4" /> PDF
          </Button>
          {invoice.status !== 'paid' && (
            <>
              <Button variant="secondary" onClick={() => handleAction('send')} loading={actionLoading === 'send'}>
                <Send className="w-4 h-4" /> Send
              </Button>
              <Button onClick={() => handleAction('paid')} loading={actionLoading === 'paid'}>
                <CheckCircle className="w-4 h-4" /> Mark Paid
              </Button>
            </>
          )}
          <Button variant="danger" onClick={() => handleAction('delete')} loading={actionLoading === 'delete'}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="card space-y-6">
        {/* From / To */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase mb-2">From</p>
            <p className="font-bold text-gray-900">{invoice.company?.name}</p>
            <p className="text-sm text-gray-500">{invoice.company?.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase mb-2">Bill To</p>
            <p className="font-bold text-gray-900">{invoice.customer?.name}</p>
            <p className="text-sm text-gray-500">{invoice.customer?.email}</p>
          </div>
        </div>

        {/* Line Items */}
        <div className="rounded-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>
          {invoice.lineItems?.map((item, i) => (
            <div key={i} className="grid grid-cols-12 px-4 py-3 border-t border-gray-50">
              <div className="col-span-6 text-sm text-gray-700">{item.description}</div>
              <div className="col-span-2 text-sm text-right text-gray-600">{item.quantity}</div>
              <div className="col-span-2 text-sm text-right text-gray-600">${item.rate?.toFixed(2)}</div>
              <div className="col-span-2 text-sm font-semibold text-right">${item.amount?.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>${invoice.subtotal?.toFixed(2)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600">-${invoice.discountAmount?.toFixed(2)}</span>
              </div>
            )}
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax ({invoice.taxRate}%)</span>
                <span>${invoice.taxAmount?.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-red-600">${invoice.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p>
            <p className="text-sm text-gray-700">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}