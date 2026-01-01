"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Key, Mail, Fingerprint, Check, Copy, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { type Hex } from "viem";

// Animation variants
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

type AccountType = "social" | "ecdsa" | "passkey";

interface Account {
  id: string;
  type: AccountType;
  address: string;
  label: string;
  isActive: boolean;
}

export default function AccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // Simulate fetching accounts
  useEffect(() => {
    // In a real app, this would come from a persistent store supporting multiple accounts
    // For now, we'll mock it based on the current active session + some dummy data
    const currentType = localStorage.getItem("type") as AccountType;
    const currentAddress = localStorage.getItem("kernelAccountAddress");
    const eoaAddress = localStorage.getItem("eoaAddress");
    
    const activeAddress = eoaAddress || (currentAddress ? JSON.parse(currentAddress) : "");

    const mockAccounts: Account[] = [
      {
        id: "1",
        type: currentType || "social",
        address: activeAddress || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        label: currentType === "social" ? "Google Account" : currentType === "passkey" ? "Passkey Wallet" : "Imported Account",
        isActive: true,
      },
      // Add some dummy accounts to show the UI
      {
        id: "2",
        type: "ecdsa",
        address: "0x123f681646d4a755815f9cb19e1acc8565a0c2ac",
        label: "Secondary Wallet",
        isActive: false,
      },
    ];
    setAccounts(mockAccounts);
  }, []);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setIsCopied(address);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleRemove = (id: string) => {
    setAccounts(accounts.filter(acc => acc.id !== id));
  };

  const handleSwitch = (id: string) => {
    setAccounts(accounts.map(acc => ({
      ...acc,
      isActive: acc.id === id
    })));
  };

  const getIcon = (type: AccountType) => {
    switch (type) {
      case "social": return <Mail className="w-5 h-5 text-blue-400" />;
      case "passkey": return <Fingerprint className="w-5 h-5 text-emerald-400" />;
      case "ecdsa": return <Key className="w-5 h-5 text-amber-400" />;
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-slate-200 relative overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-14 pb-6 flex items-center justify-between bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-20 border-b border-white/5">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white">Manage Accounts</h1>
        <div className="w-6" />
      </div>

      <div className="px-6 py-6 pb-32">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          
          {/* Active Accounts List */}
          <div className="space-y-4">
            <h2 className="text-xs text-white/40 font-bold uppercase tracking-widest ml-1">Your Accounts</h2>
            <AnimatePresence mode="popLayout">
              {accounts.map((account) => (
                <motion.div
                  key={account.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                    account.isActive 
                      ? "bg-[#111] border-emerald-500/30 shadow-[0_0_20px_-5px_rgba(16,185,129,0.1)]" 
                      : "bg-[#0a0a0a] border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => handleSwitch(account.id)}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 ${
                      account.type === 'social' ? 'bg-blue-500/10' : 
                      account.type === 'passkey' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                    }`}>
                      {getIcon(account.type)}
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${account.isActive ? "text-white" : "text-white/70"}`}>
                          {account.label}
                        </span>
                        {account.isActive && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCopy(account.address); }}
                        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors mt-0.5"
                      >
                        <span className="font-mono">{formatAddress(account.address)}</span>
                        {isCopied === account.address ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!account.isActive && (
                      <button 
                        onClick={() => handleRemove(account.id)}
                        className="p-2 rounded-full hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add New Account Section */}
          <div className="space-y-4">
            <h2 className="text-xs text-white/40 font-bold uppercase tracking-widest ml-1">Add New Account</h2>
            
            <div className="grid grid-cols-1 gap-3">
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#111] border border-white/5 hover:bg-[#161616] hover:border-white/10 transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <Key className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm">Import Private Key</span>
                  <span className="text-white/40 text-xs">Connect an existing EOA wallet</span>
                </div>
                <Plus className="w-5 h-5 text-white/20 ml-auto group-hover:text-white/60" />
              </motion.button>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#111] border border-white/5 hover:bg-[#161616] hover:border-white/10 transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm">Connect Social</span>
                  <span className="text-white/40 text-xs">Google, Apple, or Email</span>
                </div>
                <Plus className="w-5 h-5 text-white/20 ml-auto group-hover:text-white/60" />
              </motion.button>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
