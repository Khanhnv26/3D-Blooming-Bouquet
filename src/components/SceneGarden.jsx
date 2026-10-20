import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Sparkles, Mail, ArrowRight, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioManager } from '../utils/audio';

export default function SceneGarden({ onNext, recipientName }) {

  const [progress, setProgress] = useState(0);
  const [isWatering, setIsWatering] = useState(false);
  const [isAutoWatering, setIsAutoWatering] = useState(false);

  const containerRef = useRef(null);
  const plantTargetRef = useRef(null);
  const soundThrottleRef = useRef(0);
  const animationFrameRef = useRef(null);

  const isBloomed = progress >= 100;

  useEffect(() => {
    if ((isWatering || isAutoWatering) && progress < 100) {
      const now = Date.now();
      if (now - soundThrottleRef.current > 650) {
        audioManager.playWaterSound();
        soundThrottleRef.current = now;
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        setProgress((prev) => {
          const next = prev + 0.75;
          if (next >= 100) {
            audioManager.playChime();
            setIsWatering(false);
            setIsAutoWatering(false);
            setTimeout(() => {
              confetti({
                particleCount: 110,
                spread: 100,
                origin: { y: 0.5 },
                colors: ['#f43f5e', '#fb7185', '#fbbf24', '#f472b6', '#fda4af', '#38bdf8']
              });
            }, 300);
            return 100;
          }
          return next;
        });
      });
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isWatering, isAutoWatering, progress]);

  const handleDrag = (event, info) => {
    if (isBloomed || isAutoWatering) return;

    if (plantTargetRef.current) {
      const rect = plantTargetRef.current.getBoundingClientRect();
      const px = info.point.x;
      const py = info.point.y;

      const isOverPlant =
        px >= rect.left - 50 &&
        px <= rect.right + 70 &&
        py >= rect.top - 140 &&
        py <= rect.bottom + 10;

      setIsWatering(isOverPlant);
    }
  };

  const handleDragEnd = () => {
    if (!isAutoWatering) {
      setIsWatering(false);
    }
  };

  const triggerAutoWater = () => {
    if (isBloomed || isAutoWatering) return;
    setIsAutoWatering(true);
    setIsWatering(true);
    audioManager.playWaterSound();

    let cur = progress;
    const interval = setInterval(() => {
      cur += 6;
      if (cur >= 100) {
        clearInterval(interval);
        setProgress(100);
        setIsWatering(false);
        setIsAutoWatering(false);
        audioManager.playChime();
        confetti({
          particleCount: 110,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#f43f5e', '#fb7185', '#fbbf24', '#f472b6', '#38bdf8']
        });
      } else {
        setProgress(cur);
      }
    }, 110);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="relative z-10 w-full max-w-xl mx-auto px-4 py-3 flex flex-col items-center"
    >

      <div
        ref={containerRef}
        className="w-full bg-white/85 backdrop-blur-xl border border-rose-200/90 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-rose-200/50 flex flex-col items-center relative overflow-hidden text-center"
      >

        <div className="mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/90 text-rose-700 text-xs font-bold tracking-wider uppercase mb-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>20.10 • Dành Cho {recipientName}</span>
          </div>

          <h2 className="font-serif-romantic text-2xl sm:text-3xl font-bold text-rose-950">
            {!isBloomed ? "Tưới Nước Cho Hoa Nở" : "Bó Hoa Tình Yêu Đã Bung Nở 💐"}
          </h2>

          <p className="font-casual text-base sm:text-lg text-rose-700/85 mt-0.5 max-w-md">
            {!isBloomed
              ? "Kéo chiếc bình nước màu hồng qua chậu để tưới nha! 💕"
              : "Bó hoa này được tạo nên từ sự chăm sóc và yêu thương dành riêng cho em."}
          </p>
        </div>

        {!isBloomed && (
          <div className="w-full max-w-xs mb-3 flex items-center gap-3">
            <div className="flex-1 h-2.5 bg-rose-100/90 rounded-full overflow-hidden p-0.5 border border-rose-200 shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-rose-400 to-pink-500"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
            <span className="text-xs font-bold text-rose-600 font-mono min-w-[38px] text-right">
              {Math.round(progress)}%
            </span>
          </div>
        )}

        <div className="relative w-full h-[340px] sm:h-[390px] flex items-center justify-center my-1">

          <motion.div
            animate={{
              scale: isBloomed ? [1, 1.15, 1] : [1, 1.06, 1],
              opacity: isBloomed ? [0.45, 0.75, 0.45] : [0.25, 0.45, 0.25]
            }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-t from-rose-200/40 via-pink-100/30 to-amber-100/20 rounded-full blur-2xl pointer-events-none"
          />

          <div
            ref={plantTargetRef}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 sm:w-56 h-48 pointer-events-none flex items-center justify-center"
          >
            {isWatering && (
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="w-40 h-40 rounded-full bg-sky-200/40 blur-xl"
              />
            )}
          </div>

          <svg
            viewBox="0 0 460 480"
            className="w-full h-full overflow-visible select-none drop-shadow-lg"
          >
            <defs>
              <linearGradient id="potGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <linearGradient id="soilGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
              <linearGradient id="wrapOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffe4e6" />
                <stop offset="50%" stopColor="#fecdd3" />
                <stop offset="100%" stopColor="#fda4af" />
              </linearGradient>
              <linearGradient id="wrapInner" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff1f2" />
                <stop offset="100%" stopColor="#ffe4e6" />
              </linearGradient>
              <linearGradient id="wrapPaperCream" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="100%" stopColor="#fef3c7" />
              </linearGradient>
              <linearGradient id="roseGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="50%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#be123c" />
              </linearGradient>
              <linearGradient id="tulipPeach" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="50%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
              <linearGradient id="tulipPink" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fda4af" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
              <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#9f1239" />
              </linearGradient>
            </defs>

            <ellipse cx="230" cy="425" rx="140" ry="14" fill="#fecdd3" opacity="0.4" />

            {!isBloomed && (
              <g>

                <ellipse cx="230" cy="340" rx="62" ry="13" fill="#fb923c" />
                <path
                  d="M 172 340 L 186 420 C 190 428, 270 428, 274 420 L 288 340 Z"
                  fill="url(#potGrad3)"
                />
                <ellipse cx="230" cy="340" rx="55" ry="9" fill="url(#soilGrad3)" />
                <circle cx="230" cy="382" r="13" fill="#ffffff" opacity="0.9" />
                <text x="230" y="387" fontSize="12" textAnchor="middle">🌸</text>

                {isWatering && (
                  <ellipse
                    cx="230"
                    cy="340"
                    rx="16"
                    ry="6"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    className="animate-ping"
                  />
                )}

                {progress < 25 && (
                  <g>
                    <circle cx="230" cy="326" r="14" fill="#fbbf24" opacity="0.3" filter="blur(3px)" />
                    <text x="230" y="333" fontSize="22" textAnchor="middle">🌰</text>
                    <text x="230" y="308" fontSize="12" textAnchor="middle" fill="#f59e0b">✨</text>
                  </g>
                )}

                {progress >= 25 && progress < 55 && (
                  <motion.g
                    initial={{ scale: 0.2 }}
                    animate={{ scale: 1 }}
                    style={{ originX: "230px", originY: "340px" }}
                  >
                    <path d="M 230 340 Q 230 300, 230 275" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" fill="none" />
                    <path d="M 230 310 Q 200 300, 195 280 Q 220 290, 230 310 Z" fill="#4ade80" />
                    <path d="M 230 295 Q 260 285, 265 265 Q 240 275, 230 295 Z" fill="#22c55e" />
                    <circle cx="230" cy="273" r="6" fill="#86efac" />
                    <text x="230" y="255" fontSize="14" textAnchor="middle">🌱</text>
                  </motion.g>
                )}

                {progress >= 55 && (
                  <motion.g
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    style={{ originX: "230px", originY: "340px" }}
                  >
                    <path d="M 230 340 Q 230 240, 230 180" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" fill="none" />
                    <path d="M 230 280 Q 180 240, 160 190" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <path d="M 230 260 Q 280 220, 300 180" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" fill="none" />

                    <ellipse cx="190" cy="245" rx="12" ry="8" fill="#86efac" transform="rotate(-30 190 245)" />
                    <ellipse cx="270" cy="230" rx="12" ry="8" fill="#86efac" transform="rotate(30 270 230)" />

                    <ellipse cx="160" cy="185" rx="11" ry="16" fill="#fda4af" />
                    <ellipse cx="300" cy="175" rx="10" ry="15" fill="#fed7aa" />

                    <ellipse cx="230" cy="165" rx="18" ry="24" fill="#fb7185" />
                    <ellipse cx="230" cy="155" rx="13" ry="17" fill="#f43f5e" />
                    <circle cx="230" cy="145" r="8" fill="#e11d48" />
                    <text x="230" y="125" fontSize="16" textAnchor="middle" fill="#fbbf24">✨</text>
                  </motion.g>
                )}
              </g>
            )}

            {isBloomed && (
              <motion.g
                initial={{ scale: 0.5, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 1.1, type: "spring", bounce: 0.3 }}
                style={{ originX: "230px", originY: "380px" }}
              >

                <path d="M 230 420 L 50 210 C 40 150, 110 100, 150 110 L 230 420 Z" fill="url(#wrapOuter)" opacity="0.85" />
                <path d="M 230 420 L 410 210 C 420 150, 350 100, 310 110 L 230 420 Z" fill="url(#wrapOuter)" opacity="0.85" />
                <path d="M 230 430 L 90 170 C 130 80, 330 80, 370 170 L 230 430 Z" fill="url(#wrapPaperCream)" opacity="0.9" />
                <path d="M 230 420 L 120 130 M 230 420 L 340 130" stroke="#fecdd3" strokeWidth="2" opacity="0.6" />

                <path d="M 210 350 Q 150 250, 100 140" fill="none" stroke="#15803d" strokeWidth="3" />
                <ellipse cx="115" cy="170" rx="12" ry="16" fill="#86efac" opacity="0.85" transform="rotate(-30 115 170)" />
                <ellipse cx="140" cy="210" rx="13" ry="17" fill="#4ade80" opacity="0.85" transform="rotate(-40 140 210)" />

                <path d="M 250 350 Q 310 250, 360 140" fill="none" stroke="#15803d" strokeWidth="3" />
                <ellipse cx="345" cy="170" rx="12" ry="16" fill="#86efac" opacity="0.85" transform="rotate(30 345 170)" />
                <ellipse cx="320" cy="210" rx="13" ry="17" fill="#4ade80" opacity="0.85" transform="rotate(40 320 210)" />

                {[
                  { x: 120, y: 160 }, { x: 135, y: 140 }, { x: 110, y: 190 },
                  { x: 170, y: 110 }, { x: 230, y: 105 }, { x: 290, y: 110 },
                  { x: 335, y: 140 }, { x: 350, y: 160 }, { x: 325, y: 190 },
                  { x: 160, y: 280 }, { x: 300, y: 280 }, { x: 230, y: 300 }
                ].map((p, i) => (
                  <g key={`baby2-${i}`}>
                    <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))" />
                    <circle cx={p.x + 3} cy={p.y - 2} r="3.5" fill="#ffffff" />
                    <circle cx={p.x} cy={p.y} r="1.5" fill="#fef08a" />
                  </g>
                ))}

                <g>
                  <path d="M 165 145 C 145 130, 140 90, 155 80 C 165 100, 165 130, 165 145 Z" fill="url(#tulipPeach)" />
                  <path d="M 165 145 C 185 130, 190 90, 175 80 C 165 100, 165 130, 165 145 Z" fill="#fb923c" />
                </g>
                <g>
                  <path d="M 295 145 C 275 130, 270 90, 285 80 C 295 100, 295 130, 295 145 Z" fill="url(#tulipPink)" />
                  <path d="M 295 145 C 315 130, 320 90, 305 80 C 295 100, 295 130, 295 145 Z" fill="#fda4af" />
                </g>
                <g>
                  <path d="M 115 215 C 95 205, 95 170, 110 160 C 120 175, 120 200, 115 215 Z" fill="#fda4af" />
                  <path d="M 115 215 C 135 205, 135 170, 120 160 C 110 175, 110 200, 115 215 Z" fill="#fb7185" />
                </g>
                <g>
                  <path d="M 345 215 C 325 205, 325 170, 340 160 C 350 175, 350 200, 345 215 Z" fill="#fed7aa" />
                  <path d="M 345 215 C 365 205, 365 170, 350 160 C 340 175, 340 200, 345 215 Z" fill="#fb923c" />
                </g>

                <g>
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, idx) => (
                    <ellipse key={`daisy1-${idx}`} cx="230" cy="135" rx="5" ry="16" fill="#ffffff" transform={`rotate(${angle} 230 135)`} />
                  ))}
                  <circle cx="230" cy="135" r="8" fill="#facc15" />
                </g>
                <g>
                  {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((angle, idx) => (
                    <ellipse key={`daisy2-${idx}`} cx="150" cy="220" rx="5" ry="14" fill="#fffbeb" transform={`rotate(${angle} 150 220)`} />
                  ))}
                  <circle cx="150" cy="220" r="7" fill="#f59e0b" />
                </g>
                <g>
                  {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((angle, idx) => (
                    <ellipse key={`daisy3-${idx}`} cx="310" cy="220" rx="5" ry="14" fill="#fffbeb" transform={`rotate(${angle} 310 220)`} />
                  ))}
                  <circle cx="310" cy="220" r="7" fill="#f59e0b" />
                </g>

                <g>
                  {[0, 60, 120, 180, 240, 300].map((a, i) => (
                    <path key={`r1-out-${i}`} d="M 185 205 C 160 170, 170 140, 185 140 C 200 140, 210 170, 185 205 Z" fill={i % 2 === 0 ? "#f472b6" : "#fb7185"} transform={`rotate(${a} 185 205)`} />
                  ))}
                  <circle cx="185" cy="205" r="8" fill="#fbcfe8" />
                </g>

                <g>
                  {[0, 60, 120, 180, 240, 300].map((a, i) => (
                    <path key={`r2-out-${i}`} d="M 275 205 C 250 170, 260 140, 275 140 C 290 140, 300 170, 275 205 Z" fill={i % 2 === 0 ? "#fb7185" : "#fda4af"} transform={`rotate(${a} 275 205)`} />
                  ))}
                  <circle cx="275" cy="205" r="8" fill="#fed7aa" />
                </g>

                <g>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
                    <path key={`r3-out-${i}`} d="M 230 230 C 200 185, 210 150, 230 150 C 250 150, 260 185, 230 230 Z" fill={i % 2 === 0 ? "url(#roseGradMain)" : "#fb7185"} transform={`rotate(${a} 230 230)`} />
                  ))}
                  {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((a, i) => (
                    <path key={`r3-mid-${i}`} d="M 230 230 C 210 200, 215 170, 230 170 C 245 170, 250 200, 230 230 Z" fill={i % 2 === 0 ? "#e11d48" : "#f43f5e"} transform={`rotate(${a} 230 230)`} />
                  ))}
                  <circle cx="230" cy="230" r="10" fill="#fbbf24" />
                  <text x="230" y="234" fontSize="10" textAnchor="middle" fill="#fff">✨</text>
                </g>

                <path
                  d="M 120 150 Q 180 110, 230 130 T 340 160 Q 300 210, 230 200 T 130 240 Q 200 290, 280 270"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.8"
                />
                {[
                  { x: 135, y: 145, d: 0 }, { x: 185, y: 120, d: 0.3 }, { x: 235, y: 130, d: 0.6 },
                  { x: 285, y: 135, d: 0.9 }, { x: 330, y: 165, d: 0.4 }, { x: 275, y: 190, d: 0.7 },
                  { x: 205, y: 195, d: 0.2 }, { x: 145, y: 230, d: 0.8 }, { x: 195, y: 280, d: 0.5 },
                  { x: 265, y: 275, d: 1.1 }
                ].map((bulb, i) => (
                  <motion.g
                    key={`bulb-${i}`}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
                    transition={{ repeat: Infinity, duration: 1.8, delay: bulb.d, ease: "easeInOut" }}
                    style={{ originX: `${bulb.x}px`, originY: `${bulb.y}px` }}
                  >
                    <circle cx={bulb.x} cy={bulb.y} r="4" fill="#fef08a" opacity="0.6" filter="blur(2px)" />
                    <circle cx={bulb.x} cy={bulb.y} r="2.5" fill="#fbbf24" />
                  </motion.g>
                ))}

                <path
                  d="M 130 330 C 180 345, 280 345, 330 330 L 255 435 C 240 445, 220 445, 205 435 Z"
                  fill="url(#wrapInner)"
                  filter="drop-shadow(0 4px 6px rgba(0,0,0,0.08))"
                />
                <path
                  d="M 140 340 Q 230 370, 320 340 L 230 440 Z"
                  fill="url(#wrapOuter)"
                  opacity="0.9"
                />

                <path d="M 220 405 Q 200 450, 185 475 Q 205 455, 215 410" fill="url(#ribbonGrad)" />
                <path d="M 240 405 Q 260 450, 275 475 Q 255 455, 245 410" fill="url(#ribbonGrad)" />
                <ellipse cx="205" cy="395" rx="22" ry="13" fill="url(#ribbonGrad)" transform="rotate(-20 205 395)" />
                <ellipse cx="255" cy="395" rx="22" ry="13" fill="url(#ribbonGrad)" transform="rotate(20 255 395)" />
                <circle cx="230" cy="397" r="9" fill="#9f1239" />
                <circle cx="230" cy="397" r="6" fill="#f43f5e" />

                <g transform="rotate(-8 230 415)">
                  <line x1="230" y1="405" x2="215" y2="425" stroke="#fbbf24" strokeWidth="1.5" />
                  <rect x="170" y="425" width="120" height="32" rx="6" fill="#ffffff" stroke="#f43f5e" strokeWidth="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.12))" />
                  <circle cx="178" cy="441" r="2.5" fill="#f43f5e" />
                  <text x="233" y="439" fontSize="9" fontWeight="bold" fill="#9f1239" textAnchor="middle">
                    Dành riêng cho {recipientName}
                  </text>
                  <text x="233" y="450" fontSize="7.5" fill="#f43f5e" textAnchor="middle">
                    ✨ 20.10 Yêu Thương ✨
                  </text>
                </g>
              </motion.g>
            )}
          </svg>

          {!isBloomed && (
            <motion.div
              drag
              dragConstraints={containerRef}
              dragElastic={0.1}
              dragMomentum={false}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              onClick={triggerAutoWater}
              animate={
                isAutoWatering
                  ? {
                      x: -95,
                      y: -110,
                      rotate: -38,
                      scale: 1.05
                    }
                  : {
                      rotate: isWatering ? -38 : 0,
                      scale: isWatering ? 1.05 : 1
                    }
              }
              transition={{
                rotate: { duration: 0.25 },
                scale: { duration: 0.25 }
              }}
              whileHover={{ scale: 1.08 }}
              className="absolute bottom-12 right-6 sm:right-10 z-40 cursor-grab active:cursor-grabbing touch-none select-none filter drop-shadow-xl"
            >

              <div className="relative">
                <svg width="105" height="95" viewBox="0 0 120 110">
                  <defs>
                    <linearGradient id="canBodyGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f472b6" />
                      <stop offset="50%" stopColor="#fb7185" />
                      <stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                  </defs>

                  <path d="M 32 45 C 5 25, 5 75, 32 82" fill="none" stroke="#be123c" strokeWidth="7" strokeLinecap="round" />

                  <ellipse cx="58" cy="65" rx="32" ry="26" fill="url(#canBodyGrad3)" />

                  <path d="M 76 60 L 108 34 L 115 42 L 83 72 Z" fill="#e11d48" />

                  <ellipse cx="112" cy="38" rx="9" ry="13" fill="#fb7185" transform="rotate(-30 112 38)" />

                  <text x="58" y="71" fontSize="16" textAnchor="middle">💖</text>
                </svg>

                <AnimatePresence>
                  {isWatering && (
                    <motion.div
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-9 left-24 pointer-events-none"
                    >
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                          key={`drop-${i}`}
                          animate={{
                            y: [0, 80 + i * 12],
                            x: [(i % 2 === 0 ? -4 : 4), (i % 2 === 0 ? 8 : -8)],
                            opacity: [1, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.4 + i * 0.06,
                            ease: "easeIn"
                          }}
                          className="w-2 h-3 rounded-full bg-gradient-to-b from-sky-200 to-sky-400 blur-[0.2px] shadow-sm shadow-sky-300"
                          style={{ position: 'absolute' }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute -bottom-2 inset-x-2 h-2.5 bg-rose-900/10 rounded-full blur-xs pointer-events-none"></div>
              </div>
            </motion.div>
          )}
        </div>

        {!isBloomed ? (
          <div className="w-full mt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={triggerAutoWater}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-200 transition-all hover:scale-105 active:scale-95"
            >
              <Droplets className="w-4 h-4 text-sky-200" />
              <span>Chạm vào đây để tưới ngay ⚡</span>
            </button>
            <span className="text-stone-400 text-xs hidden sm:inline">•</span>
            <span className="text-xs text-rose-500 font-medium">
              Hoặc cầm bình nước kéo qua chậu
            </span>
          </div>
        ) : (

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full mt-3 flex flex-col items-center"
          >
            <motion.button
              onClick={() => {
                confetti({
                  particleCount: 70,
                  spread: 70,
                  origin: { y: 0.6 }
                });
                onNext();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 shadow-xl shadow-rose-300/60 flex items-center gap-3 text-sm sm:text-base group"
            >
              <Mail className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Mở Bức Thư Bí Mật Của Anh 💌</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
