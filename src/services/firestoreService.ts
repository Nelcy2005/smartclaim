import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Claim,
  ClaimStatus,
  Order,
  RefundRecord,
  UserProfile,
  FirestoreAiAnalysisRecord,
  AccountabilityRecord,
  AuditLogRecord,
  InAppNotification,
  AuditAction,
} from '../types';

/**
 * Sync or update User document in users/{uid}
 */
export async function syncUserProfile(userProfile: UserProfile): Promise<void> {
  if (!userProfile.uid) return;
  const userRef = doc(db, 'users', userProfile.uid);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      await updateDoc(userRef, {
        lastLogin: new Date().toISOString(),
        name: userProfile.name || snap.data().name || 'User',
        email: userProfile.email || snap.data().email || '',
        photoURL: userProfile.photoURL ?? snap.data().photoURL ?? null,
      });
    } else {
      await setDoc(userRef, {
        uid: userProfile.uid,
        name: userProfile.name,
        email: userProfile.email,
        photoURL: userProfile.photoURL || null,
        role: userProfile.role || 'customer',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error syncing user profile to Firestore:', error);
  }
}

/**
 * Real-time listener for Orders belonging to the authenticated user
 */
export function subscribeUserOrders(
  userId: string,
  onUpdate: (orders: Order[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          orderId: data.orderId || docSnap.id,
          userId: data.userId,
          orderNumber: data.orderNumber || docSnap.id.replace('ord-', ''),
          productName: data.productName || 'Fresh Item',
          productCategory: data.productCategory || 'Fresh Produce',
          quantity: data.quantity || 1,
          price: data.price || data.totalAmount || 0,
          orderDate: data.orderDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          orderTime: data.orderTime || '',
          deliveryDate: data.deliveryDate || '',
          deliveryTime: data.deliveryTime || 'Delivered in 12 mins',
          deliveryPartnerName: data.deliveryPartnerName || 'Express Fleet',
          status: data.status || 'delivered',
          items: data.items || [
            {
              id: `${docSnap.id}-item-1`,
              productName: data.productName || 'Organic Fresh Apples (Pack of 4)',
              category: data.productCategory || 'Fresh Produce',
              quantity: data.quantity || 1,
              unitPrice: data.price || data.totalAmount || 120,
              totalPrice: data.price || data.totalAmount || 120,
            },
          ],
          totalAmount: data.price || data.totalAmount || 120,
          createdAt: data.createdAt,
          isTestOrder: data.isTestOrder || false,
        };
      });

      // Sort by creation date descending
      orders.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(orders);
    },
    (err) => {
      console.error('Firestore orders listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Creates an academic test order for the authenticated user
 */
export async function createAcademicTestOrder(
  userId: string,
  productName: string = 'Organic Fresh Apples (Pack of 4)',
  price: number = 120,
  category: string = 'Fresh Produce'
): Promise<Order> {
  const orderId = `ord-${Math.floor(10000 + Math.random() * 90000)}`;
  const orderNumber = orderId.replace('ord-', '');
  const now = new Date();
  const orderDate = now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const orderTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newOrder: Order = {
    id: orderId,
    orderId,
    userId,
    orderNumber,
    productName,
    productCategory: category,
    quantity: 1,
    price,
    orderDate,
    orderTime,
    deliveryDate: orderDate,
    deliveryTime: 'Delivered in 11 mins',
    deliveryPartnerName: 'Ramesh K. (Eco Rider)',
    status: 'delivered',
    items: [
      {
        id: `${orderId}-it1`,
        productName,
        category,
        quantity: 1,
        unitPrice: price,
        totalPrice: price,
      },
    ],
    totalAmount: price,
    createdAt: now.toISOString(),
    isTestOrder: true,
  };

  const orderDocRef = doc(db, 'orders', orderId);
  await setDoc(orderDocRef, {
    orderId,
    userId,
    orderNumber,
    productName,
    productCategory: category,
    quantity: 1,
    price,
    orderDate,
    orderTime,
    deliveryDate: orderDate,
    deliveryTime: 'Delivered in 11 mins',
    deliveryPartnerName: 'Ramesh K. (Eco Rider)',
    status: 'delivered',
    items: newOrder.items,
    totalAmount: price,
    createdAt: now.toISOString(),
    isTestOrder: true,
  });

  return newOrder;
}

/**
 * Parses raw Firestore document data into standard Claim object
 */
function parseClaimDoc(docId: string, data: any): Claim {
  return {
    id: docId,
    claimId: data.claimId || docId,
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    orderId: data.orderId,
    orderNumber: data.orderNumber,
    productName: data.productName,
    productCategory: data.productCategory || 'Fresh Produce',
    productPrice: data.productPrice || 0,
    unitPrice: data.unitPrice || data.productPrice || 0,
    affectedQuantity: data.affectedQuantity || 1,
    issueType: data.issueType || data.complaintType || 'Spoiled',
    complaintType: data.complaintType || data.issueType || 'Spoiled',
    description: data.description || '',
    imageUrl: data.evidenceImageUrl || data.imageUrl || '',
    evidenceImageUrl: data.evidenceImageUrl || data.imageUrl || '',
    evidenceStoragePath: data.evidenceStoragePath || '',
    evidenceFileName: data.evidenceFileName || '',
    evidenceUploadedAt: data.evidenceUploadedAt || '',
    status: data.status || 'Manual Review',
    decision: data.decision,
    evidenceStatus: data.evidenceStatus,
    decisionReason: data.decisionReason,
    aiPrediction: data.aiPrediction || data.aiAnalysis?.predictedClass,
    aiConfidence: data.aiConfidence || data.aiAnalysis?.confidence,
    aiSupported: data.aiSupported ?? data.aiAnalysis?.isSupportedCategory ?? true,
    modelName: data.modelName || data.aiAnalysis?.modelName || 'MobileNetV2 Transfer Learning',
    modelVersion: data.modelVersion || data.aiAnalysis?.modelVersion || 'MobileNetV2-v1.2',
    recommendedRefundAmount: data.recommendedRefundAmount || data.recommendedRefund || 0,
    recommendedRefund: data.recommendedRefund || data.recommendedRefundAmount || 0,
    approvedRefundAmount: data.approvedRefundAmount,
    reviewDecision: data.reviewDecision,
    reviewReason: data.reviewReason,
    reviewerId: data.reviewerId,
    reviewerName: data.reviewerName,
    reviewedAt: data.reviewedAt,
    adminReviewNotes: data.adminReviewNotes,
    additionalEvidenceRequest: data.additionalEvidenceRequest,
    accountabilityCategory: data.accountabilityCategory,
    timeline: data.timeline || [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    aiAnalysis: data.aiAnalysis,
  };
}

/**
 * Real-time listener for Claims belonging to the authenticated user
 */
export function subscribeUserClaims(
  userId: string,
  onUpdate: (claims: Claim[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const claimsRef = collection(db, 'claims');
  const q = query(claimsRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const claims: Claim[] = snapshot.docs.map((docSnap) => parseClaimDoc(docSnap.id, docSnap.data()));
      claims.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(claims);
    },
    (err) => {
      console.error('Firestore claims listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Real-time listener for ALL Claims (Admin & Reviewer Queue)
 */
export function subscribeAdminClaims(
  onUpdate: (claims: Claim[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const claimsRef = collection(db, 'claims');
  return onSnapshot(
    claimsRef,
    (snapshot) => {
      const claims: Claim[] = snapshot.docs.map((docSnap) => parseClaimDoc(docSnap.id, docSnap.data()));
      claims.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(claims);
    },
    (err) => {
      console.error('Firestore admin claims listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Create a new Claim document in Firestore with initial timeline & audit log
 */
export async function saveClaimToFirestore(claim: Claim): Promise<void> {
  const claimRef = doc(db, 'claims', claim.id);
  const now = new Date().toISOString();

  const initialTimeline = [
    {
      title: 'Claim Submitted',
      description: `Customer submitted issue report for ${claim.productName} (${claim.issueType}).`,
      timestamp: now,
      actor: claim.userName || 'Customer',
      actorRole: 'customer',
    },
    {
      title: 'AI Image Analysis Completed',
      description: `CNN Model evaluated evidence: ${claim.aiPrediction || 'Analyzed'} with ${claim.aiConfidence || 0}% confidence (${claim.evidenceStatus || 'Evaluated'}).`,
      timestamp: now,
      actor: 'SmartClaim MobileNetV2',
      actorRole: 'system',
    },
  ];

  if (claim.status === 'Manual Review') {
    initialTimeline.push({
      title: 'Routed to Manual Review',
      description: 'Discrepancy or safety threshold routed claim to human reviewer queue.',
      timestamp: now,
      actor: 'SmartClaim Decision Engine',
      actorRole: 'system',
    });
  } else if (claim.status === 'Refund Approved' || claim.status === 'Refund Recommended') {
    initialTimeline.push({
      title: 'Refund Recommended by AI',
      description: `Eligible for instant refund of ₹${claim.recommendedRefundAmount}.`,
      timestamp: now,
      actor: 'SmartClaim Decision Engine',
      actorRole: 'system',
    });
  }

  await setDoc(claimRef, {
    claimId: claim.id,
    userId: claim.userId,
    userName: claim.userName || 'User',
    userEmail: claim.userEmail || '',
    orderId: claim.orderId,
    orderNumber: claim.orderNumber,
    productName: claim.productName,
    productCategory: claim.productCategory || 'Fresh Produce',
    productPrice: claim.productPrice,
    unitPrice: claim.unitPrice || claim.productPrice,
    affectedQuantity: claim.affectedQuantity || 1,
    issueType: claim.issueType,
    complaintType: claim.issueType,
    description: claim.description,
    imageUrl: claim.evidenceImageUrl || claim.imageUrl || '',
    evidenceImageUrl: claim.evidenceImageUrl || claim.imageUrl || '',
    evidenceStoragePath: claim.evidenceStoragePath || '',
    evidenceFileName: claim.evidenceFileName || '',
    evidenceUploadedAt: claim.evidenceUploadedAt || now,
    aiPrediction: claim.aiPrediction || claim.aiAnalysis?.predictedClass || '',
    aiConfidence: claim.aiConfidence ?? claim.aiAnalysis?.confidence ?? 0,
    aiSupported: claim.aiSupported ?? claim.aiAnalysis?.isSupportedCategory ?? true,
    modelName: claim.modelName || claim.aiAnalysis?.modelName || 'MobileNetV2 Transfer Learning',
    modelVersion: claim.modelVersion || claim.aiAnalysis?.modelVersion || 'MobileNetV2-v1.2',
    status: claim.status,
    decision: claim.decision || 'Manual Review Required',
    evidenceStatus: claim.evidenceStatus || 'Inconclusive Evidence',
    decisionReason: claim.decisionReason || '',
    recommendedRefund: claim.recommendedRefundAmount || 0,
    recommendedRefundAmount: claim.recommendedRefundAmount || 0,
    timeline: initialTimeline,
    createdAt: claim.createdAt || now,
    updatedAt: now,
    aiAnalysis: claim.aiAnalysis || null,
  });

  // Log audit entry for submission
  await createAuditLog({
    logId: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    claimId: claim.id,
    userId: claim.userId,
    actorId: claim.userId,
    actorName: claim.userName || 'Customer',
    actorRole: 'customer',
    action: 'claim_submitted',
    description: `Claim submitted for ${claim.productName} (Issue: ${claim.issueType}). Evidence image uploaded.`,
    timestamp: now,
  });

  // In-app notification for user
  await createNotification({
    userId: claim.userId,
    title: 'Claim Submitted',
    message: `Your claim for ${claim.productName} (#${claim.id}) has been submitted for automated verification.`,
    claimId: claim.id,
    type: 'info',
  });
}

/**
 * Checks whether an active or completed refund already exists for this claim (Duplicate Refund Prevention)
 */
export async function checkExistingRefundForClaim(claimId: string): Promise<boolean> {
  const refundsRef = collection(db, 'refunds');
  const q = query(refundsRef, where('claimId', '==', claimId));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Real-time listener for Refunds belonging to the authenticated user
 */
export function subscribeUserRefunds(
  userId: string,
  onUpdate: (refunds: RefundRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const refundsRef = collection(db, 'refunds');
  const q = query(refundsRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const refunds: RefundRecord[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          refundId: data.refundId || docSnap.id,
          userId: data.userId,
          claimId: data.claimId,
          orderId: data.orderId,
          orderNumber: data.orderNumber || '',
          productName: data.productName || 'Perishable Item',
          unitPrice: data.unitPrice,
          affectedQuantity: data.affectedQuantity || 1,
          amount: data.amount || 0,
          currency: data.currency || 'INR',
          status: data.status || 'Approved',
          reason: data.reason,
          approvedBy: data.approvedBy,
          approvedAt: data.approvedAt,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          processedAt: data.processedAt,
          notes: data.notes || '',
        };
      });

      refunds.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(refunds);
    },
    (err) => {
      console.error('Firestore refunds listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Real-time listener for ALL Refunds (Admin / Reviewer View)
 */
export function subscribeAdminRefunds(
  onUpdate: (refunds: RefundRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const refundsRef = collection(db, 'refunds');
  return onSnapshot(
    refundsRef,
    (snapshot) => {
      const refunds: RefundRecord[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          refundId: data.refundId || docSnap.id,
          userId: data.userId,
          claimId: data.claimId,
          orderId: data.orderId,
          orderNumber: data.orderNumber || '',
          productName: data.productName || 'Perishable Item',
          unitPrice: data.unitPrice,
          affectedQuantity: data.affectedQuantity || 1,
          amount: data.amount || 0,
          currency: data.currency || 'INR',
          status: data.status || 'Approved',
          reason: data.reason,
          approvedBy: data.approvedBy,
          approvedAt: data.approvedAt,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          processedAt: data.processedAt,
          notes: data.notes || '',
        };
      });

      refunds.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(refunds);
    },
    (err) => {
      console.error('Firestore admin refunds listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Create a new Refund record in Firestore
 */
export async function saveRefundToFirestore(refund: RefundRecord): Promise<void> {
  const refundRef = doc(db, 'refunds', refund.id);
  const now = new Date().toISOString();

  await setDoc(refundRef, {
    refundId: refund.id,
    userId: refund.userId,
    claimId: refund.claimId,
    orderId: refund.orderId || '',
    orderNumber: refund.orderNumber || '',
    productName: refund.productName,
    unitPrice: refund.unitPrice || refund.amount,
    affectedQuantity: refund.affectedQuantity || 1,
    amount: refund.amount,
    currency: 'INR',
    status: refund.status || 'Approved',
    reason: refund.reason || 'Verified claim resolution',
    approvedBy: refund.approvedBy || 'System / Reviewer',
    approvedAt: refund.approvedAt || now,
    notes: refund.notes || 'Academic Demo Refund Workflow',
    createdAt: refund.createdAt || now,
    updatedAt: now,
  });
}

/**
 * Reviewer Action: APPROVE REFUND
 * Calculates exact eligible refund amount, validates duplicate protection,
 * creates refund document, updates claim timeline, and logs audit trail.
 */
export async function approveClaimAndCreateRefund(params: {
  claim: Claim;
  reviewerId: string;
  reviewerName: string;
  notes?: string;
}): Promise<{ success: boolean; message: string; refund?: RefundRecord }> {
  const { claim, reviewerId, reviewerName, notes } = params;

  // 1. Duplicate check
  const alreadyRefunded = await checkExistingRefundForClaim(claim.id);
  if (alreadyRefunded) {
    return {
      success: false,
      message: 'A refund has already been created for this claim.',
    };
  }

  // 2. Validate and calculate refund amount strictly from affected product
  const unitPrice = claim.unitPrice || claim.productPrice || 120;
  const quantity = claim.affectedQuantity || 1;
  const refundAmount = unitPrice * quantity;
  const now = new Date().toISOString();

  const refundId = `ref-${Math.floor(10000 + Math.random() * 90000)}`;
  const newRefund: RefundRecord = {
    id: refundId,
    refundId,
    userId: claim.userId,
    claimId: claim.id,
    orderId: claim.orderId,
    orderNumber: claim.orderNumber,
    productName: claim.productName,
    unitPrice,
    affectedQuantity: quantity,
    amount: refundAmount,
    currency: 'INR',
    status: 'Approved',
    reason: notes || 'Approved by reviewer after evidence inspection.',
    approvedBy: reviewerName,
    approvedAt: now,
    createdAt: now,
    notes: notes || 'Refund verified by reviewer. Academic simulated disbursement.',
  };

  await saveRefundToFirestore(newRefund);

  // 3. Update Claim status in Firestore with updated timeline
  const claimRef = doc(db, 'claims', claim.id);
  const updatedTimeline = [
    ...(claim.timeline || []),
    {
      title: 'Refund Approved by Reviewer',
      description: `Reviewer ${reviewerName} approved ₹${refundAmount} refund (${quantity}x ${claim.productName}).`,
      timestamp: now,
      actor: reviewerName,
      actorRole: 'reviewer',
    },
    {
      title: 'Refund Processing',
      description: 'Simulated disbursement queued to original payment instrument.',
      timestamp: now,
      actor: 'SmartClaim Settlement Service',
      actorRole: 'system',
    },
  ];

  await updateDoc(claimRef, {
    status: 'Refund Approved',
    approvedRefundAmount: refundAmount,
    reviewDecision: 'Approve Refund',
    reviewReason: notes || 'Approved by reviewer.',
    reviewerId,
    reviewerName,
    reviewedAt: now,
    adminReviewNotes: notes || 'Approved after evidence review.',
    timeline: updatedTimeline,
    updatedAt: now,
  });

  // 4. Audit Log
  await createAuditLog({
    logId: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    claimId: claim.id,
    userId: claim.userId,
    actorId: reviewerId,
    actorName: reviewerName,
    actorRole: 'reviewer',
    action: 'refund_approved',
    description: `Refund of ₹${refundAmount} approved for claim #${claim.id} by ${reviewerName}.`,
    timestamp: now,
  });

  // 5. Customer Notification
  await createNotification({
    userId: claim.userId,
    title: 'Refund Approved',
    message: `Your refund of ₹${refundAmount} for ${claim.productName} (#${claim.id}) has been approved.`,
    claimId: claim.id,
    type: 'success',
  });

  return {
    success: true,
    message: `Refund of ₹${refundAmount} successfully approved.`,
    refund: newRefund,
  };
}

/**
 * Reviewer Action: REJECT CLAIM
 * Requires mandatory professional rejection reason.
 */
export async function rejectClaimInFirestore(params: {
  claim: Claim;
  reason: string;
  reviewerId: string;
  reviewerName: string;
}): Promise<{ success: boolean; message: string }> {
  const { claim, reason, reviewerId, reviewerName } = params;
  if (!reason.trim()) {
    return { success: false, message: 'Rejection reason is mandatory.' };
  }

  const now = new Date().toISOString();
  const claimRef = doc(db, 'claims', claim.id);

  const updatedTimeline = [
    ...(claim.timeline || []),
    {
      title: 'Claim Rejected by Reviewer',
      description: `Decision: ${reason}`,
      timestamp: now,
      actor: reviewerName,
      actorRole: 'reviewer',
    },
  ];

  await updateDoc(claimRef, {
    status: 'Claim Rejected',
    reviewDecision: 'Reject Claim',
    reviewReason: reason,
    reviewerId,
    reviewerName,
    reviewedAt: now,
    adminReviewNotes: reason,
    timeline: updatedTimeline,
    updatedAt: now,
  });

  // Audit Log
  await createAuditLog({
    logId: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    claimId: claim.id,
    userId: claim.userId,
    actorId: reviewerId,
    actorName: reviewerName,
    actorRole: 'reviewer',
    action: 'refund_rejected',
    description: `Claim #${claim.id} rejected by ${reviewerName}. Reason: ${reason}`,
    timestamp: now,
  });

  // Customer Notification
  await createNotification({
    userId: claim.userId,
    title: 'Claim Status Updated',
    message: `Your claim for ${claim.productName} (#${claim.id}) was reviewed: ${reason}`,
    claimId: claim.id,
    type: 'warning',
  });

  return { success: true, message: 'Claim has been marked as rejected.' };
}

/**
 * Reviewer Action: REQUEST MORE EVIDENCE
 */
export async function requestAdditionalEvidenceInFirestore(params: {
  claim: Claim;
  instruction: string;
  reviewerId: string;
  reviewerName: string;
}): Promise<{ success: boolean; message: string }> {
  const { claim, instruction, reviewerId, reviewerName } = params;
  const promptText = instruction.trim() || 'Please upload a clearer image showing the product condition in good lighting.';
  const now = new Date().toISOString();

  const claimRef = doc(db, 'claims', claim.id);
  const updatedTimeline = [
    ...(claim.timeline || []),
    {
      title: 'Additional Evidence Requested',
      description: promptText,
      timestamp: now,
      actor: reviewerName,
      actorRole: 'reviewer',
    },
  ];

  await updateDoc(claimRef, {
    status: 'Additional Evidence Required',
    additionalEvidenceRequest: promptText,
    reviewDecision: 'Request More Evidence',
    reviewerId,
    reviewerName,
    reviewedAt: now,
    timeline: updatedTimeline,
    updatedAt: now,
  });

  // Audit Log
  await createAuditLog({
    logId: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    claimId: claim.id,
    userId: claim.userId,
    actorId: reviewerId,
    actorName: reviewerName,
    actorRole: 'reviewer',
    action: 'additional_evidence_requested',
    description: `Reviewer ${reviewerName} requested additional evidence: "${promptText}".`,
    timestamp: now,
  });

  // Customer Notification
  await createNotification({
    userId: claim.userId,
    title: 'Additional Evidence Requested',
    message: `Reviewer requested updated photo for ${claim.productName}: "${promptText}"`,
    claimId: claim.id,
    type: 'warning',
  });

  return { success: true, message: 'Additional evidence request dispatched to customer.' };
}

/**
 * Customer Action: RE-UPLOAD EVIDENCE
 */
export async function reuploadEvidenceForClaim(params: {
  claimId: string;
  userId: string;
  userName: string;
  imageUrl: string;
  storagePath: string;
  fileName: string;
}): Promise<void> {
  const { claimId, userId, userName, imageUrl, storagePath, fileName } = params;
  const now = new Date().toISOString();
  const claimRef = doc(db, 'claims', claimId);

  const snap = await getDoc(claimRef);
  const existingTimeline = snap.exists() ? snap.data().timeline || [] : [];

  const updatedTimeline = [
    ...existingTimeline,
    {
      title: 'Updated Evidence Submitted',
      description: 'Customer uploaded updated photographic evidence from Firebase Storage.',
      timestamp: now,
      actor: userName,
      actorRole: 'customer',
    },
    {
      title: 'Returned to Manual Review Queue',
      description: 'Awaiting reviewer inspection with new evidence.',
      timestamp: now,
      actor: 'SmartClaim System',
      actorRole: 'system',
    },
  ];

  await updateDoc(claimRef, {
    evidenceImageUrl: imageUrl,
    imageUrl: imageUrl,
    evidenceStoragePath: storagePath,
    evidenceFileName: fileName,
    evidenceUploadedAt: now,
    status: 'Manual Review',
    timeline: updatedTimeline,
    updatedAt: now,
  });

  await createAuditLog({
    logId: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    claimId,
    userId,
    actorId: userId,
    actorName: userName,
    actorRole: 'customer',
    action: 'evidence_reuploaded',
    description: `Customer re-uploaded new photographic evidence for claim #${claimId}.`,
    timestamp: now,
  });
}

/**
 * Real-time listener for Accountability Reviews
 */
export function subscribeAccountabilityReviews(
  onUpdate: (records: AccountabilityRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const collRef = collection(db, 'accountability_reviews');
  return onSnapshot(
    collRef,
    (snapshot) => {
      const records: AccountabilityRecord[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          reviewId: data.reviewId || docSnap.id,
          claimId: data.claimId,
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          productName: data.productName,
          responsibilityCategory: data.responsibilityCategory || 'Unknown',
          reason: data.reason || '',
          evidenceSummary: data.evidenceSummary || '',
          decision: data.decision || 'Under Review',
          penaltyRecommendation: data.penaltyRecommendation || 'No Penalty',
          reviewerId: data.reviewerId,
          reviewerName: data.reviewerName,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });

      records.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(records);
    },
    (err) => {
      console.error('Firestore accountability listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Create or update an Accountability Review record
 */
export async function saveAccountabilityReview(record: AccountabilityRecord): Promise<void> {
  const docRef = doc(db, 'accountability_reviews', record.id);
  const now = new Date().toISOString();

  await setDoc(docRef, {
    ...record,
    updatedAt: now,
    createdAt: record.createdAt || now,
  });

  // Update claim accountabilityCategory
  const claimRef = doc(db, 'claims', record.claimId);
  try {
    await updateDoc(claimRef, {
      accountabilityCategory: record.responsibilityCategory,
      updatedAt: now,
    });
  } catch (err) {
    console.warn('Could not update claim accountability field:', err);
  }

  // Audit Log
  await createAuditLog({
    logId: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    claimId: record.claimId,
    actorId: record.reviewerId,
    actorName: record.reviewerName || 'Reviewer',
    actorRole: 'reviewer',
    action: 'accountability_review_created',
    description: `Accountability review created: Category [${record.responsibilityCategory}] - Decision [${record.decision}] - Recommendation [${record.penaltyRecommendation}].`,
    timestamp: now,
  });
}

/**
 * Real-time listener for Audit Logs
 */
export function subscribeAuditLogs(
  claimId: string | null,
  onUpdate: (logs: AuditLogRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const collRef = collection(db, 'audit_logs');
  let q = query(collRef);
  if (claimId) {
    q = query(collRef, where('claimId', '==', claimId));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const logs: AuditLogRecord[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          logId: data.logId || docSnap.id,
          claimId: data.claimId,
          userId: data.userId,
          actorId: data.actorId,
          actorName: data.actorName,
          actorRole: data.actorRole || 'system',
          action: data.action,
          description: data.description,
          timestamp: data.timestamp,
        };
      });

      logs.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
      onUpdate(logs);
    },
    (err) => {
      console.error('Firestore audit logs listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Record an immutable audit log entry
 */
export async function createAuditLog(log: AuditLogRecord): Promise<void> {
  const logDocRef = doc(db, 'audit_logs', log.id || log.logId);
  try {
    await setDoc(logDocRef, {
      ...log,
      timestamp: log.timestamp || new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error creating audit log in Firestore:', err);
  }
}

/**
 * Real-time listener for User in-app notifications
 */
export function subscribeUserNotifications(
  userId: string,
  onUpdate: (notifications: InAppNotification[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const collRef = collection(db, 'notifications');
  const q = query(collRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const notifs: InAppNotification[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          notificationId: docSnap.id,
          userId: data.userId,
          title: data.title,
          message: data.message,
          claimId: data.claimId,
          read: data.read ?? false,
          createdAt: data.createdAt,
          type: data.type || 'info',
        };
      });

      notifs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(notifs);
    },
    (err) => {
      console.error('Firestore notifications listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Create an in-app notification
 */
export async function createNotification(notif: Omit<InAppNotification, 'id'>): Promise<void> {
  const id = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const notifRef = doc(db, 'notifications', id);
  try {
    await setDoc(notifRef, {
      ...notif,
      read: false,
      createdAt: notif.createdAt || new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error creating in-app notification:', err);
  }
}

/**
 * Mark in-app notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const notifRef = doc(db, 'notifications', notificationId);
  try {
    await updateDoc(notifRef, { read: true });
  } catch (err) {
    console.error('Error marking notification read:', err);
  }
}

/**
 * Store AI Analysis Result audit record in analysis_results/{analysisId}
 */
export async function saveAiAnalysisRecord(record: FirestoreAiAnalysisRecord): Promise<void> {
  const analysisRef = doc(db, 'analysis_results', record.analysisId);
  await setDoc(analysisRef, {
    analysisId: record.analysisId,
    userId: record.userId,
    claimId: record.claimId,
    prediction: record.prediction,
    confidence: record.confidence,
    supported: record.supported,
    modelName: record.modelName || 'MobileNetV2 Transfer Learning',
    modelVersion: record.modelVersion || 'MobileNetV2-v1.2',
    condition: record.condition,
    evidenceStatus: record.evidenceStatus,
    decision: record.decision,
    createdAt: record.createdAt || new Date().toISOString(),
  });
}

/**
 * Update claim status in Firestore (Admin / Resolution)
 */
export async function updateClaimStatusInFirestore(
  claimId: string,
  newStatus: ClaimStatus,
  reviewNotes?: string
): Promise<void> {
  const claimRef = doc(db, 'claims', claimId);
  const now = new Date().toISOString();
  await updateDoc(claimRef, {
    status: newStatus,
    adminReviewNotes: reviewNotes || null,
    updatedAt: now,
  });
}
