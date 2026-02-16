'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import panda from "../data/panda.png";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
});

const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
});

const skills = [
  { name: 'TypeScript', pct: 95, color: '#3178C6' },
  { name: 'React', pct: 88, color: '#61DAFB' },
  { name: 'Go', pct: 82, color: '#00ADD8' },
  { name: 'Docker', pct: 65, color: '#2496ED' },
];

const steps = [
  { icon: '📥', label: 'Add', sub: 'GitHub repos' },
  { icon: '🧠', label: 'Analyze', sub: '400+ techs' },
  { icon: '⚡', label: 'Score', sub: 'Aura engine' },
  { icon: '🎯', label: 'Match', sub: '342 jobs' },
];

export default function Landing() {
  return (
    <div className="h-screen w-full bg-[#050505] font-sans flex flex-col overflow-hidden relative selection:bg-[#ADFF2F] selection:text-black">

      {/* SUBTLE GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* AMBIENT GLOW */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#ADFF2F]/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] bg-[#ADFF2F]/[0.02] rounded-full blur-[100px] pointer-events-none" />

      {/* NAVBAR */}
      <nav className="relative z-50 px-6 md:px-12 lg:px-16 flex items-center justify-between h-[68px] border-b border-white/[0.06]">
        <Link href="/" className="text-xl font-black text-white tracking-tight">
          Verify<span className="text-[#ADFF2F]">Dev</span>
        </Link>
        <div className="flex gap-8 items-center">
          <Link href="/login" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors duration-200">
            Sign In
          </Link>
          <Link
            href="/get-started"
            className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#ADFF2F] transition-all duration-300 hover:shadow-[0_0_24px_rgba(173,255,47,0.3)]"
          >
            Get Started →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative z-10 flex-1 grid lg:grid-cols-[1fr_1.15fr] gap-0">

        {/* LEFT COLUMN */}
        <div className="flex flex-col justify-center px-6 lg:px-16 relative z-30">

          <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] w-fit mb-7">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] animate-pulse" />
            <span className="text-zinc-400 text-xs font-medium tracking-wide">The Developer Credit Score</span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.15)}
            className="text-[48px] md:text-[64px] lg:text-[76px] xl:text-[100px] font-josefin font-black leading-[0.92] text-white tracking-[-0.04em]"
          >
            Stop<br />Claiming.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ADFF2F] via-[#c8ff60] to-[#ADFF2F]">
              Start Proving.
            </span>
          </motion.h1>
          <motion.div {...fadeUp(0.35)} className="mt-7 flex items-center gap-5">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="bg-[#ADFF2F] rounded-full px-7 py-3.5 font-semibold text-black text-[15px] hover:shadow-[0_0_32px_rgba(173,255,47,0.4)] transition-all duration-300"
            >
              Start Verification →
            </motion.button>
            <p className="text-zinc-600 text-xs font-medium">3 min setup · Free</p>
          </motion.div>


        </div>

        {/* RIGHT COLUMN */}
        <div className="relative h-full w-full overflow-hidden lg:rounded-tl-[48px]">

          {/* GREEN BG */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#ADFF2F] via-[#b8ff47] to-[#9beb00]" />
          <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_center,#000_1.5px,transparent_1.5px)] bg-[size:24px_24px]" />

          {/* PANDA (z-index: 20) */}
          <motion.div
            {...scaleIn(0.3)}
            className="absolute inset-x-0 bottom-0 h-[72%] z-20 pointer-events-none"
          >
            <Image
              src={panda}
              alt="VerifyDev AI Panda"
              fill
              priority
              draggable={false}
              className="object-contain object-bottom scale-[1.55] origin-bottom drop-shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
            />
          </motion.div>

          {/* FLOATING AURA SCORE CARD (z-index: 30 - Now floats ABOVE Panda) */}
          <motion.div
            initial={{ opacity: 0, x: 20, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[10%] right-[20%] z-30 bg-black/80 backdrop-blur-2xl rounded-2xl p-4 w-[170px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Aura Score</span>
              <span className="text-[8px] font-bold text-[#ADFF2F] bg-[#ADFF2F]/10 px-1.5 py-0.5 rounded-full">STRONG</span>
            </div>
            <div className="text-[28px] font-black text-white leading-none">892</div>
            <div className="text-[10px] text-zinc-600 mt-0.5 mb-2.5">out of 1,000</div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '89%' }}
                transition={{ delay: 0.9, duration: 1.2, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#ADFF2F] to-[#7dcc16] rounded-full"
              />
            </div>
          </motion.div>

          {/* FLOATING SKILLS CARD (z-index: 30 - Now floats ABOVE Panda) */}
          <motion.div
            initial={{ opacity: 0, x: -20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[30%] left-[8%] z-30 bg-black/80 backdrop-blur-2xl rounded-2xl p-3.5 w-[185px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Verified Stack</span>
            <div className="mt-2.5 space-y-2">
              {skills.map((s, i) => (
                <div key={s.name}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[11px] font-semibold text-white">{s.name}</span>
                    <span className="text-[10px] font-bold text-zinc-400">{s.pct}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ delay: 1.0 + i * 0.1, duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* BOTTOM DASHBOARD STRIP (z-index: 40 - Now floats ABOVE Panda) */}
          <div className="absolute bottom-[25%] left-0 right-0 z-[100]">
            <div className="bg-white/[0.97] backdrop-blur-xl border-t border-gray-200/50 px-4 lg:px-5 py-3 lg:py-3.5">

              {/* Pipeline steps */}
              <div className="flex items-center gap-1 mb-2.5">
                {steps.map((step, i) => (
                  <React.Fragment key={step.label}>
                    <motion.div
                      {...scaleIn(1.0 + i * 0.12)}
                      className="flex items-center gap-1.5 bg-gray-50/80 hover:bg-gray-100 border border-gray-200/80 rounded-lg px-2.5 py-1.5 transition-all duration-200 flex-1 cursor-default"
                    >
                      <span className="text-sm leading-none">{step.icon}</span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-900 leading-none">{step.label}</p>
                        <p className="text-[8px] text-gray-400 font-medium leading-none mt-0.5">{step.sub}</p>
                      </div>
                    </motion.div>
                    {i < steps.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: 1.2 + i * 0.12 }}
                        className="text-gray-400 text-[10px] flex-shrink-0 mx-0.5"
                      >
                        →
                      </motion.div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Terminal bar */}
              <motion.div
                {...fadeUp(1.6)}
                className="bg-[#0a0a0a] rounded-xl px-4 py-2 flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] shadow-[0_0_6px_#ADFF2F]"
                  />
                  <code className="text-[10px] font-mono">
                    <span className="text-[#ADFF2F]">verifydev</span>
                    <span className="text-zinc-700"> ~ </span>
                    <span className="text-zinc-500">analyzing 47 repos...</span>
                    <span className="text-white font-medium"> 100% organic ✓</span>
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {['from-blue-500 to-blue-600', 'from-red-500 to-red-600', 'from-purple-500 to-purple-600'].map((g, i) => (
                      <div key={i} className={`w-4 h-4 rounded-full bg-gradient-to-br ${g} border-[1.5px] border-[#0a0a0a]`} />
                    ))}
                  </div>
                  <span className="text-zinc-500 text-[10px] font-semibold hidden sm:block">342 jobs</span>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}