import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function ModalSubscriptionInformation({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl">
        <button
          className="absolute top-4 right-4 text-gray-400 transition hover:text-gray-600"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        {title && (
          <h2 className="mb-4 text-center text-2xl font-semibold text-gray-900">
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>
  );
}
