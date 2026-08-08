import React from 'react';
import clsx from 'clsx';

type AvatarProps = {
  src?: string; // image URL
  alt?: string;
  name?: string; // fallback initials
  size?: number; // pixel size, default 48
  className?: string;
};

export const Avatar = ({ src, alt, name, size = 48, className }: AvatarProps) => {
  const initials = name ? name.split(' ').map(n => n[0]).join('') : '';
  const baseClass = 'rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-medium overflow-hidden';
  const style = { width: size, height: size } as React.CSSProperties;
  return (
    <div className={clsx(baseClass, className)} style={style}>
      {src ? (
        <img src={src} alt={alt || 'avatar'} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
