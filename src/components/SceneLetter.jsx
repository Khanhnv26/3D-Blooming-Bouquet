import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Calendar, RotateCcw, ArrowLeft, Feather } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioManager } from '../utils/audio';

export default function SceneLetter({ config, onReplay }) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayedParagraphs, setDisplayedParagraphs] = useState([]);
  const [currentParaIndex, setCurrentParaIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);

  const paragraphs = config.letter.paragraphs;

  // Calculate love days
  const calculateDays = () => {
    if (!config.anniversaryDate) return null;
    const start = new Date(config.anniversaryDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const loveDays = calculateDays();

  // Open letter action with rich fanfare
  const handleOpenLetter = () => {
    setIsOpen(true);
    audioManager.playMagicFanfare();
    confetti({
      particleCount: 80,
      spread: 85,
      origin: { y: 0.5 },
      colors: ['#e11d48', '#f43f5e', '#fbbf24', '#fbcfe8', '#fff1f2'],
    });
  };

  // Typewriter effect for paragraphs
  useEffect(() => {
    if (!isOpen || isTypingComplete) return;

    if (currentParaIndex >= paragraphs.length) {
      setIsTypingComplete(true);
      return;
    }

    const currentText = paragraphs[currentParaIndex];

    if (charIndex < currentText.length) {
      const timer = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
      }, 24);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setDisplayedParagraphs((prev) => [...prev, currentText]);
        setCurrentParaIndex((prev) => prev + 1);
        setCharIndex(0);
      }, 380);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentParaIndex, charIndex, isTypingComplete, paragraphs]);

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
  const handleLoveBurst = (e) => {
    audioManager.playChime();
    confetti({
      particleCount: 60,
      spread: 75,
      origin: { y: 0.7 },
      colors: ['#f43f5e', '#fb7185', '#fbbf24', '#fda4af'],
    });

    // Add floating emoji heart
    const id = Date.now() + Math.random();
    setFloatingHearts((prev) => [...prev.slice(-6), { id, x: (Math.random() - 0.5) * 200 }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== id));
    }, 2000);
  };

  return (
    <div className="relative z-10 w-full min-h-screen py-8 px-4 flex flex-col items-center justify-start overflow-x-hidden">
      {/* Gentle drifting ambient background particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              y: -50,
              x: `${(i / 14) * 100}%`,
              opacity: 0,
              rotate: 0,
            }}
            animate={{
              y: '105vh',
              x: `${(i / 14) * 100 + Math.sin(i) * 10}%`,
              opacity: [0, 0.45, 0.6, 0],
              rotate: 360,
            }}
            transition={{
              duration: 12 + (i % 6) * 3,
              repeat: Infinity,
              delay: (i * 1.5) % 8,
              ease: 'linear',
            }}
            className="absolute text-rose-300/40 text-lg sm:text-xl select-none"
          >
            {i % 3 === 0 ? '🌸' : i % 3 === 1 ? '✨' : '💖'}
          </motion.div>
        ))}
      </div>

      {/* Top Navigation Bar */}
      <div className="relative z-20 w-full max-w-2xl flex items-center justify-between mb-6">
        <button
          onClick={onReplay}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-rose-200 text-xs sm:text-sm font-semibold border border-rose-500/30 shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Quay lại ngắm bó hoa 3D"
        >
          <ArrowLeft className="w-4 h-4 text-rose-400" />
          <span>Quay lại ngắm bó hoa 3D 💐</span>
        </button>

        {isOpen && (
          <button
            onClick={handleLoveBurst}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-500/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>Thả tim yêu thương</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. SEALED ENVELOPE STAGE (Khi chưa mở thư)                                  */}
      {/* ========================================================================= */}
      {!isOpen ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring', damping: 22 }}
          className="relative z-20 flex flex-col items-center justify-center my-auto min-h-[68vh] text-center max-w-lg"
        >
          {/* Header Title */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-950/80 text-rose-300 text-xs sm:text-sm font-semibold tracking-wider uppercase border border-rose-500/40 shadow-sm mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Bức Thư Tình Dành Riêng Cho Em</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </span>
            <h2 className="font-serif-romantic text-3xl sm:text-4xl font-bold text-rose-100 drop-shadow-[0_2px_20px_rgba(244,63,94,0.6)]">
              Gửi Người Anh Thương Nhất 🌸
            </h2>
            <p className="text-rose-200/80 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
              Trái tim anh đã gửi trọn vào những dòng chữ này. Hãy chạm vào con dấu sáp đỏ để mở thư...
            </p>
          </div>

          {/* 3D-feel Realistic Sealed Envelope */}
          <motion.div
            whileHover={{ scale: 1.04, rotate: 0.5 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenLetter}
            className="relative w-84 sm:w-96 h-56 sm:h-64 rounded-3xl bg-gradient-to-br from-[#fffdf7] via-[#fff8ef] to-[#fcefe3] border-2 border-amber-200/80 shadow-[0_25px_60px_-15px_rgba(225,29,72,0.35)] cursor-pointer flex flex-col items-center justify-between p-6 select-none overflow-hidden group transition-all"
          >
            {/* Triangular Flap Fold lines */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-100/50 to-transparent border-b-2 border-amber-300/40 [clip-path:polygon(0_0,100%_0,50%_100%)]"></div>

            {/* Subtle vintage postage stamp */}
            <div className="absolute top-4 right-4 w-12 h-14 border-2 border-dashed border-rose-300/80 rounded bg-white/90 p-1 flex flex-col items-center justify-center text-center shadow-xs">
              <span className="text-[8px] uppercase tracking-tighter text-rose-500 font-bold">20.10</span>
              <span className="text-lg">💌</span>
              <span className="text-[7px] text-amber-600 font-bold tracking-widest">LOVE</span>
            </div>

            {/* Fine satin ribbon crossing */}
            <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-4 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 opacity-70 shadow-xs border-y border-amber-500/30"></div>

            {/* Recipient Details */}
            <div className="text-center z-10 mt-6">
              <span className="text-[11px] uppercase tracking-widest text-rose-400 font-bold">Thân gửi</span>
              <h3 className="font-serif-romantic text-2xl sm:text-3xl text-rose-950 font-bold mt-0.5">
                {config.recipientName}
              </h3>
              <p className="text-xs text-stone-500 mt-1 italic font-serif">
                {config.occasion}
              </p>
            </div>

            {/* Royal Crimson Wax Seal Button */}
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                boxShadow: [
                  '0 0 0 0 rgba(225, 29, 72, 0.45)',
                  '0 0 0 16px rgba(225, 29, 72, 0)',
                  '0 0 0 0 rgba(225, 29, 72, 0.45)',
                ],
              }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-tr from-rose-800 via-red-600 to-rose-700 border-2 border-amber-300/90 flex items-center justify-center shadow-xl cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full border border-rose-300/50 flex items-center justify-center bg-rose-900/60 shadow-inner">
                <Heart className="w-6 h-6 text-amber-200 fill-amber-200 drop-shadow-sm" />
              </div>
            </motion.div>

            {/* Prompt at bottom */}
            <div className="z-10 text-[11px] text-rose-500 font-semibold flex items-center gap-1.5 group-hover:text-rose-700 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span>Chạm vào con dấu sáp để bẻ niêm phong thư</span>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        /* ========================================================================= */
        /* 2. THE UNFOLDED MASTERPIECE LOVE LETTER                                   */
        /* ========================================================================= */
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 35 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring', damping: 24 }}
          className="relative z-20 w-full max-w-2xl flex flex-col items-center"
        >
          {/* Days in Love Badge */}
          {loveDays && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-stone-900/85 backdrop-blur-md border border-amber-400/40 shadow-xl text-rose-100 text-xs sm:text-sm font-semibold mb-6"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Đôi ta đã cùng nhau đi qua</span>
              <span className="font-bold text-amber-300 text-base px-2 py-0.5 bg-rose-950/80 rounded-lg border border-amber-400/30">
                {loveDays}
              </span>
              <span>ngày đong đầy yêu thương ❤️</span>
            </motion.div>
          )}

          {/* Luxury Cotton Parchment Letter Container */}
          <div className="relative w-full bg-[#fdfbf7] rounded-3xl p-7 sm:p-12 shadow-[0_25px_60px_-15px_rgba(225,29,72,0.3),0_0_50px_rgba(251,191,36,0.12)] border-2 border-amber-300/60 overflow-hidden text-left">
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
                className="absolute top-5 right-6 z-20 text-[11px] font-bold px-3 py-1 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                title="Đọc toàn bộ thư ngay"
              >
                <Feather className="w-3 h-3 text-rose-500" />
                <span>Đọc hết ngay ⚡</span>
              </button>
            )}

            {/* Salutation & Vintage Date */}
            <div className="relative border-b border-rose-200/60 pb-5 mb-7 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5">
              <h2 className="font-serif-romantic text-2xl sm:text-3xl font-bold text-rose-950 tracking-tight">
                {config.letter.salutation}
              </h2>
              <span className="font-serif italic text-xs sm:text-sm text-stone-500">
                Ngày 20 tháng 10 năm 2026
              </span>
            </div>

            {/* Body Paragraphs with Organic Typewriter Motion */}
            <div className="space-y-5 text-stone-800 text-base sm:text-lg leading-relaxed font-serif">
              {displayedParagraphs.map((para, idx) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="indent-6 sm:indent-8 text-justify leading-[1.85]"
                >
                  {para}
                </motion.p>
              ))}

              {!isTypingComplete && currentParaIndex < paragraphs.length && (
                <p className="indent-6 sm:indent-8 text-stone-900 leading-[1.85] text-justify font-serif">
                  {paragraphs[currentParaIndex].slice(0, charIndex)}
                  <span className="inline-block w-2 h-5 bg-rose-500 ml-1 rounded-xs animate-pulse align-middle shadow-xs"></span>
                </p>
              )}
            </div>

            {/* Closing & Handwritten Signature */}
            <div className="mt-10 pt-6 border-t border-rose-200/60 flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Embossed Wax Seal Watermark on Paper */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-700 to-red-600 flex items-center justify-center shadow-lg border border-amber-300/60">
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
              <div className="text-right">
                <span className="text-stone-500 text-sm font-serif italic block mb-1">
                  {config.letter.closing}
                </span>
                <span className="font-handwriting text-3xl sm:text-4xl text-rose-700 font-bold tracking-wide block">
                  {config.senderName}
                </span>
              </div>
            </div>
          </div>

          {/* Romantic Controls & Navigation */}
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
      )}

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
