import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import {
  DollarSign, FileText, Users, AlertTriangle,
  TrendingUp, TrendingDown, Plus, Trophy
} from 'lucide-react';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Custom Pie Label ──────────────────────────────────────────────────────────
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r  = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x  = cx + r * Math.cos(-midAngle * RADIAN);
  const y  = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, expRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/expenses?limit=100').catch(() => ({ data: { data: [] } })),
        ]);
        setData(dashRes.data.data);
        setExpenses(expRes.data.data || []);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );

  // ── Chart Data ──────────────────────────────────────────────────────────────
  const chartData = data?.revenueByMonth?.map(r => ({
    name:    MONTHS[(r._id.month - 1)],
    revenue: r.total || 0,
    paid:    r.paid  || 0,
  })) || [];

  // ── Paid vs Unpaid Pie ──────────────────────────────────────────────────────
  const totalRevenue     = data?.stats?.totalRevenue     || 0;
  const totalInvoiced    = data?.stats?.totalInvoiced    || totalRevenue;
  const paidAmount       = totalRevenue;
  const unpaidAmount     = Math.max(0, totalInvoiced - paidAmount);
  const pieData = [
    { name: 'Paid',    value: paidAmount,   color: '#22C55E' },
    { name: 'Unpaid',  value: unpaidAmount, color: '#EF4444' },
  ].filter(d => d.value > 0);

  // ── Expense vs Revenue Bar ──────────────────────────────────────────────────
  const expenseByMonth = MONTHS.map((name, idx) => {
    const rev = data?.revenueByMonth?.find(r => r._id.month === idx + 1)?.total || 0;
    const exp = expenses
      .filter(e => new Date(e.date).getMonth() === idx)
      .reduce((s, e) => s + (e.amount || 0), 0);
    return { name, revenue: rev, expenses: exp };
  }).filter(m => m.revenue > 0 || m.expenses > 0);

  // ── Top Customers ───────────────────────────────────────────────────────────
  const topCustomers = (data?.topCustomers || []).slice(0, 5);

  // ── Monthly Growth ──────────────────────────────────────────────────────────
  const months       = data?.revenueByMonth || [];
  const thisMonth    = months[months.length - 1]?.total || 0;
  const lastMonth    = months[months.length - 2]?.total || 0;
  const growthPct    = lastMonth > 0
    ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1)
    : null;
  const growthPositive = growthPct >= 0;

  // ── Stats Cards ─────────────────────────────────────────────────────────────
  const stats = [
    {
      label: 'Total Revenue', icon: DollarSign,
      value: `$${(data?.stats?.totalRevenue || 0).toLocaleString()}`,
      color: 'text-green-600', bg: 'bg-green-50',
      change: growthPct ? `${growthPositive ? '+' : ''}${growthPct}%` : null,
      changePositive: growthPositive,
    },
    {
      label: 'Total Invoices', icon: FileText,
      value: data?.stats?.totalInvoices || 0,
      color: 'text-blue-600', bg: 'bg-blue-50',
      change: null,
    },
    {
      label: 'Customers', icon: Users,
      value: data?.stats?.totalCustomers || 0,
      color: 'text-purple-600', bg: 'bg-purple-50',
      change: null,
    },
    {
      label: 'Overdue', icon: AlertTriangle,
      value: data?.stats?.overdueInvoices || 0,
      color: 'text-red-600', bg: 'bg-red-50',
      change: null,
    },
  ];

  return (
    <div className="space-y-5 md:space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">Overview of your business</p>
        </div>
        <button
          onClick={() => navigate('/invoices/create')}
          className="btn-primary text-sm px-3 py-2 md:px-4 md:py-2.5">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Invoice</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="card p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 md:w-10 md:h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
              </div>
              {stat.change && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                  stat.changePositive
                    ? 'text-green-600 bg-green-50'
                    : 'text-red-600 bg-red-50'
                }`}>
                  {stat.changePositive
                    ? <TrendingUp className="w-3 h-3" />
                    : <TrendingDown className="w-3 h-3" />}
                  <span className="hidden sm:inline">{stat.change}</span>
                </span>
              )}
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">
              {stat.value}
            </p>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5 truncate">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Row 2: Revenue Chart + Paid vs Unpaid Pie ──────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">

        {/* Revenue Area Chart */}
        <div className="xl:col-span-2 card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-bold text-gray-900">Revenue Overview</h2>
            <span className="text-xs text-gray-500">This Year</span>
          </div>
          <ResponsiveContainer width="100%" height={180} className="md:!h-[220px]">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#DC2626" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false}
                tickLine={false} width={45}
                tickFormatter={v => `$${v >= 1000 ? `${v/1000}k` : v}`} />
              <Tooltip
                formatter={v => [`$${v.toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: 8, border: '1px solid #F3F4F6', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#DC2626"
                strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Paid vs Unpaid Pie */}
        <div className="card p-4 md:p-6">
          <h2 className="text-base md:text-lg font-bold text-gray-900 mb-1">
            Payment Status
          </h2>
          <p className="text-xs text-gray-500 mb-4">Paid vs outstanding</p>

          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              No invoice data yet
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={70}
                    dataKey="value" labelLine={false} label={PieLabel}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={v => [`$${v.toLocaleString()}`, '']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #F3F4F6', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="space-y-2 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: d.color }} />
                      <span className="text-gray-600 text-xs">{d.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900 text-xs">
                      ${d.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Row 3: Expense vs Revenue Bar + Top Customers ──────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">

        {/* Expense vs Revenue Bar Chart */}
        <div className="xl:col-span-2 card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              Revenue vs Expenses
            </h2>
            <span className="text-xs text-gray-500">This Year</span>
          </div>

          {expenseByMonth.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180} className="md:!h-[200px]">
              <BarChart data={expenseByMonth} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false}
                  tickLine={false} width={45}
                  tickFormatter={v => `$${v >= 1000 ? `${v/1000}k` : v}`} />
                <Tooltip
                  formatter={(v, name) => [`$${v.toLocaleString()}`, name]}
                  contentStyle={{ borderRadius: 8, border: '1px solid #F3F4F6', fontSize: 12 }} />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={v => v.charAt(0).toUpperCase() + v.slice(1)} />
                <Bar dataKey="revenue"  fill="#DC2626" radius={[4,4,0,0]} name="revenue" />
                <Bar dataKey="expenses" fill="#FCA5A5" radius={[4,4,0,0]} name="expenses" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Customers */}
        <div className="card p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <h2 className="text-base md:text-lg font-bold text-gray-900">Top Customers</h2>
          </div>

          {topCustomers.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              No customer data yet
            </div>
          ) : (
            <div className="space-y-3">
              {topCustomers.map((c, i) => {
                const maxVal = topCustomers[0]?.total || 1;
                const pct    = ((c.total || 0) / maxVal) * 100;
                const medals = ['🥇','🥈','🥉'];
                return (
                  <div key={c._id}
                    onClick={() => navigate(`/customers/${c._id}`)}
                    className="cursor-pointer group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm flex-shrink-0">
                          {medals[i] || `#${i+1}`}
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate group-hover:text-red-600 transition-colors">
                          {c.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-900 flex-shrink-0 ml-2">
                        ${(c.total || 0).toLocaleString()}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => navigate('/customers')}
            className="w-full mt-4 text-xs text-red-600 font-semibold hover:underline text-center">
            View all customers →
          </button>
        </div>
      </div>

      {/* ── Row 4: Recent Invoices ──────────────────────────────────────── */}
      <div className="card p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-bold text-gray-900">Recent Invoices</h2>
          <button onClick={() => navigate('/invoices')}
            className="text-xs text-red-600 font-semibold hover:underline">
            View all
          </button>
        </div>

        {(!data?.recentInvoices || data.recentInvoices.length === 0) ? (
          <div className="text-center py-8">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-3">No invoices yet</p>
            <button onClick={() => navigate('/invoices/create')}
              className="btn-primary text-sm px-4 py-2">
              <Plus className="w-4 h-4" /> Create Invoice
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Invoice', 'Customer', 'Amount', 'Due', 'Status'].map(h => (
                      <th key={h}
                        className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentInvoices.map(inv => (
                    <tr key={inv._id}
                      onClick={() => navigate(`/invoices/${inv._id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-3 py-3 text-sm font-semibold text-red-600">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {inv.customer?.name}
                      </td>
                      <td className="px-3 py-3 text-sm font-bold">
                        ${inv.total?.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-500">
                        {inv.dueDate
                          ? new Date(inv.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })
                          : '—'}
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
              {data.recentInvoices.map(inv => (
                <div key={inv._id}
                  onClick={() => navigate(`/invoices/${inv._id}`)}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-red-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-red-600">
                      {inv.invoiceNumber}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {inv.customer?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">
                      ${inv.total?.toFixed(2)}
                    </p>
                    <Badge status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}