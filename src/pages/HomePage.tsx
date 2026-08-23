import React from 'react';
import {
  ShoppingBag,
  FileCheck2,
  Receipt,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Claim, NavigationPage, Order, RefundRecord, UserProfile } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';

interface HomePageProps {
  user: UserProfile | null;
  orders: Order[];
  claims: Claim[];
  refunds: RefundRecord[];
  loading?: boolean;
  onNavigate: (page: NavigationPage) => void;
  onSelectClaim: (claim: Claim) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  user,
  orders,
  claims,
  refunds,
  loading = false,
  onNavigate,
  onSelectClaim,
}) => {
  const totalOrdersCount = orders.length;

  const activeClaimsCount = claims.filter(
    (c) => c.status === 'Submitted' || c.status === 'AI Analysis' || c.status === 'Manual Review' || c.status === 'Verified'
  ).length;

  const approvedRefundsAmount = refunds
    .filter((r) => r.status === 'Approved' || r.status === 'Processing' || r.status === 'Completed')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const resolvedClaimsCount = claims.filter(
    (c) => c.status === 'Resolved' || c.status === 'Refund Approved' || c.status === 'Rejected'
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Overview Title and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Overview</h2>
          <p className="text-xs text-gray-500 mt-1">
            Real-time status for automated condition verification and claim resolutions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="home-submit-claim-cta"
            type="button"
            onClick={() => onNavigate('submit-claim')}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Submit a Claim</span>
          </button>
        </div>
      </div>

      {/* 4 Dashboard Metric Cards - Pure real-time Firestore calculation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Orders */}
        <div
          id="stat-total-orders"
          onClick={() => onNavigate('orders')}
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Orders
            </span>
            <ShoppingBag className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalOrdersCount}</div>
          <div className="text-xs text-gray-400 mt-1">
            {totalOrdersCount === 1 ? '1 order placed' : `${totalOrdersCount} orders placed`}
          </div>
        </div>

        {/* Metric 2: Active Claims */}
        <div
          id="stat-active-claims"
          onClick={() => onNavigate('my-claims')}
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Claims
            </span>
            <FileCheck2 className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{activeClaimsCount}</div>
          <div className="text-xs text-amber-700 mt-1">
            {activeClaimsCount === 1 ? '1 in progress' : `${activeClaimsCount} in progress`}
          </div>
        </div>

        {/* Metric 3: Approved Refunds */}
        <div
          id="stat-approved-refunds"
          onClick={() => onNavigate('refunds')}
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Approved Refunds
            </span>
            <Receipt className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            ₹{approvedRefundsAmount.toFixed(2)}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            Settlement balance
          </div>
        </div>

        {/* Metric 4: Resolved Claims */}
        <div
          id="stat-resolved-claims"
          onClick={() => onNavigate('my-claims')}
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Resolved Claims
            </span>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{resolvedClaimsCount}</div>
          <div className="text-xs text-gray-400 mt-1">
            Completed claims
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>How SmartClaim AI Works</span>
          </h3>
          <button
            onClick={() => onNavigate('ai-analysis')}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            Model Specs &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800 mb-1">
              <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Select Order & Product</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Pick the delivered item that arrived damaged, spoiled, or expired from your order history.
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800 mb-1">
              <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Upload Photo Proof</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Our MobileNetV2 CNN model extracts visual features to classify product condition and freshness.
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800 mb-1">
              <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Fair Refund Resolution</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Get an instant refund recommendation matched directly to the verified item cost.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity / Claims Table or Empty State */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">Recent Activity</h3>
            <p className="text-xs text-gray-500">Your most recently submitted claim verifications</p>
          </div>
          {claims.length > 0 && (
            <button
              onClick={() => onNavigate('my-claims')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              View all &rarr;
            </button>
          )}
        </div>

        {claims.length === 0 ? (
          <EmptyState
            title="No claims submitted yet."
            description="If you receive a damaged or spoiled product, you can submit a claim."
            actionText="Submit a Claim"
            onAction={() => onNavigate('submit-claim')}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {claims.slice(0, 5).map((claim) => (
              <div
                key={claim.id}
                onClick={() => onSelectClaim(claim)}
                className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-xs flex-shrink-0">
                    {claim.productName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {claim.productName}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Order #{claim.orderNumber} &bull; {claim.issueType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-800">
                    ₹{claim.recommendedRefundAmount}
                  </span>
                  <StatusBadge status={claim.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
