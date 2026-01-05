"use client";

import React, { useEffect, useState } from "react";
import { Fingerprint, Wallet, ArrowRight, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { loginWithPasskey, registerWithPasskey } from "@/services/auth/passkey";
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

export default function ModernLoginPage() {
  const route = useRouter();
  const [privateKey, setPrivateKey] = useState<Hex>();

  const handlePasskeyLogin = async () => {
    await loginWithPasskey();
    route.push("/dashboard");
  };

  const handleSocialLogin = async () => {
    await loginWithSocial(route);
  };

  const handleECDSALogin = async () => {
    if (!privateKey) return;
    await loginWithECDSA(privateKey);
    route.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-sans text-slate-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-95 h-200 bg-[#050505] rounded-[3rem] flex flex-col justify-between overflow-hidden shadow-2xl border border-white/5"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-62.5 h-62.5 bg-purple-900/40 blur-[80px] rounded-full pointer-events-none"
        />

        <div className="flex flex-col flex-1 pt-12 relative z-10">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex justify-center mb-16">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]"
            >
              <div className="w-5 h-5 rounded-full bg-[#0a0a0a] shadow-lg border border-white/10" />
            </motion.div>
          </motion.div>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-3 pb-8 relative z-10">
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePasskeyLogin()}
            className="group w-full relative overflow-hidden bg-[#111] border border-white/10 rounded-2xl p-4 flex items-center justify-between transition-colors hover:border-emerald-500/30 hover:bg-[#161616]"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <Fingerprint className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-white font-semibold text-sm tracking-wide">Continue with Passkey</span>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out" />
          </motion.button>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSocialLogin()}
            className="group w-full bg-[#111] hover:bg-[#161616] border border-white/5 hover:border-white/10 rounded-2xl p-4 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
              <span className="text-white font-medium text-sm tracking-wide">Continue with Social</span>
            </div>
            <ArrowRight className="w-5 h-5 text-white/40 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out" />
          </motion.button>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group w-full bg-[#111] hover:bg-[#161616] border border-white/5 hover:border-white/10 rounded-2xl p-4 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <Wallet className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" />
              </div>
              <span className="text-white/60 group-hover:text-white/90 transition-colors font-medium text-sm tracking-wide">Connect External EOA</span>
            </div>
            <ArrowRight className="w-5 h-5 text-white/40 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out" />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
