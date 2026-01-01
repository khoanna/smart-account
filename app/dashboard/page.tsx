"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Landmark, Loader2, User, Copy, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginWithSocial } from "@/services/auth/social";
import { publicClient } from "../../utils/constant";
import { getTransactionHistory, TransactionActivity } from "@/services/history";
import { formatEther, type Hex } from "viem";
import Link from "next/link";

// Helper for animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 180, damping: 15 },
  },
};

const getSmoothHoverAnimation = () => ({
  whileHover: { scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" },
  whileTap: { scale: 0.95 },
  transition: { type: "spring" as const, stiffness: 300, damping: 20 },
});

const formatAddress = (addr: string | undefined) => {
  if (!addr) return "Botanary";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export default function DashboardPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [kernelAccountAddress, setKernelAccountAddress] = useState<Hex | undefined>();
  const [history, setHistory] = useState<TransactionActivity[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [balance, setBalance] = useState<string>("0.00");

  useEffect(() => {
    const getKernelAccount = async () => {
      setLoading(true);
      try {
        if (params?.size && params.size > 0) {
          await loginWithSocial(router);
        }
        const storedAccountAddress = localStorage.getItem("kernelAccountAddress");
        if (storedAccountAddress) {
          const kernelAccountAddress = JSON.parse(storedAccountAddress);
          const balance = await publicClient.getBalance({
            address: kernelAccountAddress,
          });
          const data = await getTransactionHistory(kernelAccountAddress);
          setHistory(data);
          setBalance(Number(formatEther(balance)).toFixed(4).toString());
          setKernelAccountAddress(kernelAccountAddress);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    getKernelAccount();
  }, [params, router]);

  const handleCopyAddress = () => {
    if (kernelAccountAddress) {
      navigator.clipboard.writeText(kernelAccountAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#050505] text-slate-200 font-sans">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative flex flex-col min-h-screen">
        <div className="flex-1 px-6 pt-14 pb-32">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3.5">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-linear-to-br from-emerald-500 to-emerald-900 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500" />
                <div className="relative w-11 h-11 rounded-full bg-[#111] border border-white/10 flex items-center justify-center shadow-xl">
                  <User className="w-5 h-5 text-emerald-400/90" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0a0a0a] rounded-full" />
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">Wallet</span>

                <button onClick={handleCopyAddress} className="group flex items-center gap-2 hover:bg-white/5 px-2 -ml-2 py-1 rounded-lg transition-colors">
                  <span className="text-white font-bold text-sm tracking-tight font-mono">{formatAddress(kernelAccountAddress)}</span>

                  <div className="relative w-3.5 h-3.5">
                    <motion.div initial={{ opacity: 1, scale: 1 }} animate={{ opacity: isCopied ? 0 : 1, scale: isCopied ? 0.5 : 1 }} className="absolute inset-0">
                      <Copy className="w-3.5 h-3.5 text-white/40 group-hover:text-emerald-400 transition-colors" />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: isCopied ? 1 : 0, scale: isCopied ? 1 : 0.5 }} className="absolute inset-0">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </motion.div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-full px-4 py-1.5 border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-[10px] text-white/50 font-bold tracking-wide uppercase">Gas Sponsored</span>
            </div>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-10">
            <motion.div variants={itemVariants} className="mb-3">
              <p className="text-xs text-white/40 font-medium mb-1 text-center uppercase tracking-wider">Total Net Worth</p>
              <h1 className="text-5xl font-bold text-white text-center tracking-tight">{balance} ETH</h1>
            </motion.div>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex items-center justify-center gap-2 mb-10 px-1">
            {[{ icon: ArrowUpRight, label: "Send", link: "/dashboard/transaction" }].map((action, index) => (
              <motion.div key={index} variants={itemVariants} className="flex flex-col items-center gap-2.5">
                <Link href={action.link} className="flex flex-col items-center gap-2.5">
                  <motion.button {...getSmoothHoverAnimation()} className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center border border-white/5">
                    <action.icon className="w-6 h-6 text-white" />
                  </motion.button>
                  <span className="text-[11px] text-white/50 font-medium tracking-wide">{action.label}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-xs text-white/60 font-bold tracking-widest uppercase">Recent Activity</h3>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-3 px-1">
            {history.length === 0 ? (
              <div className="text-center text-xs text-white/30 py-4">No recent activity</div>
            ) : (
              history.map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 p-4 bg-[#111]/60 rounded-2xl border border-white/5 hover:bg-[#161616] cursor-pointer"
                  onClick={() => window.open(`https://sepolia.etherscan.io/tx/${tx.hash}`, "_blank")}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl border border-white/5 flex items-center justify-center ${tx.action === "Receive" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                      {tx.action === "Receive" ? <ArrowDownLeft className="w-5 h-5 text-emerald-400" /> : <ArrowUpRight className="w-5 h-5 text-red-400" />}
                    </div>

                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-white font-semibold text-[14px] tracking-wide">
                        {tx.action === "Receive" ? "Received" : "Sent"} {tx.asset}
                      </span>
                      <span className="text-[11px] text-white/40 font-medium">{new Date(tx.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <span className={`text-[14px] font-bold tracking-wide ${tx.action === "Receive" ? "text-emerald-400" : "text-white"}`}>
                    {tx.action === "Receive" ? "+" : "-"}
                    {tx.value.toFixed(4)}
                  </span>
                </div>
              ))
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
