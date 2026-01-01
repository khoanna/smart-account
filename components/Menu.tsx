"use client";

import React from "react";
import { Home, Landmark, Clock, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

const Menu = () => {
  const router = useRouter();
  const pathname = usePathname(); // Hook to check current active page

  const menuItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Landmark, label: "Markets", path: "/dashboard/markets" },
    { icon: Clock, label: "History", path: "/dashboard/history" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

  return (
    // 'fixed': Pins to viewport bottom
    // 'max-w-[380px] mx-auto left-0 right-0': Keeps it centered and phone-sized on desktop
    <div className="fixed bottom-0 left-0 right-0 max-w-95 mx-auto px-6 pt-4 pb-6 bg-[#050505]/90 backdrop-blur-xl border-t border-white/5 z-50">
      <div className="flex items-center justify-between">
        {menuItems.map((item, index) => {
          // Check if this item is active
          const isActive = pathname === item.path || (item.path === "/dashboard" && pathname === "/");

          return (
            <motion.button
              key={index}
              onClick={() => router.push(item.path)}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center gap-1.5 w-16 group transition-all ${
                isActive ? "text-emerald-400" : "text-white/20 hover:text-white/60"
              }`}
            >
              <item.icon
                className={`w-5 h-5 transition-transform group-hover:-translate-y-0.5`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[9px] font-bold tracking-widest uppercase">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default Menu;