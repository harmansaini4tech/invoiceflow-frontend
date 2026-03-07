import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { X, Lock, CreditCard } from "lucide-react";

const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

// ── Inner form ────────────────────────────────────────────────────────────────
function CheckoutForm({ amount, currency, invoiceNumber, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message);
      setPaying(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || paying}
        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-70
          text-white font-bold py-3 px-6 rounded-xl transition-colors
          flex items-center justify-center gap-2"
      >
        {paying ? (
          <>
            <div
              className="w-4 h-4 border-2 border-white border-t-transparent
              rounded-full animate-spin"
            />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pay {currency} {amount?.toFixed(2)}
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <Lock className="w-3 h-3" />
        <span>Secured by Stripe · SSL encrypted</span>
      </div>
    </form>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
export default function PaymentModal({ invoice, onClose, onSuccess }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [publishableKey, setPublishableKey] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // ✅ handle all possible id formats
        const invoiceId = invoice._id?.$oid || invoice._id || invoice.id;
        console.log("invoice object:", invoice); // ✅ temp debug
        console.log("invoiceId sending:", invoiceId);

        if (!invoiceId) {
          setError("Could not determine invoice ID");
          setLoading(false);
          return;
        }

        const res = await axios.post(`${BASE_URL}/payments/create-intent`, {
          invoiceId,
        });
        const { clientSecret, publishableKey } = res.data.data;
        setClientSecret(clientSecret);
        setPublishableKey(publishableKey);
        setStripePromise(loadStripe(publishableKey));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to initialize payment");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [invoice]);

  const handleSuccess = () => {
    setPaid(true);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 3000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50
      flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4
          border-b border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-red-50 rounded-xl flex items-center
              justify-center"
            >
              <CreditCard className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Pay Invoice</h2>
              <p className="text-xs text-gray-500">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Amount summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount Due</span>
              <span className="text-2xl font-bold text-gray-900">
                {invoice.currency}{" "}
                {invoice.balanceDue?.toFixed(2) || invoice.total?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-400">Invoice Total</span>
              <span className="text-xs text-gray-400">
                {invoice.currency} {invoice.total?.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div
                className="w-8 h-8 border-4 border-red-600
                border-t-transparent rounded-full animate-spin"
              />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Success */}
          {paid && (
            <div className="text-center py-6">
              <div
                className="w-16 h-16 bg-green-100 rounded-full flex items-center
                justify-center mx-auto mb-4"
              >
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                Payment Successful!
              </h3>
              <p className="text-sm text-gray-500">
                Your payment has been processed. Thank you!
              </p>
            </div>
          )}

          {/* Stripe Elements */}
          {!loading && !error && !paid && clientSecret && stripePromise && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: { colorPrimary: "#DC2626" },
                },
              }}
            >
              <CheckoutForm
                amount={invoice.balanceDue || invoice.total}
                currency={invoice.currency}
                invoiceNumber={invoice.invoiceNumber}
                onSuccess={handleSuccess}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
