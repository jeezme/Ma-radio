import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  height?: number;
  colorScheme?: 'amber' | 'emerald' | 'rose' | 'rainbow';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  barCount = 18,
  height = 24,
  colorScheme = 'amber',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const phasesRef = useRef<number[]>([]);

  useEffect(() => {
    phasesRef.current = Array.from({ length: barCount }, () => Math.random() * Math.PI * 2);
  }, [barCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const barWidth = Math.max(2, (width / barCount) - 2);

      for (let i = 0; i < barCount; i++) {
        let barHeight = 2;

        if (isPlaying) {
          const phase = phasesRef.current[i] || 0;
          // Organic frequency wave simulation
          const wave1 = Math.sin(tick * 0.08 + phase);
          const wave2 = Math.cos(tick * 0.05 + i * 0.4);
          const factor = Math.abs((wave1 + wave2) / 2);
          barHeight = Math.max(3, factor * (canvas.height - 4));
        }

        const x = i * (barWidth + 2);
        const y = canvas.height - barHeight;

        let gradient: CanvasGradient;
        if (colorScheme === 'amber') {
          gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
          gradient.addColorStop(0, '#f59e0b');
          gradient.addColorStop(1, '#ef4444');
        } else if (colorScheme === 'emerald') {
          gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
          gradient.addColorStop(0, '#10b981');
          gradient.addColorStop(1, '#06b6d4');
        } else if (colorScheme === 'rainbow') {
          gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
          gradient.addColorStop(0, '#ec4899');
          gradient.addColorStop(0.5, '#8b5cf6');
          gradient.addColorStop(1, '#3b82f6');
        } else {
          gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
          gradient.addColorStop(0, '#f43f5e');
          gradient.addColorStop(1, '#fb923c');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      tick++;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, barCount, height, colorScheme]);

  return (
    <canvas
      ref={canvasRef}
      width={barCount * 4}
      height={height}
      className="inline-block"
      style={{ width: `${barCount * 4}px`, height: `${height}px` }}
    />
  );
};
