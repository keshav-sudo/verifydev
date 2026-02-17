'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import Image from 'next/image';

interface PinnedScrollCanvasProps {
  baseUrl?: string;
  totalFrames?: number;
  className?: string;
}

interface Caption {
  start: number;
  end: number;
  text: string;
}

const defaultCaptions: Caption[] = [
  { start: 0, end: 370, text: "Lost in the Crowd: Skilled talent buried in a sea of generic resumes." },
  { start: 370, end: 739, text: "The BottleNeck: Recruiters drowning in unverified claims & endless noise." },
  { start: 739, end: 900, text: "Enter VerifyDev: A new protocol for truth emerges." },
  { start: 900, end: 1108, text: "The Insight: Seeing the developer behind the paper." },
  { start: 1108, end: 1340, text: "Deep Analysis: Verifying logic, architecture, and live projects." },
  { start: 1340, end: 1600, text: "The Verdict: Skills verified. Connection established." },
];

export default function PinnedScrollCanvas({
  baseUrl = 'https://ik.imagekit.io/ex97dobms/frames-123/',
  totalFrames = 1478,
  className = '',
}: PinnedScrollCanvasProps) {
  // CONFIGURATION
  const FRAME_STEP = 3; 
  const EFFECTIVE_FRAMES = Math.ceil(totalFrames / FRAME_STEP);
  const CACHE_SIZE = 50; // Keep only 50 decoded frames in GPU memory
  const LOOKAHEAD = 20;  // Pre-decode 20 frames ahead

  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // DATA STORAGE
  // Store all compressed blobs (Low RAM usage, e.g. ~20-50MB total)
  const blobsRef = useRef<Map<number, Blob>>(new Map());
  
  // Store decoded bitmaps (High VRAM usage, managed by LRU)
  const bitmapsRef = useRef<Map<number, ImageBitmap>>(new Map());
  
  // Track active decodes to prevent duplicates
  const pendingDecodes = useRef<Set<number>>(new Set());

  const currentFrameRef = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentCaption, setCurrentCaption] = useState("");

  const getFrameUrl = useCallback((index: number) => {
    const frameNum = (index * FRAME_STEP) + 1;
    const paddedNum = String(frameNum).padStart(4, '0');
    // NOTE: Removing ?updated=1 caching buster for production efficiency
    return `${baseUrl}frame_${paddedNum}.avif`;
  }, [baseUrl]);

  const updateCaption = useCallback((frameIndex: number) => {
    const caption = defaultCaptions.find(c => frameIndex >= c.start && frameIndex < c.end);
    if (caption) {
        setCurrentCaption(caption.text);
    }
  }, []);

  // --- BITMAP MANAGEMENT ---

  const decodeFrame = useCallback(async (index: number) => {
    if (bitmapsRef.current.has(index) || pendingDecodes.current.has(index)) return;
    
    // Check if we have the blob
    const blob = blobsRef.current.get(index);
    if (!blob) return; // Blob not downloaded yet

    try {
        pendingDecodes.current.add(index);
        const bitmap = await createImageBitmap(blob);
        bitmapsRef.current.set(index, bitmap);
        pendingDecodes.current.delete(index);
    } catch (err) {
        console.error(`Failed to decode frame ${index}`, err);
        pendingDecodes.current.delete(index);
    }
  }, []);

  const manageCache = useCallback((currentIndex: number) => {
    // 1. Decode Lookahead
    const endLookahead = Math.min(currentIndex + LOOKAHEAD, EFFECTIVE_FRAMES);
    for (let i = currentIndex; i < endLookahead; i++) {
        decodeFrame(i);
    }
    
    // 2. Decode Lookbehind (smaller window for reverse scroll)
    const startLookbehind = Math.max(0, currentIndex - 10);
    for (let i = startLookbehind; i < currentIndex; i++) {
        decodeFrame(i);
    }

    // 3. Clean up old frames (LRU)
    // We keep a window of [currentIndex - LOOKAHEAD, currentIndex + CACHE_SIZE] roughly
    // Any bitmap outside this range is explicitly closed to free VRAM
    for (const [index, bitmap] of bitmapsRef.current.entries()) {
        if (index < currentIndex - LOOKAHEAD || index > currentIndex + CACHE_SIZE) {
            bitmap.close(); // CRITICAL: Free GPU memory
            bitmapsRef.current.delete(index);
        }
    }
  }, [EFFECTIVE_FRAMES, decodeFrame]);


  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    updateCaption(index);
    
    // Trigger cache management on every render
    manageCache(index);

    // Try to draw current frame
    if (bitmapsRef.current.has(index)) {
      const bitmap = bitmapsRef.current.get(index)!;
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    } else {
      // Fallback: Try to draw nearest available frame
      // Search backwards first
      for (let i = 1; i < 10; i++) {
          if (bitmapsRef.current.has(index - i)) {
              const bitmap = bitmapsRef.current.get(index - i)!;
              ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
              return;
          }
      }
      // If nothing found properly, we might just keep previous frame on canvas
      // trigger decode priority
      decodeFrame(index);
    }
  }, [updateCaption, manageCache, decodeFrame]);


  // --- BLOB FETCHING ---
  
  // --- BLOB FETCHING ---
  
  const fetchBlobs = useCallback(async () => {
    // Phase 1: High Priority - First 50 frames
    // This allows the animation to start immediately
    const PRIORITY_BATCH = 1400;
    
    const loadBatch = async (start: number, end: number) => {
        const promises = [];
        for (let i = start; i < end; i++) {
            if (i >= EFFECTIVE_FRAMES) break;
            
            const p = fetch(getFrameUrl(i))
                .then(res => res.blob())
                .then(blob => {
                    blobsRef.current.set(i, blob);
                    if (i === 0) {
                        decodeFrame(0).then(() => {
                           renderFrame(0);
                           setIsLoaded(true);
                        });
                    }
                })
                .catch(err => console.error(`Failed frame ${i}`, err));
            promises.push(p);
        }
        await Promise.all(promises);
    }

    // Load first batch ASAP to show something
    await loadBatch(0, PRIORITY_BATCH);

    // Load the WHOLE rest immediately without delay
    // We break it into larger chunks just to avoid stack/connection limits
    const CHUNK_SIZE = 100;
    for (let i = PRIORITY_BATCH; i < EFFECTIVE_FRAMES; i += CHUNK_SIZE) {
        // No delay, just microtask queue
        loadBatch(i, Math.min(i + CHUNK_SIZE, EFFECTIVE_FRAMES));
    }

  }, [EFFECTIVE_FRAMES, getFrameUrl, decodeFrame, renderFrame]);


  // --- SCROLL HANDLER ---

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !stickyRef.current) return;
    
    const container = containerRef.current;
    const sticky = stickyRef.current;
    const rect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;    
  
    if (rect.top <= 0 && rect.bottom >= viewportHeight) {
      sticky.style.position = 'fixed';
      sticky.style.top = '0px';
      sticky.style.bottom = 'auto';
    } else if (rect.bottom < viewportHeight) {
      sticky.style.position = 'absolute';
      sticky.style.top = 'auto';
      sticky.style.bottom = '0px';
    } else {
      sticky.style.position = 'absolute';
      sticky.style.top = '0px';
      sticky.style.bottom = 'auto';
    }

    const totalDist = rect.height - viewportHeight;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / totalDist));

    const targetFrame = Math.min(
      Math.floor(progress * (EFFECTIVE_FRAMES - 1)),
      EFFECTIVE_FRAMES - 1
    );

    if (targetFrame !== currentFrameRef.current) {
      currentFrameRef.current = targetFrame;
      requestAnimationFrame(() => renderFrame(targetFrame));
    }
  }, [EFFECTIVE_FRAMES, renderFrame]);


  useEffect(() => {
    if (canvasRef.current) {
        canvasRef.current.width = 1920;
        canvasRef.current.height = 1080;
    }
    
    // Start fetching
    fetchBlobs();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      
      // Cleanup bitmaps safely
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const bitmaps = bitmapsRef.current;
      bitmaps.forEach(bmp => bmp.close());
      bitmaps.clear();
    };
  }, [fetchBlobs, handleScroll]);

  return (
    <div ref={containerRef} className={`relative w-full bg-black ${className}`} style={{ height: '300vh' }}>
      
      <div ref={stickyRef} className="w-full h-screen left-0 flex items-center justify-center overflow-hidden z-40 bg-black px-4 md:px-8">
        
        <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden bg-zinc-900 border-[1px] border-white/20 shadow-[0_0_80px_rgba(173,255,47,0.15)] ring-1 ring-white/10 group">
            
            {!isLoaded && (
                <div className="absolute inset-0 w-full h-full z-0">
                  <Image 
                      src={getFrameUrl(0)} 
                      alt="Loading..."
                      fill
                      className="object-cover"
                      priority
                  />
                </div>
            )}

            <canvas
                ref={canvasRef}
                className="w-full h-full object-cover block"
            />

            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />

            {/* System Status Pill */}
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-xl text-white px-3 py-1.5 rounded-full text-[10px] md:text-xs font-mono border border-white/10 shadow-2xl z-50 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-[#ADFF2F] rounded-full animate-pulse shadow-[0_0_10px_#ADFF2F]"></span>
                <span>System Processing</span>
            </div>

            {/* Caption Strip */}
            <div className="absolute bottom-0 left-0 right-0 h-16 md:h-20 bg-black z-50 flex items-center justify-center border-t border-white/10">
                <p className="text-white/90 font-mono text-sm md:text-base font-medium tracking-wide">
                   {currentCaption && (
                       <span className="flex items-center gap-3">
                           <span className="text-[#ADFF2F]">{'>'}</span>
                           {currentCaption}
                           <span className="w-2 h-4 bg-[#ADFF2F] animate-pulse ml-1 opacity-70"></span>
                       </span>
                   )}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}