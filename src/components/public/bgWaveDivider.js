export default function BgWaveDivider({
  className = 'text-blue-50/80 dark:text-zinc-950',
  fillColor,
  inverted = false,
  showDotted = true,
}) {
  return (
    <div
      className={`relative z-20 w-full overflow-hidden leading-none pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className={`w-full h-12 sm:h-16 md:h-24 block ${inverted ? 'rotate-180' : ''}`}
      >
        {/* Layer 1: Gelombang Belakang (Subtle Depth Wave) */}
        <path
          d="M0,50 C180,90 360,20 540,55 C720,90 900,30 1080,60 C1260,90 1380,45 1440,55 L1440,120 L0,120 Z"
          fill="currentColor"
          className="opacity-40"
        />

        {/* Layer 2: Gelombang Utama */}
        <path
          d="M0,32 C240,88 480,24 720,68 C960,108 1200,36 1440,48 L1440,120 L0,120 Z"
          fill={fillColor || 'currentColor'}
        />

        {/* Layer 3: Garis Bintik-Bintik Dekoratif Mengikuti Lekukan Gelombang */}
        {showDotted && (
          <path
            d="M0,28 C240,84 480,20 720,64 C960,104 1200,32 1440,44"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="3 7"
            strokeLinecap="round"
            className="text-blue-700 dark:text-blue-400 opacity-60 dark:opacity-50"
          />
        )}
      </svg>
    </div>
  );
}
