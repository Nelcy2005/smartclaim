import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  PlusCircle,
  Eye,
  Calendar,
  Package,
  Sparkles,
  Receipt,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Claim, ClaimStatus, NavigationPage, UserProfile } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { ClaimDetailsModal } from '../components/claims/ClaimDetailsModal';

interface ClaimsPageProps {
  claims: Claim[];
  user?: UserProfile | null;
  loading?: boolean;
  onNavigate: (page: NavigationPage) => void;
  onSelectClaim: (claim: Claim) => void;
}

export const ClaimsPage: React.FC<ClaimsPageProps> = ({
  claims,
  user = null,
  loading = false,
  onNavigate,
  onSelectClaim,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalClaim, setActiveModalClaim] = useState<Claim | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredClaims = claims.filter((claim) => {
    const matchesFilter =
      filterStatus === 'all'
        ? true
        : filterStatus === 'active'
        ? claim.status === 'Submitted' ||
          claim.status === 'AI Analysis' ||
          claim.status === 'Manual Review' ||
          claim.status === 'Additional Evidence Required' ||
          claim.status === 'Refund Processing'
        : filterStatus === 'resolved'
        ? claim.status === 'Resolved' ||
          claim.status === 'Refund Approved' ||
          claim.status === 'Refund Completed' ||
          claim.status === 'Verified'
        : filterStatus === 'rejected'
        ? claim.status === 'Rejected' || claim.status === 'Claim Rejected'
        : true;

    const matchesSearch =
      claim.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-gray-900 text-white text-xs font-semibold shadow-xl border border-gray-700 flex items-center gap-2.5 animate-in slide-in-from-top-3">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">My Claims</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time claim verifications, AI analysis, manual review triage, and simulated refunds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('submit-claim')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Submit a Claim</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 rounded-lg w-fit">
          {[
            { id: 'all', label: 'All Claims' },
            { id: 'active', label: 'In Progress / Triage' },
            { id: 'resolved', label: 'Approved / Settled' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-white text-gray-900 border border-gray-200 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product, claim ID, or order #"
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Loading / Claims Table / Empty State */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-xs font-medium text-gray-500">Loading your claims...</p>
        </div>
      ) : filteredClaims.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No claims match your filter."
          description="If you receive a damaged, spoiled, or expired product, you can submit a claim."
          actionText="Submit a Claim"
          onAction={() => onNavigate('submit-claim')}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Claim ID</th>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Issue</th>
                  <th className="px-4 py-3">AI Prediction & Confidence</th>
                  <th className="px-4 py-3">Verification Rule</th>
                  <th className="px-4 py-3">Refund Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-blue-700">
                      #{claim.id}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">
                      #{claim.orderNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-900">{claim.productName}</div>
                      <div className="text-[11px] text-gray-400">
                        {claim.affectedQuantity ? `${claim.affectedQuantity} unit(s) @ ` : ''}₹{claim.productPrice}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 font-medium">
                      {claim.issueType}
                    </td>
                    <td className="px-4 py-3.5">
                      {claim.aiPrediction || claim.aiAnalysis?.predictedClass ? (
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                          <span className="font-medium text-gray-800">
                            {claim.aiPrediction || claim.aiAnalysis?.predictedClass}
                          </span>
                          <span className="text-[10px] font-bold text-blue-600">
                            ({(claim.aiConfidence || claim.aiAnalysis?.confidence || 0).toFixed(1)}%)
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                          claim.decision === 'Refund Recommended'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : claim.decision === 'Manual Review Required'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        {claim.decision || 'Manual Review Required'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      ₹{claim.recommendedRefundAmount || claim.productPrice}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={claim.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap text-[11px]">
                      {claim.createdAt}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveModalClaim(claim)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Claim Detail Inspector & Evidence Re-Upload Modal */}
      {activeModalClaim && (
        <ClaimDetailsModal
          claim={activeModalClaim}
          user={user}
          onClose={() => setActiveModalClaim(null)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}
    </div>
  );
};
export default ClaimsPage;
