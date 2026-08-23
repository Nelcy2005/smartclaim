import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  X,
  AlertCircle,
  CheckCircle2,
  Package,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Claim, ClaimIssueType, NavigationPage, Order, OrderItem } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  validateEvidenceFile,
  validateImageReadable,
  uploadClaimEvidenceImage,
  deleteClaimEvidenceImage,
  StorageUploadResult,
  UploadStatus,
} from '../services/storageService';

interface SubmitClaimPageProps {
  orders: Order[];
  preSelectedOrder?: Order | null;
  preSelectedItem?: OrderItem | null;
  onAnalyzeClaim: (claimData: Partial<Claim>) => void;
  onNavigate: (page: NavigationPage) => void;
}

export const SubmitClaimPage: React.FC<SubmitClaimPageProps> = ({
  orders,
  preSelectedOrder,
  preSelectedItem,
  onAnalyzeClaim,
  onNavigate,
}) => {
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(preSelectedOrder?.id || '');
  const [selectedProductId, setSelectedProductId] = useState<string>(preSelectedItem?.id || '');
  const [issueType, setIssueType] = useState<ClaimIssueType>('Spoiled');
  const [description, setDescription] = useState<string>('');

  // Pre-generate a stable claimId for storage path: claims/{userId}/{claimId}/evidence/{fileName}
  const [claimId] = useState<string>(() => Math.floor(10000 + Math.random() * 90000).toString());

  // Image & Upload States
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadResult, setUploadResult] = useState<StorageUploadResult | null>(null);

  // Form error & loading states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync if preSelected props change
  useEffect(() => {
    if (preSelectedOrder) {
      setSelectedOrderId(preSelectedOrder.id);
    }
    if (preSelectedItem) {
      setSelectedProductId(preSelectedItem.id);
      setCurrentStep(3); // jump to problem selection
    }
  }, [preSelectedOrder, preSelectedItem]);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const selectedProduct = selectedOrder?.items.find((i) => i.id === selectedProductId);

  const issueOptions: { type: ClaimIssueType; label: string; desc: string }[] = [
    { type: 'Spoiled', label: 'Spoiled / Rotten', desc: 'Mold, decay, bad odor, or discoloration' },
    { type: 'Damaged', label: 'Damaged / Crushed', desc: 'Broken packaging, crushed product, or dented seal' },
    { type: 'Leaking', label: 'Leaking Liquid', desc: 'Container puncture or spilled packaging' },
    { type: 'Melted', label: 'Melted / Thawed', desc: 'Frozen product melted due to temperature breach' },
    { type: 'Expired', label: 'Expired Product', desc: 'Passed expiry or "best before" date on delivery' },
    { type: 'Wrong product', label: 'Wrong Item', desc: 'Different item delivered than ordered' },
    { type: 'Other', label: 'Other Quality Issue', desc: 'Other quality defects or packaging irregularities' },
  ];

  /**
   * Complete image selection, validation & Firebase Storage upload workflow
   */
  const handleFileSelected = async (file: File | null) => {
    setErrorMessage(null);
    if (!file) return;

    // 1. Validate file format and size
    const fileValidation = validateEvidenceFile(file);
    if (!fileValidation.isValid) {
      setUploadStatus('error');
      setErrorMessage(fileValidation.errorMessage || 'Please upload a JPG, JPEG, PNG or WEBP image under 10 MB.');
      return;
    }

    // 2. Validate image can actually be read / decoded
    const readabilityValidation = await validateImageReadable(file);
    if (!readabilityValidation.isValid) {
      setUploadStatus('error');
      setErrorMessage(
        readabilityValidation.errorMessage || 'The image could not be read. Please upload another image.'
      );
      return;
    }

    // 3. Clean up previous uploaded image if replacing
    if (uploadResult?.storagePath) {
      try {
        await deleteClaimEvidenceImage(uploadResult.storagePath);
      } catch (err) {
        console.warn('Old file cleanup error:', err);
      }
    }

    // 4. Set local preview
    setSelectedImage(file);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 5. Upload to Firebase Storage
    if (!user?.uid) {
      setUploadStatus('error');
      setErrorMessage('You need to sign in before uploading evidence.');
      return;
    }

    setUploadStatus('uploading');

    try {
      const result = await uploadClaimEvidenceImage({
        userId: user.uid,
        claimId,
        file,
      });

      setUploadResult(result);
      setUploadStatus('uploaded');
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Storage upload failed:', err);
      setUploadStatus('error');
      setErrorMessage(err.message || 'Upload failed. Please try again.');
    }
  };

  /**
   * Handle image removal & Storage cleanup
   */
  const handleRemoveImage = async () => {
    if (uploadResult?.storagePath) {
      try {
        await deleteClaimEvidenceImage(uploadResult.storagePath);
      } catch (err) {
        console.warn('Storage cleanup error:', err);
      }
    }

    setSelectedImage(null);
    setImagePreview(null);
    setUploadResult(null);
    setUploadStatus('idle');
    setErrorMessage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handle replace image trigger
   */
  const handleReplaceImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  /**
   * Form submit - validates and triggers AI verification & Firestore save
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isSubmitting) return;

    if (!selectedOrder) {
      setErrorMessage('Please select an order before submitting.');
      setCurrentStep(1);
      return;
    }
    if (!selectedProduct) {
      setErrorMessage('Please select the affected product.');
      setCurrentStep(2);
      return;
    }
    if (!selectedImage || !uploadResult || uploadStatus !== 'uploaded') {
      if (uploadStatus === 'uploading') {
        setErrorMessage('Please wait for the image upload to complete.');
      } else {
        setErrorMessage('Please upload a product photo for AI condition verification.');
      }
      setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);

    onAnalyzeClaim({
      id: claimId,
      claimId,
      orderId: selectedOrder.id,
      orderNumber: selectedOrder.orderNumber,
      productName: selectedProduct.productName,
      productPrice: selectedProduct.unitPrice * selectedProduct.quantity,
      issueType,
      complaintType: issueType,
      description: description.trim() || 'No additional customer description provided.',
      imageFile: selectedImage,
      imageUrl: uploadResult.downloadUrl,
      evidenceImageUrl: uploadResult.downloadUrl,
      evidenceStoragePath: uploadResult.storagePath,
      evidenceFileName: uploadResult.fileName,
      evidenceUploadedAt: uploadResult.uploadedAt,
      recommendedRefundAmount: selectedProduct.unitPrice * selectedProduct.quantity,
      recommendedRefund: selectedProduct.unitPrice * selectedProduct.quantity,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Submit Claim Verification</h1>
          <p className="text-xs text-gray-500 mt-1">
            Follow the guided steps to submit product evidence for AI verification and refund calculation.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Stepper Progress */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-6 gap-2 text-center">
          {[
            { num: 1, label: 'Order' },
            { num: 2, label: 'Product' },
            { num: 3, label: 'Problem' },
            { num: 4, label: 'Photo' },
            { num: 5, label: 'Notes' },
            { num: 6, label: 'Analyze' },
          ].map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`flex flex-col items-center cursor-pointer transition-all ${
                  isCurrent
                    ? 'text-blue-600 font-semibold'
                    : isCompleted
                    ? 'text-gray-700'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1 ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-50'
                      : isCompleted
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                </div>
                <span className="text-[11px] truncate w-full">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Notice</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Form Box */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
        {/* STEP 1: Select Order */}
        <div className={`space-y-3 ${currentStep !== 1 ? 'hidden' : ''}`}>
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900">Step 1: Select Delivered Order</h2>
            <p className="text-xs text-gray-500">Choose the order containing the affected product.</p>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50">
              <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-700">No orders connected yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Please connect or simulate an order to proceed with claim submission.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('orders')}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer"
              >
                Go to Orders Page
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setSelectedProductId(order.items[0]?.id || '');
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedOrderId === order.id
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/10'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">Order #{order.orderNumber}</span>
                    <span className="text-xs font-semibold text-blue-600">₹{order.totalAmount}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {order.orderDate} &bull; Delivered {order.deliveryTime}
                  </p>
                  <div className="mt-2 text-xs text-gray-600 truncate">
                    {order.items.map((i) => i.productName).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={!selectedOrderId}
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <span>Next: Select Product</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* STEP 2: Select Product from Order */}
        <div className={`space-y-3 ${currentStep !== 2 ? 'hidden' : ''}`}>
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900">Step 2: Select Affected Product</h2>
            <p className="text-xs text-gray-500">Pick the specific item that has a quality or condition issue.</p>
          </div>

          {selectedOrder ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedOrder.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedProductId(item.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedProductId === item.id
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/10'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{item.productName}</span>
                    <span className="text-xs font-semibold text-gray-800">₹{item.totalPrice}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Qty: {item.quantity} &bull; Unit price: ₹{item.unitPrice}
                  </p>
                  <span className="mt-2 inline-block text-[10px] uppercase font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500">Please select an order first.</div>
          )}

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={!selectedProductId}
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <span>Next: Select Problem</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* STEP 3: Select Problem */}
        <div className={`space-y-3 ${currentStep !== 3 ? 'hidden' : ''}`}>
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900">Step 3: Select the Problem</h2>
            <p className="text-xs text-gray-500">Identify the nature of the issue experienced.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {issueOptions.map((opt) => (
              <div
                key={opt.type}
                onClick={() => setIssueType(opt.type)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  issueType === opt.type
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/10'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <p className="text-xs font-bold text-gray-900">{opt.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <span>Next: Upload Photo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* STEP 4: Upload Image to Firebase Storage */}
        <div className={`space-y-4 ${currentStep !== 4 ? 'hidden' : ''}`}>
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900">Step 4: Upload Product Evidence Photo</h2>
            <p className="text-xs text-gray-500">
              Provide photographic proof of the product. Images are uploaded to secure Firebase Storage for AI verification.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
          />

          {!imagePreview ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/50'
                  : 'border-gray-200 hover:border-gray-400 bg-gray-50/50'
              }`}
            >
              <div className="h-12 w-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-blue-600 mb-3 shadow-xs">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-gray-800">
                Click to upload product image or drag and drop
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                JPG, JPEG, PNG or WEBP (Maximum file size: 10 MB)
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <span className="text-xs font-bold text-gray-900">Evidence Image</span>
                {uploadStatus === 'uploading' && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Uploading evidence...</span>
                  </span>
                )}
                {uploadStatus === 'uploaded' && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Evidence uploaded successfully.</span>
                  </span>
                )}
                {uploadStatus === 'error' && (
                  <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Upload failed. Please try again.</span>
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Image Preview */}
                <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <img
                    src={imagePreview}
                    alt="Claim Evidence Preview"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Image Metadata & Controls */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div>
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {selectedImage?.name || 'evidence-photo.jpg'}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {selectedImage ? `${(selectedImage.size / (1024 * 1024)).toFixed(2)} MB` : ''} &bull; {selectedImage?.type || 'image/jpeg'}
                    </p>
                  </div>

                  {/* Storage destination indicator */}
                  {uploadResult && (
                    <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 truncate">
                      <span className="font-medium text-gray-700">Storage Path: </span>
                      <span className="text-gray-500 font-mono text-[10px]">{uploadResult.storagePath}</span>
                    </div>
                  )}

                  {/* Action Controls: Remove / Replace */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleReplaceImage}
                      disabled={uploadStatus === 'uploading'}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Replace</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={uploadStatus === 'uploading'}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={!selectedImage || uploadStatus !== 'uploaded'}
              onClick={() => setCurrentStep(5)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <span>Next: Add Notes</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* STEP 5: Description */}
        <div className={`space-y-4 ${currentStep !== 5 ? 'hidden' : ''}`}>
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900">Step 5: Customer Description</h2>
            <p className="text-xs text-gray-500">Provide any specific details about the delivery or product issue.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              What happened? (Optional details)
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened..."
              className="w-full rounded-xl border border-gray-200 p-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-600 outline-none"
            />
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <span>Next: Review & Analyze</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* STEP 6: Review & Analyze */}
        <div className={`space-y-4 ${currentStep !== 6 ? 'hidden' : ''}`}>
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900">Step 6: Review & Trigger AI Analysis</h2>
            <p className="text-xs text-gray-500">Review your claim summary before launching MobileNetV2 verification.</p>
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Selected Order:</span>
              <span className="font-semibold text-gray-800">Order #{selectedOrder?.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Product:</span>
              <span className="font-semibold text-gray-800">{selectedProduct?.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Reported Problem:</span>
              <span className="font-semibold text-gray-800">{issueType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Item Cost (Max Refund):</span>
              <span className="font-bold text-blue-700">
                ₹{selectedProduct ? selectedProduct.unitPrice * selectedProduct.quantity : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Photo Evidence:</span>
              <span className="font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Uploaded to Firebase Storage</span>
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
            <button
              id="analyze-claim-btn"
              type="submit"
              disabled={isSubmitting || uploadStatus !== 'uploaded'}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze Claim</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
