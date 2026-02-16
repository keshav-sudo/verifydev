'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';

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
  baseUrl = 'https://ik.imagekit.io/ex97dobms/frame/',
  totalFrames = 1600,
  className = '',
}: PinnedScrollCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentCaption, setCurrentCaption] = useState("");

  const getFrameUrl = useCallback((index: number) => {
    const frameNum = index + 1;
    const paddedNum = String(frameNum).padStart(4, '0');
    return `${baseUrl}frame_${paddedNum}.webp`;
  }, [baseUrl]);

  const updateCaption = useCallback((frameIndex: number) => {
    const caption = defaultCaptions.find(c => frameIndex >= c.start && frameIndex < c.end);
    if (caption) {
        setCurrentCaption(caption.text);
    }
  }, []);

  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Update caption
    updateCaption(index);

    const img = imagesRef.current[index];
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
      for (let i = 1; i < 50; i++) {
        const backupImg = imagesRef.current[index - i];
        if (backupImg?.complete && backupImg?.naturalWidth > 0) {
          ctx.drawImage(backupImg, 0, 0, canvas.width, canvas.height);
          break;
        }
      }
    }
  }, [updateCaption]);

  const preloadImages = useCallback(() => {
    const images: HTMLImageElement[] = [];
    
    for (let i = 0; i < Math.min(50, totalFrames); i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.crossOrigin = 'anonymous';
      images[i] = img;
      
      if (i === 0) {
        img.onload = () => {
          renderFrame(0);
          setIsLoaded(true);
        };
      }
    }

    let currentBatch = 50;
    const batchSize = 100;

    const loadNextBatch = () => {
      const end = Math.min(currentBatch + batchSize, totalFrames);
      for (let i = currentBatch; i < end; i++) {
        const img = new Image();
        img.src = getFrameUrl(i);
        img.crossOrigin = 'anonymous';
        images[i] = img;
      }
      currentBatch = end;
      if (currentBatch < totalFrames) {
        setTimeout(loadNextBatch, 20);
      }
    };
    
    setTimeout(loadNextBatch, 100);
    imagesRef.current = images;
  }, [totalFrames, getFrameUrl, renderFrame]);

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
      Math.floor(progress * (totalFrames - 1)),
      totalFrames - 1
    );

    if (targetFrame !== currentFrameRef.current) {
      currentFrameRef.current = targetFrame;
      requestAnimationFrame(() => renderFrame(targetFrame));
    }
  }, [totalFrames, renderFrame]);

  useEffect(() => {
    if (canvasRef.current) {
        canvasRef.current.width = 1920;
        canvasRef.current.height = 1080;
    }
    preloadImages();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [preloadImages, handleScroll]);

  return (
    <div ref={containerRef} className={`relative w-full bg-black ${className}`} style={{ height: '300vh' }}>
      
      <div ref={stickyRef} className="w-full h-screen left-0 flex items-center justify-center overflow-hidden z-40 bg-black px-4 md:px-8">
        
        {/* YAHAN BADLAV KIYA GAYA HAI: max-w-6xl ko max-w-4xl kar diya gaya hai */}
        <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden bg-zinc-900 border-[1px] border-white/20 shadow-[0_0_80px_rgba(173,255,47,0.15)] ring-1 ring-white/10 group">
            
            {!isLoaded && (
                <img 
                    src={getFrameUrl(0)} 
                    alt="Loading..."
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
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

            {/* Caption Strip (Hides Logo & Shows Context) */}
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