import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, ArrowRight, Play, Eye, CheckCircle2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioManager } from '../utils/audio';

export default function SceneBloom({ onNext, recipientName }) {
  // Mode: 'static' (Full bloom for inspection) or 'animated' (Live blooming progression)
  const [viewMode, setViewMode] = useState('static');
  const [animKey, setAnimKey] = useState(0);
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    if (viewMode === 'animated') {
      audioManager.playChime();
      const timer = setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { y: 0.55 },
          colors: ['#f43f5e', '#fb7185', '#fbbf24', '#f472b6', '#fda4af', '#e11d48']
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [viewMode, animKey]);

  const handlePlayAnimation = () => {
    setViewMode('animated');
    setAnimKey((prev) => prev + 1);
  };

  const handleShowStatic = () => {
    setViewMode('static');
  };

  const isAnimated = viewMode === 'animated';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="relative z-10 w-full max-w-2xl mx-auto px-3 sm:px-4 py-2 flex flex-col items-center select-none"
    >
      {/* ================= MOCKUP STAGE CARD ================= */}
      <div className="w-full bg-white/85 backdrop-blur-xl border border-rose-200/90 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-rose-200/50 flex flex-col items-center relative overflow-hidden text-center">
        
        {/* Mockup Inspector Control Bar */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              MOCKUP BÓ HOA 20.10
            </span>
            <span className="text-xs font-semibold text-rose-800 bg-rose-100/90 px-2.5 py-1 rounded-full">
              20 đóa hoa phối tầng
            </span>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-full border border-stone-200 text-xs">
            <button
              onClick={handleShowStatic}
              className={`px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1 ${
                viewMode === 'static'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Dáng hoa nở rộ
            </button>
            <button
              onClick={handlePlayAnimation}
              className={`px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1 ${
                viewMode === 'animated'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Chuyển động nở
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-1">
          <h2 className="font-serif-romantic text-2xl sm:text-3xl font-bold text-rose-950">
            Bó Hoa Tươi Hàn Quốc Đầy Đặn 💐
          </h2>
          <p className="font-casual text-base sm:text-lg text-rose-700/85 mt-0.5">
            Phối tầng dày dặn với 20 bông: Hồng Ohara, Mẫu đơn, Tulip, Cúc tana & Baby trắng
          </p>
        </div>

        {/* ================= THE GRAND BOUQUET STAGE (20 FLOWERS) ================= */}
        <div className="relative w-[340px] h-[410px] sm:w-[450px] sm:h-[490px] flex items-center justify-center my-0.5">
          {/* Ambient Glow */}
          <motion.div
            animate={{
              scale: [1, 1.12, 1],
              opacity: [0.35, 0.65, 0.35]
            }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-t from-rose-200/50 via-pink-100/30 to-amber-100/20 rounded-full blur-3xl pointer-events-none"
          />

          {/* SVG 20-FLOWER BOUQUET */}
          <svg
            key={animKey}
            viewBox="0 0 460 520"
            className="w-full h-full overflow-visible select-none drop-shadow-2xl"
          >
            <defs>
              {/* Korean Paper Gradients */}
              <linearGradient id="paperPinkFluted" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff1f2" />
                <stop offset="30%" stopColor="#ffe4e6" />
                <stop offset="70%" stopColor="#fecdd3" />
                <stop offset="100%" stopColor="#fda4af" />
              </linearGradient>
              <linearGradient id="paperCreamSilk" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#fffbeb" />
                <stop offset="100%" stopColor="#fef3c7" />
              </linearGradient>

              {/* Flower Gradients */}
              <linearGradient id="oharaRose" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbcfe8" />
                <stop offset="40%" stopColor="#f472b6" />
                <stop offset="85%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#9f1239" />
              </linearGradient>
              <linearGradient id="peonyCreamPeach" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff7ed" />
                <stop offset="50%" stopColor="#ffedd5" />
                <stop offset="85%" stopColor="#fed7aa" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
              <linearGradient id="tulipCoral" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="50%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
              <linearGradient id="sprayRosePink" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fce7f3" />
                <stop offset="60%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
              <linearGradient id="ribbonBurgundy" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#be123c" />
                <stop offset="50%" stopColor="#9f1239" />
                <stop offset="100%" stopColor="#4c0519" />
              </linearGradient>
            </defs>

            {/* Pedestal Surface Shadow */}
            <ellipse cx="230" cy="485" rx="150" ry="15" fill="#fecdd3" opacity="0.35" />

            {/* 1. KOREAN WRAPPING PAPER (LỚP GIẤY GÓI XẾP LY PHỒNG TO BỒNG BỀNH) */}
            <motion.g
              initial={isAnimated ? { scale: 0.85, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ originX: "230px", originY: "440px" }}
            >
              {/* Back Fluted Paper Wings (Xòe rộng hai bên) */}
              <path
                d="M 230 460 L 40 220 C 25 150, 110 90, 160 100 L 230 460 Z"
                fill="url(#paperPinkFluted)"
                filter="drop-shadow(0 4px 10px rgba(0,0,0,0.06))"
              />
              <path
                d="M 230 460 L 420 220 C 435 150, 350 90, 300 100 L 230 460 Z"
                fill="url(#paperPinkFluted)"
                filter="drop-shadow(0 4px 10px rgba(0,0,0,0.06))"
              />
              {/* Center Back Cream Silk Paper */}
              <path
                d="M 230 470 L 80 180 C 130 80, 330 80, 380 180 L 230 470 Z"
                fill="url(#paperCreamSilk)"
                opacity="0.95"
              />
              {/* Fluted Pleat Curves */}
              <path d="M 230 460 Q 140 280, 100 130 M 230 460 Q 320 280, 360 130" stroke="#fecdd3" strokeWidth="2.5" opacity="0.7" fill="none" />
              <path d="M 230 460 Q 190 280, 170 110 M 230 460 Q 270 280, 290 110" stroke="#fecdd3" strokeWidth="2" opacity="0.5" fill="none" />
            </motion.g>

            {/* 2. EUCALYPTUS FOLIAGE & SAGE LEAVES (LÁ BẠC KHUYNH DIỆP ĐỆM VIỀN) */}
            <motion.g
              initial={isAnimated ? { opacity: 0, scale: 0.8 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              style={{ originX: "230px", originY: "380px" }}
            >
              {/* Left Eucalyptus */}
              <path d="M 210 390 Q 130 280, 75 160" fill="none" stroke="#15803d" strokeWidth="3" />
              <ellipse cx="95" cy="190" rx="14" ry="18" fill="#86efac" opacity="0.9" transform="rotate(-35 95 190)" />
              <ellipse cx="125" cy="235" rx="15" ry="19" fill="#4ade80" opacity="0.9" transform="rotate(-40 125 235)" />
              <ellipse cx="70" cy="155" rx="13" ry="16" fill="#86efac" transform="rotate(-20 70 155)" />

              {/* Right Eucalyptus */}
              <path d="M 250 390 Q 330 280, 385 160" fill="none" stroke="#15803d" strokeWidth="3" />
              <ellipse cx="365" cy="190" rx="14" ry="18" fill="#86efac" opacity="0.9" transform="rotate(35 365 190)" />
              <ellipse cx="335" cy="235" rx="15" ry="19" fill="#4ade80" opacity="0.9" transform="rotate(40 335 235)" />
              <ellipse cx="390" cy="155" rx="13" ry="16" fill="#86efac" transform="rotate(20 390 155)" />

              {/* Top Sprigs */}
              <ellipse cx="230" cy="95" rx="11" ry="17" fill="#4ade80" opacity="0.8" />
              <ellipse cx="200" cy="105" rx="10" ry="15" fill="#86efac" transform="rotate(-25 200 105)" />
              <ellipse cx="260" cy="105" rx="10" ry="15" fill="#86efac" transform="rotate(25 260 105)" />
            </motion.g>

            {/* 3. BABY'S BREATH WHITE FILLERS (18 CHÙM HOA BABY TRẮNG LI TI) */}
            <motion.g
              initial={isAnimated ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {[
                { x: 95, y: 180 }, { x: 120, y: 150 }, { x: 80, y: 220 },
                { x: 155, y: 115 }, { x: 230, y: 105 }, { x: 305, y: 115 },
                { x: 365, y: 180 }, { x: 340, y: 150 }, { x: 380, y: 220 },
                { x: 120, y: 290 }, { x: 340, y: 290 }, { x: 165, y: 340 },
                { x: 295, y: 340 }, { x: 230, y: 355 }, { x: 110, y: 250 },
                { x: 350, y: 250 }, { x: 175, y: 190 }, { x: 285, y: 190 }
              ].map((p, i) => (
                <g key={`baby3-${i}`}>
                  <circle cx={p.x} cy={p.y} r="5.5" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.12))" />
                  <circle cx={p.x + 3.5} cy={p.y - 2.5} r="4" fill="#ffffff" />
                  <circle cx={p.x - 3} cy={p.y + 2.5} r="3.5" fill="#ffffff" />
                  <circle cx={p.x} cy={p.y} r="1.8" fill="#fef08a" />
                </g>
              ))}
            </motion.g>

            {/* 4. THE 20 FLOWERS (ARRANGED IN A DENSE 3D DOME) */}
            {/* --- FLOWER 1 & 2: Far Flank Coral Tulips --- */}
            <motion.g
              initial={isAnimated ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, duration: 0.7, type: "spring" }}
              style={{ originX: "90px", originY: "215px" }}
            >
              <path d="M 90 215 C 70 200, 70 165, 85 155 C 95 170, 95 195, 90 215 Z" fill="url(#tulipCoral)" />
              <path d="M 90 215 C 110 200, 110 165, 95 155 C 85 170, 85 195, 90 215 Z" fill="#fb923c" />
              <path d="M 90 215 C 85 195, 85 175, 90 165 C 95 175, 95 195, 90 215 Z" fill="#f43f5e" />
            </motion.g>

            <motion.g
              initial={isAnimated ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: 0.65, duration: 0.7, type: "spring" }}
              style={{ originX: "370px", originY: "215px" }}
            >
              <path d="M 370 215 C 350 200, 350 165, 365 155 C 375 170, 375 195, 370 215 Z" fill="url(#tulipCoral)" />
              <path d="M 370 215 C 390 200, 390 165, 375 155 C 365 170, 365 195, 370 215 Z" fill="#fb923c" />
              <path d="M 370 215 C 365 195, 365 175, 370 165 C 375 175, 375 195, 370 215 Z" fill="#f43f5e" />
            </motion.g>

            {/* --- FLOWER 3 & 4: Top Slender Peach Tulips --- */}
            <motion.g
              initial={isAnimated ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, duration: 0.7, type: "spring" }}
              style={{ originX: "185px", originY: "135px" }}
            >
              <path d="M 185 135 C 168 120, 165 90, 178 80 C 185 98, 185 120, 185 135 Z" fill="url(#tulipCoral)" />
              <path d="M 185 135 C 202 120, 205 90, 192 80 C 185 98, 185 120, 185 135 Z" fill="#fed7aa" />
              <path d="M 185 135 C 180 115, 180 98, 185 90 C 190 98, 190 115, 185 135 Z" fill="#fb923c" />
            </motion.g>

            <motion.g
              initial={isAnimated ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: 0.75, duration: 0.7, type: "spring" }}
              style={{ originX: "275px", originY: "135px" }}
            >
              <path d="M 275 135 C 258 120, 255 90, 268 80 C 275 98, 275 120, 275 135 Z" fill="url(#tulipCoral)" />
              <path d="M 275 135 C 292 120, 295 90, 282 80 C 275 98, 275 120, 275 135 Z" fill="#fed7aa" />
              <path d="M 275 135 C 270 115, 270 98, 275 90 C 280 98, 280 115, 275 135 Z" fill="#fb923c" />
            </motion.g>

            {/* --- FLOWER 5, 6, 7, 8: 4 Lush Cream Peonies (Hoa mẫu đơn phồng tròn) --- */}
            {/* Peony 1: Upper Left */}
            <motion.g
              initial={isAnimated ? { scale: 0, rotate: -20 } : false}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.8, duration: 0.8, type: "spring", bounce: 0.3 }}
              style={{ originX: "140px", originY: "165px" }}
            >
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
                <ellipse key={`peo1-${i}`} cx="140" cy="165" rx="12" ry="22" fill={i % 2 === 0 ? "url(#peonyCreamPeach)" : "#ffe4e6"} transform={`rotate(${a} 140 165)`} />
              ))}
              <circle cx="140" cy="165" r="10" fill="#fed7aa" />
              <circle cx="140" cy="165" r="6" fill="#f43f5e" />
            </motion.g>

            {/* Peony 2: Upper Right */}
            <motion.g
              initial={isAnimated ? { scale: 0, rotate: 20 } : false}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.85, duration: 0.8, type: "spring", bounce: 0.3 }}
              style={{ originX: "320px", originY: "165px" }}
            >
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
                <ellipse key={`peo2-${i}`} cx="320" cy="165" rx="12" ry="22" fill={i % 2 === 0 ? "url(#peonyCreamPeach)" : "#ffe4e6"} transform={`rotate(${a} 320 165)`} />
              ))}
              <circle cx="320" cy="165" r="10" fill="#fed7aa" />
              <circle cx="320" cy="165" r="6" fill="#f43f5e" />
            </motion.g>

            {/* Peony 3: Lower Left Flank */}
            <motion.g
              initial={isAnimated ? { scale: 0, rotate: -15 } : false}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.9, duration: 0.8, type: "spring" }}
              style={{ originX: "125px", originY: "280px" }}
            >
              {[0, 51, 102, 154, 205, 257, 308].map((a, i) => (
                <ellipse key={`peo3-${i}`} cx="125" cy="280" rx="11" ry="20" fill={i % 2 === 0 ? "#fecdd3" : "url(#peonyCreamPeach)"} transform={`rotate(${a} 125 280)`} />
              ))}
              <circle cx="125" cy="280" r="9" fill="#f472b6" />
            </motion.g>

            {/* Peony 4: Lower Right Flank */}
            <motion.g
              initial={isAnimated ? { scale: 0, rotate: 15 } : false}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.95, duration: 0.8, type: "spring" }}
              style={{ originX: "335px", originY: "280px" }}
            >
              {[0, 51, 102, 154, 205, 257, 308].map((a, i) => (
                <ellipse key={`peo4-${i}`} cx="335" cy="280" rx="11" ry="20" fill={i % 2 === 0 ? "#fecdd3" : "url(#peonyCreamPeach)"} transform={`rotate(${a} 335 280)`} />
              ))}
              <circle cx="335" cy="280" r="9" fill="#f472b6" />
            </motion.g>

            {/* --- FLOWER 9, 10, 11, 12, 13: 5 Chamomile / Cúc Tana Daisies (Trắng nhụy vàng) --- */}
            {/* Daisy 1: High Center Peak */}
            <motion.g
              initial={isAnimated ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: 1.0, duration: 0.6, type: "spring" }}
              style={{ originX: "230px", originY: "120px" }}
            >
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, idx) => (
                <ellipse key={`tana1-${idx}`} cx="230" cy="120" rx="4.5" ry="16" fill="#ffffff" transform={`rotate(${deg} 230 120)`} filter="drop-shadow(0 1px 1px rgba(0,0,0,0.06))" />
              ))}
              <circle cx="230" cy="120" r="8" fill="#facc15" />
            </motion.g>

            {/* Daisy 2: Mid Left */}
            <motion.g
              initial={isAnimated ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: 1.05, duration: 0.6, type: "spring" }}
              style={{ originX: "145px", originY: "215px" }}
            >
              {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg, idx) => (
                <ellipse key={`tana2-${idx}`} cx="145" cy="215" rx="4.5" ry="14" fill="#ffffff" transform={`rotate(${deg} 145 215)`} />
              ))}
              <circle cx="145" cy="215" r="7" fill="#f59e0b" />
            </motion.g>

            {/* Daisy 3: Mid Right */}
            <motion.g
              initial={isAnimated ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: 1.1, duration: 0.6, type: "spring" }}
              style={{ originX: "315px", originY: "215px" }}
            >
              {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg, idx) => (
                <ellipse key={`tana3-${idx}`} cx="315" cy="215" rx="4.5" ry="14" fill="#ffffff" transform={`rotate(${deg} 315 215)`} />
              ))}
              <circle cx="315" cy="215" r="7" fill="#f59e0b" />
            </motion.g>

            {/* Daisy 4: Low Left */}
            <motion.g
              initial={isAnimated ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: 1.15, duration: 0.6 }}
              style={{ originX: "180px", originY: "290px" }}
            >
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => (
                <ellipse key={`tana4-${idx}`} cx="180" cy="290" rx="4" ry="13" fill="#ffffff" transform={`rotate(${deg} 180 290)`} />
              ))}
              <circle cx="180" cy="290" r="6" fill="#facc15" />
            </motion.g>

            {/* Daisy 5: Low Right */}
            <motion.g
              initial={isAnimated ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              style={{ originX: "280px", originY: "290px" }}
            >
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => (
                <ellipse key={`tana5-${idx}`} cx="280" cy="290" rx="4" ry="13" fill="#ffffff" transform={`rotate(${deg} 280 290)`} />
              ))}
              <circle cx="280" cy="290" r="6" fill="#facc15" />
            </motion.g>

            {/* --- FLOWER 14, 15, 16, 17: 4 Pastel Spray Roses (Hồng trà pastel) --- */}
            {/* Spray Rose 1: Upper-left edge */}
            <motion.g
              initial={isAnimated ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: 1.25, duration: 0.6 }}
              style={{ originX: "105px", originY: "160px" }}
            >
              {[0, 72, 144, 216, 288].map((a, i) => (
                <circle key={`sr1-${i}`} cx="105" cy="152" r="8" fill="url(#sprayRosePink)" transform={`rotate(${a} 105 160)`} />
              ))}
              <circle cx="105" cy="160" r="5" fill="#f43f5e" />
            </motion.g>

            {/* Spray Rose 2: Upper-right edge */}
            <motion.g
              initial={isAnimated ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              style={{ originX: "355px", originY: "160px" }}
            >
              {[0, 72, 144, 216, 288].map((a, i) => (
                <circle key={`sr2-${i}`} cx="355" cy="152" r="8" fill="url(#sprayRosePink)" transform={`rotate(${a} 355 160)`} />
              ))}
              <circle cx="355" cy="160" r="5" fill="#f43f5e" />
            </motion.g>

            {/* Spray Rose 3: Lower Center Front */}
            <motion.g
              initial={isAnimated ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: 1.35, duration: 0.6 }}
              style={{ originX: "230px", originY: "275px" }}
            >
              {[0, 60, 120, 180, 240, 300].map((a, i) => (
                <path key={`sr3-${i}`} d="M 230 275 C 215 255, 220 240, 230 240 C 240 240, 245 255, 230 275 Z" fill="#fda4af" transform={`rotate(${a} 230 275)`} />
              ))}
              <circle cx="230" cy="275" r="7" fill="#f43f5e" />
            </motion.g>

            {/* Spray Rose 4: Lower Center Base */}
            <motion.g
              initial={isAnimated ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              style={{ originX: "230px", originY: "320px" }}
            >
              {[0, 72, 144, 216, 288].map((a, i) => (
                <circle key={`sr4-${i}`} cx="230" cy="312" r="9" fill="#fecdd3" transform={`rotate(${a} 230 320)`} />
              ))}
              <circle cx="230" cy="320" r="6" fill="#fb7185" />
            </motion.g>

            {/* --- FLOWER 18, 19, 20: 3 THE QUEEN OHARA ROSES (TÂM ĐIỂM CHỦ ĐẠO LỘNG LẪY NHẤT) --- */}
            {/* Rose 18: Center Left Ohara Rose */}
            <motion.g
              initial={isAnimated ? { scale: 0, rotate: -20 } : false}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.5, duration: 0.9, type: "spring", bounce: 0.35 }}
              style={{ originX: "175px", originY: "225px" }}
            >
              {/* Outer Velvet Petals */}
              {[0, 60, 120, 180, 240, 300].map((a, i) => (
                <path key={`r18-out-${i}`} d="M 175 225 C 145 185, 155 150, 175 150 C 195 150, 205 185, 175 225 Z" fill={i % 2 === 0 ? "url(#oharaRose)" : "#fb7185"} transform={`rotate(${a} 175 225)`} />
              ))}
              {/* Mid Spiral Petals */}
              {[30, 90, 150, 210, 270, 330].map((a, i) => (
                <path key={`r18-in-${i}`} d="M 175 225 C 158 200, 165 175, 175 175 C 185 175, 192 200, 175 225 Z" fill={i % 2 === 0 ? "#e11d48" : "#f43f5e"} transform={`rotate(${a} 175 225)`} />
              ))}
              <circle cx="175" cy="225" r="9" fill="#fbcfe8" />
              <circle cx="175" cy="225" r="5" fill="#f43f5e" />
            </motion.g>

            {/* Rose 19: Center Right Ohara Rose */}
            <motion.g
              initial={isAnimated ? { scale: 0, rotate: 20 } : false}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.6, duration: 0.9, type: "spring", bounce: 0.35 }}
              style={{ originX: "285px", originY: "225px" }}
            >
              {[0, 60, 120, 180, 240, 300].map((a, i) => (
                <path key={`r19-out-${i}`} d="M 285 225 C 255 185, 265 150, 285 150 C 305 150, 315 185, 285 225 Z" fill={i % 2 === 0 ? "url(#oharaRose)" : "#fb7185"} transform={`rotate(${a} 285 225)`} />
              ))}
              {[30, 90, 150, 210, 270, 330].map((a, i) => (
                <path key={`r19-in-${i}`} d="M 285 225 C 268 200, 275 175, 285 175 C 295 175, 302 200, 285 225 Z" fill={i % 2 === 0 ? "#e11d48" : "#f43f5e"} transform={`rotate(${a} 285 225)`} />
              ))}
              <circle cx="285" cy="225" r="9" fill="#fbcfe8" />
              <circle cx="285" cy="225" r="5" fill="#f43f5e" />
            </motion.g>

            {/* Rose 20: Center-Top Grand Crown Rose (Bông hồng trung tâm lớn nhất) */}
            <motion.g
              initial={isAnimated ? { scale: 0, rotate: -10 } : false}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.75, duration: 1.0, type: "spring", bounce: 0.4 }}
              style={{ originX: "230px", originY: "195px" }}
            >
              {/* Outer Layer */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
                <path key={`r20-out-${i}`} d="M 230 195 C 195 145, 208 105, 230 105 C 252 105, 265 145, 230 195 Z" fill={i % 2 === 0 ? "url(#oharaRose)" : "#fb7185"} transform={`rotate(${a} 230 195)`} filter="drop-shadow(0 2px 5px rgba(0,0,0,0.15))" />
              ))}
              {/* Middle Layer */}
              {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((a, i) => (
                <path key={`r20-mid-${i}`} d="M 230 195 C 208 160, 215 130, 230 130 C 245 130, 252 160, 230 195 Z" fill={i % 2 === 0 ? "#e11d48" : "#f43f5e"} transform={`rotate(${a} 230 195)`} />
              ))}
              {/* Inner Petal Spiral */}
              {[0, 60, 120, 180, 240, 300].map((a, i) => (
                <path key={`r20-in-${i}`} d="M 230 195 C 218 178, 222 158, 230 158 C 238 158, 242 178, 230 195 Z" fill="#9f1239" transform={`rotate(${a} 230 195)`} />
              ))}
              {/* Radiant Dew Core */}
              <circle cx="230" cy="195" r="11" fill="#fbbf24" />
              <circle cx="230" cy="195" r="7" fill="#f59e0b" />
              <text x="230" y="199" fontSize="9" textAnchor="middle" fill="#fff" fontWeight="bold">✨</text>
            </motion.g>

            {/* 5. FRONT PLEATED COLLAR (LỚP GIẤY XẾP CHÉO PHÍA TRƯỚC) */}
            <motion.g
              initial={isAnimated ? { y: 30, opacity: 0 } : false}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              {/* Soft pleat collar */}
              <path
                d="M 125 355 C 175 372, 285 372, 335 355 L 260 460 C 245 470, 215 470, 200 460 Z"
                fill="url(#paperPinkFluted)"
                filter="drop-shadow(0 4px 8px rgba(0,0,0,0.08))"
              />
              <path
                d="M 140 365 Q 230 395, 320 365 L 230 465 Z"
                fill="url(#paperCreamSilk)"
                opacity="0.9"
              />
            </motion.g>

            {/* 6. SATIN RIBBON BOW & FLOWING TAILS (NƠ SATIN ĐỎ RƯỢU DUYÊN DÁNG) */}
            <motion.g
              initial={isAnimated ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: 1.8, type: "spring", bounce: 0.4 }}
              style={{ originX: "230px", originY: "430px" }}
            >
              {/* Ribbon Tails */}
              <path d="M 220 435 Q 195 480, 175 510 Q 198 485, 215 440" fill="url(#ribbonBurgundy)" />
              <path d="M 240 435 Q 265 480, 285 510 Q 262 485, 245 440" fill="url(#ribbonBurgundy)" />
              {/* Ribbon Loops */}
              <ellipse cx="202" cy="425" rx="25" ry="15" fill="url(#ribbonBurgundy)" transform="rotate(-20 202 425)" />
              <ellipse cx="258" cy="425" rx="25" ry="15" fill="url(#ribbonBurgundy)" transform="rotate(20 258 425)" />
              {/* Knot Center */}
              <circle cx="230" cy="427" r="10" fill="#4c0519" />
              <circle cx="230" cy="427" r="7" fill="#be123c" />
            </motion.g>

            {/* Floating Soft Emojis */}
            <motion.g
              animate={{ y: [-4, -14, -4], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <text x="85" y="115" fontSize="18">🌸</text>
              <text x="355" y="110" fontSize="18">💖</text>
              <text x="220" y="60" fontSize="20">✨</text>
            </motion.g>
          </svg>
        </div>

        {/* Flower Composition Legend (Có thể bấm xem để duyệt từng loài hoa) */}
        <div className="w-full mt-1 flex flex-col items-center">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline underline-offset-2 transition-colors mb-2"
          >
            {showLegend ? "Ẩn danh mục hoa ▲" : "Xem chi tiết 20 đóa hoa trong bó ▼"}
          </button>

          {showLegend && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full p-3 rounded-2xl bg-rose-50/80 border border-rose-200 text-left text-xs mb-3"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span><strong>3 Hồng Ohara</strong> (Tâm điểm)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span><strong>4 Mẫu đơn kem</strong> (Xòe tròn)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                <span><strong>4 Tulip cam đào</strong> (Vươn cao)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                <span><strong>5 Cúc tana</strong> (Trắng nhụy vàng)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-400"></span>
                <span><strong>4 Hồng trà</strong> (Điểm viền)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span><strong>Baby & Lá bạc</strong> (Đệm kín)</span>
              </div>
            </motion.div>
          )}

          {/* ================= APPROVE & PROCEED BUTTON ================= */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 mt-1">
            <motion.button
              onClick={() => {
                confetti({
                  particleCount: 80,
                  spread: 80,
                  origin: { y: 0.6 }
                });
                onNext();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 shadow-xl shadow-rose-300/60 flex items-center justify-center gap-2.5 text-sm sm:text-base group"
            >
              <CheckCircle2 className="w-5 h-5 text-rose-100" />
              <span>Duyệt Bó Hoa & Mở Thư Tình 💌</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
