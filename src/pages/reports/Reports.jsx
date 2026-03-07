import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  RefreshCw,
  Calendar,
} from "lucide-react";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const STATUSES = ["all", "draft", "sent", "paid", "overdue"];
const CAT_COLORS = {
  travel: "#3B82F6",
  food: "#F97316",
  utilities: "#EAB308",
  software: "#8B5CF6",
  hardware: "#6B7280",
  marketing: "#EC4899",
  salary: "#22C55E",
  other: "#9CA3AF",
};

const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

// ── Helper ────────────────────────────────────────────────────────────────────
const fmt = (n) =>
  `$${(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function Reports() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), 0, 1)
    .toISOString()
    .split("T")[0];
  const lastDay = today.toISOString().split("T")[0];

  const [from, setFrom] = useState(firstDay);
  const [to, setTo] = useState(lastDay);
  const [status, setStatus] = useState("all");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/reports/summary?from=${from}&to=${to}&status=${status}`
      );
      setData(res.data.data);
    } catch {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [from, to, status]);

  // ✅ Add this helper function
  const fetchWithParams = async (fromDate, toDate, statusVal) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/reports/summary?from=${fromDate}&to=${toDate}&status=${statusVal}`
      );
      setData(res.data.data);
    } catch {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Only runs ONCE on page load with default dates
  useEffect(() => {
    fetchReport();
  }, []); // eslint-disable-line

  // ── CSV Export ──────────────────────────────────────────────────────────────
  const handleExport = async (type) => {
    setExporting(type);
    try {
      const token = localStorage.getItem("token");
      const params =
        type === "invoices"
          ? `from=${from}&to=${to}&status=${status}`
          : `from=${from}&to=${to}`;
      const url = `${BASE_URL}/reports/export/${type}?${params}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${type}-report-${from}-${to}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success(`${type} exported!`);
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(null);
    }
  };

  // ── Chart Data ──────────────────────────────────────────────────────────────
  const monthlyChart = (data?.revenueByMonth || []).map((m) => ({
    name: MONTHS[m._id.month - 1],
    revenue: m.revenue || 0,
    paid: m.paid || 0,
  }));

  const categoryChart = (data?.expenseByCategory || []).map((e) => ({
    name: e._id,
    value: e.total || 0,
    color: CAT_COLORS[e._id] || "#9CA3AF",
  }));

  const summary = data?.invoiceSummary || {};
  const expSum = data?.expenseSummary || {};
  const profit = (summary.totalPaid || 0) - (expSum.total || 0);

  const summaryCards = [
    {
      label: "Total Invoiced",
      value: fmt(summary.totalInvoiced),
      icon: FileText,
      color: "bg-blue-50   text-blue-600",
    },
    {
      label: "Total Collected",
      value: fmt(summary.totalPaid),
      icon: DollarSign,
      color: "bg-green-50  text-green-600",
    },
    {
      label: "Outstanding",
      value: fmt(summary.totalUnpaid),
      icon: TrendingUp,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Total Expenses",
      value: fmt(expSum.total),
      icon: TrendingDown,
      color: "bg-red-50    text-red-600",
    },
    {
      label: "Net Profit",
      value: fmt(profit),
      icon: DollarSign,
      color:
        profit >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600",
    },
    {
      label: "Total Invoices",
      value: summary.count || 0,
      icon: FileText,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Reports
          </h1>
          <p className="text-xs md:text-sm text-gray-500">
            Business analytics & exports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchWithParams(from, to, status)}
            className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-semibold text-gray-700">
            Date Range & Filters
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="w-full sm:w-auto flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input-field text-sm w-full"
            />
          </div>
          <div className="w-full sm:w-auto flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input-field text-sm w-full"
            />
          </div>
          <div className="w-full sm:w-auto flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Invoice Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-field text-sm w-full"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "all"
                    ? "All Statuses"
                    : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-auto flex-shrink-0">
            <button
              onClick={() => fetchWithParams(from, to, status)}
              className="w-full sm:w-auto btn-primary px-6 py-2 text-sm justify-center whitespace-nowrap"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Quick date range presets */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs text-gray-400">Quick:</span>
          {[
            {
              label: "This Month",
              from: new Date(today.getFullYear(), today.getMonth(), 1)
                .toISOString()
                .split("T")[0],
              to: lastDay,
            },
            {
              label: "Last Month",
              from: new Date(today.getFullYear(), today.getMonth() - 1, 1)
                .toISOString()
                .split("T")[0],
              to: new Date(today.getFullYear(), today.getMonth(), 0)
                .toISOString()
                .split("T")[0],
            },
            { label: "This Year", from: firstDay, to: lastDay },
            {
              label: "Last Year",
              from: `${today.getFullYear() - 1}-01-01`,
              to: `${today.getFullYear() - 1}-12-31`,
            },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setFrom(preset.from);
                setTo(preset.to);
                fetchWithParams(preset.from, preset.to, status);
              }}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors border ${
                from === preset.from && to === preset.to
                  ? "bg-red-600 text-white border-red-600"
                  : "border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* ── Summary Cards ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="card p-3 md:p-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${card.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-gray-500 mb-0.5 truncate">
                    {card.label}
                  </p>
                  <p className="font-bold text-gray-900 text-sm md:text-base truncate">
                    {card.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ── Export Buttons ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Export Invoices */}
            <div className="card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Export Invoices
                  </p>
                  <p className="text-xs text-gray-500">
                    {summary.count || 0} invoices · CSV format
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleExport("invoices")}
                disabled={exporting === "invoices"}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-70 flex-shrink-0"
              >
                {exporting === "invoices" ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>

            {/* Export Expenses */}
            <div className="card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Export Expenses
                  </p>
                  <p className="text-xs text-gray-500">
                    {expSum.count || 0} expenses · CSV format
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleExport("expenses")}
                disabled={exporting === "expenses"}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-70 flex-shrink-0"
              >
                {exporting === "expenses" ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* ── Revenue by Month Chart ────────────────────────────────── */}
          {monthlyChart.length > 0 && (
            <div className="card p-4 md:p-6">
              <h2 className="font-bold text-gray-900 mb-4">Revenue by Month</h2>
              <ResponsiveContainer
                width="100%"
                height={200}
                className="md:!h-[240px]"
              >
                <BarChart data={monthlyChart} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                    tickFormatter={(v) =>
                      `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                    }
                  />
                  <Tooltip
                    formatter={(v) => [`$${v.toLocaleString()}`, ""]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #F3F4F6",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#DC2626"
                    radius={[4, 4, 0, 0]}
                    name="Revenue"
                  />
                  <Bar
                    dataKey="paid"
                    fill="#FCA5A5"
                    radius={[4, 4, 0, 0]}
                    name="Paid"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Bottom Row: Expense by Category + Top Customers ──────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Expense by Category */}
            <div className="card p-4 md:p-6">
              <h2 className="font-bold text-gray-900 mb-4">
                Expenses by Category
              </h2>
              {categoryChart.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  No expense data
                </p>
              ) : (
                <div className="space-y-3">
                  {categoryChart.map((cat) => {
                    const max = categoryChart[0]?.value || 1;
                    const pct = (cat.value / max) * 100;
                    return (
                      <div key={cat.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize font-medium text-gray-700">
                            {cat.name}
                          </span>
                          <span className="font-bold text-gray-900">
                            {fmt(cat.value)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Customers */}
            <div className="card p-4 md:p-6">
              <h2 className="font-bold text-gray-900 mb-4">
                Top Customers by Revenue
              </h2>
              {(data?.topCustomers || []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  No customer data
                </p>
              ) : (
                <div className="space-y-0 rounded-xl overflow-hidden border border-gray-100">
                  {data.topCustomers.map((c, i) => (
                    <div
                      key={c._id}
                      className={`flex items-center gap-3 px-4 py-3 ${
                        i !== data.topCustomers.length - 1
                          ? "border-b border-gray-50"
                          : ""
                      }`}
                    >
                      <span className="text-sm w-5 text-center flex-shrink-0 text-gray-400 font-bold">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {c.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {c.count} invoice{c.count !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">
                          {fmt(c.total)}
                        </p>
                        <p className="text-xs text-green-600">
                          {fmt(c.paid)} paid
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Status Breakdown ──────────────────────────────────────── */}
          {(data?.statusBreakdown || []).length > 0 && (
            <div className="card p-4 md:p-6">
              <h2 className="font-bold text-gray-900 mb-4">
                Invoice Status Breakdown
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.statusBreakdown.map((s) => {
                  const colors = {
                    paid: "bg-green-50  text-green-700  border-green-200",
                    sent: "bg-blue-50   text-blue-700   border-blue-200",
                    draft: "bg-gray-50   text-gray-700   border-gray-200",
                    overdue: "bg-red-50    text-red-700    border-red-200",
                  };
                  return (
                    <div
                      key={s._id}
                      className={`rounded-xl p-3 border capitalize ${
                        colors[s._id] ||
                        "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1">
                        {s._id}
                      </p>
                      <p className="text-xl font-bold">{s.count}</p>
                      <p className="text-xs mt-0.5">{fmt(s.total)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
