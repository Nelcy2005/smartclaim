import React, { useState } from 'react';
import {
  X,
  Scale,
  Truck,
  Building2,
  Package,
  HelpCircle,
  ShieldAlert,
  Info,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  Claim,
  UserProfile,
  ResponsibilityCategory,
  AccountabilityDecision,
  PenaltyRecommendation,
  AccountabilityRecord,
} from '../../types';
import { saveAccountabilityReview } from '../../services/firestoreService';

interface AccountabilityModalProps {
  claim: Claim;
  reviewer: UserProfile;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const AccountabilityModal: React.FC<AccountabilityModalProps> = ({
  claim,
  reviewer,
  onClose,
  onSuccess,
}) => {
  const [category, setCategory] = useState<ResponsibilityCategory>('Delivery');
  const [decision, setDecision] = useState<AccountabilityDecision>('Under Review');
  const [penalty, setPenalty] = useState<PenaltyRecommendation>('No Penalty');
  const [reason, setReason] = useState<string>('');
  const [evidenceSummary, setEvidenceSummary] = useState<string>(
    `Evidence evaluated for claim #${claim.id} (${claim.productName}). AI predicted ${claim.aiPrediction || 'analyzed item'}.`
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A written justification is mandatory for accountability reviews.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const reviewId = `acc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const record: AccountabilityRecord = {
      id: reviewId,
      reviewId,
      claimId: claim.id,
      orderId: claim.orderId,
      orderNumber: claim.orderNumber,
      productName: claim.productName,
      responsibilityCategory: category,
      reason: reason.trim(),
      evidenceSummary: evidenceSummary.trim(),
      decision,
      penaltyRecommendation: penalty,
      reviewerId: reviewer.uid,
      reviewerName: reviewer.name || reviewer.email || 'Reviewer',
      createdAt: now,
      updatedAt: now,
    };

    try {
      await saveAccountabilityReview(record);
      onSuccess(`Accountability review recorded for claim #${claim.id}.`);
      onClose();
    } catch (err: any) {
      console.error('Accountability submission error:', err);
      setError(err.message || 'Failed to submit accountability review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              <Scale className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-base font-bold text-gray-900">
              Accountability & Root Cause Review
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Fair Treatment Mandatory Banner */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <strong className="font-bold">Fair Treatment & No-Blame Protocol:</strong> AI recommendations must never automatically punish a delivery partner or warehouse employee. Human review evaluates process factors before assigning recommendations.
            </div>
          </div>

          {/* Responsibility Category */}
          <div className="space-y-1.5">
            <label className="block font-bold text-gray-700">
              Responsibility Category:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ResponsibilityCategory)}
              className="w-full p-2.5 rounded-lg border border-gray-300 bg-white font-medium text-gray-800 outline-none focus:border-indigo-600"
            >
              <option value="Delivery">Delivery (Transit Handling / Temperature / Shock)</option>
              <option value="Storage / Warehouse">Storage / Warehouse (Dark Store / Humidity / Shelf-life)</option>
              <option value="Store / Management">Store / Management (Dispatch Inspection / Packaging)</option>
              <option value="Product Quality">Product Quality (Farm / Vendor Supply Defect)</option>
              <option value="Customer Evidence">Customer Evidence (Unclear / Non-Matching Proof)</option>
              <option value="Unknown">Unknown / Indeterminate</option>
            </select>
          </div>

          {/* Decision */}
          <div className="space-y-1.5">
            <label className="block font-bold text-gray-700">
              Accountability Decision:
            </label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value as AccountabilityDecision)}
              className="w-full p-2.5 rounded-lg border border-gray-300 bg-white font-medium text-gray-800 outline-none focus:border-indigo-600"
            >
              <option value="Under Review">Under Review</option>
              <option value="Delivery Responsible">Delivery Responsible</option>
              <option value="Storage Responsible">Storage Responsible</option>
              <option value="Product Quality Responsible">Product Quality Responsible</option>
              <option value="Customer Evidence Issue">Customer Evidence Issue</option>
              <option value="No Responsibility Assigned">No Responsibility Assigned</option>
              <option value="Insufficient Evidence">Insufficient Evidence</option>
            </select>
          </div>

          {/* Penalty / Recommendation */}
          <div className="space-y-1.5">
            <label className="block font-bold text-gray-700">
              Operational Recommendation:
            </label>
            <select
              value={penalty}
              onChange={(e) => setPenalty(e.target.value as PenaltyRecommendation)}
              className="w-full p-2.5 rounded-lg border border-gray-300 bg-white font-medium text-gray-800 outline-none focus:border-indigo-600"
            >
              <option value="No Penalty">No Penalty (Standard Process Learning)</option>
              <option value="Warning">Warning (Notice of Procedure Non-Compliance)</option>
              <option value="Process Review">Process Review (Packaging / Handling SOP Audit)</option>
              <option value="Delivery Review">Delivery Review (Route / Cold-Bag Re-evaluation)</option>
              <option value="Storage Review">Storage Review (Dark Store Cold Room Calibration)</option>
              <option value="Management Review">Management Review (Vendor Batch Procurement Audit)</option>
            </select>
          </div>

          {/* Reason / Justification */}
          <div className="space-y-1.5">
            <label className="block font-bold text-gray-700">
              Reviewer Justification & Findings (Mandatory)*:
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the factual basis for this determination based on photographic evidence and order metadata..."
              className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-xs outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>Save Accountability Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
