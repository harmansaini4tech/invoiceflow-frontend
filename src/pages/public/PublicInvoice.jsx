import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Download, Zap, CheckCircle, Clock, AlertTriangle, CreditCard } from 'lucide-react'; // ✅ added CreditCard
import PaymentModal from './PaymentModal'; // ✅ added

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const STATUS_CONFIG = {
  paid:    { color: 'bg-green-100 text-green-700',  icon: CheckCircle,   label: 'Paid' },
  sent:    { color: 'bg-blue-100 text-blue-700',    icon: Clock,         label: 'Payment Due' },
  overdue: { color: 'bg-red-100 text-red-700',      icon: AlertTriangle, label: 'Overdue' },
  draft:   { color: 'bg-gray-100 text-gray-600',    icon: Clock,         label: 'Draft' },
};

export default function PublicInvoice() {
  const { token } = useParams();
  const [invoice,     setInvoice]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showPayment, setShowPayment] = useState(false); // ✅ added

  useEffect(() => {
    axios.get(`${BASE_URL}/public/invoice/${token}`)
      .then(r => setInvoice(r.data.data))
      .catch(err => setError(err.response?.data?.message || 'Invoice not found'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await axios.get(`${BASE_URL}/public/invoice/${token}/pdf`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${invoice.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading invoice...</p>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    </div>
  );

  const status     = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.sent;
  const StatusIcon = status.icon;
  const isPaid     = invoice.status === 'paid';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">
              {invoice.company?.name}
            </span>
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-2 px-4 rounded-lg transition-colors disabled:opacity-70">
            {downloading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-10 space-y-4 md:space-y-6">

        {/* ✅ Status Banner — Pay Now button added here */}
        <div className={`rounded-2xl p-4 md:p-5 flex items-center gap-4 ${
          isPaid ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-100 shadow-sm'
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isPaid ? 'bg-green-100' : 'bg-red-50'
          }`}>
            <StatusIcon className={`w-6 h-6 ${isPaid ? 'text-green-600' : 'text-red-500'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm md:text-base">
              {isPaid ? 'This invoice has been paid' : `Payment due by ${format(new Date(invoice.dueDate), 'MMMM d, yyyy')}`}
            </p>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              Invoice {invoice.invoiceNumber} · {invoice.currency} {invoice.total?.toFixed(2)}
            </p>
          </div>

          {/* ✅ Status badge + Pay Now button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${status.color}`}>
              {status.label}
            </span>
            {/* ✅ Pay Now button — only shows when not paid */}
            {!isPaid && (
              <button
                onClick={() => setShowPayment(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold
                  text-sm py-2 px-4 rounded-xl transition-colors
                  flex items-center gap-2 whitespace-nowrap">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Pay Now</span>
                <span className="sm:hidden">Pay</span>
              </button>
            )}
          </div>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-5 md:px-8 py-6 md:py-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                {invoice.company?.logo?.url && (
                  <img src={invoice.company.logo.url} alt={invoice.company.name}
                    className="h-10 w-auto object-contain mb-3 rounded" />
                )}
                <h2 className="text-white font-bold text-lg md:text-xl">
                  {invoice.company?.name}
                </h2>
                <p className="text-red-200 text-xs md:text-sm mt-0.5">
                  {invoice.company?.email}
                </p>
                {invoice.company?.phone && (
                  <p className="text-red-200 text-xs mt-0.5">{invoice.company.phone}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-red-200 text-xs uppercase tracking-wider mb-1">Invoice</p>
                <p className="text-white font-bold text-lg">{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-8 space-y-5 md:space-y-6">

            {/* From / Bill To */}
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">
                  From
                </p>
                <p className="font-bold text-gray-900 text-sm md:text-base">
                  {invoice.company?.name}
                </p>
                <p className="text-xs md:text-sm text-gray-500">{invoice.company?.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">
                  Bill To
                </p>
                <p className="font-bold text-gray-900 text-sm md:text-base">
                  {invoice.customer?.name}
                </p>
                <p className="text-xs md:text-sm text-gray-500">{invoice.customer?.email}</p>
                {invoice.customer?.phone && (
                  <p className="text-xs md:text-sm text-gray-500">{invoice.customer.phone}</p>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 bg-gray-50 rounded-xl p-3 md:p-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Invoice #</p>
                <p className="font-semibold text-gray-900 text-xs md:text-sm truncate">
                  {invoice.invoiceNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Issue Date</p>
                <p className="font-semibold text-gray-900 text-xs md:text-sm">
                  {format(new Date(invoice.issueDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Due Date</p>
                <p className={`font-semibold text-xs md:text-sm ${
                  invoice.status === 'overdue' ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Line Items — desktop table / mobile cards */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Items
              </p>

              {/* Desktop */}
              <div className="hidden md:block rounded-xl overflow-hidden border border-gray-100">
                <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Rate</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>
                {invoice.lineItems?.map((item, i) => (
                  <div key={i}
                    className={`grid grid-cols-12 px-4 py-3 border-t border-gray-50 text-sm ${
                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}>
                    <div className="col-span-6 text-gray-700">{item.description}</div>
                    <div className="col-span-2 text-right text-gray-600">{item.quantity}</div>
                    <div className="col-span-2 text-right text-gray-600">
                      {invoice.currency} {item.rate?.toFixed(2)}
                    </div>
                    <div className="col-span-2 text-right font-semibold">
                      {invoice.currency} {item.amount?.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile */}
              <div className="md:hidden space-y-2">
                {invoice.lineItems?.map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium text-gray-900 flex-1 pr-2">
                        {item.description}
                      </p>
                      <p className="text-sm font-bold flex-shrink-0">
                        {invoice.currency} {item.amount?.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {item.quantity} × {invoice.currency} {item.rate?.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full md:w-72 space-y-2 bg-gray-50 rounded-xl p-3 md:p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">
                    {invoice.currency} {invoice.subtotal?.toFixed(2)}
                  </span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-green-600 font-medium">
                      -{invoice.currency} {invoice.discountAmount?.toFixed(2)}
                    </span>
                  </div>
                )}
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax ({invoice.taxRate}%)</span>
                    <span className="font-medium">
                      {invoice.currency} {invoice.taxAmount?.toFixed(2)}
                    </span>
                  </div>
                )}
                {invoice.shippingCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-medium">
                      {invoice.currency} {invoice.shippingCharge?.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Due</span>
                  <span className="font-bold text-xl md:text-2xl text-red-600">
                    {invoice.currency} {invoice.total?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {(invoice.notes || invoice.terms) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                {invoice.notes && (
                  <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Terms</p>
                    <p className="text-sm text-gray-700">{invoice.terms}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          Powered by{' '}
          <span className="font-semibold text-red-500">InvoiceFlow</span>
          {' '}· Secure invoice sharing
        </p>
      </div>

      {/* ✅ Payment Modal — outside main content div, inside root div */}
      {showPayment && (
        <PaymentModal
          invoice={invoice}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            // Refresh invoice data
            axios.get(`${BASE_URL}/public/invoice/${token}`)
              .then(r => setInvoice(r.data.data));
          }}
        />
      )}

    </div>
  );
}