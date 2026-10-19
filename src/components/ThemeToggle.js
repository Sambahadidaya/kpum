'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center ${className}`}>
        <span className="w-3.5 h-3.5 rounded-full bg-zinc-300 dark:bg-zinc-700 animate-pulse" />
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle Theme Mode"
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 border cursor-pointer ${
        isDark
          ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700'
          : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300'
      } shadow-xs ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-zinc-200 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-zinc-800 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
