"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ArrowLeft, User, Fuel, ArrowRight, Check, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { sendTransaction } from "@/services/transaction/sendTransaction";
import { publicClient } from "@/utils/constant";
import { formatEther, type Hex, parseEther, isAddress } from "viem";
import SlideToConfirm from "@/components/SlideToConfirm";

export default function SendPage() {
  const router = useRouter();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState<string>("0.00");

  useEffect(() => {
    const fetchBalance = async () => {
      const storedAccountAddress = localStorage.getItem("kernelAccountAddress");
      if (storedAccountAddress) {
        const kernelAccountAddress = JSON.parse(storedAccountAddress);
        const balance = await publicClient.getBalance({
          address: kernelAccountAddress,
        });
        setBalance(Number(formatEther(balance)).toFixed(4).toString());
      } else {
        router.push("/login");
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
    if (!isNaN(inputVal) && inputVal <= maxBalance) {
      setAmount(val);
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
    setIsProcessing(true);
    try {
      const val = parseEther(amount);
      const toAddress = recipient as Hex;
      const txHash = await sendTransaction(toAddress, val);
      if (txHash) {
        setIsProcessing(false);
        setIsSuccess(true);
        setTimeout(() => {
          setShowConfirm(false);
          router.push("/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      setIsProcessing(false);
      alert("Transaction failed. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-slate-200 relative overflow-hidden">
      <div className="px-6 pt-14 pb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white">Send ETH</h1>
        <div className="w-6" />
      </div>

      <div className="px-6 mt-4 space-y-8">
        <div className="flex flex-col items-center justify-center space-y-2 py-10">
          <div className="relative flex items-center justify-center w-full">
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="bg-transparent text-6xl font-bold text-white placeholder-white/20 text-center w-2/3 focus:outline-none focus:placeholder-transparent"
            />
          </div>

          {/* Balance Display with Max Button */}
          <div className="flex items-center gap-2 bg-[#1a1a1a] pl-3 pr-1.5 py-1.5 rounded-full border border-white/5 transition-colors hover:border-white/10">
            <div className="w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
            <span className="text-xs font-medium text-white/60">Balance: {balance} ETH</span>

            {/* MAX Button */}
            <button
              onClick={() => setAmount(balance.toString())}
              className="ml-2 bg-[#2a2a2a] hover:bg-[#333] text-[10px] font-bold text-emerald-400 px-2 py-1 rounded-full border border-white/5 transition-all active:scale-95"
            >
              MAX
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">To Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <User className="w-5 h-5 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Recipient Address"
              className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/20 font-mono"
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-6 bg-linear-to-t from-[#050505] to-transparent">
        <button
          onClick={handleReview}
          disabled={!amount || !recipient}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${amount && recipient ? "bg-white text-black hover:scale-[1.02]" : "bg-[#1a1a1a] text-white/20 cursor-not-allowed"}`}
        >
          Review Transaction
        </button>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirm(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] rounded-t-[2.5rem] border-t border-white/10 overflow-hidden max-h-[90vh] flex flex-col z-99"
            >
              <div className="w-full flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-white/10 rounded-full" />
              </div>

              <div className="p-6 pb-10 flex flex-col items-center flex-1">
                <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-white/5 flex items-center justify-center mb-6 shadow-2xl relative">
                  <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-xl" />
                  <ArrowRight className="w-6 h-6 text-yellow-200 -rotate-45" />
                </div>

                <h2 className="text-4xl font-bold text-[#FDE047] mb-1">{amount} USDC</h2>
                <p className="text-white/40 text-sm font-medium mb-10">≈ ${amount} USD</p>

                <div className="w-full bg-[#111] rounded-3xl p-5 space-y-6 border border-white/5 mb-8">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 font-medium text-sm">To</span>
                    <div className="flex items-center gap-3 bg-[#1a1a1a] pl-2 pr-3 py-1.5 rounded-full border border-white/5">
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold">{recipient.slice(0, 1).toUpperCase()}</div>
                      <span className="text-sm font-medium text-white tracking-tight">{recipient.length > 10 ? `${recipient.slice(0, 6)}...${recipient.slice(-4)}` : recipient}</span>
                      <Copy className="w-3 h-3 text-white/30" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white/40 font-medium text-sm">From</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#222] flex items-center justify-center border border-white/5">
                        <Fuel className="w-3 h-3 text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-white">Universal Gas Account</span>
                    </div>
                  </div>

                  <div className="h-px w-full bg-white/5" />

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                      <span className="text-white/60 font-medium text-sm">Network Fee</span>
                      <span className="text-[10px] text-emerald-500/80 font-bold tracking-wider uppercase mt-0.5">Botanary Benefit</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-500/20">
                      <span className="text-xs font-bold text-emerald-400">Sponsored</span>
                      <div className="bg-emerald-500 rounded-full p-0.5">
                        <Check className="w-2 h-2 text-black" strokeWidth={4} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-white/20 text-xs">Est. processing time</span>
                    <span className="text-white/40 text-xs font-medium">{"<"} 15 seconds</span>
                  </div>
                </div>

                <SlideToConfirm onConfirm={handleConfirm} isSuccess={isSuccess} isProcessing={isProcessing} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
