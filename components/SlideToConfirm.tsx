import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { ArrowRight, Check, Loader2, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export default function SlideToConfirm({ onConfirm, isSuccess, isProcessing }: { onConfirm: () => void; isSuccess: boolean; isProcessing: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [constraints, setConstraints] = useState(0);
  const controls = useAnimation();
  const x = useMotionValue(0);

  const progress = useTransform(x, [0, constraints], [0, 1]);

  const textOpacity = useTransform(x, [0, constraints * 0.5], [1, 0]);

  const fillWidth = useTransform(x, (value) => value + 56);

  useEffect(() => {
    if (containerRef.current) {
      setConstraints(containerRef.current.offsetWidth - 56 - 8);
    }
  }, []);

  const handleDragEnd = () => {
    if (x.get() > constraints * 0.5) {
      if (navigator.vibrate) navigator.vibrate(50);
      onConfirm();
    } else {
      controls.start({ x: 0 });
    }
  };

  useEffect(() => {
    if (isSuccess || isProcessing) {
      controls.start({ x: constraints });
    } else {
      controls.start({ x: 0 });
    }
  }, [isSuccess, isProcessing, constraints, controls]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-16 bg-neutral-900/90 backdrop-blur-xl rounded-full border border-white/10 overflow-hidden p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_4px_12px_rgba(0,0,0,0.5)] select-none group/slider"
    >
      <motion.div className="absolute top-0 left-0 bottom-0 bg-linear-to-r from-yellow-500/20 to-yellow-400/30 z-0 rounded-full" style={{ width: fillWidth }} />

      <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="relative overflow-hidden">
          <span className="text-neutral-400 font-medium text-sm tracking-[0.2em] uppercase flex items-center gap-2">{isProcessing ? "Processing..." : "Slide to confirm"}</span>
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -skew-x-12"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 1 }}
          />
        </div>
      </motion.div>

      <motion.div
        drag={isSuccess || isProcessing ? false : "x"}
        dragConstraints={{ left: 0, right: constraints }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{ x }}
        className="relative z-20 w-14 h-14 bg-linear-to-b from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(253,224,71,0.3),inset_0_2px_4px_rgba(255,255,255,0.5)] cursor-grab active:cursor-grabbing"
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 text-black animate-spin" />
        ) : isSuccess ? (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}>
            <Check className="w-7 h-7 text-black drop-shadow-sm" strokeWidth={3} />
          </motion.div>
        ) : (
          <ArrowRight className="w-6 h-6 text-black drop-shadow-sm" strokeWidth={2.5} />
        )}
      </motion.div>
    </div>
  );
}
