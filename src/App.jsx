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
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-[#fff7ed] via-[#fee2e2]/50 to-[#fdf2f8] text-stone-800 flex flex-col justify-between selection:bg-rose-200 selection:text-rose-900">
      {/* Studio Radial Warm Spotlight for the Bouquet */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_42%,rgba(254,240,138,0.25)_0%,rgba(253,164,175,0.15)_45%,transparent_75%)]" />

      {/* Dynamic Romantic Background Canvas (Petals, Fireflies, Sparkles) */}
      <BackgroundCanvas />

      {/* Music Player Disc (Top Right) */}
      <MusicPlayer audioUrl={CONFIG.audioUrl} songTitle={CONFIG.songTitle} />

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
