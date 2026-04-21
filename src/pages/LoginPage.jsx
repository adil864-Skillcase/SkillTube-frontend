import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, Phone, User } from "lucide-react";

import { sendOtp, verifyOtp } from "../api/endpoints";
import { setCredentials } from "../redux/slices/authSlice";
import OtpInput from "../components/OtpInput";
import { triggerHaptic } from "../utils/haptics";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Name (if new)
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      triggerHaptic("heavy");
      toast.error("Enter a valid phone number");
      return;
    }

    triggerHaptic("medium");
    setLoading(true);
    try {
      const res = await sendOtp(phoneNumber);
      // Backend returns if this is a new phone number
      setIsNewUser(res.data.isNewUser); 
      
      toast.success("OTP sent successfully");
      if (res.data.devOtp) {
        toast((t) => (
          <span>
            Dev OTP: <b>{res.data.devOtp}</b>
          </span>
        ));
      }
      setStep(2);
    } catch (err) {
      triggerHaptic("heavy");
      toast.error(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndLogin = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      triggerHaptic("heavy");
      toast.error("Enter complete 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(phoneNumber, fullOtp, name || undefined);
      const { token, user } = res.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      dispatch(setCredentials({ user, token }));
      
      triggerHaptic("medium");
      toast.success(`Welcome ${user.name}!`);
      navigate("/", { replace: true });
    } catch (err) {
      triggerHaptic("heavy");
      toast.error(err.response?.data?.error || "Invalid OTP");
      // Clear OTP on fail
      setOtp(["", "", "", "", "", ""]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    triggerHaptic("medium");

    if (isNewUser && !name) {
      // Need name before finalizing
      setStep(3);
      return;
    }

    await verifyAndLogin();
  };

  const handleSetupProfile = async (e) => {
    e.preventDefault();
    triggerHaptic("medium");
    if (!name.trim()) {
      triggerHaptic("heavy");
      toast.error("Please enter your name");
      return;
    }
    await verifyAndLogin();
  };

  const goBack = () => {
    triggerHaptic("light");
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white"
    >
      <header className="p-4 pt-[calc(1rem+env(safe-area-inset-top))]">
        <button
          onClick={goBack}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-[#002856]" />
        </button>
      </header>

      <main className="px-6 pt-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-[#002856]">
            Skill<span className="text-[#edb843]">Snap</span>
          </h1>
          <p className="text-gray-500 mt-2">
            {step === 1 && "Enter your phone number to continue"}
            {step === 2 && "Enter the 6-digit code sent to you"}
            {step === 3 && "Complete your profile profile"}
          </p>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOtp}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-[#002856] mb-2">
                    Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-4 w-5 h-5 text-gray-400" />
                    <span className="absolute left-10 text-[#002856] font-medium">+91</span>
                    <input
                      type="tel"
                      autoFocus
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="9999999999"
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-18 pr-4 py-4 outline-none text-[#002856] focus:border-[#edb843] font-medium tracking-wide"
                    />
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || phoneNumber.length < 10}
                  className="w-full bg-[#edb843] text-[#002856] font-bold py-4 rounded-xl disabled:opacity-50 transition-opacity"
                >
                  {loading ? "Sending..." : "Continue"}
                </motion.button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerifyOtp}
                className="space-y-8"
              >
                <div>
                  <label className="block text-sm font-medium text-center text-[#002856] mb-4">
                    Code sent to +91 {phoneNumber}
                  </label>
                  <OtpInput length={6} otp={otp} onChange={setOtp} />
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || otp.join("").length < 6}
                  className="w-full bg-[#002856] text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-opacity"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </motion.button>

                <p className="text-center text-sm font-medium text-gray-500">
                  Didn't receive the code?{" "}
                  <button 
                    type="button" 
                    onClick={handleSendOtp} 
                    className="text-[#edb843] underline py-2"
                  >
                    Resend
                  </button>
                </p>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSetupProfile}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-[#002856] mb-2">
                    What should we call you?
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-12 pr-4 py-4 outline-none text-[#002856] focus:border-[#edb843]"
                    />
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="w-full bg-[#edb843] text-[#002856] font-bold py-4 rounded-xl disabled:opacity-50 transition-opacity"
                >
                  {loading ? "Completing..." : "Complete Setup"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
  );
}
