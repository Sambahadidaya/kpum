'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { getActiveTimelineStage } from '@/utils/timelineUtils';

export default function HeroTimelineProgress() {
  const [stage, setStage] = useState(() => getActiveTimelineStage());

  useEffect(() => {
    setStage(getActiveTimelineStage());
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Tahapan Berjalan</span>
        </span>
        <span
          className="text-blue-950 dark:text-zinc-100 font-bold truncate max-w-[200px]"
          title={stage.title}
        >
          {stage.title}
        </span>
      </div>
      <div className="w-full bg-blue-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-blue-700 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-700 shadow-xs"
          style={{ width: `${stage.progressPercent}%` }}
        />
      </div>
    </div>
  );
}
