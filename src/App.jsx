import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CONFIG } from './config';
import BackgroundCanvas from './components/BackgroundCanvas';
import MusicPlayer from './components/MusicPlayer';
import SceneBloom from './components/SceneBloom';
import SceneLetter from './components/SceneLetter';
import { Heart } from 'lucide-react';

export default function App() {
  const [currentScene, setCurrentScene] = useState(1); // 1: Bloom, 2: Letter

  const handleNextScene = () => {
    setCurrentScene(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReplay = () => {
    setCurrentScene(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-rose-50 via-pink-50/50 to-amber-50/40 text-stone-800 flex flex-col justify-between selection:bg-rose-200 selection:text-rose-900">
      {/* Dynamic Romantic Background Canvas (Petals, Fireflies, Sparkles) */}
      <BackgroundCanvas />

      {/* Music Player Disc (Top Right) */}
      <MusicPlayer audioUrl={CONFIG.audioUrl} songTitle={CONFIG.songTitle} />

      {/* Top Floating Step Indicator */}
      <header className="relative z-20 pt-5 px-4 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-rose-200/80 shadow-xs">
          <button
            onClick={() => setCurrentScene(1)}
            className={`text-xs font-semibold px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
              currentScene === 1
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-500 hover:text-rose-600'
            }`}
          >
            <span>1.</span> Đóa Hoa Nở 🌹
          </button>

          <span className="text-rose-300 text-xs">→</span>

          <button
            onClick={() => setCurrentScene(2)}
            className={`text-xs font-semibold px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
              currentScene === 2
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-500 hover:text-rose-600'
            }`}
          >
            <span>2.</span> Tâm Thư Tình 💌
          </button>
        </div>
      </header>

      {/* Main Interactive Stage with AnimatePresence Transitions */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full py-4">
        <AnimatePresence mode="wait">
          {currentScene === 1 && (
            <SceneBloom
              key="scene-bloom"
              recipientName={CONFIG.recipientName}
              onNext={handleNextScene}
            />
          )}

          {currentScene === 2 && (
            <SceneLetter
              key="scene-letter"
              config={CONFIG}
              onReplay={handleReplay}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Subtle Romantic Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-rose-400 font-medium flex items-center justify-center gap-1.5 select-none">
        <span>Thiết kế bằng trọn cả yêu thương</span>
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
        <span>Gửi tặng {CONFIG.recipientName} ngày 20.10</span>
      </footer>
    </div>
  );
}
