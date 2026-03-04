import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { DollarSign, FileText, Users, AlertTriangle, TrendingUp, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const [data, setData] = useState(null);
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
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  );

  const chartData = data?.revenueByMonth?.map(r => ({
    name: MONTHS[(r._id.month - 1)],
    revenue: r.total || 0,
    paid: r.paid || 0,
  })) || [];

  const stats = [
    { label: 'Total Revenue', value: `$${(data?.stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', change: '+12%' },
    { label: 'Total Invoices', value: data?.stats?.totalInvoices || 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', change: '+5' },
    { label: 'Customers', value: data?.stats?.totalCustomers || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', change: '+2' },
    { label: 'Overdue', value: data?.stats?.overdueInvoices || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', change: null },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Overview of your business</p>
        </div>
        <button onClick={() => navigate('/invoices/create')} className="btn-primary">
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {stat.change && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />{stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
            <span className="text-sm text-gray-500">This Year</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${v >= 1000 ? `${v/1000}k` : v}`} />
              <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: 8, border: '1px solid #F3F4F6', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#DC2626" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Invoices</h2>
          <div className="space-y-3">
            {data?.recentInvoices?.map(inv => (
              <div key={inv._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-red-50 transition-colors"
                onClick={() => navigate(`/invoices/${inv._id}`)}>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{inv.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">{inv.customer?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">${inv.total?.toFixed(2)}</p>
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