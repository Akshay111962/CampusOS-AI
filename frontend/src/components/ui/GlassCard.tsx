import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  aiBorder?: boolean;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  aiBorder = false,
  hoverEffect = true,
  ...props
}) => {
  return (
    <div
      className={`
        glass-card
        ${hoverEffect ? 'glass-card-hover' : ''}
        ${aiBorder ? 'ai-gradient-border' : ''}
        rounded-2xl
        overflow-hidden
        p-6
        transition-all
        duration-300
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
