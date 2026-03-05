import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import {
  DollarSign, FileText, Users, AlertTriangle, TrendingUp, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setData(res.data.data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );

  const chartData = data?.revenueByMonth?.map(r => ({
    name: MONTHS[(r._id.month - 1)],
    revenue: r.total || 0,
    paid: r.paid || 0,
  })) || [];

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${(data?.stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', change: '+12%',
    },
    {
      label: 'Total Invoices',
      value: data?.stats?.totalInvoices || 0,
      icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', change: '+5',
    },
    {
      label: 'Customers',
      value: data?.stats?.totalCustomers || 0,
      icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', change: '+2',
    },
    {
      label: 'Overdue',
      value: data?.stats?.overdueInvoices || 0,
      icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', change: null,
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
      {/* Mobile: 2 columns | sm+: 2 columns | xl: 4 columns */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className={`w-9 h-9 md:w-10 md:h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
              </div>
              {stat.change && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 md:px-2 py-0.5 rounded-full flex items-center gap-0.5 md:gap-1">
                  <TrendingUp className="w-3 h-3" />
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

      {/* ── Chart + Recent Invoices ─────────────────────────────────────── */}
      {/* Mobile: stacked | xl: side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">

        {/* Revenue Chart */}
        <div className="xl:col-span-2 card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              Revenue Overview
            </h2>
            <span className="text-xs md:text-sm text-gray-500">This Year</span>
          </div>
          {/* Shorter chart height on mobile */}
          <ResponsiveContainer width="100%" height={180} className="md:!h-[220px]">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#DC2626" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                // Show every other month on mobile to avoid crowding
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                width={45}
                tickFormatter={v => `$${v >= 1000 ? `${v/1000}k` : v}`}
              />
              <Tooltip
                formatter={v => [`$${v.toLocaleString()}`, 'Revenue']}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #F3F4F6',
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#DC2626"
                strokeWidth={2}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Invoices */}
        <div className="card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              Recent Invoices
            </h2>
            <button
              onClick={() => navigate('/invoices')}
              className="text-xs text-red-600 font-semibold hover:underline">
              View all
            </button>
          </div>

          {/* Empty state */}
          {(!data?.recentInvoices || data.recentInvoices.length === 0) && (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No invoices yet</p>
            </div>
          )}

          <div className="space-y-2 md:space-y-3">
            {data?.recentInvoices?.map(inv => (
              <div
                key={inv._id}
                className="flex items-center justify-between p-2.5 md:p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-red-50 transition-colors gap-2"
                onClick={() => navigate(`/invoices/${inv._id}`)}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {inv.invoiceNumber}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {inv.customer?.name}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">
                    ${inv.total?.toFixed(2)}
                  </p>
                  <Badge status={inv.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}