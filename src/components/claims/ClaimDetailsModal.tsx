import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  UploadCloud,
  FileCheck2,
  Receipt,
  HelpCircle,
  Info,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Claim, ClaimStatus, UserProfile } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { uploadClaimEvidenceImage } from '../../services/storageService';
import { reuploadEvidenceForClaim } from '../../services/firestoreService';

interface ClaimDetailsModalProps {
  claim: Claim;
  user: UserProfile | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const ClaimDetailsModal: React.FC<ClaimDetailsModalProps> = ({
  claim,
  user,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError(null);
    }
  };

  const handleUploadNewEvidence = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // 1. Upload to Firebase Storage
      const uploadResult = await uploadClaimEvidenceImage({
        userId: user.uid,
        claimId: claim.id,
        file: selectedFile,
      });

      // 2. Update claim in Firestore
      await reuploadEvidenceForClaim({
        claimId: claim.id,
        userId: user.uid,
        userName: user.name || user.email || 'Customer',
        imageUrl: uploadResult.downloadUrl,
        storagePath: uploadResult.storagePath,
        fileName: uploadResult.fileName,
      });

      onSuccess('Updated evidence photo uploaded! Claim returned to manual review.');
      onClose();
    } catch (err: any) {
      console.error('Evidence re-upload error:', err);
      setUploadError(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Determine Stepper Active Step
  const getStepIndex = (status: ClaimStatus) => {
    switch (status) {
      case 'Submitted':
        return 0;
      case 'AI Analysis':
        return 1;
      case 'Manual Review':
      case 'Additional Evidence Required':
        return 2;
      case 'Refund Recommended':
      case 'Refund Approved':
        return 3;
      case 'Refund Processing':
      case 'Refund Completed':
      case 'Resolved':
      case 'Verified':
        return 4;
      case 'Claim Rejected':
      case 'Rejected':
        return -1;
      default:
        return 2;
    }
  };

  const currentStep = getStepIndex(claim.status);
  const steps = [
    { title: 'Submitted', desc: 'Report logged' },
    { title: 'AI Verification', desc: 'CNN evaluated' },
    { title: 'Review / Triage', desc: 'Adjudication' },
    { title: 'Refund Approved', desc: 'Resolution' },
    { title: 'Settled', desc: 'Completed' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-gray-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                <FileCheck2 className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-base font-bold text-gray-900">
                Claim Details &bull; #{claim.id}
              </h2>
              <StatusBadge status={claim.status} size="sm" />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Order #{claim.orderNumber} &bull; Submitted {claim.createdAt}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Stepper Progress Timeline */}
          {currentStep !== -1 ? (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between relative">
                {steps.map((step, idx) => {
                  const isDone = currentStep > idx;
                  const isCurrent = currentStep === idx;
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 text-center relative z-10">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                      </div>
                      <span className="mt-1.5 font-bold text-[11px] text-gray-800">
                        {step.title}
                      </span>
                      <span className="text-[10px] text-gray-400 hidden sm:block">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Claim Rejected:</strong>{' '}
                {claim.reviewReason || 'The submitted proof did not satisfy verification criteria.'}
              </div>
            </div>
          )}

          {/* Action Required Alert: Additional Evidence Required */}
          {claim.status === 'Additional Evidence Required' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-3">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Action Required: Clearer Photo Requested</h4>
                  <p className="text-[11px] mt-0.5 text-amber-800 leading-relaxed">
                    <strong>Reviewer Note:</strong> &ldquo;{claim.additionalEvidenceRequest || 'Please provide an updated, clear photo of the product condition.'}&rdquo;
                  </p>
                </div>
              </div>

              {/* Re-upload Dropzone */}
              <div className="p-3 bg-white rounded-lg border border-dashed border-amber-300 space-y-2">
                <input
                  type="file"
                  id="reupload-file-input"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="reupload-file-input"
                  className="flex items-center justify-center gap-2 p-3 bg-amber-50/50 hover:bg-amber-100/50 rounded-lg text-amber-900 font-bold text-xs cursor-pointer transition-colors"
                >
                  <UploadCloud className="h-4 w-4 text-amber-600" />
                  <span>{selectedFile ? selectedFile.name : 'Choose New Evidence Photo'}</span>
                </label>

                {previewUrl && (
                  <div className="h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}

                {uploadError && (
                  <p className="text-[11px] text-red-600 font-medium">{uploadError}</p>
                )}

                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleUploadNewEvidence}
                    disabled={isUploading}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                    <span>Submit Updated Evidence</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Evidence and Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Image Box */}
            <div className="space-y-1.5">
              <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                Uploaded Evidence
              </span>
              {claim.evidenceImageUrl || claim.imageUrl ? (
                <div className="h-48 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                  <img
                    src={claim.evidenceImageUrl || claim.imageUrl}
                    alt="Claim evidence"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-48 rounded-xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400">
                  No image attached
                </div>
              )}
            </div>

            {/* AI Summary and Refund */}
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Product:</span>
                  <span className="font-bold text-gray-900">{claim.productName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Reported Issue:</span>
                  <span className="font-semibold text-gray-800">{claim.issueType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">AI Classification:</span>
                  <span className="font-bold text-blue-600">
                    {claim.aiPrediction || claim.aiAnalysis?.predictedClass || 'Evaluating'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">AI Confidence:</span>
                  <span className="font-bold text-blue-600">
                    {claim.aiConfidence ? `${claim.aiConfidence.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-1.5">
                  <span className="font-bold text-gray-900">Eligible Refund:</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    ₹{claim.recommendedRefundAmount || claim.productPrice}
                  </span>
                </div>
              </div>

              {/* Responsible AI Disclaimer */}
              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900">
                <Info className="h-3.5 w-3.5 text-blue-600 inline mr-1" />
                AI analysis assists verification. Cases with conflicting evidence undergo human review.
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px] block mb-1">
              Your Description:
            </span>
            <p className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 leading-relaxed">
              {claim.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold text-xs hover:bg-gray-300 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
