import { Sparkles } from 'lucide-react'

export default function LoadingScreen({ visible = true }) {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A0A0B] overflow-hidden transition-opacity duration-700 ease-out ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      role="status"
      aria-label="Loading"
    >
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="loading-orb loading-orb-1" />
        <div className="loading-orb loading-orb-2" />
        <div className="loading-orb loading-orb-3" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo with glow */}
        <div className="loading-logo-wrapper">
          <div className="loading-logo-glow" />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-400/20">
            <Sparkles className="loading-sparkle h-8 w-8 text-blue-400" />
          </div>
        </div>

        {/* Brand + tagline */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="loading-title text-2xl font-semibold tracking-tight text-white">
            VC Scout
          </h1>
          <p className="loading-subtitle text-sm font-medium text-gray-500">
            Discovering opportunities
          </p>
        </div>

        {/* Progress bar */}
        <div className="loading-bar-track">
          <div className="loading-bar-fill" />
        </div>
      </div>

      {/* Decorative dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="loading-dot h-1.5 w-1.5 rounded-full bg-blue-400/60"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
