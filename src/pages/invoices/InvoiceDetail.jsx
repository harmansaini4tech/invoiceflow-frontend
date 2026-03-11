import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Download,
  Send,
  CheckCircle,
  Trash2,
  MoreVertical,
  X,
  Link2,
  DollarSign, // ✅ added DollarSign
} from "lucide-react";
import { format } from "date-fns";

const WhatsAppIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// ✅ RecordPaymentModal component
function RecordPaymentModal({ invoice, onClose, onSave }) {
  const [form, setForm] = useState({
    amount: invoice.balanceDue || invoice.total || "",
    method: "manual",
    reference: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.amount || form.amount <= 0)
      return toast.error("Enter a valid amount");
    setSaving(true);
    try {
      await api.post("/payments/record", {
        invoiceId: invoice._id,
        ...form,
        amount: parseFloat(form.amount),
      });
      toast.success("Payment recorded!");
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  const methods = [
    { id: "manual", label: "Manual" },
    { id: "bank", label: "Bank Transfer" },
    { id: "cash", label: "Cash" },
    { id: "upi", label: "UPI" },
    { id: "other", label: "Other" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Record Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 flex justify-between">
            <span className="text-sm text-gray-500">Balance Due</span>
            <span className="font-bold text-red-600">
              {invoice.currency}{" "}
              {(invoice.balanceDue || invoice.total || 0).toFixed(2)}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) =>
                setForm((p) => ({ ...p, amount: e.target.value }))
              }
              className="input-field w-full"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, method: m.id }))}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                    form.method === m.id
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference / Transaction ID
            </label>
            <input
              value={form.reference}
              onChange={(e) =>
                setForm((p) => ({ ...p, reference: e.target.value }))
              }
              className="input-field w-full"
              placeholder="TXN123456 (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              rows={2}
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              className="input-field w-full resize-none"
              placeholder="Optional note..."
            />
          </div>
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <Button
              onClick={handleSave}
              loading={saving}
              className="flex-1 justify-center"
            >
              Record Payment
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1 justify-center"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false); // ✅ added
  const [payments, setPayments] = useState([]); // ✅ added

  useEffect(() => {
    api
      .get(`/invoices/${id}`)
      .then((r) => setInvoice(r.data.data))
      .catch(() => toast.error("Invoice not found"))
      .finally(() => setLoading(false));
  }, [id]);

  // ✅ Fetch payment history when invoice loads
  useEffect(() => {
    if (invoice) {
      api
        .get(`/payments/${invoice._id}/history`)
        .then((r) => setPayments(r.data.data.payments || []))
        .catch(() => {});
    }
  }, [invoice]);

  const refreshInvoice = async () => {
    const r = await api.get(`/invoices/${id}`);
    setInvoice(r.data.data);
    const p = await api.get(`/payments/${id}/history`);
    setPayments(p.data.data.payments || []);
  };

  const handleAction = async (action) => {
    setShowMobileActions(false);
    setActionLoading(action);
    try {
      if (action === "send") {
        await api.post(`/invoices/${id}/send`);
        toast.success("Invoice sent via email!");
      } else if (action === "paid") {
        await api.patch(`/invoices/${id}/mark-paid`);
        toast.success("Marked as paid!");
      } else if (action === "pdf") {
        const res = await api.get(`/invoices/${id}/pdf`, {
          responseType: "blob",
        });
        const url = URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" })
        );
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice-${invoice.invoiceNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("PDF downloaded!");
      } else if (action === "delete") {
        if (!window.confirm("Delete this invoice?")) return;
        await api.delete(`/invoices/${id}`);
        toast.success("Invoice deleted");
        navigate("/invoices");
        return;
      }
      await refreshInvoice();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleWhatsApp = async () => {
    setShowMobileActions(false);
    setActionLoading("whatsapp");
    try {
      const res = await api.get(`/invoices/${id}/pdf`, {
        responseType: "blob",
      });
      const pdfBlob = new Blob([res.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const customerName = invoice.customer?.name || "Customer";
      const customerPhone = invoice.customer?.phone || "";
      const companyName = invoice.company?.name || "Us";
      const dueDate = format(new Date(invoice.dueDate), "MMMM d, yyyy");
      const issueDate = format(new Date(invoice.issueDate), "MMMM d, yyyy");
      const message = `Hello ${customerName}! 👋\n\n*Invoice from ${companyName}*\n━━━━━━━━━━━━━━━━━━\n📄 *Invoice #:* ${
        invoice.invoiceNumber
      }\n📅 *Issue Date:* ${issueDate}\n⏰ *Due Date:* ${dueDate}\n💰 *Amount Due:* ${
        invoice.currency
      } ${invoice.total?.toFixed(
        2
      )}\n📌 *Status:* ${invoice.status?.toUpperCase()}\n━━━━━━━━━━━━━━━━━━\n\n${invoice.lineItems
        ?.map(
          (item) =>
            `• ${item.description} × ${item.quantity} = ${
              invoice.currency
            } ${item.amount?.toFixed(2)}`
        )
        .join("\n")}\n\n━━━━━━━━━━━━━━━━━━\n${
        invoice.subtotal !== invoice.total
          ? `Subtotal: ${invoice.currency} ${invoice.subtotal?.toFixed(2)}\n`
          : ""
      }${
        invoice.taxAmount > 0
          ? `Tax (${invoice.taxRate}%): ${
              invoice.currency
            } ${invoice.taxAmount?.toFixed(2)}\n`
          : ""
      }${
        invoice.discountAmount > 0
          ? `Discount: -${invoice.currency} ${invoice.discountAmount?.toFixed(
              2
            )}\n`
          : ""
      }*Total Due: ${invoice.currency} ${invoice.total?.toFixed(2)}*\n\n${
        invoice.notes ? `📝 *Note:* ${invoice.notes}\n` : ""
      }Please find the attached PDF invoice and make payment by the due date.\n\nThank you for your business! 🙏\n_Powered by InvoiceFlow_`;
      const encodedMessage = encodeURIComponent(message);
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = `Invoice-${invoice.invoiceNumber}.pdf`;
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
        if (customerPhone) {
          const cleanPhone = customerPhone.replace(/\D/g, "");
          window.open(
            `https://wa.me/${cleanPhone}?text=${encodedMessage}`,
            "_blank"
          );
        } else {
          window.open(
            `https://web.whatsapp.com/send?text=${encodedMessage}`,
            "_blank"
          );
          toast("💡 Tip: Add customer phone number to send directly!", {
            duration: 4000,
            icon: "📱",
          });
        }
      }, 800);
      toast.success("PDF saved! Attach it in WhatsApp chat 📎");
    } catch {
      toast.error("WhatsApp share failed. Try downloading PDF manually.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  if (!invoice)
    return (
      <div className="text-center py-24 text-gray-500">Invoice not found.</div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/invoices")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-2xl font-bold truncate">
                {invoice.invoiceNumber}
              </h1>
              <Badge status={invoice.status} />
            </div>
            <p className="text-xs md:text-sm text-gray-500">
              Due {format(new Date(invoice.dueDate), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end max-w-2xl">
          <button
            onClick={() => {
              const link = `${window.location.origin}/invoice/view/${invoice.publicToken}`;
              navigator.clipboard.writeText(link);
              toast.success("Public link copied! 🔗");
            }}
            className="inline-flex items-center gap-1.5 font-semibold py-2 px-3 rounded-lg transition-all text-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            <Link2 className="w-4 h-4" />
            <span className="hidden lg:inline">Copy Link</span>
          </button>

          <button
            onClick={() => handleAction("pdf")}
            disabled={actionLoading === "pdf"}
            className="inline-flex items-center gap-1.5 font-semibold py-2 px-3 rounded-lg transition-all text-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 disabled:opacity-50"
          >
            {actionLoading === "pdf" ? (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden lg:inline">PDF</span>
          </button>

          <button
            onClick={handleWhatsApp}
            disabled={actionLoading === "whatsapp"}
            className="inline-flex items-center gap-1.5 font-semibold py-2 px-3 rounded-lg transition-all text-sm disabled:opacity-50 bg-green-500 hover:bg-green-600 text-white shadow-sm"
          >
            {actionLoading === "whatsapp" ? (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <WhatsAppIcon />
            )}
            <span className="hidden lg:inline">WhatsApp</span>
          </button>

          {invoice.status !== "paid" && (
            <button
              onClick={() => handleAction("send")}
              disabled={actionLoading === "send"}
              className="inline-flex items-center gap-1.5 font-semibold py-2 px-3 rounded-lg transition-all text-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 disabled:opacity-50"
            >
              {actionLoading === "send" ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden lg:inline">Email</span>
            </button>
          )}

          {invoice.status !== "paid" && (
            <button
              onClick={() => setShowRecordPayment(true)}
              className="inline-flex items-center gap-1.5 font-semibold py-2 px-3 rounded-lg transition-all text-sm bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden lg:inline">Record</span>
            </button>
          )}

          {invoice.status !== "paid" && (
            <button
              onClick={() => handleAction("paid")}
              disabled={actionLoading === "paid"}
              className="inline-flex items-center gap-1.5 font-semibold py-2 px-3 rounded-lg transition-all text-sm bg-red-600 hover:bg-red-700 text-white shadow-sm disabled:opacity-50"
            >
              {actionLoading === "paid" ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span className="hidden lg:inline">Mark Paid</span>
            </button>
          )}

          <button
            onClick={() => handleAction("delete")}
            disabled={actionLoading === "delete"}
            className="inline-flex items-center gap-1.5 font-semibold py-2 px-3 rounded-lg transition-all text-sm bg-white border border-red-200 hover:bg-red-50 text-red-500 disabled:opacity-50"
          >
            {actionLoading === "delete" ? (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Mobile trigger */}
        <button
          onClick={() => setShowMobileActions(true)}
          className="md:hidden flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* ── Mobile Bottom Sheet ───────────────────────────────────────── */}
      {showMobileActions && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowMobileActions(false)}
          />
          <div className="md:hidden fixed bottom-0 inset-x-0 bg-white rounded-t-2xl z-50 p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-gray-900">Invoice Actions</p>
              <button
                onClick={() => setShowMobileActions(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const link = `${window.location.origin}/invoice/view/${invoice.publicToken}`;
                  navigator.clipboard.writeText(link);
                  toast.success("Public link copied! 🔗");
                  setShowMobileActions(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Link2 className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    Copy Public Link
                  </p>
                  <p className="text-xs text-gray-500">
                    Share invoice with customer
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleAction("pdf")}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    Download PDF
                  </p>
                  <p className="text-xs text-gray-500">Save invoice as PDF</p>
                </div>
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <WhatsAppIcon />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    Share via WhatsApp
                  </p>
                  <p className="text-xs text-gray-500">
                    Send invoice details on WhatsApp
                  </p>
                </div>
              </button>

              {invoice.status !== "paid" && (
                <button
                  onClick={() => handleAction("send")}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Send className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      Send via Email
                    </p>
                    <p className="text-xs text-gray-500">
                      Email invoice to customer
                    </p>
                  </div>
                </button>
              )}

              {/* ✅ Record Payment — mobile sheet */}
              {invoice.status !== "paid" && (
                <button
                  onClick={() => {
                    setShowMobileActions(false);
                    setShowRecordPayment(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      Record Payment
                    </p>
                    <p className="text-xs text-gray-500">
                      Record partial or full payment
                    </p>
                  </div>
                </button>
              )}

              {invoice.status !== "paid" && (
                <button
                  onClick={() => handleAction("paid")}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      Mark as Paid
                    </p>
                    <p className="text-xs text-gray-500">
                      Record full payment received
                    </p>
                  </div>
                </button>
              )}

              <button
                onClick={() => handleAction("delete")}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-red-600">
                    Delete Invoice
                  </p>
                  <p className="text-xs text-gray-500">This cannot be undone</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Invoice Card ───────────────────────────────────────────────── */}
      <div className="card p-4 md:p-6 space-y-5 md:space-y-6">
        <div className="grid grid-cols-2 gap-4 md:gap-8">
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1 md:mb-2">
              From
            </p>
            <p className="font-bold text-gray-900 text-sm md:text-lg truncate">
              {invoice.company?.name}
            </p>
            <p className="text-xs md:text-sm text-gray-500 truncate">
              {invoice.company?.email}
            </p>
            {invoice.company?.phone && (
              <p className="text-xs md:text-sm text-gray-500">
                {invoice.company.phone}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1 md:mb-2">
              Bill To
            </p>
            <p className="font-bold text-gray-900 text-sm md:text-lg truncate">
              {invoice.customer?.name}
            </p>
            <p className="text-xs md:text-sm text-gray-500 truncate">
              {invoice.customer?.email}
            </p>
            {invoice.customer?.phone && (
              <p className="text-xs md:text-sm text-gray-500">
                {invoice.customer.phone}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4 bg-gray-50 rounded-xl p-3 md:p-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5 md:mb-1">Invoice #</p>
            <p className="font-semibold text-gray-900 text-xs md:text-sm truncate">
              {invoice.invoiceNumber}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5 md:mb-1">Issue Date</p>
            <p className="font-semibold text-gray-900 text-xs md:text-sm">
              {format(new Date(invoice.issueDate), "MMM d, yyyy")}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5 md:mb-1">Due Date</p>
            <p className="font-semibold text-gray-900 text-xs md:text-sm">
              {format(new Date(invoice.dueDate), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        {/* Desktop line items */}
        <div className="hidden md:block rounded-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>
          {invoice.lineItems?.map((item, i) => (
            <div
              key={i}
              className={`grid grid-cols-12 px-4 py-3 border-t border-gray-50 ${
                i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
              }`}
            >
              <div className="col-span-6 text-sm text-gray-700">
                {item.description}
              </div>
              <div className="col-span-2 text-sm text-right text-gray-600">
                {item.quantity}
              </div>
              <div className="col-span-2 text-sm text-right text-gray-600">
                {invoice.currency} {item.rate?.toFixed(2)}
              </div>
              <div className="col-span-2 text-sm font-semibold text-right">
                {invoice.currency} {item.amount?.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile line items */}
        <div className="md:hidden space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Line Items
          </p>
          {invoice.lineItems?.map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3">
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-medium text-gray-900 flex-1 pr-2">
                  {item.description}
                </p>
                <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                  {invoice.currency} {item.amount?.toFixed(2)}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                {item.quantity} × {invoice.currency} {item.rate?.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full md:w-72 space-y-2 bg-gray-50 md:bg-transparent rounded-xl p-3 md:p-0">
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
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Total Due</span>
                <span className="font-bold text-xl md:text-2xl text-red-600">
                  {invoice.currency} {invoice.total?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 pt-2 border-t border-gray-100">
            {invoice.notes && (
              <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Notes
                </p>
                <p className="text-sm text-gray-700">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Terms
                </p>
                <p className="text-sm text-gray-700">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ Payment History Card */}
      {payments.length > 0 && (
        <div className="card p-4 md:p-6">
          <h3 className="font-bold text-gray-900 mb-4">Payment History</h3>
          <div className="space-y-2">
            {payments.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 capitalize">
                      {p.method} Payment
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(p.paidAt), "MMM d, yyyy")}
                      {p.reference && ` · ${p.reference}`}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-green-600 text-sm">
                  +{invoice.currency} {p.amount?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Paid</span>
              <span className="font-semibold text-green-600">
                {invoice.currency} {invoice.amountPaid?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Balance Due</span>
              <span
                className={`font-bold ${
                  invoice.balanceDue > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {invoice.currency} {invoice.balanceDue?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp tip */}
      {!invoice.customer?.phone && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-3 md:p-4">
          <WhatsAppIcon />
          <div>
            <p className="text-sm font-semibold text-green-800">
              Add phone number for direct WhatsApp
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              Go to <strong>Customers</strong> → edit{" "}
              <strong>{invoice.customer?.name}</strong> → add phone with country
              code (e.g. +91XXXXXXXXXX)
            </p>
          </div>
        </div>
      )}

      {/* ✅ Record Payment Modal */}
      {showRecordPayment && (
        <RecordPaymentModal
          invoice={invoice}
          onClose={() => setShowRecordPayment(false)}
          onSave={refreshInvoice}
        />
      )}
    </div>
  );
}
