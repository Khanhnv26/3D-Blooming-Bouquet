import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, RotateCcw, ArrowLeft, Sparkles } from 'lucide-react';
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
/* 2. Floating Fireflies & Golden Embers Layer                        */
/* ------------------------------------------------------------------ */
function AmbientFireflies() {
  const flies = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: `${(i * 7.1 + 4) % 92}%`,
        top: `${(i * 8.5 + 8) % 86}%`,
        size: 3 + (i % 3) * 1.5,
        duration: 4.5 + (i % 4) * 1.6,
        delay: (i * 0.6) % 3,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {flies.map((f) => (
        <motion.div
          key={f.id}
          animate={{
            y: [0, -18, 6, -14, 0],
            x: [0, 14, -10, 8, 0],
            opacity: [0.2, 0.85, 0.3, 0.9, 0.2],
            scale: [1, 1.25, 0.9, 1.2, 1],
          }}
          transition={{
            duration: f.duration,
            repeat: Infinity,
            delay: f.delay,
            ease: 'easeInOut',
          }}
          style={{
            left: f.left,
            top: f.top,
            width: f.size,
            height: f.size,
          }}
          className="absolute rounded-full bg-amber-300 blur-[0.6px] shadow-[0_0_12px_rgba(251,191,36,0.95)]"
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Romantic Flickering Taper Candle with Dynamic Embers & Flares   */
/* ------------------------------------------------------------------ */
function RomanticCandle() {
  const handleCandleClick = () => {
    audioManager.playChime();
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { x: 0.18, y: 0.35 },
      colors: ['#fbbf24', '#fef08a', '#f59e0b', '#fff'],
    });
  };

  return (
    <div
      onClick={handleCandleClick}
      title="Chạm vào ngọn nến để bùng tia sáng ấm áp ✨"
      className="relative flex flex-col items-center cursor-pointer hover:scale-105 active:scale-95 transition-transform group"
    >
      {/* Ambient Candlelight Radial Halo */}
      <motion.div
        animate={{
          scale: [1, 1.15, 0.95, 1.1, 1],
          opacity: [0.22, 0.32, 0.20, 0.30, 0.22],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-14 w-56 h-56 rounded-full bg-amber-400/25 blur-2xl pointer-events-none"
      />

      {/* Rising Golden Embers / Sparkles from Flame */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ y: 0, opacity: 0.9, scale: 1 }}
          animate={{
            y: -48 - i * 14,
            x: [(i - 1) * 7, (1 - i) * 8, (i - 1) * 5],
            opacity: [0.9, 0.4, 0],
            scale: [1, 0.8, 0.2],
          }}
          transition={{
            duration: 1.8 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.6,
            ease: 'easeOut',
          }}
          className="absolute -top-3 w-1.5 h-1.5 bg-amber-300 rounded-full blur-[0.5px] shadow-[0_0_8px_rgba(251,191,36,0.9)] pointer-events-none"
        />
      ))}

      {/* Flame */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 0.92, 1.08, 1],
            rotate: [-2, 2.5, -1.5, 2, -2],
            y: [0, -1.5, 0, -2, 0],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-4 h-9 bg-gradient-to-t from-amber-500 via-amber-300 to-amber-100 rounded-[50%_50%_35%_35%] shadow-[0_0_24px_rgba(251,191,36,0.9)] flex items-center justify-center group-hover:scale-125 transition-transform"
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
/* 4. Vintage Botanical Dried Rose & Eucalyptus Sprig (Swaying)       */
/* ------------------------------------------------------------------ */
function DriedBotanicalSprig() {
  const handleSprigClick = () => {
    audioManager.playChime();
    confetti({
      particleCount: 22,
      spread: 55,
      origin: { x: 0.18, y: 0.65 },
      colors: ['#e11d48', '#fda4af', '#f43f5e', '#fb7185'],
    });
  };

  return (
    <motion.div
      animate={{
        rotate: [3, 7, 2, 6, 3],
      }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: 'bottom center' }}
      onClick={handleSprigClick}
      title="Chạm vào nhành hoa để rụng cánh hoa tình yêu 🌸"
      className="relative flex flex-col items-center cursor-pointer hover:scale-110 active:scale-95 transition-transform group"
    >
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
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Antique Gold & Rosewood Fountain Pen (Dancing / Writing)        */
/* ------------------------------------------------------------------ */
function VintageFountainPen({ isTyping }) {
  const handlePenClick = () => {
    audioManager.playChime();
    confetti({
      particleCount: 20,
      spread: 50,
      origin: { x: 0.82, y: 0.35 },
      colors: ['#fbbf24', '#fef08a', '#d97706'],
    });
  };

  return (
    <motion.div
      animate={
        isTyping
          ? {
              y: [0, -6, 2, -4, 0],
              x: [0, 4, -3, 3, 0],
              rotate: [12, 17, 9, 15, 12],
            }
          : {
              rotate: [12, 14, 11, 13, 12],
              y: [0, -2, 0, -1, 0],
            }
      }
      transition={{
        duration: isTyping ? 1.4 : 5.0,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      onClick={handlePenClick}
      title="Bút máy mạ vàng đang nắn nót từng dòng thư 🖋️"
      className="relative flex flex-col items-center drop-shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-transform group"
    >
      {/* Pen Barrel */}
      <div className="w-3.5 h-36 bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 rounded-t-full shadow-lg relative">
        {/* Gold Trim Rings */}
        <div className="absolute bottom-6 inset-x-0 h-1.5 bg-gradient-to-r from-amber-300 via-amber-100 to-amber-400 shadow-xs" />
        <div className="absolute bottom-4 inset-x-0 h-1 bg-amber-400" />
      </div>

      {/* Two-tone Gold Fountain Nib */}
      <div className="relative">
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

        {/* Dancing Golden Ink Sparkle at Nib while typing */}
        {isTyping && (
          <motion.div
            animate={{ scale: [0.6, 1.4, 0.6], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,1)] pointer-events-none"
          />
        )}
      </div>

      {/* Ink Shadow on Table */}
      <div className="w-14 h-1.5 bg-black/40 blur-xs rounded-full mt-1" />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Keepsake Wax Seal & Opened Envelope Decor (Interactive)         */
/* ------------------------------------------------------------------ */
function KeepsakeEnvelopeDecor() {
  const handleEnvelopeClick = () => {
    audioManager.playChime();
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x: 0.82, y: 0.65 },
      colors: ['#e11d48', '#fda4af', '#f43f5e', '#fbbf24'],
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.12, rotate: -2 }}
      whileTap={{ scale: 0.94 }}
      onClick={handleEnvelopeClick}
      title="Chạm vào phong thư kỷ niệm để thả tim ❤️"
      className="flex flex-col items-center gap-2 -rotate-6 cursor-pointer drop-shadow-xl select-none"
    >
      <div className="w-20 h-14 rounded-lg bg-stone-900/85 border border-amber-400/40 p-2 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden">
        {/* Gold Satin Ribbon Drape */}
        <div className="absolute top-2.5 inset-x-0 h-2 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 opacity-90 shadow-xs" />
        {/* Heart Wax Seal */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-900 to-red-600 border border-amber-300 flex items-center justify-center shadow-md relative z-10">
          <Heart className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
        </div>
      </div>
    </motion.div>
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  // 3D Parallax Tilt Handler
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

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
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative z-10 w-full min-h-screen py-10 px-4 sm:px-6 flex flex-col items-center justify-start overflow-x-hidden"
    >
      {/* 1. Gentle Drifting Rose Petals & Golden Bokeh Layer */}
      <FloatingRosePetals />

      {/* 2. Floating Fireflies & Golden Embers */}
      <AmbientFireflies />

      {/* 3. Top Floating Navigation Bar */}
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
      {/* 4. DESKTOP STAGE: ROMANTIC WRITING DESK WITH FLANKING ATMOSPHERE ELEMENTS */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full max-w-6xl flex items-start justify-center gap-6 lg:gap-10">
        {/* Left Flank: Candlelight & Dried Rose Sprig (Shown on desktop/tablet) */}
        <aside className="hidden lg:flex flex-col items-center gap-12 select-none sticky top-28 pt-8">
          <RomanticCandle />
          <DriedBotanicalSprig />
        </aside>

        {/* ========================================================================= */}
        {/* THE MASTERPIECE LUXURY COTTON PARCHMENT LOVE LETTER WITH 3D PARALLAX TILT */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 25 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            rotateX: -mousePos.y * 5,
            rotateY: mousePos.x * 6,
          }}
          transition={{
            opacity: { duration: 0.8 },
            scale: { duration: 0.8 },
            y: { duration: 0.8 },
            rotateX: { type: 'spring', stiffness: 220, damping: 25 },
            rotateY: { type: 'spring', stiffness: 220, damping: 25 },
          }}
          style={{ transformPerspective: 1200, transformStyle: 'preserve-3d' }}
          className="relative z-20 w-full max-w-2xl sm:max-w-3xl flex flex-col items-center"
        >
          {/* Luxury Double-Bezel Cotton Parchment Container */}
          <div className="relative w-full bg-[#fdfbf7] rounded-3xl p-8 sm:p-14 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.6),0_0_60px_rgba(251,191,36,0.1)] border-2 border-amber-300/60 overflow-hidden text-left">
            {/* Dynamic Metallic Light Sheen sweeping with mouse angle */}
            <div
              className="absolute inset-0 pointer-events-none rounded-3xl opacity-30 transition-opacity duration-300"
              style={{
                background: `linear-gradient(${120 + mousePos.x * 40}deg, transparent 30%, rgba(254, 240, 138, 0.35) ${50 + mousePos.x * 30}%, transparent 70%)`,
              }}
            />

            {/* Candlelight Warmth Aura on Paper Left Flank */}
            <div className="absolute -left-12 top-1/4 w-36 h-72 bg-gradient-to-r from-amber-400/18 via-amber-300/8 to-transparent rounded-full blur-2xl pointer-events-none animate-pulse" />

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
                  <span className="inline-block w-[1.5px] h-[1.1em] bg-rose-800/70 ml-0.5 align-middle animate-pulse rounded-full" />
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
        <aside className="hidden lg:flex flex-col items-center gap-14 select-none sticky top-28 pt-8">
          <VintageFountainPen isTyping={!isTypingComplete} />
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
