import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, RotateCcw, ArrowLeft, Feather, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioManager } from '../utils/audio';

export default function SceneLetter({ config, onReplay }) {
  const [displayedParagraphs, setDisplayedParagraphs] = useState([]);
  const [currentParaIndex, setCurrentParaIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);

  // Ensure all strings are strictly NFC normalized so Vietnamese diacritics are flawless
  const paragraphs = useMemo(
    () => (config?.letter?.paragraphs || []).map((p) => p.normalize('NFC')),
    [config?.letter?.paragraphs]
  );

  // Initial letter open celebration
  useEffect(() => {
    audioManager.playMagicFanfare();
    confetti({
      particleCount: 60,
      spread: 75,
      origin: { y: 0.4 },
      colors: ['#e11d48', '#f43f5e', '#fbbf24', '#fbcfe8', '#fff1f2'],
    });
  }, []);

  // Typewriter effect for paragraphs
  useEffect(() => {
    if (isTypingComplete) return;

    if (currentParaIndex >= paragraphs.length) {
      setIsTypingComplete(true);
      return;
    }

    const currentText = paragraphs[currentParaIndex];

    if (charIndex < currentText.length) {
      const timer = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
      }, 22);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setDisplayedParagraphs((prev) => [...prev, currentText]);
        setCurrentParaIndex((prev) => prev + 1);
        setCharIndex(0);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentParaIndex, charIndex, isTypingComplete, paragraphs]);

  // Fast forward typewriter
  const handleSkipTypewriter = () => {
    setDisplayedParagraphs(paragraphs);
    setIsTypingComplete(true);
    audioManager.playChime();
  };

  // Re-read letter animation
  const handleReRead = () => {
    setDisplayedParagraphs([]);
    setCurrentParaIndex(0);
    setCharIndex(0);
    setIsTypingComplete(false);
    audioManager.playChime();
  };

  // Trigger heart burst
  const handleLoveBurst = () => {
    audioManager.playChime();
    confetti({
      particleCount: 55,
      spread: 70,
      origin: { y: 0.75 },
      colors: ['#f43f5e', '#fb7185', '#fbbf24', '#fda4af'],
    });

    // Add floating emoji heart
    const id = Date.now() + Math.random();
    setFloatingHearts((prev) => [...prev.slice(-6), { id, x: (Math.random() - 0.5) * 180 }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== id));
    }, 2000);
  };

  return (
    <div className="relative z-10 w-full min-h-screen py-10 px-4 sm:px-6 flex flex-col items-center justify-start overflow-x-hidden">
      {/* Gentle drifting ambient background particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              y: -50,
              x: `${(i / 12) * 100}%`,
              opacity: 0,
              rotate: 0,
            }}
            animate={{
              y: '105vh',
              x: `${(i / 12) * 100 + Math.sin(i) * 12}%`,
              opacity: [0, 0.35, 0.5, 0],
              rotate: 360,
            }}
            transition={{
              duration: 14 + (i % 5) * 3,
              repeat: Infinity,
              delay: (i * 1.8) % 8,
              ease: 'linear',
            }}
            className="absolute text-rose-300/30 text-lg select-none"
          >
            {i % 2 === 0 ? '🌸' : '✨'}
          </motion.div>
        ))}
      </div>

      {/* Top Floating Glassmorphism Navigation Bar */}
      <div className="relative z-20 w-full max-w-2xl flex items-center justify-between mb-8">
        <button
          onClick={onReplay}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-rose-200 text-xs sm:text-sm font-semibold border border-rose-500/30 shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Quay lại ngắm bó hoa 3D"
        >
          <ArrowLeft className="w-4 h-4 text-rose-400" />
          <span>Trở về đóa hoa 3D</span>
        </button>

        <button
          onClick={handleLoveBurst}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Heart className="w-4 h-4 fill-white" />
          <span>Thả tim yêu thương</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* THE MASTERPIECE LUXURY COTTON PARCHMENT LOVE LETTER                       */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', damping: 24 }}
        className="relative z-20 w-full max-w-2xl flex flex-col items-center"
      >
        {/* Luxury Double-Bezel Cotton Parchment Container */}
        <div className="relative w-full bg-[#fdfbf7] rounded-3xl p-8 sm:p-14 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.5),0_0_60px_rgba(251,191,36,0.08)] border-2 border-amber-300/60 overflow-hidden text-left">
          {/* Fine Inner Filigree Border Frame */}
          <div className="absolute inset-3 sm:inset-4 border border-amber-200/50 rounded-2xl pointer-events-none"></div>

          {/* Elegant Corner Engravings (SVG Botanical Flourishes) */}
          <svg
            className="absolute top-4 left-4 w-8 h-8 text-amber-400/60 pointer-events-none"
            viewBox="0 0 40 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 36V12C4 7.58 7.58 4 12 4H36" />
            <path d="M10 28V14C10 11.79 11.79 10 14 10H28" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.6" />
          </svg>
          <svg
            className="absolute top-4 right-4 w-8 h-8 text-amber-400/60 pointer-events-none rotate-90"
            viewBox="0 0 40 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 36V12C4 7.58 7.58 4 12 4H36" />
            <path d="M10 28V14C10 11.79 11.79 10 14 10H28" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.6" />
          </svg>
          <svg
            className="absolute bottom-4 left-4 w-8 h-8 text-amber-400/60 pointer-events-none -rotate-90"
            viewBox="0 0 40 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 36V12C4 7.58 7.58 4 12 4H36" />
            <path d="M10 28V14C10 11.79 11.79 10 14 10H28" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.6" />
          </svg>
          <svg
            className="absolute bottom-4 right-4 w-8 h-8 text-amber-400/60 pointer-events-none rotate-180"
            viewBox="0 0 40 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 36V12C4 7.58 7.58 4 12 4H36" />
            <path d="M10 28V14C10 11.79 11.79 10 14 10H28" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.6" />
          </svg>

          {/* Fast-forward Typewriter Button */}
          {!isTypingComplete && (
            <button
              onClick={handleSkipTypewriter}
              className="absolute top-5 right-6 z-20 text-[11px] font-bold px-3 py-1 rounded-full bg-rose-100/90 hover:bg-rose-200 text-rose-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1 backdrop-blur-xs"
              title="Đọc toàn bộ thư ngay"
            >
              <Feather className="w-3 h-3 text-rose-500" />
              <span>Đọc hết ngay ⚡</span>
            </button>
          )}

          {/* Salutation & Vintage Date */}
          <div className="relative border-b border-rose-200/60 pb-5 mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5">
            <h2 className="font-serif-romantic text-2xl sm:text-3xl font-bold text-rose-950 tracking-tight">
              {config?.letter?.salutation || 'Gửi công chúa nhỏ của anh,'}
            </h2>
            <span className="font-serif italic text-xs sm:text-sm text-stone-500">
              Hà Nội, ngày 20 tháng 10 năm 2026
            </span>
          </div>

          {/* Body Paragraphs with Organic Flowing Typewriter Motion */}
          <div className="space-y-6 text-stone-800 text-[17px] sm:text-lg leading-[2.05] font-serif">
            {displayedParagraphs.map((para, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="indent-6 sm:indent-8 text-justify"
              >
                {para}
              </motion.p>
            ))}

            {!isTypingComplete && currentParaIndex < paragraphs.length && (
              <p className="indent-6 sm:indent-8 text-stone-900 text-justify font-serif">
                {paragraphs[currentParaIndex].slice(0, charIndex)}
                <span className="inline-block w-2 h-5 bg-rose-500 ml-1 rounded-xs animate-pulse align-middle shadow-xs"></span>
              </p>
            )}
          </div>

          {/* Closing & Handwritten Signature with Royal Crimson Wax Seal */}
          <div className="mt-12 pt-7 border-t border-rose-200/60 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Embossed Royal Wax Seal Watermark on Paper */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-800 to-red-600 flex items-center justify-center shadow-lg border-2 border-amber-300/80">
                <Heart className="w-7 h-7 text-amber-200 fill-amber-200" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-rose-600 tracking-widest block">
                  Niêm phong vĩnh cửu
                </span>
                <span className="text-xs text-stone-500 font-serif italic">
                  Trọn một đời yêu thương
                </span>
              </div>
            </div>

            {/* Handwritten Signature */}
            <div className="text-center sm:text-right">
              <span className="text-stone-500 text-sm font-serif italic block mb-1">
                {config?.letter?.closing || 'Mãi yêu em,'}
              </span>
              <span className="font-handwriting text-3xl sm:text-4xl text-rose-700 font-bold tracking-wide block">
                {config?.senderName || 'Người thương của em'}
              </span>
            </div>
          </div>
        </div>

        {/* Romantic Bottom Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            onClick={handleReRead}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-rose-200 text-xs sm:text-sm font-semibold border border-rose-500/30 shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Đọc lại thư 📜</span>
          </button>

          <button
            onClick={onReplay}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-rose-200 text-xs sm:text-sm font-semibold border border-rose-500/30 shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-rose-400" />
            <span>Quay lại ngắm đóa hoa 3D 💐</span>
          </button>
        </div>
      </motion.div>

      {/* Floating Interactive Hearts Overlay */}
      <AnimatePresence>
        {floatingHearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 1, y: 0, scale: 0.5, x: heart.x }}
            animate={{ opacity: 0, y: -260, scale: 1.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            className="fixed bottom-24 pointer-events-none z-50 text-4xl select-none"
          >
            💖
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
