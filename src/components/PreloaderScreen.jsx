import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioManager } from '../utils/audio';

export default function PreloaderScreen({ config, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    audioManager.init(config?.audioUrl || '/music.mp3');

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }

        const step = Math.floor(Math.random() * 6) + 3;
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        return next;
      });
    }, 65);

    return () => clearInterval(timer);
  }, []);

  const statusMessage = useMemo(() => {
    if (progress < 30) return 'Đang chọn những đóa hoa tươi thắm nhất… 🌸'.normalize('NFC');
    if (progress < 65) return 'Đang thắp sáng những vì sao và ánh nến lung linh… ✨'.normalize('NFC');
    if (progress < 100) return 'Gói ghém từng lời chúc ngọt ngào vào phong thư… 💌'.normalize('NFC');
    return 'Món quà 20/10 đã sẵn sàng dành riêng cho em 💖'.normalize('NFC');
  }, [progress]);

  const handleOpenGift = () => {

    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.52 },
      colors: ['#e11d48', '#fbbf24', '#f43f5e', '#fda4af', '#fef08a'],
    });

    audioManager.play();
    audioManager.playMagicFanfare();

    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#090514] via-[#1b0a2a] to-[#2a0820] text-rose-100 select-none overflow-hidden px-4"
    >

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-amber-500/12 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-rose-600/15 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-400/8 blur-3xl pointer-events-none" />

        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              y: '105vh',
              x: `${(i * 6.2 + 3) % 96}vw`,
              opacity: 0,
            }}
            animate={{
              y: '-10vh',
              opacity: [0, 0.7, 0.9, 0],
            }}
            transition={{
              duration: 10 + (i % 5) * 3,
              repeat: Infinity,
              delay: (i * 0.9) % 7,
              ease: 'linear',
            }}
            className="absolute text-amber-200/40 text-sm select-none"
          >
            {i % 3 === 0 ? '✨' : i % 3 === 1 ? '🌸' : '💖'}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">

        <motion.div
          animate={{
            scale: [1, 1.08, 0.96, 1.05, 1],
            rotate: [0, 2, -2, 1, 0],
          }}
          transition={{ duration: 4.0, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-28 h-28 sm:w-32 sm:h-32 mb-6 flex items-center justify-center"
        >

          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500/35 via-pink-500/25 to-amber-400/35 blur-xl animate-pulse" />

          <svg className="w-full h-full drop-shadow-[0_0_25px_rgba(244,63,94,0.7)]" viewBox="0 0 100 100" fill="none">

            <circle cx="50" cy="50" r="44" fill="#881337" fillOpacity="0.8" />
            <path
              d="M50 8 C68 8 84 24 84 42 C84 65 68 85 50 92 C32 85 16 65 16 42 C16 24 32 8 50 8 Z"
              fill="#be123c"
              fillOpacity="0.85"
            />

            <path
              d="M50 18 C62 18 76 30 76 46 C76 66 62 78 50 82 C38 78 24 66 24 46 C24 30 38 18 50 18 Z"
              fill="#e11d48"
              fillOpacity="0.9"
            />

            <path
              d="M50 28 C58 28 66 36 66 48 C66 60 56 68 50 72 C44 68 34 60 34 48 C34 36 42 28 50 28 Z"
              fill="#f43f5e"
            />

            <g transform="translate(42, 42) scale(0.7)">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="#fbbf24"
                className="drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]"
              />
            </g>
          </svg>
        </motion.div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md border border-rose-500/35 text-xs font-semibold text-rose-200 mb-3 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>{config?.occasion || 'Ngày Phụ Nữ Việt Nam 20.10'}</span>
        </div>

        <h1 className="font-serif-romantic text-3xl sm:text-4xl font-bold text-rose-100 tracking-tight mb-2">
          Gửi tặng {config?.recipientName || 'Em Yêu'} 💖
        </h1>

        <p className="text-sm sm:text-base font-serif italic text-rose-300/85 mb-8 h-6 flex items-center justify-center">
          {statusMessage}
        </p>

        <div className="w-full flex flex-col items-center justify-center min-h-[58px]">
          <AnimatePresence mode="wait">
            {!isReady ? (
              <motion.div
                key="loading-bar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full flex flex-col items-center gap-2"
              >

                <div className="relative w-64 sm:w-72 h-3 rounded-full bg-stone-900/90 border border-rose-500/30 overflow-hidden p-0.5 shadow-inner">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-400 to-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: 'easeOut', duration: 0.2 }}
                  />
                </div>

                <span className="text-xs font-semibold font-mono text-amber-300/90 tracking-wider">
                  {progress}%
                </span>
              </motion.div>
            ) : (
              <motion.button
                key="open-button"
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
                className="group relative px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-base sm:text-lg shadow-[0_0_40px_rgba(244,63,94,0.7)] border-2 border-amber-300/60 flex items-center gap-2.5 cursor-pointer transition-all"
              >
                <Gift className="w-5 h-5 text-amber-200 group-hover:rotate-12 transition-transform" />
                <span>Mở món quà 20/10 🎁</span>
                <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
