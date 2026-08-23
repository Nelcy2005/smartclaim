export type UserRole = 'customer' | 'reviewer' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string | null;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
}

export type OrderStatus = 'delivered' | 'in_transit' | 'cancelled';

export interface OrderItem {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderId?: string;
  userId: string;
  orderNumber: string;
  productName?: string;
  productCategory?: string;
  quantity?: number;
  price?: number;
  orderDate: string;
  orderTime?: string;
  deliveryDate?: string;
  deliveryTime: string;
  deliveryPartnerName?: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt?: string;
  isTestOrder?: boolean;
}

export type ClaimIssueType =
  | 'Spoiled'
  | 'Damaged'
  | 'Leaking'
  | 'Melted'
  | 'Expired'
  | 'Wrong product'
  | 'Other';

export type ClaimStatus =
  | 'Submitted'
  | 'AI Analysis'
  | 'Manual Review'
  | 'Additional Evidence Required'
  | 'Refund Recommended'
  | 'Refund Approved'
  | 'Refund Processing'
  | 'Refund Completed'
  | 'Claim Rejected'
  | 'Resolved'
  | 'Verified'
  | 'Rejected';

export interface ResponsibilityRisk {
  transportationRisk: number; // percentage e.g. 72
  storageRisk: number; // percentage e.g. 18
  expiryRisk: number; // percentage e.g. 5
  otherRisk: number; // percentage e.g. 5
  summaryText: string;
}

export type ClaimDecision =
  | 'Refund Recommended'
  | 'Manual Review Required'
  | 'Claim Not Supported';

export type EvidenceCheckStatus =
  | 'Evidence Supported'
  | 'Conflict Detected'
  | 'Inconclusive Evidence'
  | 'Unverified Image'
  | 'Unsupported Issue Type';

export interface ModelEvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  valLoss?: number;
  confidenceThreshold: number;
}

export interface AiAnalysisResult {
  productType: string;
  predictedClass: string;
  condition: 'Fresh' | 'Spoiled' | 'Damaged' | 'Unrecognized';
  confidence: number;
  isSupportedCategory: boolean;
  supportedClasses: string[];
  evidenceStatus: EvidenceCheckStatus;
  decision: ClaimDecision;
  decisionReason: string;
  explanation: string;
  modelName?: string;
  modelVersion?: string;
  threshold?: number;
  classProbabilities?: Record<string, number>;
  responsibilityRisk?: ResponsibilityRisk;
}

export interface ClaimTimelineEvent {
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
  actorRole?: string;
}

export interface Claim {
  id: string;
  claimId?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  orderId: string;
  orderNumber: string;
  productName: string;
  productCategory?: string;
  productPrice: number;
  unitPrice?: number;
  affectedQuantity?: number;
  issueType: ClaimIssueType;
  complaintType?: ClaimIssueType;
  description: string;
  imageUrl?: string;
  imageFile?: File | null;
  evidenceImageUrl?: string;
  evidenceStoragePath?: string;
  evidenceFileName?: string;
  evidenceUploadedAt?: string;
  status: ClaimStatus;
  decision?: ClaimDecision;
  evidenceStatus?: EvidenceCheckStatus;
  decisionReason?: string;
  aiPrediction?: string;
  aiConfidence?: number;
  aiSupported?: boolean;
  modelName?: string;
  modelVersion?: string;
  createdAt: string;
  updatedAt?: string;
  aiAnalysis?: AiAnalysisResult;
  recommendedRefundAmount: number;
  recommendedRefund?: number;
  approvedRefundAmount?: number;
  reviewDecision?: 'Approve Refund' | 'Reject Claim' | 'Request More Evidence' | 'Manual Review' | 'Approve' | 'Reject';
  reviewReason?: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  adminReviewNotes?: string;
  additionalEvidenceRequest?: string;
  additionalEvidenceNote?: string;
  accountabilityCategory?: ResponsibilityCategory;
  timeline?: ClaimTimelineEvent[];
}

export type RefundStatus = 'Approved' | 'Processing' | 'Completed' | 'Rejected' | 'Pending';

export interface RefundRecord {
  id: string;
  refundId?: string;
  userId: string;
  claimId: string;
  orderId?: string;
  orderNumber: string;
  productName: string;
  unitPrice?: number;
  affectedQuantity?: number;
  amount: number;
  currency?: string; // e.g. 'INR'
  status: RefundStatus;
  reason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt?: string;
  processedAt?: string;
  notes: string;
}

export type ResponsibilityCategory =
  | 'Delivery'
  | 'Storage / Warehouse'
  | 'Store / Management'
  | 'Product Quality'
  | 'Customer Evidence'
  | 'Unknown';

export type AccountabilityDecision =
  | 'Under Review'
  | 'Delivery Responsible'
  | 'Storage Responsible'
  | 'Product Quality Responsible'
  | 'Customer Evidence Issue'
  | 'No Responsibility Assigned'
  | 'Insufficient Evidence';

export type PenaltyRecommendation =
  | 'No Penalty'
  | 'Warning'
  | 'Process Review'
  | 'Delivery Review'
  | 'Storage Review'
  | 'Management Review';

export interface AccountabilityRecord {
  id: string;
  reviewId: string;
  claimId: string;
  orderId: string;
  orderNumber?: string;
  productName?: string;
  responsibilityCategory: ResponsibilityCategory;
  reason: string;
  evidenceSummary: string;
  decision: AccountabilityDecision;
  penaltyRecommendation: PenaltyRecommendation;
  reviewerId: string;
  reviewerName?: string;
  createdAt: string;
  updatedAt: string;
}

export type AuditAction =
  | 'claim_submitted'
  | 'ai_analyzed'
  | 'manual_review_started'
  | 'refund_approved'
  | 'refund_rejected'
  | 'additional_evidence_requested'
  | 'evidence_reuploaded'
  | 'accountability_review_created'
  | 'claim_resolved';

export interface AuditLogRecord {
  id?: string;
  logId: string;
  claimId: string;
  userId?: string;
  actorId: string;
  actorName?: string;
  actorRole: UserRole | 'system';
  action: AuditAction;
  description: string;
  timestamp: string;
}

export interface InAppNotification {
  id?: string;
  notificationId?: string;
  userId: string;
  title: string;
  message: string;
  claimId?: string;
  read?: boolean;
  createdAt?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface FirestoreAiAnalysisRecord {
  analysisId: string;
  userId: string;
  claimId: string;
  prediction: string | null;
  confidence: number;
  supported: boolean;
  condition: string;
  modelName: string;
  modelVersion: string;
  evidenceStatus: string;
  decision: string;
  createdAt: string;
}

export type NavigationPage =
  | 'login'
  | 'home'
  | 'orders'
  | 'submit-claim'
  | 'my-claims'
  | 'refunds'
  | 'ai-analysis'
  | 'profile'
  | 'admin'
  | 'admin-reviews'
  | 'admin-refunds'
  | 'admin-accountability'
  | 'admin-audit'
  | 'claim-result';
