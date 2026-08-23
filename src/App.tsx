import React, { useState, useEffect } from 'react';
import {
  Claim,
  ClaimStatus,
  NavigationPage,
  Order,
  OrderItem,
  RefundRecord,
} from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { LoadingModal } from './components/ui/LoadingModal';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { OrdersPage } from './pages/OrdersPage';
import { SubmitClaimPage } from './pages/SubmitClaimPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { RefundsPage } from './pages/RefundsPage';
import { AiAnalysisPage } from './pages/AiAnalysisPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { ClaimResultPage } from './pages/ClaimResultPage';
import { Loader2 } from 'lucide-react';

import { evaluateClaimVerification } from './services/claimDecisionEngine';
import {
  subscribeUserOrders,
  subscribeUserClaims,
  subscribeUserRefunds,
  createAcademicTestOrder,
  saveClaimToFirestore,
  saveRefundToFirestore,
  saveAiAnalysisRecord,
  updateClaimStatusInFirestore,
} from './services/firestoreService';

function AppContent() {
  const { user, loading, logout, setUserRole } = useAuth();

  // Navigation State
  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Application Data States (synced in real-time with Firestore)
  const [orders, setOrders] = useState<Order[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  // Workflow states
  const [preSelectedOrder, setPreSelectedOrder] = useState<Order | null>(null);
  const [preSelectedItem, setPreSelectedItem] = useState<OrderItem | null>(null);
  const [selectedClaimForResult, setSelectedClaimForResult] = useState<Claim | null>(null);
  const [isAnalyzingModalOpen, setIsAnalyzingModalOpen] = useState<boolean>(false);
  const [pendingClaimData, setPendingClaimData] = useState<Partial<Claim> | null>(null);

  // If user logs out or user changes, handle page routing
  useEffect(() => {
    if (!user && !loading) {
      setCurrentPage('login');
    } else if (user && currentPage === 'login') {
      setCurrentPage('home');
    }
  }, [user, loading]);

  // Real-time Firestore Subscriptions for authenticated user
  useEffect(() => {
    if (!user?.uid) {
      setOrders([]);
      setClaims([]);
      setRefunds([]);
      setIsDataLoading(false);
      return;
    }

    setIsDataLoading(true);

    const unsubOrders = subscribeUserOrders(
      user.uid,
      (userOrders) => {
        setOrders(userOrders);
        setIsDataLoading(false);
      },
      (error) => {
        console.error('Error fetching user orders from Firestore:', error);
        setIsDataLoading(false);
      }
    );

    const unsubClaims = subscribeUserClaims(
      user.uid,
      (userClaims) => {
        setClaims(userClaims);
      },
      (error) => {
        console.error('Error fetching user claims from Firestore:', error);
      }
    );

    const unsubRefunds = subscribeUserRefunds(
      user.uid,
      (userRefunds) => {
        setRefunds(userRefunds);
      },
      (error) => {
        console.error('Error fetching user refunds from Firestore:', error);
      }
    );

    return () => {
      unsubOrders();
      unsubClaims();
      unsubRefunds();
    };
  }, [user?.uid]);

  const handleLogout = async () => {
    await logout();
    setCurrentPage('login');
  };

  const handleToggleRole = () => {
    if (!user) return;
    const nextRole =
      user.role === 'customer'
        ? 'reviewer'
        : user.role === 'reviewer'
        ? 'admin'
        : 'customer';
    setUserRole(nextRole);
  };

  // Helper to add an academic test order for the authenticated user directly in Firestore
  const handleSimulateConnectedOrder = async () => {
    if (!user?.uid) return;
    try {
      await createAcademicTestOrder(
        user.uid,
        'Organic Fresh Apples (Pack of 4)',
        120,
        'Fresh Produce'
      );
    } catch (err) {
      console.error('Failed to create academic test order:', err);
    }
  };

  // Initiate Claim from an Order
  const handleInitiateClaimWithOrder = (order: Order, item: OrderItem) => {
    setPreSelectedOrder(order);
    setPreSelectedItem(item);
    setCurrentPage('submit-claim');
  };

  // Claim Analysis Submission Trigger
  const handleAnalyzeClaim = (claimData: Partial<Claim>) => {
    setPendingClaimData(claimData);
    setIsAnalyzingModalOpen(true);
  };

  // Completion of the 3-step AI analysis animation
  const handleAnalysisComplete = async () => {
    setIsAnalyzingModalOpen(false);

    if (!pendingClaimData || !user) return;

    const claimId = Math.floor(10000 + Math.random() * 90000).toString();
    const productPrice = pendingClaimData.productPrice || 120;
    const issueType = pendingClaimData.issueType || 'Spoiled';

    // Run the robust claim verification & evidence check engine
    const analysisResult = await evaluateClaimVerification({
      file: pendingClaimData.imageFile,
      imageUrl: pendingClaimData.imageUrl,
      productName: pendingClaimData.productName || 'Perishable Produce',
      productPrice,
      issueType,
      description: pendingClaimData.description || '',
    });

    // Determine final claim status based on decision outcome
    let claimStatus: ClaimStatus = 'Manual Review';
    let refundAmount = 0;

    if (analysisResult.decision === 'Refund Recommended') {
      claimStatus = 'Refund Approved';
      refundAmount = productPrice; // Matched strictly to actual item purchase price
    } else if (analysisResult.decision === 'Claim Not Supported') {
      claimStatus = 'Rejected';
      refundAmount = 0;
    } else {
      claimStatus = 'Manual Review';
      refundAmount = 0;
    }

    const newClaim: Claim = {
      id: claimId,
      claimId,
      userId: user.uid,
      userName: user.name || user.displayName || 'Customer',
      userEmail: user.email || '',
      orderId: pendingClaimData.orderId || 'ord-01',
      orderNumber: pendingClaimData.orderNumber || '99281',
      productName: pendingClaimData.productName || 'Perishable Product',
      productPrice,
      issueType,
      complaintType: issueType,
      description: pendingClaimData.description || 'Condition defect observed upon unboxing.',
      imageUrl: pendingClaimData.evidenceImageUrl || pendingClaimData.imageUrl,
      evidenceImageUrl: pendingClaimData.evidenceImageUrl || pendingClaimData.imageUrl,
      evidenceStoragePath: pendingClaimData.evidenceStoragePath,
      evidenceFileName: pendingClaimData.evidenceFileName,
      evidenceUploadedAt: pendingClaimData.evidenceUploadedAt || new Date().toISOString(),
      status: claimStatus,
      decision: analysisResult.decision,
      evidenceStatus: analysisResult.evidenceStatus,
      decisionReason: analysisResult.decisionReason,
      aiPrediction: analysisResult.predictedClass,
      aiConfidence: analysisResult.confidence,
      aiSupported: analysisResult.isSupportedCategory,
      modelName: analysisResult.modelName || 'MobileNetV2 Transfer Learning',
      modelVersion: analysisResult.modelVersion || 'MobileNetV2-v1.2',
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      recommendedRefundAmount: refundAmount,
      recommendedRefund: refundAmount,
      aiAnalysis: analysisResult,
    };

    // Save claim to Firestore (triggers real-time listener)
    try {
      await saveClaimToFirestore(newClaim);

      // Save AI analysis audit trail record (Section 19 & 20)
      await saveAiAnalysisRecord({
        analysisId: `ai-${claimId}`,
        userId: user.uid,
        claimId: newClaim.id,
        prediction: analysisResult.predictedClass,
        confidence: analysisResult.confidence,
        supported: analysisResult.isSupportedCategory,
        modelName: analysisResult.modelName || 'MobileNetV2 Transfer Learning',
        modelVersion: analysisResult.modelVersion || 'MobileNetV2-v1.2',
        condition: analysisResult.condition,
        evidenceStatus: analysisResult.evidenceStatus,
        decision: analysisResult.decision,
        createdAt: new Date().toISOString(),
      });

      // If and ONLY if a refund was recommended and approved, save refund to Firestore
      if (newClaim.status === 'Refund Approved' && refundAmount > 0) {
        const newRefund: RefundRecord = {
          id: `ref-${Math.floor(1000 + Math.random() * 9000)}`,
          refundId: `ref-${Math.floor(1000 + Math.random() * 9000)}`,
          userId: user.uid,
          claimId: newClaim.id,
          orderNumber: newClaim.orderNumber,
          productName: newClaim.productName,
          amount: refundAmount,
          status: 'Processing',
          createdAt: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          notes: `AI verified recommendation for ${newClaim.issueType.toLowerCase()} item. Credited to original payment account.`,
        };
        await saveRefundToFirestore(newRefund);
      }
    } catch (err) {
      console.error('Error saving claim/refund to Firestore:', err);
    }

    setSelectedClaimForResult(newClaim);
    setCurrentPage('claim-result');
  };

  // Admin status update handler with Firestore sync
  const handleUpdateClaimStatus = async (
    claimId: string,
    newStatus: ClaimStatus,
    reviewNotes?: string
  ) => {
    try {
      await updateClaimStatusInFirestore(claimId, newStatus, reviewNotes);

      // If admin approved a claim, create refund record in Firestore if not already present
      if (newStatus === 'Refund Approved' && user) {
        const claim = claims.find((c) => c.id === claimId);
        if (claim) {
          const newRefund: RefundRecord = {
            id: `ref-${Math.floor(1000 + Math.random() * 9000)}`,
            refundId: `ref-${Math.floor(1000 + Math.random() * 9000)}`,
            userId: claim.userId || user.uid,
            claimId: claim.id,
            orderNumber: claim.orderNumber,
            productName: claim.productName,
            amount: claim.recommendedRefundAmount || claim.productPrice,
            status: 'Approved',
            createdAt: new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            notes: reviewNotes || 'Approved during administrative quality review.',
          };
          await saveRefundToFirestore(newRefund);
        }
      }
    } catch (err) {
      console.error('Error updating claim status in Firestore:', err);
    }
  };

  // Loading state while checking Firebase auth session
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          <p className="text-xs font-medium text-gray-500">Checking Firebase authentication...</p>
        </div>
      </div>
    );
  }

  // Render Login page standalone if not authenticated or explicitly navigated
  if (currentPage === 'login' || !user) {
    return <LoginPage onLogin={() => setCurrentPage('home')} />;
  }

  return (
    <div className="flex min-h-screen bg-[#fafafa] text-gray-900 font-sans antialiased">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        onLogout={handleLogout}
        activeClaimsCount={claims.length}
      />

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          currentPage={currentPage}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          user={user}
          onToggleRole={handleToggleRole}
          onNavigate={setCurrentPage}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'home' && (
            <HomePage
              user={user}
              orders={orders}
              claims={claims}
              refunds={refunds}
              loading={isDataLoading}
              onNavigate={setCurrentPage}
              onSelectClaim={(claim) => {
                setSelectedClaimForResult(claim);
                setCurrentPage('claim-result');
              }}
            />
          )}

          {currentPage === 'orders' && (
            <OrdersPage
              orders={orders}
              loading={isDataLoading}
              onNavigate={setCurrentPage}
              onInitiateClaimWithOrder={handleInitiateClaimWithOrder}
              onAddTestOrder={handleSimulateConnectedOrder}
            />
          )}

          {currentPage === 'submit-claim' && (
            <SubmitClaimPage
              orders={orders}
              preSelectedOrder={preSelectedOrder}
              preSelectedItem={preSelectedItem}
              onAnalyzeClaim={handleAnalyzeClaim}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'my-claims' && (
            <ClaimsPage
              claims={claims}
              user={user}
              loading={isDataLoading}
              onNavigate={setCurrentPage}
              onSelectClaim={(claim) => {
                setSelectedClaimForResult(claim);
                setCurrentPage('claim-result');
              }}
            />
          )}

          {currentPage === 'refunds' && (
            <RefundsPage
              refunds={refunds}
              loading={isDataLoading}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'ai-analysis' && <AiAnalysisPage onNavigate={setCurrentPage} />}

          {currentPage === 'profile' && (
            <ProfilePage user={user} onLogout={handleLogout} onNavigate={setCurrentPage} />
          )}

          {currentPage === 'admin' && (
            <AdminPage
              claims={claims}
              refunds={refunds}
              user={user}
              onUpdateClaimStatus={handleUpdateClaimStatus}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'claim-result' && (
            <ClaimResultPage
              claim={selectedClaimForResult}
              onNavigate={setCurrentPage}
            />
          )}
        </main>
      </div>

      {/* 3-Step Animated Loading Modal */}
      <LoadingModal
        isOpen={isAnalyzingModalOpen}
        onComplete={handleAnalysisComplete}
        autoComplete={true}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
