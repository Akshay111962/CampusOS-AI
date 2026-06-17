import React from 'react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  glow?: boolean;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  glow = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95';
  
  let variantStyles = '';
  
  if (variant === 'primary') {
    variantStyles = `
      bg-gradient-to-r from-accent-indigo to-accent-cyan
      text-text-primary
      hover:brightness-110
      ${glow ? 'shadow-[0_0_20px_-3px_rgba(99,102,241,0.55)] hover:shadow-[0_0_25px_-1px_rgba(34,211,238,0.7)]' : ''}
      px-6 py-3
    `;
  } else if (variant === 'secondary') {
    variantStyles = `
      border border-accent-indigo/40
      bg-surface-glass/40
      hover:bg-accent-indigo/10
      hover:border-accent-cyan/60
      text-text-primary
      px-5 py-2.5
    `;
  } else {
    variantStyles = `
      text-text-secondary
      hover:text-text-primary
      hover:bg-white/5
      px-4 py-2
    `;
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};

export default GradientButton;
