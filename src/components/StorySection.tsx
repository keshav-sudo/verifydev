'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

// Register Plugin safely (Client side check)
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// --- SAFE TEXT SPLITTER (Crash Proof & Responsive) ---
const SplitText = ({ 
  children, 
  className = "", 
  triggerClass = "" 
}: { 
  children: string, 
  className?: string, 
  triggerClass: string 
}) => {
  // Safety Check: Agar text string nahi hai to crash nahi karega
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

export default function StorySection() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    const section = sectionRef.current;

    // Safety check: Agar elements load nahi huye to ruk jao
    if (!trigger || !section) return;

    const ctx = gsap.context(() => {
      
      // 1. PERFECT WIDTH CALCULATION
      // Jitna content screen ke bahar hai, sirf utna hi scroll hoga.
      // Isse "Extra Blank Scroll" ki problem khatam ho jayegi.
      const moveDistance = section.scrollWidth - window.innerWidth;
      
      // 2. HORIZONTAL SCROLL LOGIC
      const scrollTween = gsap.to(section, {
        x: -moveDistance,
        ease: "none",
        scrollTrigger: {
          trigger: trigger,
          pin: true,       // Section ko pakad ke rakhega
          scrub: 1,        // Smooth scrolling (Jhatka nahi lagega)
          end: () => "+=" + moveDistance, // Exact distance match
          invalidateOnRefresh: true, // Resize hone par recalculate karega
        }
      });

      // 3. CINEMATIC TEXT ANIMATION (Blur + Stretch)
      const animateChars = (targetClass: string, triggerId: string) => {
        const chars = gsap.utils.toArray(targetClass);
        
        if (chars.length === 0) return;

        gsap.fromTo(chars, 
          {
            y: 60,              // Niche se upar
            scaleY: 1.8,        // Height mein khincha hua (Stretch)
            scaleX: 0.8,        // Width mein patla
            filter: "blur(15px)", // Dhundhla
            opacity: 0
          },
          {
            y: 0,
            scaleY: 1,          // Normal size
            scaleX: 1,
            filter: "blur(0px)", // Saaf
            opacity: 1,
            stagger: 0.04,      // Ek ke baad ek character aayega
            duration: 1.2,
            ease: "power4.out", // Premium feel wala ease
            scrollTrigger: {
              trigger: triggerId,
              containerAnimation: scrollTween, // Horizontal sync
              start: "left 65%", // Screen ke 65% pe aate hi chalega
              toggleActions: "play none none reverse"
            }
          }
        );
      };

      // --- EXECUTE ANIMATIONS ---

      // Panel 1: Turant load hoga (Page khulte hi)
      gsap.fromTo(".char-p1", 
        { y: 60, scaleY: 1.8, filter: "blur(15px)", opacity: 0 }, 
        { y: 0, scaleY: 1, filter: "blur(0px)", opacity: 1, stagger: 0.04, duration: 1.2, delay: 0.2, ease: "power4.out" }
      );

      // Panel 2 & 3: Scroll karne par aayenge
      animateChars(".char-p2", "#panel-2");
      animateChars(".char-p3", "#panel-3");

    }, trigger);

    return () => ctx.revert();
  }, []);

  return (
    // OUTER TRIGGER (Height: 100vh fix rakhi hai taaki layout hile nahi)
    <div ref={triggerRef} className="relative h-screen overflow-hidden bg-black text-white font-sans selection:bg-[#ADFF2F] selection:text-black">
      
      {/* Background Texture/Noise */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
                <feTurbulence type="fractalNoise" baseFrequency="0.6" stitchTiles="stitch"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
        </svg>
      </div>

      {/* HORIZONTAL MOVING CONTAINER (Width: 300vw = 3 Screens) */}
      <div ref={sectionRef} className="flex flex-row h-full w-[300vw] will-change-transform relative z-10">
          
          {/* --- PANEL 1 --- */}
          <div id="panel-1" className="w-screen h-full flex flex-col items-center justify-center relative px-4 md:px-6 border-r border-white/5 bg-black">
              <div className="relative z-10 text-center max-w-[90vw]">
                <p className="text-[#ADFF2F] font-mono text-xs md:text-sm mb-4 md:mb-6 tracking-widest uppercase opacity-80">
                   The Origin
                </p>
                {/* Responsive Text: Mobile pe chhota, Desktop pe bada */}
                <h2 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-white leading-[0.9]">
                  <SplitText triggerClass="char-p1">It started</SplitText> <br className="hidden md:block" /> 
                  <SplitText triggerClass="char-p1" className="md:ml-4">with a</SplitText>{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">
                     <SplitText triggerClass="char-p1">lie.</SplitText>
                  </span>
                </h2>
              </div>
          </div>

          {/* --- PANEL 2 --- */}
          <div id="panel-2" className="w-screen h-full flex flex-col items-center justify-center relative px-4 md:px-6 border-r border-white/5 bg-zinc-950">
              <div className="max-w-[90vw] md:max-w-5xl text-center space-y-6 md:space-y-10">
                  <h2 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight text-white leading-[0.95]">
                      <SplitText triggerClass="char-p2">Resumes are</SplitText>{" "}
                      <span className="text-[#ADFF2F] italic block md:inline">
                         <SplitText triggerClass="char-p2">fiction.</SplitText>
                      </span>
                  </h2>
                  
                  <div className="text-lg md:text-3xl text-zinc-400 font-light max-w-3xl mx-auto leading-relaxed flex flex-col items-center">
                      <div className="block">
                        <SplitText triggerClass="char-p2" className="mb-1">"They quote keywords.</SplitText>
                      </div>
                      <div className="block">
                        <SplitText triggerClass="char-p2" className="mb-1">They hide incompetence.</SplitText>
                      </div>
                      <div className="block mt-2">
                        <SplitText triggerClass="char-p2">not who they are."</SplitText>
                      </div>
                  </div>
              </div>
          </div>

          {/* --- PANEL 3 --- */}
          <div id="panel-3" className="w-screen h-full flex flex-col items-center justify-center relative px-4 md:px-6 bg-[#050505]">
              {/* Background Giant Text */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-[0.05]">
                  <span className="text-[20vw] font-black text-white">TRUTH</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-white leading-none mb-8 md:mb-12 text-center drop-shadow-2xl">
                   <SplitText triggerClass="char-p3">Code is</SplitText> <br/>
                   <span className="text-[#ADFF2F]">
                      <SplitText triggerClass="char-p3">Truth.</SplitText>
                   </span>
                </h2>
                
                {/* Button ko smooth fade-in diya hai */}
                <Link href="/signup" className="char-p3 opacity-0 group relative inline-flex items-center gap-4 px-8 py-4 md:px-12 md:py-6 bg-white text-black font-bold rounded-full text-lg md:text-2xl hover:bg-[#ADFF2F] transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_80px_rgba(173,255,47,0.6)]">
                   <span>Start Verifying</span>
                   <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>
          </div>

      </div>
    </div>
  );
}