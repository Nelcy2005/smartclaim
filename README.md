# SmartClaim AI — Automated Perishable Claim & Refund Verification Platform

Welcome to **SmartClaim AI**! This is an automated adjudication engine designed for instant grocery delivery platforms to verify customer refund claims fairly and instantly using Computer Vision.

**Live Deployment:** [smartclaim-frontend.onrender.com](https://smartclaim-frontend.onrender.com)

---

## 📌 Project at a Glance

* **What we used:** A MobileNetV2 Deep Learning architecture, a FastAPI (Python) backend, a React/Vite frontend, and Firebase for secure database and storage.
* **Why we used it:** MobileNetV2 is incredibly fast and lightweight, allowing us to perform high-accuracy image classification in the cloud without needing expensive GPU servers. 
* **What we analyzed:** We analyzed customer-uploaded photos of groceries against 6 specific classes (Fresh vs. Rotten Apples, Bananas, and Oranges) to cross-check their damage claims.
* **What output we got:** The AI outputs a verified freshness prediction, a confidence score (requiring >85% for automation), and an instant decision: either an **Automated Refund** or routing to **Manual Review** if the evidence conflicts.

---

## 🛠️ Technology Stack
* **Machine Learning:** TensorFlow, MobileNetV2 (Transfer Learning)
* **Backend:** FastAPI, Python, Uvicorn
* **Frontend:** React 19, Vite, TypeScript, Tailwind CSS
* **Cloud & Security:** Firebase (Auth, Firestore, Cloud Storage), Render

---

## 🚀 How to Run Locally

Follow these quick steps to get the project running on your own computer:

### 1. Start the Backend (FastAPI)
Open your terminal, navigate to the `backend` folder, and run:
```bash
cd backend
python -m venv venv           # Create a virtual environment
source venv/bin/activate      # Mac/Linux (Use `venv\Scripts\activate` on Windows)
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

2. Start the Frontend (React)
Open a new terminal, navigate to the root folder, and run:
npm install                   # Install dependencies
npm run dev                   # Start the development server

🔮 Future Scope
Broader Grocery Dataset: Expanding the AI to recognize vegetables, dairy, and meat products.

Fraud Prevention via Metadata: Extracting EXIF data (time/location) from photos to prevent users from uploading fake stock images from the internet.

Live API Integrations: Connecting the platform directly to live e-commerce inventory systems and payment gateways for real-world automated bank reversals.
