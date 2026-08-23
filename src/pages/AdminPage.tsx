import React, { useState, useEffect } from 'react';
import {
  Shield,
  FileCheck2,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Sparkles,
  Truck,
  Building2,
  Search,
  Filter,
  X,
  Scale,
  ListFilter,
  HelpCircle,
  FileText,
  Lock,
} from 'lucide-react';
import { Claim, ClaimStatus, NavigationPage, RefundRecord, UserProfile } from '../../src/types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { ClaimReviewModal } from '../components/admin/ClaimReviewModal';
import { AccountabilityModal } from '../components/admin/AccountabilityModal';
import { RefundsManagementView } from '../components/admin/RefundsManagementView';
import { AccountabilityHubView } from '../components/admin/AccountabilityHubView';
import { AuditTrailView } from '../components/admin/AuditTrailView';
import { subscribeAdminClaims } from '../services/firestoreService';

interface AdminPageProps {
  claims: Claim[];
  refunds: RefundRecord[];
  user?: UserProfile | null;
  onUpdateClaimStatus: (claimId: string, newStatus: ClaimStatus, reviewNotes?: string) => void;
  onNavigate: (page: NavigationPage) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  claims: initialClaims,
  refunds,
  user,
  onUpdateClaimStatus,
  onNavigate,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<
    'queue' | 'refunds' | 'accountability' | 'audit'
  >('queue');
  const [allClaims, setAllClaims] = useState<Claim[]>(initialClaims);
  const [selectedClaimForReview, setSelectedClaimForReview] = useState<Claim | null>(null);
  const [selectedClaimForAccountability, setSelectedClaimForAccountability] = useState<Claim | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to real-time admin claims
  useEffect(() => {
    const unsubscribe = subscribeAdminClaims((fetched) => {
      setAllClaims(fetched);
    });
    return () => unsubscribe();
  }, []);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Role verification check
  const isReviewerOrAdmin = user?.role === 'admin' || user?.role === 'reviewer';

  if (!isReviewerOrAdmin) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl bg-white border border-gray-200 text-center space-y-4 shadow-sm">
        <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Reviewer Privileges Required</h2>
        <p className="text-xs text-gray-600 leading-relaxed">
          The Admin Review Console is restricted to authenticated users with the <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-blue-600">reviewer</code> or <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-blue-600">admin</code> role.
        </p>
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 text-left">
          <strong>Testing Tip:</strong> Use the <em>Role Switcher</em> in the top-right navbar to switch your session to <strong>Admin/Reviewer</strong> mode to evaluate the adjudication workflow.
        </div>
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
        >
          Return to Customer Dashboard
        </button>
      </div>
    );
  }

  // Calculate real Firestore metrics
  const totalClaimsCount = allClaims.length;
  const manualReviewsCount = allClaims.filter(
    (c) => c.status === 'Manual Review' || c.status === 'Additional Evidence Required'
  ).length;
  const approvedClaimsCount = allClaims.filter(
    (c) => c.status === 'Refund Approved' || c.status === 'Refund Completed' || c.status === 'Verified'
  ).length;
  const rejectedClaimsCount = allClaims.filter(
    (c) => c.status === 'Claim Rejected' || c.status === 'Rejected'
  ).length;
  const totalRefundAmount = refunds.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Filtered Claims Queue
  const filteredClaims = allClaims.filter((c) => {
    if (filterType === 'manual' && c.status !== 'Manual Review' && c.status !== 'Additional Evidence Required') {
      return false;
    }
    if (filterType === 'recommended' && c.status !== 'Refund Recommended') {
      return false;
    }
    if (filterType === 'approved' && c.status !== 'Refund Approved' && c.status !== 'Refund Completed') {
      return false;
    }
    if (filterType === 'rejected' && c.status !== 'Claim Rejected' && c.status !== 'Rejected') {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        c.productName.toLowerCase().includes(q) ||
        c.id.includes(q) ||
        c.orderNumber.includes(q) ||
        (c.userName || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-gray-900 text-white text-xs font-semibold shadow-xl border border-gray-700 flex items-center gap-2.5 animate-in slide-in-from-top-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              <Shield className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Claim Resolution & Adjudication Console
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manual triage queue, MobileNetV2 verification inspector, refund disbursements, and root-cause accountability.
          </p>
        </div>

        {/* Responsible AI Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-900">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
          <span>AI-Assisted Verification &bull; Human Final Authority</span>
        </div>
      </div>

      {/* Statistical Overview Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-gray-500">Total Submissions</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{totalClaimsCount}</span>
            <span className="text-xs text-gray-400">All claims</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-gray-500">Manual Review Queue</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600">{manualReviewsCount}</span>
            <span className="text-xs text-amber-700 font-semibold">Action needed</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-gray-500">Refunds Approved</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600">{approvedClaimsCount}</span>
            <span className="text-xs text-emerald-700 font-medium">
              {totalClaimsCount > 0 ? `${((approvedClaimsCount / totalClaimsCount) * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-gray-500">Disbursed Volume</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">₹{totalRefundAmount.toFixed(2)}</span>
            <span className="text-xs text-gray-400">{refunds.length} refund(s)</span>
          </div>
        </div>
      </div>

      {/* Main Multi-Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveAdminTab('queue')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'queue'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileCheck2 className="h-4 w-4" />
          <span>Manual Review Queue ({manualReviewsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('refunds')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'refunds'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Simulated Refunds ({refunds.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('accountability')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'accountability'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>Accountability Hub</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'audit'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: CLAIMS REVIEW QUEUE */}
      {activeAdminTab === 'queue' && (
        <div className="space-y-4">
          {/* Sub-Filters and Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 rounded-lg w-fit">
              {[
                { id: 'all', label: 'All Submissions' },
                { id: 'manual', label: 'Manual Review Queue' },
                { id: 'recommended', label: 'AI Recommended' },
                { id: 'approved', label: 'Approved' },
                { id: 'rejected', label: 'Rejected' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    filterType === tab.id
                      ? 'bg-white text-gray-900 border border-gray-200 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer, product, claim ID..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Claims Queue Table */}
          {filteredClaims.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No claims match this filter"
              description="Customer claims requiring manual verification or resolution will be listed here."
            />
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Claim ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Product / Order</th>
                      <th className="px-4 py-3">AI Prediction & Confidence</th>
                      <th className="px-4 py-3">Evidence State</th>
                      <th className="px-4 py-3">Refund Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-gray-900">
                          #{claim.id}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-gray-800">{claim.userName || 'Customer'}</div>
                          <div className="text-[10px] text-gray-400 truncate max-w-[120px]">
                            {claim.userEmail || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-gray-800">{claim.productName}</div>
                          <div className="text-[11px] text-gray-400">
                            Order #{claim.orderNumber} &bull; {claim.issueType}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                            <span className="font-medium text-gray-800">
                              {claim.aiPrediction || claim.aiAnalysis?.predictedClass || 'Pending'}
                            </span>
                            {claim.aiConfidence ? (
                              <span className="text-[10px] font-bold text-blue-600">
                                ({claim.aiConfidence.toFixed(1)}%)
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            {claim.evidenceStatus || 'Evaluated'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-gray-900">
                          ₹{claim.recommendedRefundAmount || claim.productPrice}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={claim.status} size="sm" />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedClaimForReview(claim)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Adjudicate</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SIMULATED REFUNDS */}
      {activeAdminTab === 'refunds' && <RefundsManagementView />}

      {/* TAB 3: ACCOUNTABILITY HUB */}
      {activeAdminTab === 'accountability' && <AccountabilityHubView />}

      {/* TAB 4: AUDIT TRAIL */}
      {activeAdminTab === 'audit' && <AuditTrailView />}

      {/* Modal: Full Claim Inspector & Adjudication */}
      {selectedClaimForReview && user && (
        <ClaimReviewModal
          claim={selectedClaimForReview}
          reviewer={user}
          onClose={() => setSelectedClaimForReview(null)}
          onSuccess={(msg) => showToast(msg)}
          onOpenAccountabilityModal={(c) => {
            setSelectedClaimForAccountability(c);
          }}
        />
      )}

      {/* Modal: Accountability Review */}
      {selectedClaimForAccountability && user && (
        <AccountabilityModal
          claim={selectedClaimForAccountability}
          reviewer={user}
          onClose={() => setSelectedClaimForAccountability(null)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}
    </div>
  );
};
export default AdminPage;
