import React from 'react';
import { Clock } from 'lucide-react';

interface DeadlineBadgeProps {
  hours: number;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({ hours }) => {
  let bgClass = '';
  let dotClass = '';
  let textClass = '';
  let label = '';

  if (hours <= 24) {
    bgClass = 'bg-accent-urgent/10 border-accent-urgent/25';
    dotClass = 'bg-accent-urgent animate-pulse-slow';
    textClass = 'text-accent-urgent';
    label = `Closes in ${hours}h`;
  } else if (hours <= 168) {
    const days = Math.round(hours / 24);
    bgClass = 'bg-accent-amber/10 border-accent-amber/25';
    dotClass = 'bg-accent-amber';
    textClass = 'text-accent-amber';
    label = `${days} days left`;
  } else {
    const days = Math.round(hours / 24);
    bgClass = 'bg-accent-success/10 border-accent-success/25';
    dotClass = 'bg-accent-success';
    textClass = 'text-accent-success';
    label = `${days} days left`;
  }

  return (
    <div
      className={`
        inline-flex
        items-center
        gap-1.5
        px-2.5
        py-1
        rounded-full
        border
        text-xs
        font-medium
        backdrop-blur-sm
        ${bgClass}
        ${textClass}
      `.trim()}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      <Clock className="w-3.5 h-3.5 stroke-[1.5]" />
      <span>{label}</span>
    </div>
  );
};

export default DeadlineBadge;
