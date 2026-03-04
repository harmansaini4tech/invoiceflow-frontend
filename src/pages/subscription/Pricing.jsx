import React, { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Check, Zap } from 'lucide-react';

const PLANS = [
  {
    id: 'free', name: 'Free', monthlyPrice: 0, yearlyPrice: 0,
    features: ['5 invoices/month', '10 customers', '1 user', 'PDF download', 'Basic templates'],
    cta: 'Current Plan', highlight: false,
  },
  {
    id: 'pro', name: 'Pro', monthlyPrice: 29, yearlyPrice: 290,
    features: ['Unlimited invoices', 'Unlimited customers', '5 users', 'Custom branding', 'Recurring invoices', 'Email invoices', 'CSV export', 'Priority support'],
    cta: 'Upgrade to Pro', highlight: true,
  },
  {
    id: 'business', name: 'Business', monthlyPrice: 79, yearlyPrice: 790,
    features: ['Everything in Pro', 'Unlimited users', 'Expense tracking', 'API access', 'Super admin panel', 'White-label', 'Dedicated support'],
    cta: 'Upgrade to Business', highlight: false,
  },
];

export default function Pricing() {
  const [cycle, setCycle] = useState('monthly');
  const [loading, setLoading] = useState(null);

  const handleUpgrade = async (planId) => {
    if (planId === 'free') return;
    setLoading(planId);
    try {
      const res = await api.post('/subscriptions/checkout', { plan: planId, billingCycle: cycle });
      window.location.href = res.data.data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h1>
        <p className="text-gray-500 mt-2">Start free, scale as you grow</p>

        <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 mt-6">
          {['monthly','yearly'].map(c => (
            <button key={c} onClick={() => setCycle(c)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                cycle === c ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'
              }`}>
              {c} {c === 'yearly' && <span className="text-green-600 ml-1">Save 17%</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const price = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          return (
            <div key={plan.id}
              className={`rounded-2xl p-6 border-2 relative ${
                plan.highlight ? 'border-red-500 bg-white shadow-xl shadow-red-100' : 'border-gray-100 bg-white'
              }`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> MOST POPULAR
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-gray-900">${price}</span>
                {price > 0 && <span className="text-gray-400 ml-1">/{cycle === 'monthly' ? 'mo' : 'yr'}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleUpgrade(plan.id)}
                disabled={loading === plan.id || plan.id === 'free'}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlight
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200'
                    : plan.id === 'free'
                    ? 'bg-gray-100 text-gray-400 cursor-default'
                    : 'border-2 border-red-600 text-red-600 hover:bg-red-50'
                }`}>
                {loading === plan.id ? 'Redirecting...' : plan.cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}