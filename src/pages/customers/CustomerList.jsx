import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import toast from "react-hot-toast";
import { Plus, Trash2, Mail, Phone, ChevronRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EMPTY = { name: "", email: "", phone: "", currency: "USD" };

export default function CustomerList() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const r = await api.get("/customers?limit=100");
      setCustomers(r.data.data);
      setFiltered(r.data.data);
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Client-side search filter
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(customers);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        customers.filter(
          (c) =>
            c.name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.phone?.includes(q)
        )
      );
    }
  }, [search, customers]);

  const handleSave = async () => {
    if (!form.name) return toast.error("Name is required");
    setSaving(true);
    try {
      await api.post("/customers", form);
      toast.success("Customer added!");
      setModal(false);
      setForm(EMPTY);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this customer?")) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success("Customer deleted");
      fetchCustomers();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Customers
          </h1>
          <p className="text-xs md:text-sm text-gray-500">
            {customers.length} total
          </p>
        </div>
        <Button onClick={() => setModal(true)} className="text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Customer</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* ── Search ─────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="input-field pl-9 w-full"
        />
      </div>

      {/* ── Desktop Table (md and above) ─────────────────────────────── */}
      <div className="hidden md:block card">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            message={
              search ? "No customers match your search." : "No customers yet."
            }
            action={
              !search && (
                <Button onClick={() => setModal(true)}>
                  <Plus className="w-4 h-4" /> Add Customer
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Name",
                    "Email",
                    "Phone",
                    "Invoiced",
                    "Outstanding",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((row) => (
                  <tr
                    key={row._id}
                    onClick={() => navigate(`/customers/${row._id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-red-600 font-bold text-sm">
                            {row.name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">
                          {row.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {row.email || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {row.phone || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium">
                      ${(row.totalInvoiced || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold">
                      <span
                        className={
                          row.totalOutstanding > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        ${(row.totalOutstanding || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={(e) => handleDelete(row._id, e)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                      >
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
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            message={
              search ? "No customers match your search." : "No customers yet."
            }
            action={
              !search && (
                <Button onClick={() => setModal(true)}>
                  <Plus className="w-4 h-4" /> Add Customer
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((row) => (
              <div
                key={row._id}
                onClick={() => navigate(`/customers/${row._id}`)}
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* Top: avatar + name + delete */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold">
                        {row.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 truncate">
                      {row.name}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(row._id, e)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Contact info */}
                <div className="space-y-1.5 mb-3">
                  {row.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{row.email}</span>
                    </div>
                  )}
                  {row.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                      <span>{row.phone}</span>
                    </div>
                  )}
                </div>

                {/* Stats: invoiced + outstanding */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-50">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400 mb-0.5">Invoiced</p>
                    <p className="text-sm font-bold text-gray-900">
                      ${(row.totalInvoiced || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400 mb-0.5">Outstanding</p>
                    <p
                      className={`text-sm font-bold ${
                        row.totalOutstanding > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      ${(row.totalOutstanding || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add Customer Modal ─────────────────────────────────────────── */}
      <Modal
        open={modal}
        onClose={() => {
          setModal(false);
          setForm(EMPTY);
        }}
        title="Add Customer"
      >
        <div className="space-y-4">
          <Input
            label="Name *"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="John Doe"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="john@example.com"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+91 98765 43210"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={form.currency}
              onChange={(e) =>
                setForm((p) => ({ ...p, currency: e.target.value }))
              }
              className="input-field"
            >
              {["USD", "EUR", "GBP", "INR", "CAD", "AUD"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={() => {
                setModal(false);
                setForm(EMPTY);
              }}
              className="w-full sm:w-auto justify-center"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
              className="w-full sm:w-auto justify-center"
            >
              Add Customer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
