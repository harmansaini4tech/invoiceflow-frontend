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
  const [cycle, setCycle]     = useState('monthly');
  const [loading, setLoading] = useState(null);

  const handleUpgrade = async (planId) => {
    if (planId === 'free') return;
    setLoading(planId);
    try {
      const res = await api.post('/subscriptions/checkout', {
        plan: planId, billingCycle: cycle,
      });
      window.location.href = res.data.data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="text-center px-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Simple, Transparent Pricing
        </h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">
          Start free, scale as you grow
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 mt-4 md:mt-6">
          {['monthly', 'yearly'].map(c => (
            <button key={c} onClick={() => setCycle(c)}
              className={`px-4 md:px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                cycle === c ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'
              }`}>
              {c}
              {c === 'yearly' && (
                <span className="text-green-600 ml-1 text-xs">Save 17%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Plans Grid ─────────────────────────────────────────────────── */}
      {/* Mobile:  stacked (1 col) with popular plan first
          Tablet:  still stacked but wider cards
          Desktop: 3 columns side by side                                  */}
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6 px-0">

        {/* Reorder on mobile: Pro (highlight) first, then Free, Business */}
        {[
          PLANS.find(p => p.highlight),
          ...PLANS.filter(p => !p.highlight),
        ].map((plan) => {
          const price = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          return (
            <div key={plan.id}
              className={`rounded-2xl p-5 md:p-6 border-2 relative ${
                plan.highlight
                  ? 'border-red-500 bg-white shadow-xl shadow-red-100'
                  : 'border-gray-100 bg-white'
              }`}>

              {/* Popular badge */}
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                    <Zap className="w-3 h-3" /> MOST POPULAR
                  </span>
                </div>
              )}

              {/* Plan name + price */}
              <div className="flex items-start justify-between md:block">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-1 md:mt-4 mb-0 md:mb-6 flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-bold text-gray-900">
                      ${price}
                    </span>
                    {price > 0 && (
                      <span className="text-gray-400 text-sm">
                        /{cycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    )}
                    {price === 0 && (
                      <span className="text-gray-400 text-sm">forever</span>
                    )}
                  </div>
                </div>

                {/* CTA button — shown inline on mobile right side */}
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading === plan.id || plan.id === 'free'}
                  className={`md:hidden flex-shrink-0 ml-3 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
                    plan.highlight
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200'
                      : plan.id === 'free'
                      ? 'bg-gray-100 text-gray-400 cursor-default'
                      : 'border-2 border-red-600 text-red-600 hover:bg-red-50'
                  }`}>
                  {loading === plan.id ? '...' : plan.id === 'free' ? 'Free' : 'Upgrade'}
                </button>
              </div>

              {/* Features list */}
              <ul className="space-y-2 md:space-y-3 mt-3 md:mt-0 mb-4 md:mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs md:text-sm text-gray-600">
                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA button — full width on desktop only */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading === plan.id || plan.id === 'free'}
                className={`hidden md:block w-full py-3 rounded-xl font-semibold text-sm transition-all ${
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

      {/* ── Footer note ────────────────────────────────────────────────── */}
      <p className="text-center text-xs text-gray-400 pb-4">
        All plans include SSL security, automatic backups, and 99.9% uptime SLA.
        <br className="hidden md:block" /> Cancel anytime, no questions asked.
      </p>
    </div>
  );
}