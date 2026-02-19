'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import panda from "../../data/panda.png";

// Animations
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
});

const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
});

export default function HeroSection() {
  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <div className="w-full max-w-[1536px] mx-auto min-h-[100dvh] flex flex-col relative">

        {/* NAVBAR */}
        <nav className="absolute top-0 left-0 right-0 z-50 px-6 lg:px-12 flex items-center justify-between h-[80px] border-b border-white/10">
          <Link href="/" className="text-2xl font-bold text-white tracking-tight">
            Verify<span className="text-[#ADFF2F]">Dev</span>
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/login" className="hidden sm:block text-zinc-400 hover:text-white text-sm font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="bg-white text-black px-6 py-3 rounded-full text-sm font-bold hover:bg-[#ADFF2F] transition-all shadow-[0_0_20px_rgba(173,255,47,0.3)]">
              Get Started
            </Link>
          </div>
        </nav>

        {/* MAIN CONTENT GRID */}
        <main className="relative z-10 flex-1 flex flex-col lg:grid lg:grid-cols-[0.9fr_1.1fr] w-full pt-[80px] pb-4 overflow-hidden">

          {/* LEFT COLUMN (Text) - Kept exactly as you liked */}
          <div className="flex flex-col justify-center px-6 lg:px-12 relative z-20 h-full overflow-hidden">
            <div className="relative z-10 max-w-2xl pt-10 lg:pt-0">

              {/* GREEN BADGE RESTORED */}
              <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] w-fit mb-8 backdrop-blur-md select-none">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ADFF2F] shadow-[0_0_10px_#ADFF2F]"></span>
                <span className="text-zinc-400 text-[11px] font-medium tracking-wide uppercase">Protocol V2.0</span>
              </motion.div>

              <motion.h1 {...fadeUp(0.2)} className="leading-[1] mb-8">
                <span className="block text-4xl sm:text-7xl lg:text-[75px] xl:text-[85px] font-light text-zinc-500 tracking-tight">
                  Stop claiming.
                </span>
                <span className="block text-5xl sm:text-7xl lg:text-[85px] xl:text-[95px] font-bold text-white tracking-tighter mt-1">
                  Start proving<span className="text-[#ADFF2F]">.</span>
                </span>
              </motion.h1>

              <motion.p {...fadeUp(0.3)} className="text-lg text-zinc-400 font-light max-w-md mb-10 leading-relaxed">
                Transformation complete. Replace your resume with <span className="text-zinc-200 font-medium">verified proof</span> of your coding skills.
              </motion.p>

              <motion.div {...fadeUp(0.4)} className="flex flex-wrap items-center gap-6">
                <button className="h-[56px] px-8 rounded-full bg-white text-black font-bold text-base hover:bg-zinc-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center gap-2">
                  Get Verified
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>

                {/* Social Proof */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {["bg-rose-500", "bg-blue-500", "bg-amber-500"].map((c, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-black ${c}`} />
                    ))}
                  </div>
                  <span className="text-zinc-500 text-sm">2k+ joined</span>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="relative w-full h-[600px] lg:h-auto bg-[#f4f4f5] rounded-t-[40px] lg:rounded-t-none lg:rounded-tl-[50px] overflow-hidden flex flex-col items-center justify-between z-30 shadow-[-20px_0_60px_rgba(0,0,0,0.2)]">

            {/* Tech Grid Background (Premium) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-100 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#f4f4f5_100%)] opacity-80 pointer-events-none"></div>

            {/* Active Scan Line Animation */}
            <motion.div
              initial={{ top: "-10%" }}
              animate={{ top: "110%" }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ADFF2F]/50 to-transparent z-10 pointer-events-none blur-[1px]"
            > 
              <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-[#ADFF2F]/5 to-transparent transform -translate-y-full" />
            </motion.div>

            {/* Technical HUD Corners */}
            <div className="absolute inset-0 pointer-events-none z-20 p-6 opacity-30">
              <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-zinc-400 rounded-tl-lg"></div>
              <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-zinc-400 rounded-tr-lg"></div>
              <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-zinc-400 rounded-bl-lg"></div>
              <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-zinc-400 rounded-br-lg"></div>
            </div>

            {/* ================= MASSIVE PANDA ================= */}
            <motion.div
              {...scaleIn(0.4)}
              className=" absolute
                          bottom-[-20px] sm:bottom-[-40px]
                          right-[-100px] sm:right-[-200px]
                          w-[140%] sm:w-[150%]
                          max-w-[1300px]
                          aspect-[4/3]
                          min-h-[200px]
                          z-20
                          pointer-events-none
                        "
            >
              <Image
                src={panda}
                alt="VerifyDev AI Panda"
                fill
                priority
                quality={75}
                draggable={false}
                className="object-contain drop-shadow-[0_-10px_40px_rgba(0,0,0,0.15)]"
              />

            </motion.div>


            {/* GIANT BACKGROUND WATERMARK */}
            <div className="absolute top-10 left-10 z-0 pointer-events-none opacity-[0.03]">
              <h1 className="text-[15vw] font-black text-black leading-none tracking-tighter select-none">
                VERIFY
              </h1>
            </div>

            {/* TEXT OVERLAY (Minimalist) */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute bottom-[20%] left-[8%] z-30 max-w-[500px]"
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">AI Verdict Protocol</span>
              </div>
              <h3 className="text-3xl sm:text-6xl lg:text-7xl font-black text-zinc-900 leading-[0.9] tracking-tighter">
                "I read <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 relative">
                  code,
                  <svg className="absolute w-full h-3 bottom-1 left-0 text-emerald-400/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span>
                <br />not resumes."
              </h3>
            </motion.div>

            {/* FLOATING SKILL TAGS (Background Context) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
              {['TypeScript', 'System Design', 'Docker', 'Next.js', 'Python', 'Go', 'AWS', 'Kubernetes'].map((skill, i) => (
                <motion.div
                  key={skill}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{
                    y: [100, -500],
                    opacity: [0, 0.4, 0]
                  }}
                  transition={{
                    duration: 15 + i * 2,
                    repeat: Infinity,
                    delay: i * 1.5,
                    ease: "linear"
                  }}
                  className="absolute text-xs sm:text-sm font-bold text-zinc-300 select-none"
                  style={{
                    left: `${10 + (i * 12) % 80}%`,
                    bottom: '-10%'
                  }}
                >
                  {skill}
                </motion.div>
              ))}
            </div>


            {/* INFINITE ROLLING TICKER FRAME (Footer) */}
            <div className="absolute bottom-0 left-0 w-full h-16 bg-white/40 backdrop-blur-md border-t border-white/60 z-20 flex items-center overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#f4f4f5] to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#f4f4f5] to-transparent z-10" />

              <motion.div
                className="flex gap-12 whitespace-nowrap px-4"
                animate={{ x: [0, -1000] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              >
                {[...Array(4)].map((_, i) => (
                  <React.Fragment key={i}>
                    <span className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">System Design</span>
                      <span className="h-1 w-1 bg-zinc-300 rounded-full" />
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-800 uppercase tracking-widest">Algorithms</span>
                      <span className="h-1 w-1 bg-zinc-300 rounded-full" />
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Database Arch</span>
                      <span className="h-1 w-1 bg-zinc-300 rounded-full" />
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-800 uppercase tracking-widest">Clean Code</span>
                      <span className="h-1 w-1 bg-zinc-300 rounded-full" />
                    </span>
                  </React.Fragment>
                ))}
              </motion.div>
            </div>




          </div>
        </main>
      </div>
    </>
  );
}
