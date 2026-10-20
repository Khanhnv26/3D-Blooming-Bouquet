import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CONFIG } from './config';
import MusicPlayer from './components/MusicPlayer';
import FullscreenButton from './components/FullscreenButton';
import PreloaderScreen from './components/PreloaderScreen';
import SceneBloom from './components/SceneBloom';
import SceneLetter from './components/SceneLetter';

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
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
    <div
      className={`relative ${
        currentScene === 1 ? 'h-screen w-screen overflow-hidden' : 'min-h-screen w-full overflow-x-hidden'
      } bg-gradient-to-b from-[#0a0714] via-[#1a0b2e] to-[#240618] text-rose-100 flex flex-col justify-between selection:bg-rose-500/30 selection:text-rose-200`}
    >
      {/* 0. Romantic Preloader Splash Screen with Music Entrance Gesture */}
      <AnimatePresence>
        {!hasEntered && (
          <PreloaderScreen
            key="preloader-screen"
            config={CONFIG}
            onComplete={() => setHasEntered(true)}
          />
        )}
      </AnimatePresence>

      {/* Warm Golden Candlelight Spotlight for the Bouquet */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,rgba(251,191,36,0.18)_0%,rgba(225,29,72,0.12)_45%,transparent_75%)]" />

      {/* Floating Top-Right Controls (Fullscreen & Music) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <FullscreenButton />
        <MusicPlayer audioUrl={CONFIG.audioUrl} songTitle={CONFIG.songTitle} />
      </div>

      {/* Main Interactive Stage with AnimatePresence Transitions */}
      <main
        className={`relative z-10 flex-1 flex flex-col items-center justify-center w-full ${
          currentScene === 1 ? 'h-full w-full overflow-hidden p-0' : 'py-8'
        }`}
      >
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
    </div>
  );
}
