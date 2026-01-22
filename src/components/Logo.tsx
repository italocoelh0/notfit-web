
import React from 'react';

// Update interface to extend standard img attributes
interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

// Usando o novo link do Supabase fornecido para substituir o Google Drive
const LOGO_URL = 'https://ckdkpjzswtjhdowapmzu.supabase.co/storage/v1/object/public/logo/582255859_3086579074848471_4873069475124875843_n.png';

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
        console.error('Erro ao carregar logo. Verifique a URL:', src || LOGO_URL);
        // Tenta um fallback se a imagem quebrar, ou esconde
        // e.currentTarget.style.display = 'none'; 
        e.currentTarget.src = 'https://via.placeholder.com/150x50?text=NowFit'; // Fallback temporário
      }}
      {...rest}
    />
  );
};

export default Logo;
