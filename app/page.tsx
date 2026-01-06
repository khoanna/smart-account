"use client";

import React, { useState } from "react";
import { Fingerprint, Wallet, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { loginWithPasskey } from "@/services/auth/passkey";
import { useRouter } from "next/navigation";
import { loginWithSocial } from "@/services/auth/social";
import { loginWithECDSA } from "@/services/auth/ecdsa";
import { Hex } from "viem";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export default function Home() {
  const route = useRouter();
  const [showEOAModal, setShowEOAModal] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasskeyLogin = async () => {
    await loginWithPasskey();
    route.push("/dashboard");
  };

  const handleSocialLogin = async () => {
    await loginWithSocial(route);
  };

  const handleEOALogin = async () => {
    if (!privateKey || !password) {
      alert("Please enter both private key and password");
      return;
    }

    try {
      setIsLoading(true);
      await loginWithECDSA(password, privateKey as Hex);
      route.push("/dashboard");
    } catch (error) {
      console.error("EOA login failed:", error);
      alert("Login failed. Please remember to add prefix 0x to your private key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans text-slate-200">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-emerald-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Col: Branding */}
        <div className="hidden md:flex flex-col gap-8 md:pr-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-400 to-purple-600 flex items-center justify-center shadow-2xl mb-8">
              <div className="w-8 h-8 rounded-full bg-white border-4 border-white/20" />
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              The Next Gen <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-purple-400">Smart Wallet</span>
            </h1>
            <p className="text-lg text-white/50 leading-relaxed max-w-md">Experience the future of payments. Secure, fast, and sponsored transactions powered by Account Abstraction.</p>
          </motion.div>

          {/* Stats / Features */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 gap-6 mt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="text-3xl font-bold text-white mb-1">0$</div>
              <div className="text-sm text-white/40">Gas Fees Paid</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-sm text-white/40">Secure & Non-custodial</div>
            </div>
          </motion.div>
        </div>

        {/* Right Col: Login Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full max-w-md mx-auto bg-[#0a0a0a] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl backdrop-blur-xl"
        >
          {/* Mobile Logo (only visible on mobile) */}
          <div className="md:hidden flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-400 to-purple-600 flex items-center justify-center shadow-lg mb-4">
              <div className="w-8 h-8 rounded-full bg-white border-4 border-white/20" />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          </div>

          <div className="space-y-6">
            <div className="hidden md:block mb-8">
              <h3 className="text-xl font-bold text-white mb-2">Get Started</h3>
              <p className="text-sm text-white/40">Connect your wallet or create a new one to continue.</p>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-3">
              {/* Primary: Google Login */}
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSocialLogin()}
                className="group w-full relative overflow-hidden bg-white text-black rounded-xl p-4 flex items-center justify-between transition-all hover:bg-gray-100 shadow-lg shadow-white/10"
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-sm tracking-wide">Continue with Google</span>
                    <span className="text-xs text-black/50 font-medium">Recommended</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out" />
              </motion.button>

              <div className="flex items-center gap-4 my-2">
                <div className="h-px bg-white/5 flex-1" />
                <span className="text-xs text-white/30 uppercase tracking-wider font-medium">Other options</span>
                <div className="h-px bg-white/5 flex-1" />
              </div>

              {/* Passkey Login */}
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePasskeyLogin()}
                className="group w-full bg-[#161616] hover:bg-[#202020] border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Fingerprint className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-white font-medium text-sm">Passkey</span>
                </div>
                <ArrowRight className="w-5 h-5 text-white/40 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out" />
              </motion.button>

              {/* EOA Login */}
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEOAModal(true)}
                className="group w-full bg-[#161616] hover:bg-[#202020] border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-white/70" />
                  </div>
                  <span className="text-white/70 font-medium text-sm">External Wallet (EOA)</span>
                </div>
                <ArrowRight className="w-5 h-5 text-white/40 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out" />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* EOA Modal */}
      {showEOAModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0f0f0f] rounded-3xl p-8 w-full max-w-md border border-white/10 shadow-2xl relative overflow-hidden"
          >
            {/* Modal Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] pointer-events-none" />

            <h2 className="text-xl font-bold text-white mb-1 relative z-10">Connect EOA Wallet</h2>
            <p className="text-sm text-white/40 mb-8 relative z-10">Enter your private key details securely.</p>

            <div className="space-y-5 relative z-10">
              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2.5 block ml-1">Private Key</label>
                <div className="relative group">
                  <input
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/20 font-mono text-sm focus:bg-[#202020]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2.5 block ml-1">Encryption Password</label>
                <div className="relative group">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set a password for session"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/20 focus:bg-[#202020]"
                  />
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                <p className="text-xs text-yellow-200/80 leading-relaxed">⚠ Your key is encrypted locally with your password. We never store your raw private key.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-8 relative z-10">
              <button
                onClick={() => {
                  setShowEOAModal(false);
                  setPrivateKey("");
                  setPassword("");
                }}
                className="flex-1 py-3.5 rounded-xl bg-[#1a1a1a] text-white/60 hover:bg-[#222] hover:text-white transition-colors font-medium text-sm"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleEOALogin}
                disabled={isLoading || !privateKey || !password}
                className="flex-1 py-3.5 rounded-xl bg-white text-black hover:bg-gray-100 transition-colors font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  "Connect Wallet"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
