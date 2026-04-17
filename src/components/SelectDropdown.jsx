import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Custom dropdown replacing native <select> across the app.
 *
 * Props:
 *   value        – currently selected value (string)
 *   onChange     – (value: string) => void
 *   options      – [{ value: string, label: string }]
 *   placeholder  – string shown when no value selected
 *   className    – optional extra classes on the trigger button
 *   disabled     – boolean
 */
export default function SelectDropdown({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  className = "",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((o) => String(o.value) === String(value));

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 bg-gray-50 text-[#002856] px-4 py-3 rounded-xl border outline-none transition-colors text-left ${
          open ? "border-[#002856]" : "border-gray-200 hover:border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`truncate text-sm ${
            selectedOption ? "text-[#002856]" : "text-gray-400"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown list */}
      <AnimatePresence>
        {open && (
          <motion.ul
            key="dropdown"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-auto max-h-56 py-1"
          >
            {/* Placeholder option */}
            <li>
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                  !value
                    ? "bg-gray-50 text-[#002856] font-semibold"
                    : "text-gray-400 hover:bg-gray-50"
                }`}
              >
                {placeholder}
                {!value && <Check className="w-3.5 h-3.5 text-[#002856]" />}
              </button>
            </li>
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(String(option.value))}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                    String(option.value) === String(value)
                      ? "bg-blue-50 text-[#002856] font-semibold"
                      : "text-[#002856] hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                  {String(option.value) === String(value) && (
                    <Check className="w-3.5 h-3.5 text-[#002856]" />
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
