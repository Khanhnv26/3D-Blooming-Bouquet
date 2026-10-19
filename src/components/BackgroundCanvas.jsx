import React, { useEffect, useRef } from 'react';

export default function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles: Petals & Glowing Fireflies
    const petalCount = Math.min(30, Math.floor(width / 35));
    const fireflyCount = Math.min(45, Math.floor(width / 25));

    const petals = Array.from({ length: petalCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 8 + 6,
      speedX: Math.random() * 1.2 - 0.6,
      speedY: Math.random() * 1.5 + 0.8,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.45 + 0.35,
      color: ['#f472b6', '#fb7185', '#fda4af', '#fecdd3'][Math.floor(Math.random() * 4)]
    }));

    const fireflies = Array.from({ length: fireflyCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      baseAlpha: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.03 + 0.01,
      angle: Math.random() * Math.PI * 2,
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: (Math.random() - 0.5) * 0.6
    }));

    // Interactive burst particles
    const bursts = [];

    const handlePointerDown = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
      if (clientX === undefined) return;

      for (let i = 0; i < 7; i++) {
        bursts.push({
          x: clientX,
          y: clientY,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4 - 2,
          radius: Math.random() * 3 + 2,
          alpha: 1,
          decay: Math.random() * 0.025 + 0.015,
          color: Math.random() > 0.5 ? '#f43f5e' : '#fbbf24'
        });
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing fireflies
      fireflies.forEach((f) => {
        f.x += f.speedX;
        f.y += f.speedY;
        f.angle += f.pulseSpeed;

        if (f.x < 0) f.x = width;
        if (f.x > width) f.x = 0;
        if (f.y < 0) f.y = height;
        if (f.y > height) f.y = 0;

        const alpha = f.baseAlpha + Math.sin(f.angle) * 0.25;
        const currentAlpha = Math.max(0.05, Math.min(1, alpha));

        ctx.save();
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254, 240, 138, ${currentAlpha})`;
        ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      });

      // 2. Draw falling flower petals
      petals.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;

        // Draw curved rose petal
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-p.size, -p.size * 0.6, -p.size * 0.8, p.size, 0, p.size * 1.4);
        ctx.bezierCurveTo(p.size * 0.8, p.size, p.size, -p.size * 0.6, 0, 0);
        ctx.fillStyle = p.color;
        ctx.shadowColor = 'rgba(244, 114, 182, 0.3)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      });

      // 3. Draw click bursts
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.alpha -= b.decay;

        if (b.alpha <= 0) {
          bursts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.globalAlpha = b.alpha;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
}
