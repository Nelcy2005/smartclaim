import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Info,
  DollarSign,
  Scale,
  Send,
  Loader2,
} from 'lucide-react';
import { Claim, ClaimStatus, UserProfile } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import {
  approveClaimAndCreateRefund,
  rejectClaimInFirestore,
  requestAdditionalEvidenceInFirestore,
  updateClaimStatusInFirestore,
  checkExistingRefundForClaim,
} from '../../services/firestoreService';

interface ClaimReviewModalProps {
  claim: Claim;
  reviewer: UserProfile;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onOpenAccountabilityModal: (claim: Claim) => void;
}

export const ClaimReviewModal: React.FC<ClaimReviewModalProps> = ({
  claim,
  reviewer,
  onClose,
  onSuccess,
  onOpenAccountabilityModal,
}) => {
  const [activeTab, setActiveTab] = useState<'review' | 'timeline' | 'ai_details'>('review');
  const [actionType, setActionType] = useState<
    'none' | 'approve' | 'reject' | 'request_evidence' | 'manual'
  >('none');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compute calculated eligible refund amount
  const unitPrice = claim.unitPrice || claim.productPrice || 120;
  const quantity = claim.affectedQuantity || 1;
  const computedRefundAmount = unitPrice * quantity;

  // Handle Approve Refund
  const handleApprove = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await approveClaimAndCreateRefund({
        claim,
        reviewerId: reviewer.uid,
        reviewerName: reviewer.name || reviewer.email || 'Reviewer',
        notes: notes.trim() || `Approved ₹${computedRefundAmount} refund for ${quantity}x ${claim.productName}.`,
      });

      if (!res.success) {
        setErrorMsg(res.message);
        setIsSubmitting(false);
        return;
      }

      onSuccess(res.message);
      onClose();
    } catch (err: any) {
      console.error('Approval error:', err);
      setErrorMsg(err.message || 'Failed to approve refund.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reject Claim
  const handleReject = async () => {
    if (!notes.trim()) {
      setErrorMsg('Rejection reason is required. Please provide justification.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await rejectClaimInFirestore({
        claim,
        reason: notes.trim(),
        reviewerId: reviewer.uid,
        reviewerName: reviewer.name || reviewer.email || 'Reviewer',
      });

      if (!res.success) {
        setErrorMsg(res.message);
        setIsSubmitting(false);
        return;
      }

      onSuccess('Claim rejected successfully.');
      onClose();
    } catch (err: any) {
      console.error('Rejection error:', err);
      setErrorMsg(err.message || 'Failed to reject claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Request More Evidence
  const handleRequestEvidence = async () => {
    const prompt =
      notes.trim() ||
      'Please provide a clearer, well-lit photo showing the product defect/spoilage alongside the package label.';

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await requestAdditionalEvidenceInFirestore({
        claim,
        instruction: prompt,
        reviewerId: reviewer.uid,
        reviewerName: reviewer.name || reviewer.email || 'Reviewer',
      });

      if (!res.success) {
        setErrorMsg(res.message);
        setIsSubmitting(false);
        return;
      }

      onSuccess('Additional evidence requested from customer.');
      onClose();
    } catch (err: any) {
      console.error('Request evidence error:', err);
      setErrorMsg(err.message || 'Failed to dispatch evidence request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Mark Manual Review
  const handleKeepManual = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await updateClaimStatusInFirestore(
        claim.id,
        'Manual Review',
        notes.trim() || 'Claim retained under active human inspection.'
      );
      onSuccess('Claim kept in Manual Review queue.');
      onClose();
    } catch (err: any) {
      console.error('Status update error:', err);
      setErrorMsg(err.message || 'Failed to update claim status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-4xl rounded-2xl bg-white border border-gray-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/70">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                <FileCheck2 className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Claim Review Inspector &bull; #{claim.id}
              </h2>
              <StatusBadge status={claim.status} size="sm" />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Customer: <strong className="text-gray-700">{claim.userName || 'Customer'}</strong> ({claim.userEmail || 'N/A'}) &bull; Order #{claim.orderNumber}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-gray-100 bg-white text-xs">
          <button
            onClick={() => setActiveTab('review')}
            className={`pb-2.5 font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'review'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Evidence & Adjudication
          </button>
          <button
            onClick={() => setActiveTab('ai_details')}
            className={`pb-2.5 font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'ai_details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            CNN Model Analytics
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2.5 font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Audit Trail & History ({claim.timeline?.length || 0})
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: Evidence & Adjudication */}
          {activeTab === 'review' && (
            <div className="space-y-5">
              {/* Mandatory Responsible AI Notice */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-bold">Human-in-the-Loop Safeguard:</strong> AI analysis is used to assist claim verification. Results may be uncertain and claims with conflicting or unclear evidence can be sent for manual review.
                </div>
              </div>

              {/* Two Column Layout: Evidence Photo vs Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Photographic Evidence from Storage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Uploaded Evidence Photo
                    </span>
                    {claim.evidenceUploadedAt && (
                      <span className="text-[10px] text-gray-400">
                        Uploaded: {new Date(claim.evidenceUploadedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {claim.evidenceImageUrl || claim.imageUrl ? (
                    <div className="relative group h-64 rounded-xl border border-gray-200 bg-gray-900/5 overflow-hidden flex items-center justify-center">
                      <img
                        src={claim.evidenceImageUrl || claim.imageUrl}
                        alt="Claim evidence"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-64 rounded-xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-xs text-gray-400 p-4 text-center">
                      <AlertTriangle className="h-6 w-6 text-amber-500 mb-2" />
                      <span>No image evidence attached.</span>
                    </div>
                  )}
                  {claim.evidenceFileName && (
                    <p className="text-[10px] text-gray-400 truncate">
                      File: {claim.evidenceFileName}
                    </p>
                  )}
                </div>

                {/* Claim Information & AI Evaluation Summary */}
                <div className="space-y-3">
                  <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-500 font-medium">Product Name:</span>
                      <span className="font-bold text-gray-900">{claim.productName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Customer Reported Issue:</span>
                      <span className="font-semibold text-gray-800 bg-gray-200/70 px-2 py-0.5 rounded">
                        {claim.issueType}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Calculated Unit Price:</span>
                      <span className="font-semibold text-gray-800">₹{unitPrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Affected Quantity:</span>
                      <span className="font-semibold text-gray-800">{quantity} unit(s)</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                      <span className="font-bold text-gray-800">Total Refundable Value:</span>
                      <span className="font-bold text-emerald-600 text-sm">
                        ₹{computedRefundAmount}
                      </span>
                    </div>
                  </div>

                  {/* AI Quick Verdict Card */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-blue-900">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        <span>CNN Classification</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {claim.evidenceStatus || 'Evaluated'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div>
                        <span className="text-gray-500 text-[11px]">Prediction:</span>
                        <p className="font-bold text-gray-900">
                          {claim.aiPrediction || claim.aiAnalysis?.predictedClass || 'Uncertain'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-[11px]">Confidence:</span>
                        <p className="font-bold text-blue-600">
                          {claim.aiConfidence ? `${claim.aiConfidence.toFixed(1)}%` : '0%'}
                        </p>
                      </div>
                    </div>

                    {claim.decisionReason && (
                      <p className="text-[11px] text-gray-600 bg-white/70 p-2 rounded border border-blue-100">
                        <strong>Reason:</strong> {claim.decisionReason}
                      </p>
                    )}
                  </div>

                  {/* Customer Description */}
                  <div>
                    <span className="text-xs font-bold text-gray-700 block mb-1">
                      Customer Description:
                    </span>
                    <p className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 text-xs leading-relaxed">
                      {claim.description || 'No additional comment provided.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Form Selection */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Select Adjudication Action
                  </span>

                  <button
                    type="button"
                    onClick={() => onOpenAccountabilityModal(claim)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                  >
                    <Scale className="h-3.5 w-3.5" />
                    <span>Assign Accountability Review</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType('approve')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      actionType === 'approve'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>Approve Refund</span>
                    <span className="text-[10px] font-normal text-emerald-700">₹{computedRefundAmount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('reject')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      actionType === 'reject'
                        ? 'border-red-600 bg-red-50 text-red-800 shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-red-300'
                    }`}
                  >
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span>Reject Claim</span>
                    <span className="text-[10px] font-normal text-red-600">Requires reason</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('request_evidence')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      actionType === 'request_evidence'
                        ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    <span>Request Evidence</span>
                    <span className="text-[10px] font-normal text-blue-600">Ask for photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('manual')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      actionType === 'manual'
                        ? 'border-amber-600 bg-amber-50 text-amber-800 shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    <Clock className="h-5 w-5 text-amber-600" />
                    <span>Keep in Queue</span>
                    <span className="text-[10px] font-normal text-amber-700">Manual review</span>
                  </button>
                </div>

                {/* Dynamic Input Based on Selected Action */}
                {actionType !== 'none' && (
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      {actionType === 'approve'
                        ? 'Approval Note (Optional)'
                        : actionType === 'reject'
                        ? 'Rejection Justification (Mandatory)*'
                        : actionType === 'request_evidence'
                        ? 'Specific Guidance for Customer Photo*'
                        : 'Reviewer Notes'}
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={
                        actionType === 'reject'
                          ? 'Provide clear reason (e.g. Photo does not show produce spoilage or defect)...'
                          : actionType === 'request_evidence'
                          ? 'e.g. Please capture a close-up of the expiry date on the carton...'
                          : 'Enter review notes for audit trail...'
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />

                    {errorMsg && (
                      <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                        {errorMsg}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI Details */}
          {activeTab === 'ai_details' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3 text-xs">
                <h3 className="text-sm font-bold text-gray-900">
                  MobileNetV2 Neural Network Inference Profile
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Model</span>
                    <span className="font-semibold text-gray-800">{claim.modelName || 'MobileNetV2 Transfer Learning'}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Version</span>
                    <span className="font-semibold text-gray-800">{claim.modelVersion || 'MobileNetV2-v1.2'}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Confidence</span>
                    <span className="font-bold text-blue-600">
                      {claim.aiConfidence ? `${claim.aiConfidence.toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Category Support</span>
                    <span className="font-semibold text-emerald-700">
                      {claim.aiSupported ? 'Supported Produce' : 'Unsupported Category'}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Verification State</span>
                    <span className="font-semibold text-gray-800">{claim.evidenceStatus || 'Inconclusive'}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Decision Rule</span>
                    <span className="font-semibold text-blue-700">{claim.decision || 'Manual Review Required'}</span>
                  </div>
                </div>

                {claim.aiAnalysis?.explanation && (
                  <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-blue-900">
                    <span className="font-bold block mb-1">Model Inference Explanation:</span>
                    <p className="leading-relaxed">{claim.aiAnalysis.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Claim State Transitions & Audit Trail
              </h3>
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {(claim.timeline || []).map((event, idx) => (
                  <div key={idx} className="relative flex items-start gap-3 pl-8">
                    <div className="absolute left-1.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600 shadow-xs" />
                    <div className="flex-1 rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{event.title}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1 leading-relaxed">{event.description}</p>
                      {event.actor && (
                        <span className="inline-block mt-1 text-[10px] font-medium text-gray-400">
                          Actor: {event.actor} ({event.actorRole || 'user'})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Execution Buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {actionType === 'approve' && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Disburse ₹{computedRefundAmount} Refund</span>
              </button>
            )}

            {actionType === 'reject' && (
              <button
                type="button"
                onClick={handleReject}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer shadow-xs"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                <span>Confirm Rejection</span>
              </button>
            )}

            {actionType === 'request_evidence' && (
              <button
                type="button"
                onClick={handleRequestEvidence}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Dispatch Photo Request</span>
              </button>
            )}

            {actionType === 'manual' && (
              <button
                type="button"
                onClick={handleKeepManual}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 text-xs font-bold text-white hover:bg-amber-700 transition-colors cursor-pointer shadow-xs"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                <span>Save in Manual Queue</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
