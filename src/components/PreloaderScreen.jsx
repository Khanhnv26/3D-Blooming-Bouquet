import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioManager } from '../utils/audio';

export default function PreloaderScreen({ config, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    audioManager.init(config?.audioUrl || '/music.mp3');

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        const step = Math.floor(Math.random() * 5) + 3;
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        return next;
      });
    }, 60);

    return () => clearInterval(timer);
  }, [config?.audioUrl]);

  const statusMessage = useMemo(() => {
    if (progress < 30) return 'Đang gói ghém món quà đặc biệt ngày 20/10… 🌸'.normalize('NFC');
    if (progress < 65) return 'Đang thắt nơ lụa và đính kèm lời chúc ngọt ngào… ✨'.normalize('NFC');
    if (progress < 100) return 'Sắp hoàn thành món quà dành riêng cho em… 💌'.normalize('NFC');
    return 'Món quà đã sẵn sàng! Chạm vào hộp quà để mở nắp 🎁'.normalize('NFC');
  }, [progress]);

  const handleOpenGift = () => {
    if (isOpening) return;
    setIsOpening(true);

    audioManager.play();
    audioManager.playMagicFanfare();

    confetti({
      particleCount: 110,
      spread: 90,
      origin: { y: 0.48 },
      colors: ['#fbbf24', '#f43f5e', '#e11d48', '#fda4af', '#fef08a'],
    });

    setTimeout(() => {
      onComplete();
    }, 950);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(10px)' }}
      transition={{ duration: 0.85, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#090514] via-[#1b0a2a] to-[#2a0820] text-rose-100 select-none overflow-hidden px-4"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-amber-500/12 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-rose-600/15 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              y: '105vh',
              x: `${(i * 5.8 + 2) % 96}vw`,
              opacity: 0,
            }}
            animate={{
              y: '-10vh',
              opacity: [0, 0.75, 0.9, 0],
            }}
            transition={{
              duration: 10 + (i % 5) * 3,
              repeat: Infinity,
              delay: (i * 0.8) % 7,
              ease: 'linear',
            }}
            className="absolute text-amber-200/40 text-sm select-none"
          >
            {i % 3 === 0 ? '✨' : i % 3 === 1 ? '🌸' : '💖'}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md border border-rose-500/35 text-xs font-semibold text-rose-200 mb-6 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>{config?.occasion || 'Ngày Phụ Nữ Việt Nam 20.10'}</span>
        </div>

        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center mb-6">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="rgba(244, 63, 94, 0.18)"
              strokeWidth="1.5"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="url(#progressRingGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 * (1 - progress / 100)}
              className="transition-all duration-150 ease-out"
              transform="rotate(-90 50 50)"
            />
            <defs>
              <linearGradient id="progressRingGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>

          <AnimatePresence>
            {isOpening && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0.1 }}
                animate={{ opacity: [0, 1, 0.8], scaleY: 2.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute top-0 w-44 h-72 bg-gradient-to-t from-amber-300 via-amber-200/90 to-transparent blur-xl pointer-events-none z-30"
              />
            )}
          </AnimatePresence>

          {isOpening &&
            Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0.2,
                  opacity: 0,
                }}
                animate={{
                  x: (i % 2 === 0 ? 1 : -1) * (40 + (i * 24) % 110),
                  y: -150 - i * 26,
                  scale: [0.2, 1.2, 1],
                  opacity: [0, 1, 0],
                  rotate: (i % 2 === 0 ? 1 : -1) * (20 + i * 15),
                }}
                transition={{ duration: 1.0 + i * 0.1, ease: 'easeOut', delay: 0.15 + i * 0.05 }}
                className="absolute top-20 pointer-events-none z-40 text-2xl select-none"
              >
                {i % 3 === 0 ? '🦋' : i % 3 === 1 ? '✨' : '💖'}
              </motion.div>
            ))}

          <motion.div
            animate={
              isReady && !isOpening
                ? {
                    y: [0, -8, 0],
                    scale: [1, 1.03, 1],
                  }
                : {
                    y: [0, -5, 0],
                  }
            }
            transition={{
              duration: isReady ? 2.0 : 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            onClick={isReady ? handleOpenGift : undefined}
            title={isReady ? 'Chạm vào hộp quà để mở nắp 🎁' : 'Đang chuẩn bị món quà…'}
            className={`relative z-20 flex flex-col items-center ${
              isReady && !isOpening ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''
            }`}
          >
            <motion.div
              animate={
                isOpening
                  ? {
                      y: -130,
                      rotate: -18,
                      opacity: [1, 1, 0],
                      scale: 1.1,
                    }
                  : {}
              }
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="relative z-20 flex flex-col items-center"
            >
              <div className="relative -mb-1 z-30 flex items-center justify-center">
                <div className="w-9 h-6 rounded-[50%_50%_40%_40%] bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 shadow-md -mr-1.5 -rotate-25 border border-amber-200/60" />
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 shadow-lg z-10 border border-amber-100 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-100" />
                </div>
                <div className="w-9 h-6 rounded-[50%_50%_40%_40%] bg-gradient-to-r from-amber-500 via-amber-200 to-amber-400 shadow-md -ml-1.5 rotate-25 border border-amber-200/60" />
              </div>

              <div className="w-40 h-10 rounded-t-lg bg-gradient-to-r from-[#9f1239] via-[#881337] to-[#700f2b] shadow-xl border-t border-x border-amber-300/40 relative flex items-center justify-center overflow-hidden">
                <div className="w-6 h-full bg-gradient-to-r from-amber-500 via-amber-200 to-amber-400 shadow-sm" />
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-80" />
              </div>
            </motion.div>

            <div className="relative w-36 h-28 rounded-b-lg bg-gradient-to-r from-[#881337] via-[#700f2b] to-[#4c0519] shadow-2xl border-b border-x border-amber-400/30 flex flex-col items-center overflow-hidden -mt-0.5">
              <div className="absolute top-0 inset-x-0 h-1 bg-amber-300 blur-[1px] shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
              <div className="w-6 h-full bg-gradient-to-r from-amber-500 via-amber-200 to-amber-400 shadow-sm" />
              <div className="absolute top-1/2 inset-x-0 h-5 bg-gradient-to-b from-amber-500 via-amber-200 to-amber-400 -translate-y-1/2 opacity-90 shadow-sm" />
            </div>

            <div className="w-40 h-4 bg-black/55 blur-md rounded-full mt-2" />
          </motion.div>
        </div>

        <h1 className="font-serif-romantic text-2xl sm:text-3xl font-bold text-rose-100 tracking-tight mb-2">
          Gửi tặng {config?.recipientName || 'Em Yêu'} 💖
        </h1>

        <p className="text-sm font-serif italic text-rose-300/90 mb-5 h-6 flex items-center justify-center">
          {statusMessage}
        </p>

        <div className="w-full flex items-center justify-center min-h-[48px]">
          <AnimatePresence mode="wait">
            {!isReady ? (
              <motion.div
                key="loading-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-40 h-2 rounded-full bg-stone-900/90 border border-rose-500/30 overflow-hidden p-0.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-400 to-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: 'easeOut', duration: 0.2 }}
                  />
                </div>
                <span className="text-xs font-mono font-semibold text-amber-300">
                  {progress}%
                </span>
              </motion.div>
            ) : (
              <motion.button
                key="open-gift-btn"
                initial={{ scale: 0.85, opacity: 0, y: 10 }}
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  scale: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
                  opacity: { duration: 0.4 },
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenGift}
                className="group relative px-7 py-3 rounded-full bg-gradient-to-r from-rose-600 via-pink-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-sm sm:text-base shadow-[0_0_35px_rgba(244,63,94,0.7)] border-2 border-amber-300/60 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Gift className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
                <span>Chạm để mở hộp quà 🎁</span>
                <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
