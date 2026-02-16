'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface ScrollCanvasProps {
  baseUrl?: string;
  totalFrames?: number;
  skipFactor?: number;
  className?: string;
}

export default function ScrollCanvas({
  baseUrl = 'https://ik.imagekit.io/ex97dobms/frame/',
  totalFrames = 1600,
  skipFactor = 6, // Load every 6th frame = ~267 frames
  className = '',
}: ScrollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef(0);
  const loadedImagesRef = useRef(0);
  const rafRef = useRef<number>();
  const scrollHeightRef = useRef(0);

  // Calculate effective frames
  const effectiveFrames = Math.ceil(totalFrames / skipFactor);

  // Get frame number from index
  const getFrameNumber = useCallback((index: number) => {
    return index * skipFactor;
  }, [skipFactor]);

  // Render specific frame to canvas
  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img || !img.complete) {
      // Fill with black while loading
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Clear with black background and draw
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate scaling to cover canvas while maintaining aspect ratio
    const scale = Math.max(
      canvas.width / img.width,
      canvas.height / img.height
    );
    
    const x = (canvas.width - img.width * scale) / 2;
    const y = (canvas.height - img.height * scale) / 2;
    
    ctx.drawImage(
      img,
      0, 0, img.width, img.height,
      x, y, img.width * scale, img.height * scale
    );
  }, []);

  // Preload images progressively
  const preloadImages = useCallback(() => {
    const images: HTMLImageElement[] = [];
    
    // Load first 10 frames immediately for instant playback
    for (let i = 0; i < Math.min(10, effectiveFrames); i++) {
      const img = new Image();
      const frameNum = getFrameNumber(i);
      const paddedNum = String(frameNum).padStart(4, '0');
      img.src = `${baseUrl}frame_${paddedNum}.webp`;
      img.crossOrigin = 'anonymous';
      images[i] = img;
      
      if (i === 0) {
        img.onload = () => {
          loadedImagesRef.current++;
          renderFrame(0);
        };
      } else {
        img.onload = () => {
          loadedImagesRef.current++;
        };
      }
    }

    // Load remaining frames progressively in background
    let currentBatch = 10;
    const batchSize = 20;

    const loadNextBatch = () => {
      const end = Math.min(currentBatch + batchSize, effectiveFrames);
      
      for (let i = currentBatch; i < end; i++) {
        const img = new Image();
        const frameNum = getFrameNumber(i);
        const paddedNum = String(frameNum).padStart(4, '0');
        img.src = `${baseUrl}frame_${paddedNum}.webp`;
        img.crossOrigin = 'anonymous';
        images[i] = img;
        
        img.onload = () => {
          loadedImagesRef.current++;
        };
      }

      currentBatch = end;
      
      if (currentBatch < effectiveFrames) {
        setTimeout(loadNextBatch, 100); // Throttle loading
      }
    };

    // Start loading remaining frames after a short delay
    setTimeout(loadNextBatch, 300);

    imagesRef.current = images;
  }, [baseUrl, effectiveFrames, getFrameNumber, renderFrame]);

  // Handle scroll with requestAnimationFrame
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const containerTop = rect.top + window.pageYOffset;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Calculate scroll position relative to this section
    const relativeScroll = scrollTop - containerTop;
    const maxScroll = scrollHeightRef.current - window.innerHeight;
    const scrollFraction = Math.max(0, Math.min(relativeScroll / maxScroll, 1));
    
    const targetFrame = Math.min(
      Math.floor(scrollFraction * (effectiveFrames - 1)),
      effectiveFrames - 1
    );

    if (targetFrame !== frameIndexRef.current) {
      frameIndexRef.current = targetFrame;
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        renderFrame(targetFrame);
      });
    }
  }, [effectiveFrames, renderFrame]);

  // Handle resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Set canvas size to match container (not viewport)
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Re-render current frame
    renderFrame(frameIndexRef.current);
  }, [renderFrame]);

  // Initialize
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Set initial size based on container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill with black initially
    const ctx = canvas.getContext('2d', { alpha: false });
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Set scroll height based on number of frames (reduced for tighter animation)
    scrollHeightRef.current = effectiveFrames * 12; // 12px per frame for smoother experience

    // Preload images
    preloadImages();

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Initial render
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Clean up images
      imagesRef.current = [];
    };
  }, [effectiveFrames, preloadImages, handleScroll, handleResize]);

  return (
    <div 
      ref={containerRef} 
      className={`relative bg-black ${className}`}
      style={{ height: `${scrollHeightRef.current}px` }}
    >
      {/* Canvas Container Box */}
      <div className="sticky top-8 left-0 right-0 mx-auto max-w-6xl px-4">
        <div className="relative rounded-2xl overflow-hidden border-2 border-gray-800 shadow-2xl">
          <canvas
            ref={canvasRef}
            className="w-full aspect-video"
            style={{ 
              willChange: 'transform',
              imageRendering: 'crisp-edges',
              display: 'block',
            }}
          />
          
          {/* Loading indicator */}
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-mono border border-gray-700">
            <span className="inline-block w-2 h-2 bg-[#ADFF2F] rounded-full animate-pulse mr-2"></span>
            Frame {frameIndexRef.current + 1}/{effectiveFrames}
          </div>
        </div>
      </div>
    </div>
  );
}
