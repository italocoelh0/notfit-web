
import React from 'react';

// Update interface to extend standard img attributes
interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

// Updated URL to a reliable placeholder since the Supabase bucket link is failing
const LOGO_URL = 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=200&auto=format&fit=crop';

const sizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'h-8 w-auto',
  md: 'h-10 w-auto',
  lg: 'h-14 w-auto',
  xl: 'h-20 w-auto',
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  animated = true,
  src, // Permite sobrescrever se necessário
  ...rest // This will now include style, etc.
}) => {
  return (
    <img
      src={src || LOGO_URL}
      alt="NowFit"
      className={[
        sizeClasses[size],
        'object-contain',
        animated ? 'transition-transform duration-300 hover:scale-105' : '',
        className,
      ].join(' ')}
      loading="lazy"
      onError={(e) => {
        // Silencing loud error logs and providing a simple branded fallback
        e.currentTarget.onerror = null; // Prevent infinite loops
        e.currentTarget.src = 'https://via.placeholder.com/200x80?text=NowFit';
      }}
      {...rest}
    />
  );
};

export default Logo;
