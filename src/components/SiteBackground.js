export default function SiteBackground() {
  return (
    <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden transition-opacity duration-300" aria-hidden="true">
      {/* Grid Pattern Bintik-Bintik KPU Resmi */}
      <div
        className="absolute inset-0 opacity-[0.14] dark:opacity-[0.14] text-blue-900 dark:text-blue-400 transition-opacity"
        style={{
          backgroundImage: `radial-gradient(circle at 1.5px 1.5px, currentColor 1.2px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
      {/* Ambient Gradient Halus di Sudut Latar */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 dark:bg-blue-950/20 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-3xl -z-10 pointer-events-none" />
    </div>
  );
}
