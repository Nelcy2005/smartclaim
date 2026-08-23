import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface LoadingModalProps {
  isOpen: boolean;
  onComplete?: () => void;
  autoComplete?: boolean;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  onComplete,
  autoComplete = true,
}) => {
  const [stage, setStage] = useState<number>(0);

  const stages = [
    {
      title: 'Checking your image...',
      desc: 'Validating format, resolution, and image clarity checks',
    },
    {
      title: 'Running AI analysis...',
      desc: 'MobileNetV2 CNN extracting convolutional features and calculating class probabilities',
    },
    {
      title: 'Comparing the image with your report...',
      desc: 'Evaluating customer claim against AI visual prediction and confidence threshold',
    },
    {
      title: 'Preparing your result...',
      desc: 'Finalizing evidence verification status and computing claim decision',
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setStage(0);
      return;
    }

    if (!autoComplete) return;

    const timer1 = setTimeout(() => setStage(1), 600);
    const timer2 = setTimeout(() => setStage(2), 1200);
    const timer3 = setTimeout(() => setStage(3), 1800);
    const timer4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isOpen, autoComplete, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 border border-gray-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                <Sparkles className="h-8 w-8 animate-pulse" />
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                </div>
              </div>

              <div className="h-16 flex flex-col items-center justify-center">
                <motion.h4
                  key={stage}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg font-semibold text-gray-900"
                >
                  {stages[stage].title}
                </motion.h4>
                <motion.p
                  key={`desc-${stage}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-xs text-gray-500 max-w-xs"
                >
                  {stages[stage].desc}
                </motion.p>
              </div>

              {/* Step indicator */}
              <div className="mt-6 w-full space-y-2">
                {stages.map((stg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-left transition-all ${
                      idx === stage
                        ? 'bg-blue-50 border border-blue-200 text-blue-900'
                        : idx < stage
                        ? 'bg-gray-50 text-gray-700'
                        : 'opacity-40 text-gray-400'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {idx < stage ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : idx === stage ? (
                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{stg.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="h-4 w-4 text-gray-400" />
                <span>SmartClaim AI verification engine running</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
