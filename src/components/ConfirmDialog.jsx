import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDangerous = true,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl p-6 z-50 shadow-xl"
          >
            {/* Icon */}
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-[#002856] text-center mb-2">
              {title}
            </h3>

            {/* Message */}
            <p className="text-gray-600 text-center mb-6">{message}</p>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="flex-1 py-3 px-4 bg-gray-100 text-[#002856] font-medium rounded-xl"
              >
                {cancelText}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className={`flex-1 py-3 px-4 font-medium rounded-xl ${
                  isDangerous
                    ? "bg-red-500 text-white"
                    : "bg-[#edb843] text-[#002856]"
                }`}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
