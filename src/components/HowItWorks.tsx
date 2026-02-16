import React, { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

const steps = [
  {
    id: "01",
    title: "Deep Ingestion",
    subtitle: "DATA FORENSICS",
    description: "We don't just scrape. We authenticate via GitHub API to forensically analyze 5 years of history, PRs, and architectural decisions.",
    techDetails: ["OAuth 2.0", "Git Meta-Data", "AST Parsing"],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    )
  },
  {
    id: "02",
    title: "Neural Analysis",
    subtitle: "INTELLIGENT PROCESSING",
    description: "Our 7-stage AI pipeline ignores noise. It detects logic patterns, verifies coding style, and flags non-organic contributions.",
    techDetails: ["400+ Patterns", "Anti-Fraud", "Complexity Scoring"],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )
  },
  {
    id: "03",
    title: "The Verdict",
    subtitle: "PROOF OF SKILL",
    description: "Data is distilled into a single Aura Score (0-1000). A cryptographic signal of true capability that places you in the top 1%.",
    techDetails: ["Confidence %", "Role Matching", "Instant Hire Signal"],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

// High-fidelity noise texture
const Noise = () => (
    <div 
      className="absolute inset-0 opacity-[0.05] pointer-events-none z-0 mix-blend-overlay"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
    />
);

const TiltCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useMotionValue(0), { damping: 25, stiffness: 200 });
  const rotateY = useSpring(useMotionValue(0), { damping: 25, stiffness: 200 });

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    
    // Position for spotlight
    mouseX.set(x);
    mouseY.set(y);

    // Rotation calculation
    const rotateXValue = ((y - height / 2) / height) * -10; // Max -10 to 10 deg
    const rotateYValue = ((x - width / 2) / width) * 10;   // Max -10 to 10 deg

    rotateX.set(rotateXValue);
    rotateY.set(rotateYValue);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
    mouseX.set(0); 
    mouseY.set(0); 
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
      }}
      className={`relative h-full transition-shadow duration-500 rounded-3xl ${className}`}
    >
      {/* Moving Border Beam */}
      <div 
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: "conic-gradient(from 0deg at 50% 50%, transparent 0%, rgba(173,255,47,0.3) 10%, transparent 20%)",
          maskImage: "linear-gradient(black, black), linear-gradient(black, black)",
          maskClip: "content-box, border-box",
          padding: "1px",
          maskComposite: "exclude",
        }}
      >
        <div className="absolute inset-0 bg-transparent animate-[spin_4s_linear_infinite]" />
      </div>

      <div className="relative h-full bg-[#050505]/90 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden group">
        <Noise />
        
        {/* Spotlight Gradient */}
        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-500"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                650px circle at ${mouseX}px ${mouseY}px,
                rgba(173, 255, 47, 0.1),
                transparent 80%
              )
            `,
          }}
        />

        {/* 3D Depth Content Container */}
        <div style={{ transform: "translateZ(20px)" }} className="relative z-10 h-full p-8 flex flex-col items-center text-center">
            {children}
        </div>
      </div>
    </motion.div>
  );
};

// ... imports

// ... TiltCard component ...

export default function HowItWorks() {
  return (
    <section className={`relative w-full bg-[#050505] py-32 px-6 overflow-hidden perspective-[1000px] ${inter.variable} ${mono.variable}`}>
       {/* Deep Space Background */}
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/10 via-[#050505] to-[#050505]" />
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#ADFF2F]/[0.02] blur-[150px] rounded-full pointer-events-none" />

       
       <div className="max-w-[1400px] mx-auto relative z-10">
          {/* Section Header */}
          <div className="mb-24 text-center relative">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 backdrop-blur-md shadow-2xl relative z-10"
              >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] shadow-[0_0_10px_#ADFF2F]" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">The Protocol</span>
              </motion.div>
              
              <motion.h2 
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.1, duration: 0.7 }}
                 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter relative z-10 leading-[0.9]"
              >
                 Trust. <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-400 to-zinc-600">Verified.</span>
              </motion.h2>
          </div>

          {/* 3D Holographic Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative px-4 md:px-12">
              
              {/* Connecting Laser Beams (absolute background) */}
              <div className="hidden md:block absolute top-[100px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent z-0" />

              {steps.map((step, i) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                    className="relative z-10 h-full"
                  >
                      <TiltCard>
                          {/* Floating Holo-Badge */}
                          <div className="relative mb-8 group-hover:scale-105 transition-transform duration-500">
                             <div className="w-16 h-16 bg-zinc-900/50 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-[#ADFF2F]/30 transition-colors duration-500 shadow-2xl z-10 relative backdrop-blur-sm">
                                  <div className="text-zinc-500 group-hover:text-[#ADFF2F] transition-colors duration-300">
                                    {step.icon}
                                  </div>
                             </div>
                          </div>

                          {/* Text Content with 3D Depth */}
                          <div className="text-[10px] font-bold text-[#ADFF2F] uppercase tracking-widest mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">{step.subtitle}</div>
                          <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-zinc-100 transition-colors">{step.title}</h3>
                          
                          <p className="text-zinc-500 text-sm leading-relaxed mb-6 max-w-[260px] mx-auto group-hover:text-zinc-400 transition-colors">
                            {step.description}
                          </p>

                          {/* Tech Tags */}
                          <div className="mt-auto flex flex-wrap justify-center gap-1.5">
                             {step.techDetails.map((tech) => (
                                 <span key={tech} className="px-2 py-1 rounded bg-white/[0.02] border border-white/5 text-[9px] text-zinc-600 font-bold uppercase tracking-wider group-hover:border-[#ADFF2F]/20 group-hover:text-[#ADFF2F]/80 transition-colors">
                                    {tech}
                                 </span>
                             ))}
                          </div>
                      </TiltCard>
                  </motion.div>
              ))}
          </div>
       </div>
    </section>
  );
}
