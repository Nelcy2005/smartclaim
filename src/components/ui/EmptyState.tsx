import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-gray-200 bg-white">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400 border border-gray-100 mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs text-gray-500 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
