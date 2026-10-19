import React, { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, ArrowRight, RotateCcw, Hand, Move3d, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioManager } from '../utils/audio';
import { CONFIG } from '../config';
import SceneBloomSVG from './SceneBloomSVG';

const Bouquet3D = lazy(() => import('./Bouquet3D'));

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

class Canvas3DBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err) {
    console.warn('3D bouquet failed, falling back to SVG:', err);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function SceneBloom({ onNext, recipientName }) {
  const [webgl] = useState(() => hasWebGL());
  const [replayKey, setReplayKey] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const [message, setMessage] = useState(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const clearTimer = useRef(null);
  const idleTimer = useRef(null);

  // Auto celebration when bloom finishes (~4.5s)
  useEffect(() => {
    if (!webgl) return undefined;
    audioManager.playChime();
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 95,
        origin: { y: 0.5 },
        colors: ['#f43f5e', '#fb7185', '#fbbf24', '#f472b6', '#fda4af', '#fde047'],
      });
    }, 4500);
    return () => clearTimeout(timer);
  }, [replayKey, webgl]);

  useEffect(() => {
    return () => {
      clearTimeout(clearTimer.current);
      clearTimeout(idleTimer.current);
    };
  }, []);

  // When user starts dragging or moving 3D bouquet -> hide UI
  const handleInteractStart = useCallback(() => {
    setIsInteracting(true);
    clearTimeout(idleTimer.current);
  }, []);

  // When user stops dragging -> wait 2 seconds, then show UI back
  const handleInteractEnd = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setIsInteracting(false);
    }, 2000);
  }, []);

  const handlePick = useCallback((kind, id) => {
    const pool = CONFIG.flowerMessages?.[kind] ?? ['Anh yêu em 💖'];
    setActiveId(id);
    setMessage({ id, kind, text: pool[Math.floor(Math.random() * pool.length)] });
    audioManager.playChime();

    // Trigger brief interact hide then restore
    handleInteractStart();
    handleInteractEnd();

    clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => {
      setActiveId(null);
      setMessage(null);
    }, 3200);
  }, [handleInteractStart, handleInteractEnd]);

  const handleReplay = () => {
    setActiveId(null);
    setMessage(null);
    setReplayKey((k) => k + 1);
  };

  const fallback = <SceneBloomSVG onNext={onNext} recipientName={recipientName} />;
  if (!webgl) return fallback;

  return (
    <div
      onPointerDown={handleInteractStart}
      onPointerUp={handleInteractEnd}
      className="relative w-full h-[88vh] sm:h-[92vh] flex flex-col items-center justify-between overflow-hidden select-none"
    >
      {/* ================= 1. FULLSCREEN 3D CANVAS STAGE (KHÔNG KHUNG) ================= */}
      <div className="absolute inset-0 z-0">
        <Canvas3DBoundary fallback={fallback}>
          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center text-rose-500 font-casual text-xl animate-pulse">
                Đang bung nở bó hoa 3D… 🌸
              </div>
            }
          >
            <Bouquet3D
              replayKey={replayKey}
              activeId={activeId}
              onPick={handlePick}
              onInteractStart={handleInteractStart}
              onInteractEnd={handleInteractEnd}
            />
          </Suspense>
        </Canvas3DBoundary>
      </div>

      {/* ================= 2. FLOATING HEADER (TỰ ĐỘNG ẨN KHI TƯƠNG TÁC) ================= */}
      <AnimatePresence>
        {!isInteracting && (
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="relative z-10 pt-2 px-4 text-center pointer-events-none"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-rose-200/80 shadow-md text-rose-700 text-xs font-bold tracking-wider uppercase mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
              <span>BÓ HOA 3D • 20.10 DÀNH CHO {String(recipientName).toUpperCase()}</span>
            </div>

            <h1 className="font-serif-romantic text-2xl sm:text-4xl font-bold text-rose-950 drop-shadow-sm">
              Đóa Hoa Rực Rỡ Nhất Dành Tặng Em 💐
            </h1>

            <p className="font-casual text-sm sm:text-lg text-rose-700/90 max-w-md mx-auto mt-0.5 drop-shadow-xs">
              Kéo để xoay 360° • Chụm để phóng to • Chạm vào từng đóa hoa để đọc lời nhắn
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= 3. FLOATING LOVE MESSAGE (KHI CHẠM VÀO HOA) ================= */}
      <AnimatePresence>
        {message && (
          <motion.div
            key={message.id + message.text}
            initial={{ opacity: 0, y: -20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="absolute top-20 sm:top-24 z-30 inset-x-4 mx-auto max-w-sm px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-rose-200 shadow-xl shadow-rose-200/50 text-center pointer-events-none"
          >
            <div className="flex items-center justify-center gap-1.5 mb-1 text-xs text-rose-500 font-bold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Lời thì thầm từ đóa hoa</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-rose-900 leading-snug">
              {message.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= 4. FLOATING BOTTOM ACTION BAR (TỰ ĐỘNG ẨN KHI TƯƠNG TÁC) ================= */}
      <AnimatePresence>
        {!isInteracting && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="relative z-10 pb-4 px-4 w-full flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {/* Quick interactive hint badge */}
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-rose-200/70 text-[11px] font-semibold text-rose-700 shadow-xs">
              <Move3d className="w-3.5 h-3.5 text-rose-500" />
              <span>Xoay 360° tự do</span>
            </div>

            {/* Main CTA to Open Secret Love Letter */}
            <motion.button
              onClick={() => {
                confetti({ particleCount: 90, spread: 85, origin: { y: 0.6 } });
                onNext();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 shadow-xl shadow-rose-300/60 flex items-center justify-center gap-2.5 text-sm sm:text-base group backdrop-blur-xs"
            >
              <Mail className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Mở Bức Thư Bí Mật Của Anh 💌</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Replay Bloom Animation Button */}
            <button
              onClick={handleReplay}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-white/80 hover:bg-white text-rose-700 text-xs font-semibold border border-rose-200/90 shadow-md backdrop-blur-md transition-colors"
              title="Xem lại hiệu ứng bung nở hoa 3D"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
              <span>Xem lại hoa nở 🌸</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
