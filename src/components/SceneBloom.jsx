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
  const collectedRef = useRef([]);
  const letterRevealedRef = useRef(false);

  const whisperMap = useMemo(() => {
    const map = {};
    if (CONFIG.secretWhispers) {
      CONFIG.secretWhispers.forEach((w) => {
        map[w.id] = w;
      });
    }
    return map;
  }, []);

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

  const handlePick = useCallback(
    (kind, id) => {
      const collected = collectedRef.current;
      const letterRevealed = letterRevealedRef.current;

      setActiveId(id);

      const isQuest = QUEST_IDS.includes(id);
      const isNewQuest = isQuest && !collected.includes(id);

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

      let nextCollected = collected;
      if (isNewQuest) {
        nextCollected = [...collected, id];
        collectedRef.current = nextCollected;
        setCollectedIds(nextCollected);
        setTimeout(() => {
          audioManager.playCollectSound();
          confetti({
            particleCount: 30,
            spread: 60,
            origin: { y: 0.4 },
            colors: ['#fbbf24', '#f43f5e', '#f472b6'],
            disableForReducedMotion: true,
          });
        }, 0);
      } else {
        setTimeout(() => audioManager.playChime(), 0);
      }

      if (nextCollected.length >= QUEST_IDS.length && !letterRevealed) {
        letterRevealedRef.current = true;
        setIsLetterRevealed(true);
        setActiveId(null);
        setMessage(null);
        setTimeout(() => audioManager.playMagicFanfare(), 0);

        setTimeout(() => {
          confetti({
            particleCount: 140,
            spread: 110,
            origin: { y: 0.55 },
            colors: ['#fbbf24', '#f59e0b', '#ec4899', '#f43f5e', '#fffbeb'],
          });
        }, 500);
      }

      handleInteractStart();
      handleInteractEnd();

      clearTimeout(clearTimer.current);
      clearTimer.current = setTimeout(() => {
        setActiveId(null);
        setMessage(null);
      }, 4200);
    },
    [whisperMap, handleInteractStart, handleInteractEnd]
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
    collectedRef.current = [];
    letterRevealedRef.current = false;
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
      className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden select-none"
    >

      <div className="absolute inset-0 z-0 w-full h-full">
        <Canvas3DBoundary fallback={fallback}>
          <Suspense
            fallback={
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3.5 select-none pointer-events-none">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-rose-500/30 border-t-amber-400 animate-spin" />
                  <span className="text-2xl animate-pulse">🌸</span>
                </div>
                <span className="text-sm font-semibold tracking-wide text-rose-200/90 font-serif animate-pulse">
                  Đang bung nở bó hoa 3D… ✨
                </span>
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

      <AnimatePresence>
        {!isInteracting && !isLetterRevealed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="relative z-10 pt-3 px-4 text-center pointer-events-auto"
          >

            <div className="inline-flex items-center gap-2 px-4 py-1.8 rounded-full bg-stone-900/90 border border-rose-500/35 shadow-xl">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-rose-200">
                Khám phá 5 đóa hoa phát sáng ({collectedCount}/5):
              </span>

              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`text-sm transition-transform duration-300 ${
                      i < collectedCount ? 'scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'opacity-25 grayscale'
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

      <AnimatePresence>
        {!isLetterRevealed && message && (
          <motion.div
            key={message.id + message.text}
            initial={{ opacity: 0, y: -20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="absolute top-24 sm:top-28 z-30 inset-x-4 mx-auto max-w-md px-5 py-3.5 rounded-2xl bg-stone-900/95 border border-rose-400/40 shadow-2xl shadow-rose-900/60 text-center pointer-events-none"
          >
            <div className="flex items-center justify-center gap-1.5 mb-1 text-xs text-rose-400 font-bold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-400" />
              <span>{message.title}</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-rose-100 leading-relaxed font-casual">
              "{message.text}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isInteracting && !isLetterRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="relative z-10 pb-6 px-4 w-full flex items-center justify-center"
          >
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900/90 border border-rose-500/30 text-xs font-semibold text-rose-200 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Chạm vào các đóa hoa có đốm sáng để mở bức thư tình bí mật 🌸</span>
              </div>
              <button
                onClick={handleReplay}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-rose-300 text-xs font-semibold border border-rose-500/30 shadow-md transition-colors cursor-pointer"
                title="Xem lại hiệu ứng bung nở hoa 3D"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Xem lại</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
