```markdown
# SmartClaim - Automated Perishable Claim & Refund Verification Platform

SmartClaim AI is an automated claim verification and refund adjudication platform engineered for quick-commerce and instant grocery supply chains[cite: 1]. The system pairs a MobileNetV2 transfer learning Convolutional Neural Network (CNN) with deterministic decision logic and role-based review workflows to verify produce freshness, detect photographic evidence discrepancies, and automate fair customer resolutions[cite: 1].

Live Application: [SmartClaim AI on Render](https://smartclaim-frontend.onrender.com)

---

## 1. Executive Summary (Project in 4 Sentences)

* **What We Used:** We integrated a MobileNetV2 transfer learning architecture with a FastAPI Python inference backend, a React/Vite web interface, and Firebase cloud services for authentication, storage, and database management[cite: 1].
* **Why We Used It:** We selected this lightweight convolutional architecture to ensure high parameter efficiency, low inference latency, and seamless deployment within cloud hosting environments[cite: 1].
* **What We Analyzed:** We analyzed customer-submitted photographic evidence against reported defect categories across six botanical produce freshness classes[cite: 1].
* **What Output We Obtained:** We generated verified categorical predictions, confidence scores, evidence cross-checking statuses, automated refund recommendations, and supply-chain risk diagnostics[cite: 1].

---

## 2. Problem Statement

In quick-commerce delivery ecosystems, managing perishable claim disputes manually presents substantial challenges:
1. **Operational Bottlenecks:** Human evaluation of incoming damage and spoilage claims is slow, leading to customer dissatisfaction.
2. **Fraud Exposure:** Automated payout systems without visual verification are vulnerable to dishonest claims where undamaged produce is reported as defective.
3. **Subjective Inconsistency:** Manual claim handlers lack uniform standards for assessing biological decay versus minor cosmetic blemishes.

SmartClaim AI addresses these challenges by introducing an objective, computer-vision-assisted triage mechanism that validates customer claims while retaining human-in-the-loop oversight for ambiguous cases[cite: 1].

---

## 3. Technology Stack & Component Rationale

| Layer | Technology | Primary Function & Rationale |
| :--- | :--- | :--- |
| **Deep Learning Base** | MobileNetV2 (ImageNet) | Pretrained convolutional feature extractor using depthwise separable convolutions to balance speed and accuracy[cite: 1]. |
| **Classification Head** | Dense + Dropout + Softmax | Custom transfer learning head for 6-class produce freshness classification with regularized dropout layers[cite: 1]. |
| **Backend API** | FastAPI (Python) | High-performance asynchronous API server handling image ingestion, preprocessing, tensor conversion, and inference[cite: 1]. |
| **Frontend UI** | React 19 + Vite + TypeScript | Client-side dashboard with state management, modular components, and dynamic role-switching views[cite: 1]. |
| **Authentication** | Firebase Auth | Secure Google OAuth session management and user identification[cite: 1]. |
| **Database** | Cloud Firestore | Real-time NoSQL storage for claims, test orders, audit logs, and refund transactions[cite: 1]. |
| **Object Storage** | Firebase Storage | Permanent storage for uploaded photographic evidence with secure path isolation[cite: 1]. |

---

## 4. Model Architecture & Evaluation Metrics

The classification engine is trained and evaluated on a benchmark produce freshness dataset covering six discrete classes[cite: 1]:
1. Fresh Apple[cite: 1]
2. Fresh Banana[cite: 1]
3. Fresh Orange[cite: 1]
4. Rotten Apple[cite: 1]
5. Rotten Banana[cite: 1]
6. Rotten Orange[cite: 1]

### Test Performance Metrics (MDS471 Benchmark)

* **Overall Test Accuracy:** 94.8%[cite: 1]
* **Macro Precision:** 94.5%[cite: 1]
* **Macro Recall:** 94.2%[cite: 1]
* **Macro F1-Score:** 94.3%[cite: 1]
* **Validation Loss:** 0.162[cite: 1]
* **Safety Confidence Threshold:** 85.0%[cite: 1]

### Safety & Guardrail Mechanisms

* **Laplacian Blur Check:** Measures discrete Laplacian operator variance; images scoring below a 14.0 threshold are flagged as blurry and routed to manual triage rather than forcing an uncertain inference[cite: 1].
* **Confidence Gating:** Predictions with confidence under 85.0% are treated as inconclusive and transferred to a human reviewer[cite: 1].
* **Conflict Detection Logic:** When a user reports spoilage but the model detects fresh produce with high confidence, automated payouts are withheld, preventing fraudulent settlements[cite: 1].
* **Domain Scope Limitation:** Non-freshness issues (e.g., package tearing, leakage, crushing) automatically bypass the produce CNN model and queue directly for manual agent evaluation[cite: 1].

---

## 5. End-to-End Workflow & Output Results

1. **Order & Defect Selection:** The user selects a delivered grocery item and specifies the defect type (e.g., Spoiled, Damaged, Expired)[cite: 1].
2. **Evidence Ingestion:** The user uploads photographic proof, which is validated, scaled, and uploaded to Firebase Storage[cite: 1].
3. **CNN Preprocessing & Inference:** The image is resized to (224, 224, 3) and normalized to [-1.0, 1.0] before being evaluated by the MobileNetV2 network[cite: 1].
4. **Decision Synthesis:**
   * **Evidence Supported:** Spoilage is confirmed with >= 85% confidence. The system issues a "Refund Recommended" status and queues a price-matched refund record[cite: 1].
   * **Conflict Detected / Inconclusive:** Spoilage is not corroborated or confidence is low. The system assigns a "Manual Review Required" status[cite: 1].
5. **Operational Risk Attribution:** The engine estimates diagnostic risk indicators across Transportation, Storage/Hub, and Shelf Expiry to assist supply chain managers in root-cause tracking[cite: 1].

---

## 6. Local Setup and Installation Guide

Follow these steps to run the complete solution locally on your system.

### Prerequisites
* Node.js (v18.0 or higher)
* Python (v3.10 or higher)
* Git

---

### Step 1: Clone the Repository
```bash
git clone [https://github.com/Nelcy2005/smartclaim.git](https://github.com/Nelcy2005/smartclaim.git)
cd smartclaim

```

---

### Step 2: Backend Setup (FastAPI)

```bash
# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment
# On Windows:
python -m venv venv
venv\Scripts\activate

# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

```

The backend service will be available at `http://localhost:8000`. You can verify its health status at `http://localhost:8000/health`.

---

### Step 3: Frontend Setup (React & Vite)

```bash
# Open a new terminal and return to project root
cd ..

# Install Node dependencies
npm install

# Create a .env file in the root directory and add your Firebase credentials:
# VITE_FIREBASE_API_KEY=your_api_key
# VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
# VITE_FIREBASE_PROJECT_ID=your_project_id
# VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
# VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
# VITE_FIREBASE_APP_ID=your_app_id
# VITE_FIREBASE_DATABASE_ID=your_database_id
# VITE_AI_BACKEND_URL=http://localhost:8000

# Start the Vite development server
npm run dev

```

The frontend interface will open at `http://localhost:3000` or `http://localhost:5173`.

---

## 7. Cloud Deployment Configuration (Render)

### Python Backend (Web Service)

* **Environment:** Python 3


* **Root Directory:** `backend`

* **Build Command:** `pip install -r requirements.txt`

* **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`


### React Frontend (Static Site)

* **Build Command:** `npm run build`

* **Publish Directory:** `dist`

* **Redirects/Rewrites:** Add a Rewrite rule routing `/*` to `/index.html`

---

## 8. Future Scope

* **Taxonomy Expansion:** Broaden the training dataset to include vegetables, dairy products, bakery items, and meats.
* **EXIF Metadata Auditing:** Analyze image capture metadata (timestamp, geolocation, camera parameters) to prevent reuse of external stock photos.
* **Multi-Modal Damage Detection:** Train complementary object detection models (e.g., YOLO) to identify physical container punctures, liquid spills, and box crushing.
* **ERP & Payment Gateway Integration:** Establish live webhooks with enterprise supply chain software and automated payment settlement gateways for instant real-time bank reversals.

```

```
