import { useRef } from "react";
import { triggerHaptic } from "../utils/haptics";

export default function OtpInput({ length = 6, otp, onChange }) {
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    let value = e.target.value.replace(/\D/g, ""); // Allow only numbers
    if (value.length > 1) {
      value = value[0]; // Take only the first character if somehow pasted
    }

    if (value) {
      triggerHaptic("light");
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    onChange(newOtp);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      triggerHaptic("light");
      if (!otp[index] && index > 0) {
        // Default backspace behavior: clear current and focus previous
        inputRefs.current[index - 1]?.focus();
        
        // Clear previous input value if current is already blank
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        onChange(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, length);
    if (!pastedData) return;

    triggerHaptic("medium");
    const newOtp = [...otp];
    let focusIndex = 0;

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
      focusIndex = i;
    }
    
    onChange(newOtp);

    if (focusIndex < length - 1) {
      inputRefs.current[focusIndex + 1]?.focus();
    } else {
      inputRefs.current[length - 1]?.blur();
    }
  };

  return (
    <div className="flex gap-2 justify-between w-full">
      {Array(length)
        .fill("")
        .map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="tel"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={otp[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className="w-12 h-14 text-center text-xl font-bold text-[#002856] bg-gray-100 border border-gray-200 rounded-xl outline-none focus:border-[#edb843] focus:bg-white transition-colors"
          />
        ))}
    </div>
  );
}
