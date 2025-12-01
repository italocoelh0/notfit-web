
import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-24 h-24 text-4xl',
  '2xl': 'w-32 h-32 text-5xl',
};

const Avatar: React.FC<AvatarProps> = ({ src, alt = 'User', className = '', size = 'md' }) => {
  const [error, setError] = useState(false);

  const hasValidImage = src && src.startsWith('http') && !error;

  return (
    <div 
      className={`rounded-full bg-surface-200 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 text-gray-400 ${sizeClasses[size]} ${className}`}
    >
      {hasValidImage ? (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <i className="fa-solid fa-user"></i>
      )}
    </div>
  );
};

export default Avatar;
