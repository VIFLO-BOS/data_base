'use client';

/**
 * Auth Layout
 * Premium split-screen layout for login, register, forgot/reset password pages.
 * Left panel: branding + gradient. Right panel: form content.
 */
import React, { useState, useEffect } from 'react';
import { authSlides as slides } from '../../constants/mock-data';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 500); // 500ms fade out before changing content
    }, 15000); // 5 seconds interval

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(0,0,0),rgba(0,0,0,0.4)),url('https://i.pinimg.com/736x/42/4e/28/424e28ed488931edc8be9104645341de.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 backdrop-blur-sm rounded-xl flex items-center justify-center ring-1 ring-blue/20">
              <span className="font-bold text-white text-xl">P</span>
            </div>
            <span className="text-white text-xl font-semibold tracking-tight">Paylio</span>
          </div>

          {/* Sliding Content */}
          <div
            className={`flex flex-col flex-1 justify-center transition-all duration-500 transform ${
                isTransitioning ? 'opacity-0 -translate-x-8' : 'opacity-100 translate-x-0'
              }`}
            >
              {/* Center tagline */}
              <div className="space-y-4 max-w-lg mt-12">
                <h1 className="text-white text-4xl font-bold leading-tight">
                  {slides[currentSlide].title}
              </h1>
              <p className="text-indigo-200 text-lg leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </div>

            {/* Bottom testimonial */}
            <div className="space-y-3 mt-auto mb-8">
              <p className="text-indigo-100 text-sm leading-relaxed italic">
                &ldquo;{slides[currentSlide].testimonial}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                  {slides[currentSlide].initials}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{slides[currentSlide].author}</p>
                  <p className="text-indigo-300 text-xs">{slides[currentSlide].role}</p>
                </div>
              </div>
            </div>

            {/* Slide Indicators */}
            <div className="flex gap-2 items-center">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'w-6 bg-blue-500' : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
