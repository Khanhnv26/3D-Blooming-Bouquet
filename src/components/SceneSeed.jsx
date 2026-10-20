import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Droplets, Sun, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioManager } from '../utils/audio';

export default function SceneSeed({ onNext, recipientName }) {
  const [clickCount, setClickCount] = useState(0);
  const [isWatering, setIsWatering] = useState(false);
  const targetClicks = 3;

  const steps = [
    { text: "Tưới những giọt nước yêu thương", icon: Droplets, color: "from-sky-400 to-rose-400" },
    { text: "Sưởi ấm bằng ánh nắng ngọt ngào", icon: Sun, color: "from-amber-400 to-rose-500" },
    { text: "Thì thầm lời chúc 20/10 với em", icon: Heart, color: "from-rose-500 to-pink-600" },
  ];

  const handleInteract = () => {
    if (clickCount >= targetClicks) return;

    setIsWatering(true);
    audioManager.playChime();

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    confetti({
      particleCount: 18,
      spread: 50,
      origin: { y: 0.65 },
      colors: ['#f43f5e', '#fb7185', '#fde047', '#fda4af']
    });

    setTimeout(() => {
      setIsWatering(false);
    }, 400);

    if (nextCount >= targetClicks) {
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ec4899', '#f43f5e', '#fbbf24', '#f472b6']
        });
        setTimeout(onNext, 1200);
      }, 500);
    }
  };

  const currentStep = steps[Math.min(clickCount, targetClicks - 1)];
  const StepIcon = currentStep.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-4 py-8 text-center max-w-xl mx-auto"
    >

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 border border-rose-200/90 text-rose-700 text-xs sm:text-sm font-medium shadow-sm mb-6"
      >
        <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
        <span>Ngày Phụ Nữ Việt Nam 20.10</span>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
        <span className="font-semibold text-rose-800">{recipientName}</span>
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="font-serif-romantic text-3xl sm:text-4xl md:text-5xl font-bold text-rose-950 tracking-tight leading-tight mb-4"
      >
        Dành Tặng <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500">{recipientName}</span> Một Hạt Mầm Bí Mật 🌱
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="text-stone-600 text-sm sm:text-base max-w-md mx-auto mb-10 leading-relaxed"
      >
        Hôm nay là 20/10, anh có một điều bất ngờ đặc biệt đã ấp ủ từ lâu. Hãy cùng anh gieo mầm và truyền yêu thương để xem điều kỳ diệu gì sẽ xảy ra nhé!
      </motion.p>

      <div className="relative my-6 flex flex-col items-center justify-center">

        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.35, 0.7, 0.35]
          }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-rose-200/50 via-pink-200/40 to-amber-200/50 blur-xl pointer-events-none"
        />

        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.9, 0.5]
          }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.4 }}
          className="absolute w-40 h-40 rounded-full bg-rose-300/30 blur-md pointer-events-none"
        />

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative w-44 h-44 rounded-3xl bg-gradient-to-b from-white/90 to-rose-50/90 backdrop-blur-md border border-rose-200/80 shadow-2xl shadow-rose-200/60 flex flex-col items-center justify-center cursor-pointer overflow-hidden p-4 group"
          onClick={handleInteract}
        >

          <div className="absolute top-3 left-3 text-amber-400 text-xs animate-pulse">✨</div>
          <div className="absolute bottom-3 right-3 text-rose-400 text-xs animate-pulse" style={{ animationDelay: '1s' }}>💖</div>

          <div className="relative flex flex-col items-center">
            <motion.div
              animate={{
                y: isWatering ? [0, -10, 0] : [0, -5, 0],
                scale: 1 + clickCount * 0.2,
                rotate: clickCount === 1 ? [0, -5, 5, 0] : clickCount === 2 ? [0, -8, 8, 0] : [0, 0]
              }}
              transition={{
                duration: isWatering ? 0.4 : 3,
                repeat: isWatering ? 0 : Infinity,
                ease: "easeInOut"
              }}
              className="text-5xl sm:text-6xl drop-shadow-md select-none"
            >
              {clickCount === 0 && '🌰'}
              {clickCount === 1 && '🌱'}
              {clickCount === 2 && '🌿'}
              {clickCount >= 3 && '🌸'}
            </motion.div>

            <motion.div
              animate={{ width: ['40px', '55px', '40px'] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="h-2 rounded-full bg-rose-300/60 blur-xs mt-3"
            />
          </div>

          <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-amber-900/20 to-transparent"></div>
        </motion.div>
      </div>

      <div className="flex items-center gap-2 mb-6 mt-4">
        {[0, 1, 2].map((idx) => (
          <motion.div
            key={idx}
            animate={{
              scale: clickCount > idx ? [1, 1.3, 1] : 1,
              backgroundColor: clickCount > idx ? '#f43f5e' : '#fecdd3'
            }}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              clickCount > idx ? 'bg-rose-500 shadow-sm shadow-rose-400' : 'bg-rose-200'
            }`}
          />
        ))}
      </div>

      <motion.button
        onClick={handleInteract}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        disabled={clickCount >= targetClicks}
        className={`relative group px-7 py-3.5 rounded-full font-medium text-white shadow-xl flex items-center gap-3 transition-all ${
          clickCount >= targetClicks
            ? 'bg-emerald-500 shadow-emerald-200 cursor-default'
            : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 shadow-rose-300/60'
        }`}
      >
        <StepIcon className={`w-5 h-5 ${isWatering ? 'animate-bounce' : ''}`} />
        <span className="text-sm sm:text-base font-semibold">
          {clickCount >= targetClicks ? "Hạt mầm đang bung nở... ✨" : currentStep.text}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
          {clickCount}/{targetClicks}
        </span>
      </motion.button>

      <span className="text-xs text-stone-400 mt-4 flex items-center gap-1.5 font-medium">
        <Wand2 className="w-3.5 h-3.5 text-rose-400" /> Chạm vào hạt mầm hoặc nút bấm để nuôi dưỡng
      </span>
    </motion.div>
  );
}
