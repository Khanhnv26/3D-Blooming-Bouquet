import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { audioManager } from '../utils/audio';

export default function MusicPlayer({ audioUrl, songTitle }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    audioManager.init(audioUrl);

    // Prompt user to play music on their very first click anywhere on page
    const handleFirstClick = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        audioManager.play();
        setIsPlaying(true);
        window.removeEventListener('click', handleFirstClick);
      }
    };

    window.addEventListener('click', handleFirstClick);
    return () => {
      window.removeEventListener('click', handleFirstClick);
    };
  }, [audioUrl, hasInteracted]);

  const toggleMusic = (e) => {
    e.stopPropagation();
    const playing = audioManager.toggle();
    setIsPlaying(playing);
    setHasInteracted(true);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={toggleMusic}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="group relative flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-stone-900/85 backdrop-blur-md border border-rose-500/35 shadow-xl text-rose-200 transition-all hover:bg-stone-800 hover:border-rose-400 cursor-pointer"
        title={isPlaying ? "Tắt nhạc" : "Bật nhạc lofi tình cảm"}
      >
        {/* Spinning Vinyl Disc */}
        <div className="relative w-7 h-7 flex items-center justify-center">
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{
              repeat: isPlaying ? Infinity : 0,
              duration: 4,
              ease: "linear"
            }}
            className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-400 via-rose-500 to-amber-300 p-0.5 shadow-sm"
          >
            <div className="w-full h-full rounded-full bg-rose-950 flex items-center justify-center border border-rose-300/40">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-300/80 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-rose-950"></div>
              </div>
            </div>
          </motion.div>

          <span className="absolute -top-1 -right-1 text-[10px]">
            {isPlaying ? '🎵' : '💤'}
          </span>
        </div>

        {/* Dynamic Equalizer Bar or Title */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold tracking-wide text-rose-100 line-clamp-1 max-w-[130px]">
            {songTitle || "Giai điệu 20.10"}
          </span>
          <span className="text-[10px] text-rose-400 flex items-center gap-1 font-medium">
            {isPlaying ? (
              <>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Đang phát nhạc
              </>
            ) : (
              "Chạm để nghe nhạc"
            )}
          </span>
        </div>

        {/* Audio Soundwave Bars */}
        <div className="flex items-end gap-0.5 h-4 w-3.5 px-0.5">
          <motion.span
            animate={{ height: isPlaying ? ['30%', '100%', '40%'] : '25%' }}
            transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
            className="w-1 bg-rose-500 rounded-full"
          />
          <motion.span
            animate={{ height: isPlaying ? ['80%', '30%', '90%'] : '25%' }}
            transition={{ repeat: Infinity, duration: 0.7, ease: 'easeInOut' }}
            className="w-1 bg-rose-400 rounded-full"
          />
          <motion.span
            animate={{ height: isPlaying ? ['40%', '90%', '20%'] : '25%' }}
            transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
            className="w-1 bg-rose-500 rounded-full"
          />
        </div>
      </motion.button>
    </div>
  );
}
