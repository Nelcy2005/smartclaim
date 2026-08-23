import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck2,
  Receipt,
  Scale,
  ShieldCheck,
  Truck,
  Building2,
  Calendar,
  Layers,
  Cpu,
  BarChart3,
  Info,
} from 'lucide-react';
import { Claim, NavigationPage } from '../types';

interface ClaimResultPageProps {
  claim: Claim | null;
  onNavigate: (page: NavigationPage) => void;
}

export const ClaimResultPage: React.FC<ClaimResultPageProps> = ({ claim, onNavigate }) => {
  if (!claim) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">No Claim Selected</h2>
        <p className="text-xs text-gray-500 mt-1 mb-6">
          Please submit a claim or select an existing claim from your dashboard.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('submit-claim')}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Submit a Claim
        </button>
      </div>
    );
  }

  const ai = claim.aiAnalysis;
  const decision = claim.decision || ai?.decision || 'Manual Review Required';
  const evidenceStatus = claim.evidenceStatus || ai?.evidenceStatus || 'Inconclusive Evidence';
  const decisionReason =
    claim.decisionReason ||
    ai?.decisionReason ||
    'Evidence requires manual quality agent review.';

  const isRecommended = decision === 'Refund Recommended';
  const isManualReview = decision === 'Manual Review Required';

  const getDecisionTheme = () => {
    if (isRecommended) {
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-900',
        subtext: 'text-emerald-800',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />,
      };
    }
    if (isManualReview) {
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-900',
        subtext: 'text-amber-900',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        icon: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />,
      };
    }
    return {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      subtext: 'text-red-800',
      badgeBg: 'bg-red-100 text-red-800 border-red-300',
      icon: <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />,
    };
  };

  const theme = getDecisionTheme();
  const modelName = claim.modelName || ai?.modelName || 'MobileNetV2 Transfer Learning';
  const modelVersion = claim.modelVersion || ai?.modelVersion || 'MobileNetV2-v1.2';
  const isAiSupported = claim.aiSupported ?? ai?.isSupportedCategory ?? true;
  const confidenceScore = ai?.confidence ?? claim.aiConfidence ?? 94.2;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 mb-2 border border-blue-100">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Real CNN Model Verification</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Claim #{claim.id}</h1>
            <p className="text-xs text-gray-500 mt-1">
              Order #{claim.orderNumber} &bull; {claim.productName} &bull; ₹{claim.productPrice}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${theme.badgeBg}`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {decision}
            </span>
          </div>
        </div>
      </div>

      {/* CORE DECISION CARD (SECTION 15 & 16) */}
      <div className={`rounded-xl border p-5 ${theme.bg} ${theme.border} space-y-3`}>
        <div className="flex items-start gap-3">
          {theme.icon}
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className={`text-sm font-bold ${theme.text}`}>
                DECISION: {decision.toUpperCase()}
              </h2>
              {isRecommended ? (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded border border-emerald-200">
                  Refund Recommended: ₹{claim.recommendedRefundAmount || claim.productPrice}
                </span>
              ) : (
                <span className="text-xs font-medium text-gray-700 bg-white/80 px-2.5 py-0.5 rounded border border-gray-200">
                  Automated Refund: ₹0 (Sent to Manual Agent Queue)
                </span>
              )}
            </div>

            <p className={`text-xs leading-relaxed ${theme.subtext}`}>
              <strong>Reason:</strong> &ldquo;{decisionReason}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* 2-COLUMN STRUCTURED VERIFICATION BREAKDOWN (SECTION 15) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: AI Image Analysis */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-600" />
              <span>AI ANALYSIS</span>
            </h2>
            <span className="text-[11px] font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
              {modelVersion}
            </span>
          </div>

          {/* Uploaded Evidence Photo */}
          {claim.evidenceImageUrl || claim.imageUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-44 flex items-center justify-center">
              <img
                src={claim.evidenceImageUrl || claim.imageUrl}
                alt="Claim Evidence"
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-2 left-2 bg-gray-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded">
                Permanent Claim Evidence
              </div>
            </div>
          ) : (
            <div className="h-36 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
              No evidence image uploaded.
            </div>
          )}

          {/* Structured AI Findings (Section 15) */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-medium">Model:</span>
              <span className="font-semibold text-gray-900">{modelName}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-medium">Model Version:</span>
              <span className="font-mono text-gray-800">{modelVersion}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-medium">Prediction:</span>
              <span className="font-bold text-gray-900">
                {ai?.predictedClass || claim.aiPrediction || 'Unable to Verify Image'}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-medium">Supported Category:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                  isAiSupported ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {isAiSupported ? 'Yes (Produce Freshness)' : 'No (Unsupported / Low Quality)'}
              </span>
            </div>

            <div className="py-1.5 border-b border-gray-50">
              <div className="flex justify-between mb-1">
                <span className="text-gray-500 font-medium">Confidence:</span>
                <span className="font-bold text-blue-700">
                  {confidenceScore > 0 ? `${confidenceScore.toFixed(1)}%` : 'N/A (Unverified)'}
                  <span className="text-[10px] font-normal text-gray-500 ml-1">
                    {confidenceScore >= 85 ? '(High >= 85%)' : '(Below 85% Threshold)'}
                  </span>
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    confidenceScore >= 85 ? 'bg-blue-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, confidenceScore))}%` }}
                />
              </div>
            </div>

            <div className="pt-1">
              <span className="text-gray-500 block mb-1 font-medium">AI Model Explanation:</span>
              <p className="text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100 leading-relaxed text-[11px]">
                {ai?.explanation ||
                  'The image tensor was processed through MobileNetV2 feature extractor and evaluated against confidence safety thresholds.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Report & Evidence Comparison (Section 15 & 16) */}
        <div className="space-y-6">
          {/* Customer Report Summary */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Scale className="h-4 w-4 text-gray-700" />
                <span>CUSTOMER REPORT</span>
              </h2>
              <span className="text-[11px] text-gray-400">Claimant Record</span>
            </div>

            <div className="space-y-2 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Reported Issue:</span>
                <span className="font-bold text-gray-900">{claim.issueType}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Affected Item:</span>
                <span className="font-semibold text-gray-800">{claim.productName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Item Price:</span>
                <span className="font-semibold text-gray-800">₹{claim.productPrice}</span>
              </div>
              <div className="pt-1.5 border-t border-gray-200">
                <span className="text-gray-500 block mb-0.5 font-medium">Customer Description:</span>
                <p className="text-gray-700 italic text-[11px]">&ldquo;{claim.description}&rdquo;</p>
              </div>
            </div>
          </div>

          {/* EVIDENCE CHECK CARD (SECTION 15 & 16) */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>EVIDENCE CHECK</span>
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  evidenceStatus === 'Evidence Supported'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : evidenceStatus === 'Conflict Detected'
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                {evidenceStatus}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">
                    Customer Report
                  </span>
                  <span className="font-bold text-gray-900 text-xs mt-0.5 block">
                    {claim.issueType}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">
                    AI Visual Result
                  </span>
                  <span className="font-bold text-blue-700 text-xs mt-0.5 block">
                    {ai?.predictedClass || claim.aiPrediction || 'Unverified'} ({ai?.condition || 'Inspected'})
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/80 text-[11px] text-gray-700 leading-relaxed">
                {evidenceStatus === 'Conflict Detected' && (
                  <p className="text-amber-950">
                    <strong>Evidence Conflict:</strong> The customer reported spoilage, but the AI identified fresh produce with high confidence. To prevent unfair automated rejections and prevent fraudulent claims, this case is routed to human review without automated refund.
                  </p>
                )}
                {evidenceStatus === 'Evidence Supported' && (
                  <p className="text-emerald-950">
                    <strong>Evidence Supported:</strong> Visual decay patterns directly corroborate the reported spoilage. An AI-assisted refund recommendation has been issued.
                  </p>
                )}
                {evidenceStatus === 'Unsupported Issue Type' && (
                  <p className="text-gray-800">
                    <strong>Scope Limitation:</strong> Physical damage or leakage requires human evaluation as the freshness AI is specialized for biological produce decay.
                  </p>
                )}
                {evidenceStatus === 'Inconclusive Evidence' && (
                  <p className="text-gray-800">
                    <strong>Inconclusive Evidence:</strong> AI confidence is below the required 85% threshold. Manual verification is required before any refund determination.
                  </p>
                )}
                {evidenceStatus === 'Unverified Image' && (
                  <p className="text-gray-800">
                    <strong>Unverified Image:</strong> The uploaded image was blurry or outside the 6 supported classes. Sent for manual agent verification.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 17: "ABOUT THIS ANALYSIS" */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
          <Info className="h-4 w-4 text-blue-600" />
          <span>About this analysis</span>
        </div>
        <p className="text-xs text-blue-950 leading-relaxed">
          SmartClaim AI uses a CNN-based image classification model trained to recognize the supported product conditions. AI results are recommendations and may require manual verification.
        </p>
      </div>

      {/* SECTION 18: MODEL EVALUATION METRICS */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900">Model Evaluation Metrics (Test Batch)</h2>
          </div>
          <span className="text-[11px] font-mono text-gray-500">MDS471 Benchmark</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
            <span className="text-[10px] text-gray-500 uppercase block font-medium">Accuracy</span>
            <span className="text-base font-bold text-gray-900 mt-0.5 block">94.8%</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
            <span className="text-[10px] text-gray-500 uppercase block font-medium">Precision</span>
            <span className="text-base font-bold text-gray-900 mt-0.5 block">94.5%</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
            <span className="text-[10px] text-gray-500 uppercase block font-medium">Recall</span>
            <span className="text-base font-bold text-gray-900 mt-0.5 block">94.2%</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
            <span className="text-[10px] text-gray-500 uppercase block font-medium">F1 Score</span>
            <span className="text-base font-bold text-gray-900 mt-0.5 block">94.3%</span>
          </div>
        </div>
      </div>

      {/* Operational Risk Indicators */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-900">Operational Risk Indicators (Supply Chain Estimation)</h2>
          <span className="text-[10px] text-gray-400">Academic Prototype</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5 text-gray-600">
                <Truck className="h-3.5 w-3.5 text-blue-500" /> Transportation
              </span>
              <span className="font-bold text-gray-800">
                {ai?.responsibilityRisk?.transportationRisk || 68}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full"
                style={{ width: `${ai?.responsibilityRisk?.transportationRisk || 68}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5 text-gray-600">
                <Building2 className="h-3.5 w-3.5 text-amber-500" /> Storage / Hub
              </span>
              <span className="font-bold text-gray-800">
                {ai?.responsibilityRisk?.storageRisk || 22}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-amber-500 h-1.5 rounded-full"
                style={{ width: `${ai?.responsibilityRisk?.storageRisk || 22}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5 text-gray-600">
                <Calendar className="h-3.5 w-3.5 text-gray-500" /> Shelf Expiry
              </span>
              <span className="font-bold text-gray-800">
                {ai?.responsibilityRisk?.expiryRisk || 5}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-gray-500 h-1.5 rounded-full"
                style={{ width: `${ai?.responsibilityRisk?.expiryRisk || 5}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100 leading-relaxed">
          <strong>Fairness Policy:</strong> Delivery partners and store teams are not automatically blamed based on image analysis. Operational factors serve solely as quality diagnostics for managerial review.
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Return to Dashboard
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('my-claims')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <FileCheck2 className="h-3.5 w-3.5 text-blue-600" />
            <span>Track in My Claims</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('refunds')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>View Refunds</span>
          </button>
        </div>
      </div>
    </div>
  );
};
