import React, { Component, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, ArrowRight, RotateCcw, Heart, CheckCircle2, Star } from 'lucide-react';
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

const QUEST_IDS = [0, 1, 7, 9, 11];

export default function SceneBloom({ onNext, recipientName }) {
  const [webgl] = useState(() => hasWebGL());
  const [replayKey, setReplayKey] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const [message, setMessage] = useState(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [collectedIds, setCollectedIds] = useState([]);
  const [isLetterRevealed, setIsLetterRevealed] = useState(false);

  const clearTimer = useRef(null);
  const idleTimer = useRef(null);

  // Whisper mapping for the 5 quest flowers
  const whisperMap = useMemo(() => {
    const map = {};
    if (CONFIG.secretWhispers) {
      CONFIG.secretWhispers.forEach((w) => {
        map[w.id] = w;
      });
    }
    return map;
  }, []);

  // Initial welcome bloom audio
  useEffect(() => {
    if (!webgl) return undefined;
    audioManager.playChime();
    const timer = setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#f43f5e', '#fb7185', '#fbbf24', '#f472b6', '#fda4af', '#fde047'],
      });
    }, 4200);
    return () => clearTimeout(timer);
  }, [replayKey, webgl]);

  useEffect(() => {
    return () => {
      clearTimeout(clearTimer.current);
      clearTimeout(idleTimer.current);
    };
  }, []);

  // Auto hide UI while dragging/rotating bouquet
  const handleInteractStart = useCallback(() => {
    setIsInteracting(true);
    clearTimeout(idleTimer.current);
  }, []);

  const handleInteractEnd = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setIsInteracting(false);
    }, 2200);
  }, []);

  // Handle Flower Picking & Quest Progression
  const handlePick = useCallback(
    (kind, id) => {
      setActiveId(id);

      // Check if this is a quest flower or already tapped
      const isQuest = QUEST_IDS.includes(id);
      const isNewQuest = isQuest && !collectedIds.includes(id);

      let text = '';
      let title = 'Lời thì thầm từ đóa hoa';

      if (whisperMap[id]) {
        title = whisperMap[id].title;
        text = whisperMap[id].text;
      } else {
        const pool = CONFIG.flowerMessages?.[kind] ?? ['Anh yêu em nhiều lắm 💖'];
        text = pool[Math.floor(Math.random() * pool.length)];
      }

      setMessage({ id, title, text, isQuest });

      let nextCollected = collectedIds;
      if (isNewQuest) {
        nextCollected = [...collectedIds, id];
        setCollectedIds(nextCollected);
        audioManager.playCollectSound();

        // Mini sparkle burst for finding a secret flower
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.4 },
          colors: ['#fbbf24', '#f43f5e', '#f472b6'],
        });
      } else {
        audioManager.playChime();
      }

      // Check if all 5 quest flowers found
      if (nextCollected.length >= QUEST_IDS.length && !isLetterRevealed) {
        setIsLetterRevealed(true);
        audioManager.playMagicFanfare();

        setTimeout(() => {
          confetti({
            particleCount: 140,
            spread: 110,
            origin: { y: 0.55 },
            colors: ['#fbbf24', '#f59e0b', '#ec4899', '#f43f5e', '#fffbeb'],
          });
        }, 500);
      }

      // Restore UI quickly
      handleInteractStart();
      handleInteractEnd();

      clearTimeout(clearTimer.current);
      clearTimer.current = setTimeout(() => {
        setActiveId(null);
        setMessage(null);
      }, 4200);
    },
    [collectedIds, isLetterRevealed, whisperMap, handleInteractStart, handleInteractEnd]
  );

  const handleOpenLetter = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fbbf24', '#f472b6', '#fda4af'],
    });
    audioManager.playChime();
    onNext();
  }, [onNext]);

  const handleReplay = () => {
    setActiveId(null);
    setMessage(null);
    setCollectedIds([]);
    setIsLetterRevealed(false);
    setReplayKey((k) => k + 1);
  };

  const fallback = <SceneBloomSVG onNext={onNext} recipientName={recipientName} />;
  if (!webgl) return fallback;

  const collectedCount = Math.min(collectedIds.length, 5);

  return (
    <div
      onPointerDown={handleInteractStart}
      onPointerUp={handleInteractEnd}
      className="relative w-full h-[88vh] sm:h-[92vh] flex flex-col items-center justify-between overflow-hidden select-none"
    >
      {/* ================= 1. FULLSCREEN 3D STUDIO STAGE ================= */}
      <div className="absolute inset-0 z-0">
        <Canvas3DBoundary fallback={fallback}>
          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center text-rose-500 font-casual text-xl animate-pulse">
                Đang bung nở bó hoa 3D trong studio hoàng hôn… 🌸
              </div>
            }
          >
            <Bouquet3D
              replayKey={replayKey}
              activeId={activeId}
              questIds={QUEST_IDS}
              collectedIds={collectedIds}
              isLetterRevealed={isLetterRevealed}
              onPick={handlePick}
              onOpenLetter={handleOpenLetter}
              onInteractStart={handleInteractStart}
              onInteractEnd={handleInteractEnd}
            />
          </Suspense>
        </Canvas3DBoundary>
      </div>

      {/* ================= 2. FLOATING HEADER & QUEST PROGRESS HUD ================= */}
      <AnimatePresence>
        {!isInteracting && (
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="relative z-10 pt-2 px-4 text-center pointer-events-none w-full max-w-lg"
          >
            {/* Romantic Occasion Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.2 rounded-full bg-white/80 backdrop-blur-md border border-rose-200/90 shadow-sm text-rose-700 text-xs font-bold tracking-wider uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
              <span>BÓ HOA 3D • 20.10 DÀNH CHO {String(recipientName).toUpperCase()}</span>
            </div>

            <h1 className="font-serif-romantic text-2xl sm:text-3xl font-bold text-rose-950 drop-shadow-sm">
              Đóa Hoa Rực Rỡ Dành Tặng Em 💐
            </h1>

            {/* Quest HUD: 5 Secret Flowers to Unlock Letter */}
            <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-rose-200 shadow-md pointer-events-auto">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-stone-700">
                {isLetterRevealed
                  ? '✨ Đã mở khóa bức thư tình bí mật!'
                  : `Khám phá 5 đóa hoa phát sáng (${collectedCount}/5):`}
              </span>

              {/* 5 Heart Icons */}
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`text-sm transition-transform duration-300 ${
                      i < collectedCount ? 'scale-110' : 'opacity-35 grayscale'
                    }`}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= 3. FLOATING LOVE MESSAGE TOAST ================= */}
      <AnimatePresence>
        {message && (
          <motion.div
            key={message.id + message.text}
            initial={{ opacity: 0, y: -20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="absolute top-24 sm:top-28 z-30 inset-x-4 mx-auto max-w-md px-5 py-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-rose-200/90 shadow-2xl shadow-rose-200/60 text-center pointer-events-none"
          >
            <div className="flex items-center justify-center gap-1.5 mb-1 text-xs text-rose-600 font-bold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>{message.title}</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-rose-950 leading-relaxed font-casual">
              "{message.text}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= 4. FLOATING BOTTOM ACTION BAR ================= */}
      <AnimatePresence>
        {!isInteracting && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="relative z-10 pb-4 px-4 w-full flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {/* Quick interactive hint */}
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-rose-200/70 text-[11px] font-semibold text-rose-700 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Chạm vào đóa hoa có đốm sáng lấp lánh</span>
            </div>

            {/* Main CTA to Open Secret Love Letter only when revealed */}
            {isLetterRevealed ? (
              <motion.button
                onClick={handleOpenLetter}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-pink-600 shadow-2xl shadow-rose-400/70 flex items-center justify-center gap-2.5 text-sm sm:text-base group backdrop-blur-xs ring-4 ring-amber-300/60"
              >
                <Mail className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Mở Bức Thư Tình Trong Đóa Hoa 💌</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-rose-200/90 text-xs font-semibold text-rose-700 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Chạm vào các đóa hoa có đốm sáng để mở bức thư tình bí mật 🌸</span>
              </div>
            )}

            {/* Replay Bloom Animation */}
            <button
              onClick={handleReplay}
              className="inline-flex items-center gap-1.5 px-4 py-2.8 rounded-full bg-white/80 hover:bg-white text-rose-700 text-xs font-semibold border border-rose-200/90 shadow-md backdrop-blur-md transition-colors"
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
