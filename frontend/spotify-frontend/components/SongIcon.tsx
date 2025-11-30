'use client';
import React from 'react';
import { Moon, Zap, Waves, Building2, TrendingUp, Music, Mountain, Disc3, LucideIcon } from 'lucide-react';

interface SongIconProps {
  index: number;
}

const SongIcon: React.FC<SongIconProps> = ({ index }) => {
  const icons: LucideIcon[] = [Moon, Zap, Waves, Building2, TrendingUp, Music, Mountain, Disc3];
  const Icon = icons[index % icons.length];
  return <Icon size={40} />;
};

export default SongIcon;