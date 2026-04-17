import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Custom dropdown replacing native <select> across the app.
 *
 * Renders the option list via a React portal so it is never clipped
 * by any ancestor's overflow:hidden (e.g. animated height panels).
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
  const [dropdownStyle, setDropdownStyle] = useState({});
  const triggerRef = useRef(null);

  const selectedOption = options.find((o) => String(o.value) === String(value));

  // Compute portal position from trigger bounds
  const openDropdown = () => {
    if (disabled) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const spaceBelow = window.innerHeight - rect.bottom;
    const maxH = Math.min(224, spaceBelow > 120 ? spaceBelow - 12 : rect.top - 12);
    const openAbove = spaceBelow < 120 && rect.top > spaceBelow;
    setDropdownStyle({
      position: "fixed",
      top: openAbove ? undefined : rect.bottom + 4,
      bottom: openAbove ? window.innerHeight - rect.top + 4 : undefined,
      left: rect.left,
      width: rect.width,
      maxHeight: maxH,
      zIndex: 9999,
    });
    setOpen(true);
  };

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openAbove = spaceBelow < 120 && rect.top > spaceBelow;
      setDropdownStyle((prev) => ({
        ...prev,
        top: openAbove ? undefined : rect.bottom + 4,
        bottom: openAbove ? window.innerHeight - rect.top + 4 : undefined,
        left: rect.left,
        width: rect.width,
      }));
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setOpen(false);
  };

  const dropdownList = (
    <AnimatePresence>
      {open && (
        <motion.ul
          key="dropdown"
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.12 }}
          style={dropdownStyle}
          className="fixed bg-white border border-gray-200 rounded-xl shadow-xl overflow-auto py-1"
        >
          {/* Placeholder option */}
          <li>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
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
                onMouseDown={(e) => e.preventDefault()}
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
  );

  return (
    <div className={`relative w-full ${className}`}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openDropdown())}
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

      {/* Portal — renders at document.body, never clipped by overflow:hidden */}
      {createPortal(dropdownList, document.body)}
    </div>
  );
}
