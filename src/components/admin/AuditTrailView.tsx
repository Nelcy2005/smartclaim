import React, { useState, useEffect } from 'react';
import { Shield, Search, Filter, Clock, UserCheck, Sparkles, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { AuditLogRecord } from '../../types';
import { subscribeAuditLogs } from '../../services/firestoreService';
import { EmptyState } from '../ui/EmptyState';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeAuditLogs(null, (fetchedLogs) => {
      setLogs(fetchedLogs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.claimId.toLowerCase().includes(q) ||
        (log.actorName || '').toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'refund_approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'refund_rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'additional_evidence_requested':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accountability_review_created':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'claim_submitted':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            System State Audit Ledger
          </span>
          <span className="text-xs text-gray-400">({logs.length} logged events)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="p-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 outline-none"
          >
            <option value="all">All Event Types</option>
            <option value="claim_submitted">Claim Submitted</option>
            <option value="refund_approved">Refund Approved</option>
            <option value="refund_rejected">Refund Rejected</option>
            <option value="additional_evidence_requested">Evidence Requested</option>
            <option value="accountability_review_created">Accountability Review</option>
          </select>

          <div className="relative min-w-[200px]">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search claim, actor, description..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-xs text-gray-500">
          Loading audit logs...
        </div>
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No audit events found"
          description="System events and reviewer actions will be recorded here in immutable real-time ledger."
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action Event</th>
                  <th className="px-4 py-3">Claim ID</th>
                  <th className="px-4 py-3">Actor / Role</th>
                  <th className="px-4 py-3">Event Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      #{log.claimId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{log.actorName || log.actorId}</div>
                      <div className="text-[10px] text-gray-400 font-semibold uppercase">
                        {log.actorRole}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-md leading-relaxed">
                      {log.description}
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
