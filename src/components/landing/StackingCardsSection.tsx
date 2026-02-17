import React from 'react';
import ScrollStack, { ScrollStackItem } from '../ScrollStack';
import { motion } from 'framer-motion';

const features = [
  { title: "AI-Powered Analysis", description: "Our advanced algorithms parse your code structure instantly.", color: "bg-[#111]", icon: "🤖" },
  { title: "Verified Credentials", description: "Earn cryptographic proof of your skills. No more vague claims.", color: "bg-[#0a0a0a]", icon: "🛡️" },
  { title: "Global Leaderboard", description: "Compete with developers worldwide. Rank up by proving capabilities.", color: "bg-[#111]", icon: "🌍" },
  { title: "Instant Hiring", description: "Companies trust VerifyDev scores. Skip the whiteboard and get hired.", color: "bg-[#0a0a0a]", icon: "🚀" }
];

export default function StackingCardsSection() {
  return (
    <div className="w-full relative z-30 bg-[#050505] overflow-hidden">
      {/* Background Gradient for depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="py-24 text-center relative z-10">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="inline-block mb-4"
        >
             <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-zinc-400 font-medium backdrop-blur-sm">
                The Protocol
             </span>
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-7xl font-black text-white tracking-tighter"
        >
          Why <span className="text-[#ADFF2F] inline-block relative">
              VerifyDev?
              <svg className="absolute w-full h-3 bottom-0 left-0 text-[#ADFF2F]/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
          </span>
        </motion.h2>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10"> 
        <ScrollStack 
            useWindowScroll={true}
            itemDistance={100}
            itemStackDistance={30}
            itemScale={0.03}
            blurAmount={4}
        >
          {features.map((feature, index) => (
             /* Simplify Item wrapper as styles are now in CSS class */
            <ScrollStackItem key={index} itemClassName="w-full">
              <div className={`
                  w-full h-full
                  ${feature.color} 
                  rounded-[40px] 
                  border border-white/10 
                  flex flex-col justify-between 
                  relative overflow-hidden 
                  group hover:border-white/20 transition-colors duration-500
              `}>
                
                {/* Card Background Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-start gap-8 p-8 md:p-16 h-full justify-between">
                  <div className="h-20 w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-5xl shadow-inner backdrop-blur-md">
                     {feature.icon}
                  </div>
                  <div>
                      <h3 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">{feature.title}</h3>
                      <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-xl leading-relaxed">{feature.description}</p>
                  </div>
                </div>

                <div className="absolute bottom-[-40px] right-[-20px] text-[300px] font-black opacity-[0.02] text-white pointer-events-none select-none leading-none tracking-tighter group-hover:opacity-[0.04] transition-opacity duration-700">
                  {index + 1}
                </div>
              </div>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </div>
    </div>
  );
}