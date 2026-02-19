'use client';

import React from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google'; 

// IMPORT StorySection (Ensure this path is correct)
import StorySection from '../components/StorySection'; 

import PinnedScrollCanvas from '../components/PinnedScrollCanvas';
import HowItWorks from '../components/HowItWorks';
import ProfileShowcase from '../components/landing/ProfileShowcase';
import DesktopHeroSection from '../components/landing/DesktopHeroSection';
import MobileHeroSection from '../components/landing/MobileHeroSection';
import LandingFooter from '../components/landing/LandingFooter';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';

// Initialize GSAP
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export default function Landing() {
  
  React.useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });
    
    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => { lenis.destroy(); };
  }, []);

  return (
    <div className={`w-full bg-[#050505] font-sans selection:bg-[#ADFF2F] selection:text-black overflow-x-hidden ${inter.variable} ${mono.variable}`}>
      
      <div className="hidden lg:block">
        <DesktopHeroSection />
      </div>
      <div className="block lg:hidden">
        <MobileHeroSection />
      </div>

      {/* ================= STORY SECTION ================= */}
      <section className="relative w-full z-40 bg-black">
         <StorySection />
      </section>

      {/* ================= PINNED SCROLL CANVAS ================= */}
      <div className="w-full bg-[#050505] flex justify-center relative z-20">
        <div className="w-full max-w-[1536px]">
          <PinnedScrollCanvas />
        </div>
      </div>

      <HowItWorks />
      <ProfileShowcase />
      
      <LandingFooter />

    </div>
  );
}