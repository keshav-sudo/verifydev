'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import panda from "../../data/panda.png"; 

// Premium Animations (Refined curves)
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
});

// Shimmer Animation for Button
const shimmerAnimation = {
  initial: { backgroundPosition: "200% center" },
  animate: { backgroundPosition: "-200% center" },
  transition: { repeat: Infinity, duration: 3, ease: "linear" }
};

export default function MobileHeroSection() {
  return (
    <div className="w-full min-h-[100dvh] flex flex-col relative overflow-hidden bg-[#050505]">
          
          {/* BACKGROUND EFFECTS */}
          <div className="absolute inset-0 z-0 h-full pointer-events-none">
             {/* Gradient Orb - Softer, more spread out */}
             <motion.div 
               animate={{ 
                 opacity: [0.10, 0.20, 0.10],
                 scale: [1, 1.1, 1] 
               }}
               transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-[-25%] left-[-25%] w-[100vw] h-[100vw] bg-[#ADFF2F] rounded-full blur-[140px] opacity-15" 
             />
             
             {/* Tech Grid - Finer lines */}
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)"></div>
             
             {/* Noise Texture - Subtle grain */}
             <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
          </div>

          {/* NAVBAR (Mobile) */}
          <nav className="fixed top-0 left-0 right-0 z-50 px-6 flex items-center justify-between h-[64px] bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 shadow-sm">
            <Link href="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-1">
              Verify<span className="text-[#ADFF2F]">Dev</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] ml-0.5 animate-pulse"></span>
            </Link>
            <div className="flex gap-3 items-center">
                <Link href="/login" className="text-zinc-400 text-xs font-semibold hover:text-white transition-colors">
                    Log in
                </Link>
                <Link href="/signup" className="relative overflow-hidden group bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-zinc-100 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </Link>
            </div>
          </nav>

          {/* MAIN CONTENT */}
          <main className="relative z-10 flex-1 flex flex-col pt-[90px] px-6 py-8 justify-start">
              
              {/* Badge - Glassmorphism + Glow */}
              <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] w-fit mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ADFF2F] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ADFF2F] shadow-[0_0_8px_#ADFF2F]"></span>
                </span>
                <span className="text-zinc-300 text-[10px] font-bold tracking-widest uppercase text-shadow-sm">Protocol V2.0 Live</span>
              </motion.div>

              {/* Headline - Premium Typography */}
              <motion.h1 {...fadeUp(0.2)} className="leading-[0.9] mb-5 relative">
                <span className="block text-[42px] font-light text-zinc-500 tracking-tighter mix-blend-plus-lighter">
                  Stop claiming.
                </span>
                <span className="block text-[60px] font-black text-white tracking-[-0.04em] mt-1 drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-400">
                  Start proving<span className="text-[#ADFF2F]">.</span>
                </span>
              </motion.h1>
              
              {/* Subtext */}
              <motion.p {...fadeUp(0.3)} className="text-[15px] text-zinc-400 font-medium mb-8 leading-relaxed max-w-[90%] tracking-tight">
                Transformation complete. Replace your resume with <span className="text-white border-b border-[#ADFF2F]/40 pb-0.5">verified proof</span> of your coding skills.
              </motion.p>

              {/* CTA Button - Major Upgrade */}
               <motion.div {...fadeUp(0.4)} className="flex flex-col gap-6 w-full relative z-20">
                  <button className="h-[56px] w-full rounded-full bg-white text-black font-bold text-[16px] transition-all shadow-[0_0_40px_rgba(173,255,47,0.15)] flex items-center justify-center gap-2 group relative overflow-hidden border-2 border-transparent hover:border-[#ADFF2F]/20 hover:shadow-[0_0_50px_rgba(173,255,47,0.3)]">
                    <span className="relative z-10 flex items-center gap-2 tracking-tight">
                        Get Verified Now
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </span>
                    {/* Shimmer Effect */}
                    <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-300/40 to-transparent w-full h-full skew-x-[-20deg]"
                    />
                  </button>
                  
                   {/* Social Proof - Redesigned */}
                   <div className="flex items-center justify-center gap-4">
                        <div className="flex -space-x-2.5">
                          {["bg-gradient-to-br from-rose-400 to-rose-600", "bg-gradient-to-br from-blue-400 to-blue-600", "bg-gradient-to-br from-amber-400 to-amber-600", "bg-gradient-to-br from-purple-400 to-purple-600"].map((c, i) => (
                            <div key={i} className={`w-8 h-8 rounded-full border-[3px] border-[#050505] ${c} shadow-md`} />
                          ))}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Trusted By</span>
                            <span className="text-white text-xs font-bold">2,400+ Developers</span>
                        </div>
                  </div>
               </motion.div>

              {/* Visual Element (Premium Glass Card) - Spotlight Effect */}
              <motion.div 
                {...fadeUp(0.5)}
                className="relative w-full mt-10 mb-[-40px] group perspective-1000" 
              >
                  {/* Spotlight Glow */}
                  <div className="absolute -top-[1px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#ADFF2F]/80 to-transparent blur-[2px] z-20"></div>

                  <div className="relative w-full aspect-[4/5] rounded-t-[32px] bg-[#0E0E0E] border-t border-x border-white/10 overflow-hidden shadow-2xl ring-1 ring-white/5">
                       
                       {/* Inner Texture (Code Editor Theme) */}
                       <div className="absolute inset-0 bg-[#0E0E0E] opacity-100">
                          {/* Line Numbers & Code */}
                          <div className="flex font-mono text-[10px] leading-relaxed p-6 opacity-30 select-none">
                              <div className="flex flex-col text-zinc-600 text-right pr-4 border-r border-zinc-800 mr-4">
                                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span>
                              </div>
                              <div className="flex flex-col text-blue-400">
                                  <span><span className="text-purple-400">import</span> Skill <span className="text-purple-400">from</span> <span className="text-green-400">'verify'</span>;</span>
                                  <span></span>
                                  <span><span className="text-purple-400">const</span> <span className="text-yellow-200">audit</span> = <span className="text-purple-400">await</span> verify.<span className="text-yellow-200">check</span>();</span>
                                  <span><span className="text-purple-400">if</span> (audit.<span className="text-blue-300">score</span> &gt; <span className="text-orange-300">95</span>) {'{'}</span>
                                  <span className="pl-4"><span className="text-purple-400">return</span> <span className="text-green-400">"Verified Expert"</span>;</span>
                                  <span>{'}'}</span>
                                  <span><span className="text-gray-500">// Audit Complete</span></span>
                              </div>
                          </div>
                      </div>
                       
                       {/* Ambient Glow */}
                       <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[80%] bg-gradient-to-b from-[#ADFF2F]/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

                       {/* Panda Image (Massive Scale) */}
                       <div className="absolute bottom-[25%] right-[-25%] w-[140%] h-[90%] z-10">
                            <Image
                              src={panda}
                              alt="VerifyDev AI Panda Auditor"
                              fill
                              className="object-contain object-bottom drop-shadow-[0_-5px_40px_rgba(0,0,0,0.5)] transform scale-110"
                              priority
                              quality={75}
                              sizes="(max-width: 768px) 100vw, 80vw"
                              draggable={false}
                            />
                       </div>
                       
                       {/* Floating Report Card (The White Area) */}
                       {/* Floating Report Card (The White Area) - Dark Theme */}
                       <motion.div 
                          initial={{ y: 50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.8, duration: 0.8 }}
                          className="absolute bottom-[-5px] left-[-1px] right-[-1px] bg-[#0E0E0E] pt-6 pb-12 px-6 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] z-20 border-t border-white/20"
                       >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#ADFF2F] text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(173,255,47,0.4)] border border-black/10">
                                Official Audit
                            </div>

                            <div className="flex justify-between items-end mb-3">
                                <div>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] animate-pulse shadow-[0_0_8px_#ADFF2F]"></div>
                                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Skill Verified</p>
                                    </div>
                                    <h2 className="text-[26px] font-black text-white leading-none tracking-tight">Advanced React</h2>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[44px] font-black text-white leading-[0.8] tracking-tighter">98</span>
                                    <span className="text-[11px] font-bold text-zinc-500">Score / 100</span>
                                </div>
                            </div>
                            
                            {/* Visual Bar - Dark Track */}
                            <div className="w-full h-1.5 bg-zinc-800/50 rounded-full mb-5 overflow-hidden ring-1 ring-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "98%" }}
                                    transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                                    className="h-full bg-[#ADFF2F] shadow-[0_0_10px_#ADFF2F]" 
                                />
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Candidate ID</span>
                                    <span className="text-[12px] font-bold text-zinc-300 font-mono tracking-tight">8X-9291-VF</span>
                                </div>
                                <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                    <span className="text-[10px] font-black text-white uppercase tracking-wider">Top 1% Global</span>
                                </div>
                            </div>
                       </motion.div>

                  </div>
                  
                  {/* Reflection below card */}
                  <div className="absolute -bottom-4 left-4 right-4 h-4 bg-gradient-to-b from-[#ADFF2F]/10 to-transparent blur-xl opacity-50 rounded-full mx-auto w-[80%]"></div>
              </motion.div>

          </main>
    </div>
  );
}

