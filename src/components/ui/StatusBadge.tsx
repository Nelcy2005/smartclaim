import React from 'react';
import { ClaimDecision, ClaimStatus, EvidenceCheckStatus, OrderStatus, RefundStatus } from '../../types';

interface StatusBadgeProps {
  status: ClaimStatus | RefundStatus | OrderStatus | ClaimDecision | EvidenceCheckStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyle = (s: string) => {
    switch (s) {
      case 'Refund Approved':
      case 'Refund Recommended':
      case 'Evidence Supported':
      case 'Approved':
      case 'Resolved':
      case 'Completed':
      case 'Fresh':
      case 'delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';

      case 'AI Analysis':
      case 'Refund Processing':
      case 'Processing':
      case 'in_transit':
      case 'Verified':
        return 'bg-blue-50 text-blue-800 border-blue-200';

      case 'Manual Review':
      case 'Manual Review Required':
      case 'Conflict Detected':
      case 'Inconclusive Evidence':
      case 'Unsupported Issue Type':
      case 'Unverified Image':
      case 'Spoiled':
      case 'Damaged':
        return 'bg-amber-50 text-amber-900 border-amber-200';

      case 'Rejected':
      case 'Claim Not Supported':
      case 'cancelled':
      case 'Unrecognized':
        return 'bg-red-50 text-red-800 border-red-200';

      case 'Submitted':
      case 'Pending':
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-wide transition-colors ${getStyle(
        status
      )} ${sizeClasses[size]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {status}
    </span>
  );
};
