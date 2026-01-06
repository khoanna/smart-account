"use client";

import React, { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Landmark, Loader2, User, Copy, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginWithSocial } from "@/services/auth/social";
import { publicClient } from "../../utils/constant";
import { getTransactionHistory, TransactionActivity } from "@/services/history";
import { formatEther, type Hex } from "viem";
import Link from "next/link";
import { formatBalance } from "@/utils/formatBalance";

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
  if (!addr) return "Address";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

function DashboardContent() {
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
          setBalance(formatBalance(BigInt(balance), 18, 4));
          setKernelAccountAddress(kernelAccountAddress);
        } else {
          router.push("/");
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
    <div className="min-h-screen w-full bg-[#050505] text-slate-200 font-sans relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative flex flex-col min-h-screen">
        {/* Max Width Container */}
        <div className="w-full max-w-6xl mx-auto px-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="flex items-center justify-between py-8 border-b border-white/5"
          >
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400 to-purple-600 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition duration-500" />
                <div className="relative w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-xl">
                  <User className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#050505] rounded-full" />
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">My Wallet</span>
                <button onClick={handleCopyAddress} className="group flex items-center gap-2 hover:bg-white/5 px-3 -ml-3 py-1.5 rounded-lg transition-colors">
                  <span className="text-white font-bold text-base tracking-tight font-mono">{formatAddress(kernelAccountAddress)}</span>
                  <div className="relative w-4 h-4">
                    <motion.div initial={{ opacity: 1, scale: 1 }} animate={{ opacity: isCopied ? 0 : 1, scale: isCopied ? 0.5 : 1 }} className="absolute inset-0">
                      <Copy className="w-4 h-4 text-white/40 group-hover:text-emerald-400 transition-colors" />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: isCopied ? 1 : 0, scale: isCopied ? 1 : 0.5 }} className="absolute inset-0">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </motion.div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-emerald-500/10 rounded-xl px-4 py-2 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              <span className="text-xs text-emerald-300 font-bold tracking-wide">GAS SPONSORED</span>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
            {/* Left Column - Balance Card */}
            <div className="lg:col-span-2">
              <motion.div 
                variants={containerVariants} 
                initial="hidden" 
                animate="visible" 
                className="bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-3xl p-8 border border-white/10 shadow-2xl mb-8"
              >
                <motion.div variants={itemVariants}>
                  <p className="text-sm text-white/40 font-medium mb-2 uppercase tracking-wider">Total Balance</p>
                  <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">{balance} <span className="text-3xl text-white/50">ETH</span></h1>
                  
                  <div className="flex items-center gap-4 mt-8">
                    <Link href="/dashboard/transaction" className="flex-1">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-white text-black rounded-xl py-4 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-white/10 hover:bg-gray-100 transition-colors"
                      >
                        <ArrowUpRight className="w-5 h-5" />
                        Send ETH
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              </motion.div>

              {/* Transaction History */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm text-white font-bold tracking-wide">Recent Transactions</h3>
                  {history.length > 0 && (
                    <span className="text-xs text-white/40">{history.length} transaction{history.length !== 1 ? 's' : ''}</span>
                  )}
                </div>

                <div className="space-y-3">
                  {history.length === 0 ? (
                    <div className="bg-[#0a0a0a] rounded-2xl p-12 border border-white/5 text-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <ArrowUpRight className="w-8 h-8 text-white/20" />
                      </div>
                      <p className="text-sm text-white/30">No transactions yet</p>
                      <p className="text-xs text-white/20 mt-1">Your transaction history will appear here</p>
                    </div>
                  ) : (
                    history.map((tx, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group flex items-center justify-between gap-4 p-4 bg-[#0a0a0a] rounded-2xl border border-white/5 hover:border-white/10 hover:bg-[#0f0f0f] cursor-pointer transition-all"
                        onClick={() => window.open(`https://sepolia.etherscan.io/tx/${tx.hash}`, "_blank")}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            tx.action === "Receive" 
                              ? "bg-emerald-500/10 border border-emerald-500/20" 
                              : "bg-red-500/10 border border-red-500/20"
                          }`}>
                            {tx.action === "Receive" ? (
                              <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-red-400" />
                            )}
                          </div>

                          <div className="flex flex-col">
                            <span className="text-white font-semibold text-sm">
                              {tx.action === "Receive" ? "Received" : "Sent"} {tx.asset}
                            </span>
                            <span className="text-xs text-white/40">
                              {new Date(tx.timestamp).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${
                            tx.action === "Receive" ? "text-emerald-400" : "text-white"
                          }`}>
                            {tx.action === "Receive" ? "+" : "-"}{tx.value.toFixed(4)} ETH
                          </span>
                          <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors -rotate-45" />
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Quick Stats */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/5"
              >
                <h3 className="text-sm font-bold text-white mb-4">Account Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Network</p>
                    <p className="text-sm text-white font-medium">Sepolia Testnet</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Account Type</p>
                    <p className="text-sm text-white font-medium">Smart Contract Wallet</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/5"
              >
                <h3 className="text-sm font-bold text-white mb-4">Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-xs text-white/60">Gas-free transactions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-xs text-white/60">Account abstraction</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-xs text-white/60">Multi-auth support</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
