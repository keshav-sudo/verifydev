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
  skipFactor = 16, // Load every 16th frame = ~100 frames (ultra-optimized)
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

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img || !img.complete || img.naturalWidth === 0) {
      // Fill with white while loading
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Get actual canvas display dimensions
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.width / dpr;
    const displayHeight = canvas.height / dpr;

    // Clear with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate scaling to cover canvas while maintaining aspect ratio
    const scale = Math.max(
      displayWidth / img.naturalWidth,
      displayHeight / img.naturalHeight
    );
    
    const x = (displayWidth - img.naturalWidth * scale) / 2;
    const y = (displayHeight - img.naturalHeight * scale) / 2;
    
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(
      img,
      0, 0, img.naturalWidth, img.naturalHeight,
      x, y, img.naturalWidth * scale, img.naturalHeight * scale
    );
  }, []);

  // Preload images progressively
  const preloadImages = useCallback(() => {
    const images: HTMLImageElement[] = [];
    
    // Load first 3 frames immediately for instant playback
    for (let i = 0; i < Math.min(3, effectiveFrames); i++) {
      const img = new Image();
      const frameNum = getFrameNumber(i);
      const paddedNum = String(frameNum).padStart(4, '0');
      img.crossOrigin = 'anonymous';
      img.src = `${baseUrl}tr:f-avif,q-50,pr-true/frame_${paddedNum}.webp`;
      images[i] = img;
      
      img.onload = () => {
        loadedImagesRef.current++;
        if (i === 0) {
          renderFrame(0);
        }
      };
      
      img.onerror = () => {
        console.warn(`Failed to load frame ${i}, retrying with WebP`);
        img.src = `${baseUrl}tr:f-webp,q-70,pr-true/frame_${paddedNum}.webp`;
      };
    }

    // Load remaining frames progressively in background
    let currentBatch = 3;
    const batchSize = 10;

    const loadNextBatch = () => {
      const end = Math.min(currentBatch + batchSize, effectiveFrames);
      
      for (let i = currentBatch; i < end; i++) {
        const img = new Image();
        const frameNum = getFrameNumber(i);
        const paddedNum = String(frameNum).padStart(4, '0');
        img.crossOrigin = 'anonymous';
        img.src = `${baseUrl}tr:f-avif,q-50,pr-true/frame_${paddedNum}.webp`;
        images[i] = img;
        
        img.onload = () => {
          loadedImagesRef.current++;
        };
        
        img.onerror = () => {
          // Fallback to WebP if AVIF fails
          img.src = `${baseUrl}tr:f-webp,q-70,pr-true/frame_${paddedNum}.webp`;
        };
      }

      currentBatch = end;
      
      if (currentBatch < effectiveFrames) {
        setTimeout(loadNextBatch, 150); // Optimized throttle
      }
    };

    // Start loading remaining frames after a short delay
    setTimeout(loadNextBatch, 200);

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

    // Set canvas size with device pixel ratio
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

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

      // Aggressive memory cleanup - revoke object URLs and clear image references
      imagesRef.current.forEach(img => {
        if (img && img.src) {
          img.src = '';
          img.onload = null;
          img.onerror = null;
        }
      });
      imagesRef.current = [];
    };
  }, [effectiveFrames, preloadImages, handleScroll, handleResize]);

  return (
    <div 
      ref={containerRef} 
      className={`relative bg-white ${className}`}
      style={{ height: `${scrollHeightRef.current}px` }}
    >
      {/* Canvas Container Box */}
      <div className="sticky top-8 left-0 right-0 mx-auto max-w-6xl px-4">
        <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 shadow-2xl">
          <canvas
            ref={canvasRef}
            className="w-full aspect-video bg-white"
            style={{ 
              willChange: 'contents',
              imageRendering: 'auto',
              display: 'block',
              width: '100%',
              height: 'auto',
            }}
          />
          
          {/* Loading indicator */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-gray-800 px-4 py-2 rounded-full text-sm font-mono border border-gray-300 shadow-lg">
            <span className="inline-block w-2 h-2 bg-[#ADFF2F] rounded-full animate-pulse mr-2"></span>
            Frame {frameIndexRef.current + 1}/{effectiveFrames}
          </div>
        </div>
      </div>
    </div>
  );
}
