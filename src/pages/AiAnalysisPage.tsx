import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Truck,
  Building2,
  Calendar,
  ShieldAlert,
  Info,
  BarChart3,
  GitBranch,
} from 'lucide-react';
import { NavigationPage } from '../types';

interface AiAnalysisPageProps {
  onNavigate: (page: NavigationPage) => void;
}

export const AiAnalysisPage: React.FC<AiAnalysisPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'model' | 'metrics' | 'categories' | 'responsibility'>('model');

  // Actual classes from the project dataset (Section 34)
  const supportedClasses = [
    { name: 'Fresh Apple', category: 'Fruit / Fresh', condition: 'Fresh', status: 'Active' },
    { name: 'Fresh Banana', category: 'Fruit / Fresh', condition: 'Fresh', status: 'Active' },
    { name: 'Fresh Orange', category: 'Fruit / Fresh', condition: 'Fresh', status: 'Active' },
    { name: 'Rotten Apple', category: 'Fruit / Spoilage', condition: 'Spoiled', status: 'Active' },
    { name: 'Rotten Banana', category: 'Fruit / Spoilage', condition: 'Spoiled', status: 'Active' },
    { name: 'Rotten Orange', category: 'Fruit / Spoilage', condition: 'Spoiled', status: 'Active' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            AI Model & Verification Lab
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            MobileNetV2 Transfer Learning Architecture, Evaluation Metrics, and Evidence Check Rules (MDS471).
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('submit-claim')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Test Claim Verification</span>
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('model')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'model'
              ? 'bg-blue-50 text-blue-700 border border-blue-100'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Model Architecture
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'metrics'
              ? 'bg-blue-50 text-blue-700 border border-blue-100'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Evaluation Metrics (MDS471)
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-blue-50 text-blue-700 border border-blue-100'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Supported Categories ({supportedClasses.length})
        </button>
        <button
          onClick={() => setActiveTab('responsibility')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'responsibility'
              ? 'bg-blue-50 text-blue-700 border border-blue-100'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Responsibility Indicators
        </button>
      </div>

      {/* TAB 1: Model Architecture */}
      {activeTab === 'model' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <span className="text-xs font-medium text-gray-500">Base Backbone</span>
              <p className="text-lg font-bold text-gray-900 mt-1">MobileNetV2 (ImageNet)</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Lightweight inverted residual depthwise separable convolutions
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <span className="text-xs font-medium text-gray-500">Transfer Learning Strategy</span>
              <p className="text-lg font-bold text-gray-900 mt-1">Frozen Base + Custom Head</p>
              <p className="text-[11px] text-gray-400 mt-1">
                GlobalAveragePooling2D + BatchNorm + Dense(128) + Dropout(0.35) + Softmax(6)
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <span className="text-xs font-medium text-gray-500">Inference & Safety</span>
              <p className="text-lg font-bold text-gray-900 mt-1">85% Safety Threshold</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Sub-200ms verification with Laplacian variance blur detection
              </p>
            </div>
          </div>

          {/* Pipeline Details */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900">End-to-End Classification Pipeline</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { step: '1. Ingestion & Quality', desc: 'Format check, resolution validation & Laplacian blur variance check' },
                { step: '2. Preprocessing', desc: 'Resizing to (224, 224, 3) RGB and normalized to [-1.0, 1.0] tensor' },
                { step: '3. Inference', desc: 'Convolutional feature extraction via MobileNetV2 base + Softmax head' },
                { step: '4. Evidence Check', desc: 'Case A-E validation against customer report & confidence threshold' },
              ].map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-xs font-bold text-blue-700">{p.step}</span>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strict Safety Rule Banner */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-amber-900">
                  Unknown & Out-of-Distribution Image Handling
                </h3>
                <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                  SmartClaim AI will <strong>never force a prediction</strong> on unrelated or blurry images outside its trained classes. When confidence falls below 85%, the system routes the claim to manual agent review.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Model Metrics */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-gray-200 bg-white text-center">
              <span className="text-xs font-medium text-gray-500 uppercase">Test Accuracy</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">94.8%</p>
              <span className="text-[10px] text-emerald-600 font-semibold">+2.1% vs baseline</span>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 bg-white text-center">
              <span className="text-xs font-medium text-gray-500 uppercase">Macro Precision</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">94.5%</p>
              <span className="text-[10px] text-gray-400">Low false positive rate</span>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 bg-white text-center">
              <span className="text-xs font-medium text-gray-500 uppercase">Macro Recall</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">94.2%</p>
              <span className="text-[10px] text-gray-400">High spoilage detection</span>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 bg-white text-center">
              <span className="text-xs font-medium text-gray-500 uppercase">F1-Score</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">94.3%</p>
              <span className="text-[10px] text-gray-400">Balanced harmonic mean</span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900">Academic Training & Evaluation Setup (MDS471)</h2>
              <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                MobileNetV2-v1.2
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                <span className="font-bold text-gray-900 block">Hyperparameters & Optimization</span>
                <ul className="space-y-1 text-gray-600">
                  <li>&bull; <strong>Optimizer:</strong> Adam (Initial LR = 1e-3, Fine-tune LR = 1e-5)</li>
                  <li>&bull; <strong>Loss Function:</strong> Categorical Crossentropy</li>
                  <li>&bull; <strong>Batch Size:</strong> 32 with dynamic shuffling</li>
                  <li>&bull; <strong>Regularization:</strong> L2 Weight Decay (1e-4) + Dropout (0.35)</li>
                  <li>&bull; <strong>Validation Loss:</strong> 0.162</li>
                </ul>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                <span className="font-bold text-gray-900 block">Safe Evidence Check Thresholds</span>
                <ul className="space-y-1 text-gray-600">
                  <li>&bull; <strong>High-Confidence Bar:</strong> &ge; 85.0% (Enables automated recommendation)</li>
                  <li>&bull; <strong>Uncertain Bar:</strong> &lt; 85.0% (Routes to human QA queue)</li>
                  <li>&bull; <strong>Blur Check (Laplacian Variance):</strong> Minimum 14.0 threshold</li>
                  <li>&bull; <strong>Physical Damage Safeguard:</strong> Automatically flags non-biological claims</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Supported Categories */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-1">Supported Training Categories</h2>
            <p className="text-xs text-gray-500 mb-4">
              These are the actual 6 classes present in the academic freshness dataset.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {supportedClasses.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-gray-800">{item.name}</p>
                    <p className="text-[11px] text-gray-400">{item.category}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.condition === 'Fresh'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.condition}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Responsibility Indicators */}
      {activeTab === 'responsibility' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Operational Risk Indicators</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Multi-factor operational estimation across supply chain segments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span>Transportation Risk</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Evaluates transit duration, handling shock for fragile goods, and temperature fluctuations.
                </p>
                <div className="text-[11px] font-medium text-blue-700 bg-blue-50 p-2 rounded">
                  Status: &quot;Transportation Review Required&quot; when flagged.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <Building2 className="h-4 w-4 text-amber-600" />
                  <span>Storage Risk</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Evaluates dark store batch age, cold-storage duration, and humidity exposure.
                </p>
                <div className="text-[11px] font-medium text-amber-700 bg-amber-50 p-2 rounded">
                  Status: &quot;Storage Review Required&quot; when flagged.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span>Expiry Risk</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Evaluates shelf-life thresholds against delivery timestamp to identify expired dispatches.
                </p>
                <div className="text-[11px] font-medium text-gray-700 bg-gray-100 p-2 rounded">
                  Status: &quot;Inventory Audit Triggered&quot; when flagged.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Fair Treatment Policy:</strong> Delivery partners are never penalized automatically based on image classification alone. All flags are routed to managerial review.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
