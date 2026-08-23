import React, { useState, useEffect } from 'react';
import { Scale, Search, Truck, Building2, Package, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { AccountabilityRecord } from '../../types';
import { subscribeAccountabilityReviews } from '../../services/firestoreService';
import { EmptyState } from '../ui/EmptyState';

export const AccountabilityHubView: React.FC = () => {
  const [records, setRecords] = useState<AccountabilityRecord[]>([]);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeAccountabilityReviews((allRecords) => {
      setRecords(allRecords);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = records.filter((r) => {
    if (categoryFilter !== 'all' && r.responsibilityCategory !== categoryFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.claimId.toLowerCase().includes(q) ||
      r.productName?.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q)
    );
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Storage / Warehouse':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Store / Management':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Product Quality':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Fair Treatment Mandatory Policy Card */}
      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-900 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-indigo-950">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
          <span>Fair Treatment & Accountability Governance</span>
        </div>
        <p className="leading-relaxed">
          The system enforces that AI predictions do not automatically blame delivery partners or store personnel. All accountability classifications require human reviewer findings and map to organizational improvements (e.g. cold-chain reviews, packaging audits) rather than punitive deductions.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Root Cause & Accountability Records
          </span>
          <span className="text-xs text-gray-400">({records.length})</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Delivery">Delivery</option>
            <option value="Storage / Warehouse">Storage / Warehouse</option>
            <option value="Store / Management">Store / Management</option>
            <option value="Product Quality">Product Quality</option>
            <option value="Customer Evidence">Customer Evidence</option>
          </select>

          <div className="relative min-w-[200px]">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search accountability reviews..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Records Table */}
      {loading ? (
        <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-xs text-gray-500">
          Loading accountability records...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="No accountability reviews"
          description="When human reviewers assign root cause evaluations to claims, records will appear here."
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Claim ID</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Decision</th>
                  <th className="px-4 py-3">Recommendation</th>
                  <th className="px-4 py-3">Reviewer Justification</th>
                  <th className="px-4 py-3">Adjudicator</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      #{rec.claimId}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(
                          rec.responsibilityCategory
                        )}`}
                      >
                        {rec.responsibilityCategory}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {rec.decision}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {rec.penaltyRecommendation}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-sm leading-relaxed">
                      {rec.reason}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {rec.reviewerName || 'Reviewer'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-[11px] whitespace-nowrap">
                      {new Date(rec.createdAt).toLocaleDateString()}
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
