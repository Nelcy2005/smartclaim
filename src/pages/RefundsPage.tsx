import React from 'react';
import { Receipt, CheckCircle2, Clock, AlertCircle, Info, ArrowUpRight } from 'lucide-react';
import { NavigationPage, RefundRecord } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';

interface RefundsPageProps {
  refunds: RefundRecord[];
  loading?: boolean;
  onNavigate: (page: NavigationPage) => void;
}

export const RefundsPage: React.FC<RefundsPageProps> = ({
  refunds,
  loading = false,
  onNavigate,
}) => {
  const totalCompletedAmount = refunds
    .filter((r) => r.status === 'Completed' || r.status === 'Approved')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalProcessingAmount = refunds
    .filter((r) => r.status === 'Processing' || r.status === 'Pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Refund Tracking</h1>
          <p className="text-xs text-gray-500 mt-1">
            Status and ledger of verified instant-delivery refund settlements in Firestore.
          </p>
        </div>

        {/* Academic Prototype Notice */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-medium text-amber-800">
          <Info className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Academic Demo Refund &bull; Simulated Environment</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Total Refunded</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900">₹{totalCompletedAmount.toFixed(2)}</span>
            <p className="text-[11px] text-gray-400 mt-0.5">Directly credited to payment source</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">In Processing</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900">₹{totalProcessingAmount.toFixed(2)}</span>
            <p className="text-[11px] text-gray-400 mt-0.5">Approved and awaiting bank batch</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Settlement Guarantee</span>
            <div className="p-2 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm font-bold text-gray-900">100% Item Price</span>
            <p className="text-[11px] text-gray-400 mt-0.5">No arbitrary coupon reductions</p>
          </div>
        </div>
      </div>

      {/* Refunds Table or Empty State */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-xs font-medium text-gray-500">Loading your refunds...</p>
        </div>
      ) : refunds.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No refunds yet."
          description="Approved refunds will appear here."
          actionText="Submit a Claim"
          onAction={() => onNavigate('submit-claim')}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Refund Transactions
            </h2>
            <span className="text-xs text-gray-400">{refunds.length} record(s)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Refund ID</th>
                  <th className="px-4 py-3">Claim ID</th>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Settlement Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {refunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-gray-900">#{refund.id}</td>
                    <td className="px-4 py-3.5 font-medium text-blue-700">#{refund.claimId}</td>
                    <td className="px-4 py-3.5 text-gray-600">#{refund.orderNumber}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800">{refund.productName}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600">₹{refund.amount}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={refund.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{refund.createdAt}</td>
                    <td className="px-4 py-3.5 text-gray-500 max-w-xs truncate">
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
