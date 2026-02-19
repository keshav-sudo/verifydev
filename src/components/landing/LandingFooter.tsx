'use client';

import React from 'react';

export default function LandingFooter() {
  return (
    <section className="relative w-full bg-[#050505] text-white py-40 z-20 flex justify-center overflow-hidden">
        <div className="text-center">
        <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-8">Ready to <span className="text-[#ADFF2F]">Verify?</span></h2>
        <button className="bg-white text-black px-10 py-5 rounded-full text-lg font-bold hover:bg-[#ADFF2F] transition-all shadow-xl">
            Create Your Profile
        </button>
        </div>
    </section>
  );
}
