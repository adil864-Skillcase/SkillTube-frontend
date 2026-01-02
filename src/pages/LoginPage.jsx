import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, Phone, User } from "lucide-react";
import { loginWithPhone } from "../api/endpoints";
import { setCredentials } from "../redux/slices/authSlice";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Enter valid phone number");
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithPhone(phoneNumber, name || undefined);
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      dispatch(setCredentials({ user, token }));
      toast.success(`Welcome ${user.name}!`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white"
    >
      <header className="p-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-[#002856]" />
        </button>
      </header>

      <main className="px-6 pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#002856]">
            Skill<span className="text-[#edb843]">tube</span>
          </h1>
          <p className="text-gray-500 mt-2">Learn to live in Germany</p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleLogin}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-[#002856] mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-12 pr-4 py-4 outline-none text-[#002856] focus:border-[#edb843]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#002856] mb-2">
              Your Name (optional)
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-12 pr-4 py-4 outline-none text-[#002856] focus:border-[#edb843]"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#edb843] text-[#002856] font-bold py-4 rounded-xl disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>

          <p className="text-sm text-gray-500 text-center">
            No password needed. Just enter your phone number.
          </p>
        </motion.form>
      </main>
    </motion.div>
  );
}
