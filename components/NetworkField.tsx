"use client";

import { useEffect, useRef } from "react";

type NetworkNode = {
  x: number;
  y: number;
  z: number;
  phase: number;
};

function seeded(index: number) {
  const value = Math.sin(index * 999.37) * 10000;
  return value - Math.floor(value);
}

export function NetworkField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const canvasElement = canvas;
    const drawingContext = context;
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let nodes: NetworkNode[] = [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      const parent = canvasElement.parentElement;
      const rect = parent?.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect?.width ?? window.innerWidth));
      height = Math.max(520, Math.round(rect?.height ?? 680));

      canvasElement.width = Math.round(width * dpr);
      canvasElement.height = Math.round(height * dpr);
      canvasElement.style.width = `${width}px`;
      canvasElement.style.height = `${height}px`;
      drawingContext.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = width < 760 ? 26 : 48;
      nodes = Array.from({ length: count }, (_, index) => ({
        x: width * (0.06 + seeded(index + 1) * 0.88),
        y: height * (0.08 + seeded(index + 7) * 0.76),
        z: 0.32 + seeded(index + 13) * 0.72,
        phase: seeded(index + 21) * Math.PI * 2
      }));
    }

    function draw(time = 0) {
      const isDark = document.documentElement.classList.contains("dark");
      const lineColor = isDark ? "255,255,255" : "24,24,27";
      const accentColor = isDark ? "251,113,133" : "225,29,72";
      const drift = reducedMotion ? 0 : time * 0.00018;

      drawingContext.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        const ax = a.x + Math.cos(drift + a.phase) * 18 * a.z;
        const ay = a.y + Math.sin(drift * 1.35 + a.phase) * 12 * a.z;

        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const bx = b.x + Math.cos(drift + b.phase) * 18 * b.z;
          const by = b.y + Math.sin(drift * 1.35 + b.phase) * 12 * b.z;
          const distance = Math.hypot(ax - bx, ay - by);
          const threshold = 170;

          if (distance < threshold) {
            const alpha = (1 - distance / threshold) * (isDark ? 0.18 : 0.16);
            drawingContext.strokeStyle = `rgba(${lineColor},${alpha})`;
            drawingContext.lineWidth = 1;
            drawingContext.beginPath();
            drawingContext.moveTo(ax, ay);
            drawingContext.lineTo(bx, by);
            drawingContext.stroke();
          }
        }
      }

      nodes.forEach((node, index) => {
        const x = node.x + Math.cos(drift + node.phase) * 18 * node.z;
        const y = node.y + Math.sin(drift * 1.35 + node.phase) * 12 * node.z;
        const size = 2 + node.z * 2.4;
        const isAccent = index % 11 === 0;

        drawingContext.fillStyle = isAccent
          ? `rgba(${accentColor},${isDark ? 0.72 : 0.64})`
          : `rgba(${lineColor},${isDark ? 0.34 : 0.26})`;
        drawingContext.fillRect(x - size / 2, y - size / 2, size, size);
      });

      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    }

    function handleResize() {
      resize();
      window.cancelAnimationFrame(animationFrame);
      draw();
    }

    resize();
    draw();

    const observer = new MutationObserver(() => {
      window.cancelAnimationFrame(animationFrame);
      draw();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden h-[760px] overflow-hidden opacity-75 sm:block"
    >
      <canvas className="h-full w-full" ref={canvasRef} />
    </div>
  );
}
