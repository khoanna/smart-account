"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ArrowLeft, User, Fuel, ArrowRight, Check, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { sendTransaction } from "@/services/transaction/sendTransaction";
import { publicClient } from "@/utils/constant";
import { formatEther, type Hex, parseEther, isAddress } from "viem";
import SlideToConfirm from "@/components/SlideToConfirm";
import { formatBalance } from "@/utils/formatBalance";

export default function SendPage() {
  const router = useRouter();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState<string>("0.00");
  const [password, setPassword] = useState("");
  const [isEOA, setIsEOA] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      const storedAccountAddress = localStorage.getItem("kernelAccountAddress");
      const loginType = localStorage.getItem("type");
      
      if (loginType === "ecdsa") {
        setIsEOA(true);
      }
      
      if (storedAccountAddress) {
        const kernelAccountAddress = JSON.parse(storedAccountAddress);
        const balance = await publicClient.getBalance({
          address: kernelAccountAddress,
        });
        setBalance(formatBalance(BigInt(balance), 18, 4));
      } else {
        router.push("/");
      }
    };
    fetchBalance();
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (val === "") {
      setAmount("");
      return;
    }
    const inputVal = parseFloat(val);
    const maxBalance = parseFloat(balance);
    if (!isNaN(inputVal) && inputVal >= 0) {
      if (inputVal > maxBalance) {
        setAmount(balance);
      } else {
        setAmount(val);
      }
    }
  };

  const handleReview = () => {
    if (!recipient || !amount) return;
    if (!isAddress(recipient)) {
      alert("Invalid address format. Please enter a valid 0x address.");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (isProcessing || isSuccess) return;
    
    // Check password for EOA transactions
    if (isEOA && !password) {
      alert("Password is required for EOA transactions");
      return;
    }
    
    setIsProcessing(true);
    try {
      const val = parseEther(amount);
      const toAddress = recipient as Hex;
      const txHash = await sendTransaction(toAddress, val, isEOA ? password : undefined);
      if (txHash) {
        setIsProcessing(false);
        setIsSuccess(true);
        setTimeout(() => {
          setShowConfirm(false);
          setPassword(""); // Clear password
          router.push("/dashboard");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Transaction failed:", error);
      setIsProcessing(false);
      
      // Handle specific error messages
      if (error?.message?.includes("Invalid password") || error?.message?.includes("mismatch")) {
        alert("Invalid password. Please try again.");
        setPassword(""); // Clear wrong password
      } else {
        alert("Transaction failed. Check console for details.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-slate-200 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-purple-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-emerald-900/10 blur-[120px] rounded-full" />
      </div>

      {/* Container */}
      <div className="relative w-full max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="py-8 flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 rounded-xl bg-[#0a0a0a] border border-white/10 hover:bg-[#111] flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Send Transaction</h1>
            <p className="text-xs text-white/40 mt-0.5">Transfer ETH to any address</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-linear-to-br from-[#0a0a0a] to-[#111] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Amount Section */}
          <div className="p-8 border-b border-white/5">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4 block">Amount</label>
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="relative flex items-center justify-center w-full">
                <input
                  type="number"
                  min="0"
                  max={balance}
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className="bg-transparent text-6xl md:text-7xl font-bold text-white placeholder-white/10 text-center w-full focus:outline-none"
                />
              </div>
              <span className="text-2xl text-white/30 font-medium">ETH</span>

              {/* Balance Display */}
              <div className="flex items-center gap-3 bg-[#0f0f0f] px-4 py-2.5 rounded-xl border border-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                <span className="text-sm font-medium text-white/60">Balance: {balance} ETH</span>
                <button
                  onClick={() => setAmount(balance.toString())}
                  className="ml-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all active:scale-95"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {/* Recipient Section */}
          <div className="p-8">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4 block">Recipient Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
              </div>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-[#141414] transition-all placeholder:text-white/20 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 pb-8">
          <button
            onClick={handleReview}
            disabled={!amount || !recipient}
            className={`w-full py-5 rounded-2xl font-bold text-base transition-all shadow-lg ${
              amount && recipient 
                ? "bg-white text-black hover:bg-gray-100 shadow-white/10" 
                : "bg-[#1a1a1a] text-white/20 cursor-not-allowed"
            }`}
          >
            Continue to Review
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => !isProcessing && !isSuccess && setShowConfirm(false)} 
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40" 
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
            >
              <div className="w-full max-w-md bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-400 to-purple-600 flex items-center justify-center shadow-lg">
                      <ArrowRight className="w-8 h-8 text-white -rotate-45" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white text-center mb-1">{amount} ETH</h2>
                  <p className="text-sm text-white/40 text-center">Confirm your transaction</p>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  <div className="bg-[#0f0f0f] rounded-2xl p-4 space-y-4 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40 font-medium uppercase tracking-wider">To</span>
                      <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-white/5">
                        <div className="w-5 h-5 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[9px] font-bold text-white">
                          {recipient.slice(2, 3).toUpperCase()}
                        </div>
                        <span className="text-xs font-mono text-white">
                          {recipient.length > 10 ? `${recipient.slice(0, 6)}...${recipient.slice(-4)}` : recipient}
                        </span>
                      </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40 font-medium uppercase tracking-wider">Network Fee</span>
                      <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400">Sponsored</span>
                      </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40 font-medium uppercase tracking-wider">Estimated Time</span>
                      <span className="text-xs text-white/60 font-medium">~15 seconds</span>
                    </div>
                  </div>

                  {/* Password Input for EOA */}
                  {isEOA && (
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4">
                      <label className="text-xs font-bold text-yellow-200/80 uppercase tracking-wider mb-3 block">🔐 Enter Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your encryption password"
                        className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/20"
                        disabled={isProcessing || isSuccess}
                      />
                      <p className="text-xs text-yellow-200/60 mt-2">Required for EOA wallet transactions</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-[#0f0f0f] border-t border-white/5">
                  <SlideToConfirm onConfirm={handleConfirm} isSuccess={isSuccess} isProcessing={isProcessing} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
