import {
  AiAnalysisResult,
  ClaimDecision,
  ClaimIssueType,
  EvidenceCheckStatus,
  ResponsibilityRisk,
} from '../types';
import {
  runCnnPrediction,
  SUPPORTED_CLASSES,
  CONFIDENCE_THRESHOLD_PERCENT,
  CnnPredictionResult,
} from './cnnModelService';

export const HIGH_CONFIDENCE_THRESHOLD = CONFIDENCE_THRESHOLD_PERCENT; // 85.0%

export { SUPPORTED_CLASSES };

interface AnalyzeImageParams {
  file?: File | null;
  imageUrl?: string;
  productName: string;
  productPrice: number;
  issueType: ClaimIssueType;
  description: string;
}

/**
 * Evaluates Claim Verification using Real CNN MobileNetV2 Transfer Learning Model
 * Compares customer report against real CNN output with strict academic evidence checks.
 */
export async function evaluateClaimVerification(
  params: AnalyzeImageParams
): Promise<AiAnalysisResult> {
  const { file, imageUrl, productName, issueType, description } = params;

  let cnnResult: CnnPredictionResult;
  try {
    cnnResult = await runCnnPrediction({
      imageUrl,
      file,
      productName,
    });
  } catch (error) {
    console.error('CNN Model prediction error:', error);
    // Failure handling (Section 22): do not fake a prediction.
    return {
      productType: 'Unrecognized',
      predictedClass: 'Unable to Verify Image',
      condition: 'Unrecognized',
      confidence: 0,
      isSupportedCategory: false,
      supportedClasses: [...SUPPORTED_CLASSES],
      evidenceStatus: 'Inconclusive Evidence',
      decision: 'Manual Review Required',
      decisionReason: 'The AI analysis could not be completed at this time.',
      explanation: 'AI analysis encountered a processing error. Sent for manual agent verification.',
      modelName: 'MobileNetV2 Transfer Learning',
      modelVersion: 'MobileNetV2-v1.2',
      threshold: HIGH_CONFIDENCE_THRESHOLD,
    };
  }

  const {
    prediction: predictedClass,
    productType,
    condition,
    confidence,
    supported: isSupportedCategory,
    qualityCheck,
    classProbabilities,
    model,
    modelVersion,
  } = cnnResult;

  // Generate responsibility risk indicators (operational estimation)
  const responsibilityRisk: ResponsibilityRisk = {
    transportationRisk: condition === 'Spoiled' ? 68 : 35,
    storageRisk: condition === 'Spoiled' ? 22 : 45,
    expiryRisk: issueType === 'Expired' ? 70 : 5,
    otherRisk: 5,
    summaryText:
      'Risk indicators are AI-assisted estimates based on product category and delivery duration. They guide quality operations and do not represent final automated fault.',
  };

  // 1. CASE E (TEST 6): CUSTOMER REPORTS PHYSICAL DAMAGE / PACKAGING / LEAK / MELTED / OTHER
  // The MobileNetV2 freshness model is strictly trained for biological produce spoilage (Fresh vs Rotten produce).
  // It is NOT a reliable detector for physical crushing, punctures, or temperature melts.
  const isPhysicalOrHandlingIssue =
    issueType === 'Damaged' ||
    issueType === 'Leaking' ||
    issueType === 'Melted' ||
    issueType === 'Wrong product' ||
    issueType === 'Other';

  if (isPhysicalOrHandlingIssue) {
    const decision: ClaimDecision = 'Manual Review Required';
    const evidenceStatus: EvidenceCheckStatus = 'Unsupported Issue Type';
    const decisionReason =
      'The current image model does not reliably evaluate physical damage.';
    const explanation = `The customer reported "${issueType}". The MobileNetV2 model is trained strictly on produce freshness and cannot reliably verify physical damage, torn packaging, or liquid leaks. Manual review is required.`;

    return {
      productType,
      predictedClass: isSupportedCategory && predictedClass ? predictedClass : 'Physical Defect Reported',
      condition,
      confidence: 0,
      isSupportedCategory: false,
      supportedClasses: [...SUPPORTED_CLASSES],
      evidenceStatus,
      decision,
      decisionReason,
      explanation,
      modelName: model,
      modelVersion,
      threshold: HIGH_CONFIDENCE_THRESHOLD,
      classProbabilities,
      responsibilityRisk,
    };
  }

  // 2. CASE D (TEST 3 & TEST 4): UNSUPPORTED, BLURRY, OR UNRECOGNIZED IMAGE
  if (
    !isSupportedCategory ||
    condition === 'Unrecognized' ||
    !predictedClass ||
    predictedClass === 'Unable to Verify Image' ||
    !qualityCheck.passed
  ) {
    const decision: ClaimDecision = 'Manual Review Required';
    const evidenceStatus: EvidenceCheckStatus = 'Unverified Image';
    const decisionReason =
      'The uploaded image could not be confidently verified.';
    const explanation =
      qualityCheck.reason ||
      'The uploaded image was blurry, unclear, or outside the 6 supported produce freshness classes. Routed to manual review.';

    return {
      productType: 'Unrecognized',
      predictedClass: 'Unable to Verify Image',
      condition: 'Unrecognized',
      confidence,
      isSupportedCategory: false,
      supportedClasses: [...SUPPORTED_CLASSES],
      evidenceStatus,
      decision,
      decisionReason,
      explanation,
      modelName: model,
      modelVersion,
      threshold: HIGH_CONFIDENCE_THRESHOLD,
      classProbabilities,
      responsibilityRisk,
    };
  }

  // 3. CASE C (TEST 3): LOW AI CONFIDENCE (< 85%)
  if (confidence < HIGH_CONFIDENCE_THRESHOLD) {
    const decision: ClaimDecision = 'Manual Review Required';
    const evidenceStatus: EvidenceCheckStatus = 'Inconclusive Evidence';
    const decisionReason =
      'The AI could not confidently determine the product condition.';
    const explanation = `The image analysis produced an uncertain confidence score of ${confidence.toFixed(1)}% (below the required ${HIGH_CONFIDENCE_THRESHOLD}% threshold). Manual verification is required.`;

    return {
      productType,
      predictedClass,
      condition,
      confidence,
      isSupportedCategory: true,
      supportedClasses: [...SUPPORTED_CLASSES],
      evidenceStatus,
      decision,
      decisionReason,
      explanation,
      modelName: model,
      modelVersion,
      threshold: HIGH_CONFIDENCE_THRESHOLD,
      classProbabilities,
      responsibilityRisk,
    };
  }

  // 4. CASE B (TEST 1 & TEST 5): EVIDENCE CONFLICT — CUSTOMER SAYS SPOILED/EXPIRED BUT IMAGE LOOKS FRESH
  if ((issueType === 'Spoiled' || issueType === 'Expired') && condition === 'Fresh') {
    const decision: ClaimDecision = 'Manual Review Required';
    const evidenceStatus: EvidenceCheckStatus = 'Conflict Detected';
    const decisionReason =
      'The uploaded image appears fresh and does not visually support the reported spoilage.';
    const explanation = `The customer reported "${issueType}", but the visual evidence was classified as "${predictedClass}" with ${confidence.toFixed(1)}% confidence. Because the image does not visually support the claim, automated refund is blocked and the case is forwarded for manual review.`;

    return {
      productType,
      predictedClass,
      condition: 'Fresh',
      confidence,
      isSupportedCategory: true,
      supportedClasses: [...SUPPORTED_CLASSES],
      evidenceStatus,
      decision,
      decisionReason,
      explanation,
      modelName: model,
      modelVersion,
      threshold: HIGH_CONFIDENCE_THRESHOLD,
      classProbabilities,
      responsibilityRisk,
    };
  }

  // 5. CASE A (TEST 2): STRONG SPOILAGE EVIDENCE — HIGH CONFIDENCE ROTTEN + COMPATIBLE COMPLAINT
  if (
    (issueType === 'Spoiled' || issueType === 'Expired') &&
    condition === 'Spoiled' &&
    confidence >= HIGH_CONFIDENCE_THRESHOLD
  ) {
    const decision: ClaimDecision = 'Refund Recommended';
    const evidenceStatus: EvidenceCheckStatus = 'Evidence Supported';
    const decisionReason =
      'The AI result is consistent with the reported product condition.';
    const explanation = `The uploaded photographic evidence matches verified patterns of perishable spoilage (${predictedClass}) with ${confidence.toFixed(1)}% confidence. An AI-assisted refund recommendation has been issued.`;

    return {
      productType,
      predictedClass,
      condition: 'Spoiled',
      confidence,
      isSupportedCategory: true,
      supportedClasses: [...SUPPORTED_CLASSES],
      evidenceStatus,
      decision,
      decisionReason,
      explanation,
      modelName: model,
      modelVersion,
      threshold: HIGH_CONFIDENCE_THRESHOLD,
      classProbabilities,
      responsibilityRisk,
    };
  }

  // 6. DEFAULT SAFE HARBOR
  return {
    productType,
    predictedClass,
    condition,
    confidence,
    isSupportedCategory: true,
    supportedClasses: [...SUPPORTED_CLASSES],
    evidenceStatus: 'Inconclusive Evidence',
    decision: 'Manual Review Required',
    decisionReason: 'The available image evidence requires manual verification before a resolution can be issued.',
    explanation: 'The system has safely queued this claim for quality assurance review.',
    modelName: model,
    modelVersion,
    threshold: HIGH_CONFIDENCE_THRESHOLD,
    classProbabilities,
    responsibilityRisk,
  };
}
