import React from 'react';

export interface AvatarOption {
  id: string;
  name: string;
  codename: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  svgIcon: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'avatar-1',
    name: 'Phantom',
    codename: 'Cipher',
    bgGradient: 'from-violet-600 to-indigo-900',
    borderColor: 'border-violet-500',
    glowColor: 'shadow-violet-500/30',
    svgIcon: 'eye'
  },
  {
    id: 'avatar-2',
    name: 'Valkyrie',
    codename: 'Apex',
    bgGradient: 'from-cyan-500 to-blue-900',
    borderColor: 'border-cyan-400',
    glowColor: 'shadow-cyan-400/30',
    svgIcon: 'shield'
  },
  {
    id: 'avatar-3',
    name: 'Spectre',
    codename: 'Ghost',
    bgGradient: 'from-fuchsia-600 to-purple-950',
    borderColor: 'border-fuchsia-400',
    glowColor: 'shadow-fuchsia-500/30',
    svgIcon: 'mask'
  },
  {
    id: 'avatar-4',
    name: 'Raven',
    codename: 'Nox',
    bgGradient: 'from-emerald-500 to-teal-950',
    borderColor: 'border-emerald-400',
    glowColor: 'shadow-emerald-500/30',
    svgIcon: 'feather'
  },
  {
    id: 'avatar-5',
    name: 'Solace',
    codename: 'Solar',
    bgGradient: 'from-amber-500 to-orange-950',
    borderColor: 'border-amber-400',
    glowColor: 'shadow-amber-500/30',
    svgIcon: 'sun'
  },
  {
    id: 'avatar-6',
    name: 'Oracle',
    codename: 'Synapse',
    bgGradient: 'from-blue-600 to-slate-900',
    borderColor: 'border-blue-400',
    glowColor: 'shadow-blue-500/30',
    svgIcon: 'cpu'
  },
  {
    id: 'avatar-7',
    name: 'Ronin',
    codename: 'Blade',
    bgGradient: 'from-rose-600 to-red-950',
    borderColor: 'border-rose-400',
    glowColor: 'shadow-rose-500/30',
    svgIcon: 'sword'
  },
  {
    id: 'avatar-8',
    name: 'Nova',
    codename: 'Strobe',
    bgGradient: 'from-purple-500 to-pink-900',
    borderColor: 'border-purple-400',
    glowColor: 'shadow-purple-500/30',
    svgIcon: 'zap'
  }
];

interface AvatarProps {
  avatarId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCodename?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  avatarId,
  size = 'md',
  className = ''
}) => {
  const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS[0];

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl'
  };

  // Avatar 1 uses generated high quality operative artwork
  if (avatar.id === 'avatar-1') {
    return (
      <div className={`relative rounded-xl overflow-hidden shrink-0 border ${avatar.borderColor} ${sizeClasses[size]} ${className} shadow-sm`}>
        <img
          src="/src/assets/images/avatar_mystery_agent_1793283793275.jpg"
          alt={avatar.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Other avatars render stylized graphic badges
  return (
    <div
      className={`relative rounded-xl bg-gradient-to-br ${avatar.bgGradient} border ${avatar.borderColor} flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${sizeClasses[size]} ${className}`}
    >
      <span className="tracking-tight uppercase">
        {avatar.name.slice(0, 2)}
      </span>
      <div className="absolute inset-0 bg-white/5 pointer-events-none rounded-xl" />
    </div>
  );
};
