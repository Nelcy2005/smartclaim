import React, { useState, useEffect } from 'react';
import { Receipt, Search, CheckCircle2, Clock, Info, ShieldCheck, AlertCircle } from 'lucide-react';
import { RefundRecord } from '../../types';
import { subscribeAdminRefunds } from '../../services/firestoreService';
import { StatusBadge } from '../ui/StatusBadge';
import { EmptyState } from '../ui/EmptyState';

export const RefundsManagementView: React.FC = () => {
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeAdminRefunds((allRefunds) => {
      setRefunds(allRefunds);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = refunds.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.claimId.toLowerCase().includes(q) ||
      r.productName.toLowerCase().includes(q) ||
      (r.orderNumber || '').toLowerCase().includes(q)
    );
  });

  const totalVolume = refunds.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Banner Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
        <Info className="h-4 w-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold">Academic Demonstration Mode:</strong> All refund disbursements are simulated workflows recorded strictly in Firestore. Real-world payment gateways (Stripe / Razorpay / UPI) and real employee payroll are omitted per project scope.
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <span className="text-xs font-medium text-gray-500">Total Disbursements</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-gray-900">₹{totalVolume.toFixed(2)}</span>
            <span className="text-xs text-gray-400">{refunds.length} record(s)</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <span className="text-xs font-medium text-gray-500">Settlement Currency</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-blue-600">INR (₹)</span>
            <span className="text-xs text-gray-400">Order Parity</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <span className="text-xs font-medium text-gray-500">Duplicate Protection</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-600">Active</span>
            <span className="text-xs text-emerald-600">1:1 Claim Mapping</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          All Simulated Settlement Records
        </span>

        <div className="relative min-w-[220px]">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search refund, claim or order..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Refunds Table */}
      {loading ? (
        <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-xs text-gray-500">
          Loading refunds...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No refund records"
          description="Approved customer refunds will appear here."
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Refund ID</th>
                  <th className="px-4 py-3">Claim ID</th>
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Approved By</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Settlement Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((refund) => (
                  <tr key={refund.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      #{refund.id}
                    </td>
                    <td className="px-4 py-3 text-blue-600 font-medium">
                      #{refund.claimId}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      #{refund.orderNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {refund.productName}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      ₹{refund.amount}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {refund.approvedBy || 'System'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-[11px]">
                      {refund.createdAt}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-[11px] max-w-xs truncate">
                      {refund.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
