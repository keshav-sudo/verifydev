'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

// Register Plugin safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// --- SAFE TEXT SPLITTER (Crash Proof) ---
// Ye component text ko characters mein todta hai par error nahi deta
const SplitText = ({ 
  children, 
  className = "", 
  triggerClass = "" 
}: { 
  children: string, 
  className?: string, 
  triggerClass: string 
}) => {
  if (!children || typeof children !== 'string') return null;

  return (
    <span className={`${className} inline-block whitespace-nowrap`}>
      {children.split('').map((char, i) => (
        <span 
          key={i} 
          className={`inline-block ${triggerClass} will-change-transform opacity-0`}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

// --- BACKGROUND GRID COMPONENT (Self Contained) ---
const GridBackground = () => (
  <div className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none">
     <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
     <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
  </div>
);

export default function StorySection() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    const section = sectionRef.current;

    if (!trigger || !section) return;

    const ctx = gsap.context(() => {
      
      // 1. HORIZONTAL SCROLL LOGIC
      const moveDistance = section.scrollWidth - window.innerWidth;
      
      const scrollTween = gsap.to(section, {
        x: -moveDistance,
        ease: "none",
        scrollTrigger: {
          trigger: trigger,
          pin: true,
          scrub: 1,
          end: () => "+=" + moveDistance, 
          invalidateOnRefresh: true,
        }
      });

      // 2. CINEMATIC TEXT ANIMATION
      const animatePanel = (targetClass: string, triggerId: string) => {
        const chars = gsap.utils.toArray(targetClass);
        if (chars.length === 0) return;

        gsap.fromTo(chars, 
          {
            y: 60,
            scaleY: 1.8,  // Stretch Effect
            scaleX: 0.8,
            filter: "blur(15px)",
            opacity: 0
          },
          {
            y: 0,
            scaleY: 1,
            scaleX: 1,
            filter: "blur(0px)",
            opacity: 1,
            stagger: 0.04,
            duration: 1.2,
            ease: "power4.out",
            scrollTrigger: {
              trigger: triggerId,
              containerAnimation: scrollTween, // Link to horizontal scroll
              start: "left 65%",
              toggleActions: "play none none reverse"
            }
          }
        );
      };

      // --- EXECUTE ANIMATIONS ---

      // Panel 1: Load immediately
      gsap.fromTo(".char-p1", 
        { y: 60, scaleY: 1.8, filter: "blur(15px)", opacity: 0 }, 
        { y: 0, scaleY: 1, filter: "blur(0px)", opacity: 1, stagger: 0.04, duration: 1.2, delay: 0.2, ease: "power4.out" }
      );

      // Panel 2 & 3: Load on Scroll
      animatePanel(".char-p2", "#panel-2");
      animatePanel(".char-p3", "#panel-3");

    }, trigger);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={triggerRef} className="relative h-screen overflow-hidden bg-black text-white font-sans selection:bg-[#ADFF2F] selection:text-black">
      
      <GridBackground />

      <div ref={sectionRef} className="flex flex-row h-full w-[300vw] will-change-transform relative z-10">
          
          {/* --- PANEL 1: THE PROBLEM --- */}
          <div id="panel-1" className="w-screen h-full flex flex-col items-center justify-center relative px-4 md:px-6 border-r border-white/5">
              <div className="relative z-10 text-center max-w-[90vw]">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-8 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-red-400 text-xs font-mono uppercase tracking-widest">The Industry Secret</span>
                </div>
                
                <h2 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-white leading-[0.9]">
                  <SplitText triggerClass="char-p1">70% of resumes</SplitText> <br className="hidden md:block"/>
                  <span className="text-zinc-500">
                     <SplitText triggerClass="char-p1">are fiction.</SplitText>
                  </span>
                </h2>
                
                <p className="mt-8 text-xl text-zinc-400 max-w-2xl mx-auto font-light">
                  Honest talent gets buried in noise. Hiring is a guessing game.
                </p>
              </div>
          </div>

          {/* --- PANEL 2: THE SOLUTION --- */}
          <div id="panel-2" className="w-screen h-full flex flex-col items-center justify-center relative px-4 md:px-6 border-r border-white/5 bg-zinc-950/50">
              <div className="relative z-10 text-center max-w-[90vw]">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 backdrop-blur-md">
                  <span className="text-blue-400 text-xs font-mono uppercase tracking-widest">Protocol V2.0</span>
                </div>

                  <h2 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-white leading-[0.9]">
                      <SplitText triggerClass="char-p2">Don't claim it.</SplitText> <br className="hidden md:block"/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                         <SplitText triggerClass="char-p2">Prove it.</SplitText>
                      </span>
                  </h2>
                  
                  <div className="mt-10 flex flex-col items-center gap-4">
                    <p className="text-2xl md:text-3xl text-white font-medium">
                       AI-Powered <span className="font-mono text-blue-400">Git Forensics</span>
                    </p>
                    <p className="text-zinc-500">We analyze the actual code. No more faking it.</p>
                  </div>
              </div>
          </div>

          {/* --- PANEL 3: THE BENEFIT --- */}
          <div id="panel-3" className="w-screen h-full flex flex-col items-center justify-center relative px-4 md:px-6 bg-[#050505]">
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-[0.05]">
                  <span className="text-[20vw] font-black text-white">TRUTH</span>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ADFF2F]/10 border border-[#ADFF2F]/20 mb-8 backdrop-blur-md">
                  <span className="text-[#ADFF2F] text-xs font-mono uppercase tracking-widest">VerifyDev</span>
                </div>

                <h2 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-white leading-none mb-8 drop-shadow-2xl">
                   <SplitText triggerClass="char-p3">Your</SplitText> <br/>
                   <span className="text-[#ADFF2F] drop-shadow-[0_0_30px_rgba(173,255,47,0.3)]">
                      <SplitText triggerClass="char-p3">Aura Score.</SplitText>
                   </span>
                </h2>
                
                <p className="text-xl text-zinc-400 mb-10 max-w-xl">
                   The new standard for developer identity. Build trust instantly.
                </p>

                <Link href="/signup" className="char-p3 opacity-0 group relative inline-flex items-center gap-4 px-10 py-5 bg-white text-black font-bold rounded-full text-xl hover:bg-[#ADFF2F] transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_80px_rgba(173,255,47,0.6)]">
                   <span>Get Verified Now</span>
                   <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>
          </div>

      </div>
    </div>
  );
}