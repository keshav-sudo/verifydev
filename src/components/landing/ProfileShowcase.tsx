'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { 
  Zap, Code2, CheckCircle2, 
  MapPin, Building, ShieldCheck,
  Sparkles, TrendingUp, Terminal
} from 'lucide-react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

// --- MOCK DATA ---
const MOCK_USER = {
  name: "Keshav Sharma",
  username: "keshav-sudo",
  auraScore: 942,
  percentile: 0.1,
  avatarUrl: "https://github.com/keshav-sudo.png",
  location: "Bangalore, IN",
  company: "VerifyDev",
  website: "verifydev.me",
  bio: "Full Stack Engineer specializing in distributed systems and high-performance UI. Building the future of dev identity.",
};

const MOCK_SKILLS = [
  { name: "TypeScript", isVerified: true },
  { name: "Rust", isVerified: true },
  { name: "Next.js", isVerified: true },
  { name: "Go", isVerified: true },
  { name: "Kubernetes", isVerified: true },
  { name: "PostgreSQL", isVerified: true },
  { name: "System Design", isVerified: true },
  { name: "AWS", isVerified: true },
];

const MOCK_BREAKDOWN = { profile: 150, projects: 350, skills: 300, activity: 100, github: 42 };

// --- COMPONENTS ---

// 1. The Exact "Command Center" Hero from Profile Page
const CommandCenterHero = () => (
  <div className="w-full bg-[#0A0A0A] rounded-xl p-8 shadow-xl border border-white/10 relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
     {/* Glows */}
     <div className="absolute top-0 right-0 w-64 h-64 bg-[#ADFF2F]/5 rounded-full blur-[60px] pointer-events-none" />
     <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-purple-500/5 rounded-full blur-[40px] pointer-events-none" />

     {/* Left: Identity */}
     <div className="flex flex-row items-center gap-6 relative z-10">
        <div className="relative">
           <div className="w-24 h-24 rounded-xl border border-white/10 shadow-xl bg-zinc-900 overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={MOCK_USER.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
           </div>
           <div className="absolute -bottom-2 -right-2 p-1.5 rounded-md bg-[#0A0A0A] border border-white/10 shadow-md">
              <ShieldCheck className="w-4 h-4 text-[#ADFF2F]" />
           </div>
        </div>

        <div className="space-y-2">
           <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-3xl font-black text-white tracking-tight leading-none">{MOCK_USER.name}</h1>
              </div>
              <p className="text-sm font-bold text-zinc-500 font-mono tracking-wide">@{MOCK_USER.username}</p>
           </div>
           <div className="flex flex-wrap gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {MOCK_USER.location}</span>
              <span className="flex items-center gap-1.5"><Building className="w-3 h-3" /> {MOCK_USER.company}</span>
           </div>
        </div>
     </div>

     {/* Right: Stats */}
     <div className="flex gap-3 relative z-10">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-center min-w-[100px] backdrop-blur-sm">
           <div className="text-[9px] font-extrabold text-[#ADFF2F] uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> Aura
           </div>
           <div className="text-3xl font-black text-white leading-none">{MOCK_USER.auraScore}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-center min-w-[90px] backdrop-blur-sm">
           <div className="text-[9px] font-extrabold text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Code2 className="w-3 h-3" /> Proj
           </div>
           <div className="text-2xl font-black text-white leading-none">8</div>
        </div>
     </div>
  </div>
);

// 2. The Content Area (Mirrors Profile Page Tabs/Grid)
const ProfileContent = () => (
  <div className="grid grid-cols-12 gap-6 mt-6">
      {/* Main Column */}
      <div className="col-span-8 space-y-6">
         {/* Bio */}
         <div className="bg-[#0A0A0A]/50 backdrop-blur-md rounded-lg p-6 border border-white/5">
            <h3 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">About</h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
               {MOCK_USER.bio}
            </p>
         </div>

         {/* Verified Stack */}
         <div className="bg-[#0A0A0A]/50 backdrop-blur-md rounded-lg p-6 border border-white/5">
             <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                <h3 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                   <Terminal className="w-3 h-3" /> Verified Stack
                </h3>
             </div>
             <div className="flex flex-wrap gap-2">
                {MOCK_SKILLS.map((skill, i) => (
                   <div key={i} className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-white/5 border border-white/5 rounded-md">
                      <span className="text-[10px] font-extrabold text-zinc-300">{skill.name}</span>
                      <span className="bg-[#ADFF2F]/10 border border-[#ADFF2F]/20 px-1 py-0.5 rounded-sm flex items-center">
                         <CheckCircle2 className="w-2.5 h-2.5 text-[#ADFF2F]" />
                      </span>
                   </div>
                ))}
             </div>
         </div>
      </div>

      {/* Sidebar Column */}
      <div className="col-span-4 space-y-6">
         <div className="bg-[#0A0A0A]/50 backdrop-blur-md rounded-lg p-5 border border-white/5">
             <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <h3 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                   <Sparkles className="w-3 h-3 text-amber-500" /> Pulse
                </h3>
             </div>
             
             <div className="space-y-3">
                {Object.entries(MOCK_BREAKDOWN).map(([key, value]) => {
                   // const total = 1000;  <-- removed unused var 
                   const percentage = (value / 500) * 100; // Mock math
                   return (
                      <div key={key}>
                         <div className="flex justify-between items-end mb-1">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{key}</span>
                            <span className="text-[9px] font-extrabold text-zinc-300">{value}</span>
                         </div>
                         <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${key === 'profile' ? 'bg-[#ADFF2F]' : 'bg-blue-400'}`} style={{ width: `${percentage}%` }} />
                         </div>
                      </div>
                   )
                })}
             </div>
             
             <div className="mt-4 pt-3 flex justify-between items-center bg-white/[0.02] p-2 rounded border border-white/5">
                <div className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Velocity</div>
                <div className="flex items-center gap-1 text-[#ADFF2F] font-black text-[10px]">
                   <TrendingUp className="w-3 h-3" /> +12%
                </div>
             </div>
         </div>
      </div>
  </div>
);


// 3. The Main Showcase Container
export default function ProfileShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Smooth Scroll Animations
  const rotateX = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [15, 0, -10]);
  const scale = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0.9, 1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const springConfig = { stiffness: 60, damping: 20 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springScale = useSpring(scale, springConfig);

  // Mouse Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    mouseX.set(x * 5); 
    mouseY.set(y * -5);
  }


  const parallaxRotateY = useSpring(mouseX, springConfig);

  return (
    <section 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className={`relative w-full min-h-[140vh] bg-[#050505] flex flex-col items-center justify-center overflow-hidden py-32 perspective-[2000px] ${inter.variable} ${mono.variable}`}
    >
        {/* Cinematic Spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.07] via-transparent to-transparent opacity-60 pointer-events-none" />
        
        {/* Dynamic Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* Text Header */}
        <div className="relative z-20 text-center mb-24 max-w-4xl px-4">
             <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 backdrop-blur-md"
            >
                <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] shadow-[0_0_10px_#ADFF2F]" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">V2.0 Engine Output</span>
            </motion.div>
            
            <motion.h2 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-6 leading-[0.9]"
            >
                Your <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ADFF2F] to-emerald-600">Command Center</span>.
            </motion.h2>

            <p className="text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed">
                A single implementation of your identity. <br/>
                No fluff. Just verified, cryptographically proven skills.
            </p>
        </div>

        {/* 3D PROFILE WINDOW */}
        <div className="relative w-full max-w-[1000px] px-4">
            
            <motion.div 
                style={{ 
                    rotateX: springRotateX, 
                    rotateY: parallaxRotateY,
                    scale: springScale,
                    y,
                    opacity,
                    transformStyle: "preserve-3d",
                }}
                className="relative z-30"
            >
                {/* Browser Window Chrome */}
                <div className="relative rounded-2xl bg-[#0F0F10] border border-white/5 shadow-2xl overflow-hidden">
                    
                     {/* Window Header */}
                    <div className="h-10 bg-[#0A0A0A] border-b border-white/5 flex items-center px-4 justify-between">
                        <div className="flex gap-2">
                             <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                             <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                             <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.02] border border-white/[0.05]">
                            <ShieldCheck className="w-3 h-3 text-[#ADFF2F]" />
                            <span className="text-[10px] font-mono text-zinc-500">verifydev.me/u/keshav-sudo</span>
                        </div>
                        <div className="w-10" />
                    </div>

                    {/* Window Content - THE PROFILE */}
                    <div className="bg-[#050505] p-6 md:p-8 min-h-[600px] relative">
                         {/* Grid Background inside the window */}
                         <div className="absolute inset-0 z-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />
                         
                         <div className="relative z-10 max-w-4xl mx-auto">
                             <CommandCenterHero />
                             
                             {/* Tabs Simulation */}
                             <div className="flex items-center border-b border-white/10 mt-8 mb-6 overflow-hidden">
                                 {['Overview', 'Skills', 'Projects'].map((tab, i) => (
                                     <div key={tab} className={`px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest border-b-2 ${i === 0 ? 'border-[#ADFF2F] text-white' : 'border-transparent text-zinc-600'}`}>
                                         {tab}
                                     </div>
                                 ))}
                             </div>

                             <ProfileContent />
                         </div>
                    </div>
                    
                </div>
            </motion.div>

            {/* Subtle Reflection */}
            <motion.div 
               style={{ scaleX: 0.9, opacity: 0.3 }}
               className="absolute -bottom-10 left-[5%] right-[5%] h-10 bg-gradient-to-b from-[#ADFF2F]/20 to-transparent blur-xl pointer-events-none rounded-[100%]" 
            />
        </div>
    </section>
  );
}
