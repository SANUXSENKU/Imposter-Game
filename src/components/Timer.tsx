import React from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  remaining: number;
  duration: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Timer: React.FC<TimerProps> = ({
  remaining,
  duration,
  label,
  size = 'md'
}) => {
  const safeDuration = duration > 0 ? duration : 1;
  const progress = Math.max(0, Math.min(1, remaining / safeDuration));
  const isUrgent = remaining <= 5 && remaining > 0;

  const colorClass = isUrgent
    ? 'text-red-400 stroke-red-500'
    : remaining <= 10
    ? 'text-amber-400 stroke-amber-500'
    : 'text-purple-400 stroke-purple-500';

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono tabular-nums">
        <Clock className={`w-3.5 h-3.5 ${colorClass}`} />
        <span className={isUrgent ? 'text-red-400 font-bold animate-pulse' : 'text-slate-200'}>
          {remaining}s
        </span>
      </div>
    );
  }

  // Circular gauge for md & lg
  const strokeWidth = size === 'lg' ? 6 : 4;
  const radius = size === 'lg' ? 36 : 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;
  const svgSize = size === 'lg' ? 88 : 60;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: svgSize, height: svgSize }}>
        <svg className="w-full h-full -rotate-90">
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            className="stroke-slate-800/80 fill-transparent"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            className={`fill-transparent transition-all duration-1000 ease-linear ${colorClass}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute font-mono tabular-nums font-bold ${
          size === 'lg' ? 'text-2xl' : 'text-lg'
        } ${isUrgent ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          {remaining}
        </span>
      </div>
      {label && (
        <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider font-mono">
          {label}
        </span>
      )}
    </div>
  );
};
