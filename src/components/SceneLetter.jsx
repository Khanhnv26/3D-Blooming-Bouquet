import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, RotateCcw, ArrowLeft, Feather, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioManager } from '../utils/audio';

/* ------------------------------------------------------------------ */
/* 1. Realistic Drifting Rose Petals & Golden Bokeh Layer             */
/* ------------------------------------------------------------------ */
function FloatingRosePetals() {
  const petals = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        id: i,
        left: `${(i * 4.6 + 2) % 96}%`,
        size: 14 + (i % 5) * 4,
        duration: 11 + (i % 6) * 2.8,
        delay: (i * 1.3) % 8,
        sway: 18 + (i % 4) * 14,
        rotateStart: (i * 40) % 360,
        opacity: 0.35 + (i % 4) * 0.14,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Golden bokeh ambient orbs */}
      <div className="absolute top-1/4 left-1/6 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-2/3 right-1/6 w-80 h-80 rounded-full bg-rose-600/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-400/8 blur-3xl pointer-events-none" />

      {petals.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            y: -60,
            x: 0,
            opacity: 0,
            rotate: p.rotateStart,
          }}
          animate={{
            y: '105vh',
            x: [0, p.sway, -p.sway, 0],
            opacity: [0, p.opacity, p.opacity * 0.85, 0],
            rotate: p.rotateStart + 360,
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
          style={{ left: p.left }}
          className="absolute select-none"
        >
          <svg
            width={p.size}
            height={p.size * 1.3}
            viewBox="0 0 30 40"
            fill="none"
            className="drop-shadow-[0_2px_8px_rgba(225,29,72,0.4)]"
          >
            <path
              d="M15 0 C25 8 30 22 24 34 C18 42 12 42 6 34 C0 22 5 8 15 0 Z"
              fill="url(#rosePetalGrad)"
            />
          </svg>
        </motion.div>
      ))}

      {/* Shared Gradient Definition */}
      <svg className="absolute w-0 h-0">
        <defs>
          <linearGradient id="rosePetalGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fb7185" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#e11d48" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#881337" stopOpacity="0.95" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Romantic Flickering Taper Candle with Golden Aura Glow           */
/* ------------------------------------------------------------------ */
function RomanticCandle() {
  return (
    <div className="relative flex flex-col items-center">
      {/* Ambient Candlelight Radial Halo */}
      <div className="absolute -top-14 w-52 h-52 rounded-full bg-amber-400/22 blur-2xl pointer-events-none animate-pulse" />

      {/* Flame */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={{
            scale: [1, 1.08, 0.94, 1.06, 1],
            rotate: [-1.5, 2, -1, 1.5, -1.5],
            y: [0, -1, 0, -1.5, 0],
          }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-4 h-9 bg-gradient-to-t from-amber-500 via-amber-300 to-amber-100 rounded-[50%_50%_35%_35%] shadow-[0_0_22px_rgba(251,191,36,0.85)] flex items-center justify-center"
        >
          {/* Inner blue-white flame core */}
          <div className="w-1.5 h-3.5 bg-white/95 rounded-[50%_50%_30%_30%] mt-3.5 shadow-inner" />
        </motion.div>
        {/* Wick */}
        <div className="w-0.5 h-2.5 bg-stone-800 -mt-0.5" />
      </div>

      {/* Candle Pillar */}
      <div className="w-10 h-32 bg-gradient-to-r from-[#fefbf3] via-[#fef3c7] to-[#e7e5e4] rounded-t-sm shadow-lg relative overflow-hidden border-t border-amber-200/50">
        {/* Soft melted wax drips */}
        <div className="absolute top-0 right-2 w-2 h-7 bg-[#fefbf3] rounded-b-full shadow-xs" />
        <div className="absolute top-0 left-2.5 w-1.5 h-4 bg-[#fef9c3] rounded-b-full shadow-xs" />
      </div>

      {/* Antique Brass Candleholder */}
      <div className="w-14 h-3.5 bg-gradient-to-r from-amber-800 via-amber-500 to-amber-900 rounded-sm shadow-md" />
      <div className="w-22 h-3 bg-gradient-to-r from-amber-900 via-amber-600 to-amber-950 rounded-full shadow-xl -mt-0.5" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Vintage Botanical Dried Rose & Eucalyptus Sprig                 */
/* ------------------------------------------------------------------ */
function DriedBotanicalSprig() {
  return (
    <div className="relative flex flex-col items-center rotate-6 opacity-85 hover:opacity-100 transition-opacity">
      <svg className="w-32 h-44 drop-shadow-md" viewBox="0 0 100 150" fill="none">
        {/* Central stem */}
        <path d="M50 145 C45 100 60 50 48 10" stroke="#78716c" strokeWidth="2.2" strokeLinecap="round" />
        {/* Eucalyptus leaves */}
        <path d="M48 110 C28 100 24 84 34 78 C44 80 47 98 48 110" fill="#a8a29e" fillOpacity="0.5" stroke="#78716c" strokeWidth="1" />
        <path d="M52 90 C72 82 80 68 70 60 C60 62 54 78 52 90" fill="#a8a29e" fillOpacity="0.5" stroke="#78716c" strokeWidth="1" />
        <path d="M47 65 C30 58 26 42 36 36 C46 38 48 52 47 65" fill="#a8a29e" fillOpacity="0.5" stroke="#78716c" strokeWidth="1" />
        {/* Dried Rosebud Blossom */}
        <g transform="translate(48, 12)">
          <ellipse cx="0" cy="0" rx="9" ry="12" fill="#9f1239" fillOpacity="0.85" />
          <path d="M-6 -4 C-2 -10 2 -10 6 -4 C4 4 -4 4 -6 -4" fill="#e11d48" fillOpacity="0.9" />
          <circle cx="0" cy="-2" r="3" fill="#f43f5e" />
        </g>
      </svg>
      <span className="text-[10px] text-amber-200/50 uppercase tracking-widest font-serif -mt-2">
        Nhành hoa khô
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Antique Gold & Rosewood Fountain Pen                            */
/* ------------------------------------------------------------------ */
function VintageFountainPen() {
  return (
    <div className="relative flex flex-col items-center rotate-12 drop-shadow-xl select-none pointer-events-none">
      {/* Pen Barrel */}
      <div className="w-3.5 h-36 bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 rounded-t-full shadow-lg relative">
        {/* Gold Trim Rings */}
        <div className="absolute bottom-6 inset-x-0 h-1.5 bg-gradient-to-r from-amber-300 via-amber-100 to-amber-400 shadow-xs" />
        <div className="absolute bottom-4 inset-x-0 h-1 bg-amber-400" />
      </div>

      {/* Two-tone Gold Fountain Nib */}
      <svg className="w-5 h-8 text-amber-300 -mt-0.5 drop-shadow-md" viewBox="0 0 24 36" fill="currentColor">
        <path d="M12 36 L4 14 C4 8 7 0 12 0 C17 0 20 8 20 14 Z" fill="url(#fountainNibGrad)" />
        <path d="M12 0 L12 24" stroke="#78350f" strokeWidth="1" />
        <circle cx="12" cy="24" r="1.5" fill="#78350f" />
        <defs>
          <linearGradient id="fountainNibGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>
      </svg>

      {/* Ink Shadow on Table */}
      <div className="w-14 h-1.5 bg-black/40 blur-xs rounded-full mt-1" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Keepsake Wax Seal & Opened Envelope Decor                       */
/* ------------------------------------------------------------------ */
function KeepsakeEnvelopeDecor() {
  return (
    <div className="flex flex-col items-center gap-2 -rotate-6 select-none pointer-events-none">
      <div className="w-20 h-14 rounded-lg bg-stone-900/80 border border-amber-400/35 p-2 shadow-xl backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden">
        {/* Gold Satin Ribbon Drape */}
        <div className="absolute top-2 inset-x-0 h-2 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 opacity-80" />
        {/* Heart Wax Seal */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-900 to-red-600 border border-amber-300 flex items-center justify-center shadow-md relative z-10">
          <Heart className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
        </div>
      </div>
      <span className="text-[10px] text-amber-200/60 uppercase tracking-widest font-serif">
        Kỷ niệm 20.10
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT: SceneLetter                                        */
/* ------------------------------------------------------------------ */
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
      particleCount: 65,
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
      {/* 1. Gentle Drifting Rose Petals & Golden Bokeh Layer */}
      <FloatingRosePetals />

      {/* 2. Top Floating Navigation Bar */}
      <div className="relative z-20 w-full max-w-4xl flex items-center justify-between mb-8">
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
      {/* 3. DESKTOP STAGE: ROMANTIC WRITING DESK WITH FLANKING ATMOSPHERE ELEMENTS */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full max-w-6xl flex items-start justify-center gap-6 lg:gap-10">
        {/* Left Flank: Candlelight & Dried Rose Sprig (Shown on desktop/tablet) */}
        <aside className="hidden lg:flex flex-col items-center gap-12 select-none pointer-events-none sticky top-28 pt-8">
          <RomanticCandle />
          <DriedBotanicalSprig />
        </aside>

        {/* ========================================================================= */}
        {/* THE MASTERPIECE LUXURY COTTON PARCHMENT LOVE LETTER                       */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring', damping: 24 }}
          className="relative z-20 w-full max-w-2xl sm:max-w-3xl flex flex-col items-center"
        >
          {/* Luxury Double-Bezel Cotton Parchment Container */}
          <div className="relative w-full bg-[#fdfbf7] rounded-3xl p-8 sm:p-14 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.6),0_0_60px_rgba(251,191,36,0.1)] border-2 border-amber-300/60 overflow-hidden text-left">
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
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-900 via-rose-800 to-red-700 flex items-center justify-center shadow-lg border-2 border-amber-300/80">
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

        {/* Right Flank: Vintage Fountain Pen & Keepsake Envelope (Shown on desktop/tablet) */}
        <aside className="hidden lg:flex flex-col items-center gap-14 select-none pointer-events-none sticky top-28 pt-8">
          <VintageFountainPen />
          <KeepsakeEnvelopeDecor />
        </aside>
      </div>

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
