# SmartClaim AI — AI-Powered Instant Grocery Claim & Refund Verification Platform

SmartClaim AI is an enterprise-grade, human-in-the-loop claim verification and refund automation system designed for instant grocery and quick-commerce platforms. It pairs real-time convolutional neural network (CNN) image classification with deterministic decision trees and role-based reviewer workflows to verify product damage or spoilage, safeguard business integrity, and accelerate fair customer refunds.

---

## 🌟 Key Features

### 1. Customer Self-Service Claim Submission
- **Guided 6-Step Workflow**: Order Selection → Product Selection → Defect Categorization → Permanent Photo Evidence Upload → Customer Notes → CNN Analysis.
- **Permanent Evidence Storage**: Photo proofs are securely stored in Firebase Cloud Storage (`claims/{userId}/{claimId}/evidence/{fileName}`) with signed download URLs.
- **Real-Time Notification Ledger**: In-app notifications alerting users whenever a claim is analyzed, moved to manual triage, approved, or settled.

### 2. MobileNetV2 Transfer Learning Image Analysis
- **Edge Inference Engine**: Leverages TensorFlow.js with a pretrained MobileNetV2 convolutional backbone fine-tuned for grocery quality diagnostics.
- **6 Active Botanical Defect Classes**:
  - `Fresh Apple`, `Fresh Banana`, `Fresh Orange` (Fresh Produce)
  - `Rotten Apple`, `Rotten Banana`, `Rotten Orange` (Spoiled / Biological Decay)
- **Laplacian Blur & Variance Validation**: Filters out low-quality, out-of-focus, or unreadable images prior to tensor feeding.
- **Safety Confidence Threshold (85%)**: Predictions below 85.0% confidence automatically bypass automated recommendations and route directly to manual agent review.

### 3. Claim Decision Engine & Safeguards
- **Evidence Supported (Corroborated)**: AI decay classification matches customer's reported spoilage with high confidence → Automated 100% item refund recommendation.
- **Evidence Conflict Detection**: Customer reports spoilage, but AI identifies fresh produce with high confidence → Flags conflict and routes to human reviewer without automated payout.
- **Category Scope Enforcement**: Physical damage, broken packaging, or leaks outside produce freshness are routed to human review with explicit rationale.
- **Human-in-the-Loop Safeguard Notice**: Clear, persistent disclaimer that *"AI analysis is an assistance tool and may not always be correct; humans retain final decision authority."*

### 4. Admin & Reviewer Adjudication Console
- **Manual Review Queue**: Multi-tab review console with filters for pending reviews, AI recommendations, approvals, and rejections.
- **Adjudication Modal**: Deep-dive inspector displaying customer claims, permanent photo proof, AI model confidence breakdown, decision logs, and action controls:
  - Approve Refund (triggers immediate simulated ledger credit).
  - Reject Claim (with mandatory structured justification).
  - Request Additional Evidence (with customer notification).
- **Accountability & Root-Cause Analysis**: Identifies liability distribution (Transportation, Warehouse Hub, Vendor Shelf Expiry) without penalizing riders arbitrarily.
- **Audit Trail & System Logs**: Immutable record of all automated evaluations and reviewer actions with timestamps, user IDs, and notes.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18 (TypeScript), Tailwind CSS, Lucide Icons, Vite
- **Backend & API Server**: Node.js + Express with Vite middleware
- **Authentication**: Firebase Authentication (Google OAuth & Email Credentials)
- **Database**: Firebase Firestore with strict Security Rules (RBAC / ABAC)
- **Storage**: Firebase Storage for permanent customer evidence uploads
- **Computer Vision**: TensorFlow.js MobileNetV2 Transfer Learning Model

---

## 🔒 Security & Data Privacy (Firestore & Storage Rules)

1. **Customer Data Scoping**: Customers can read and write **only** their own documents:
   - `users/{userId}`: Scoped to `auth.uid == userId`.
   - `orders/{orderId}`: Filtered by `auth.uid == resource.data.userId`.
   - `claims/{claimId}`: Filtered by `auth.uid == resource.data.userId`.
   - `refunds/{refundId}`: Filtered by `auth.uid == resource.data.userId`.
2. **Reviewer & Admin Protection**:
   - Only users with verified `reviewer` or `admin` roles in Firestore can access the adjudication console, approve refunds, or update claim status.
3. **Role Tampering Prevention**:
   - Customer clients cannot modify the `role` field on their user record.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/smartclaim-ai.git
cd smartclaim-ai

# Install dependencies
npm install

# Run development server
npm run dev
```
The application will launch on `http://localhost:3000`.

### Production Build
```bash
# Compile client assets and backend bundle
npm run build

# Start production server
npm start
```

---

## 🌐 Deployment to Render

1. **Service Type**: Web Service
2. **Environment**: Node
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start`
5. **Port**: Bind to port `3000` (or `PORT` environment variable).

---

## 📄 License & Attribution
Developed for the **MDS471 Capstone Benchmark** — AI in Supply Chain & Quick-Commerce Quality Assurance.
