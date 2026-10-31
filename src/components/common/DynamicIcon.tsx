import React from 'react';
import {
  Sparkles,
  Tv,
  Bot,
  GraduationCap,
  Cpu,
  SquarePlay,
  PlayCircle,
  ShieldCheck,
  Zap,
  Key,
  CreditCard,
  Headphones,
  Music,
  Cloud,
  FileText,
  Lock,
  Package,
  Layers,
  Settings,
  Flame,
  BookOpen,
  Code,
  Shield,
  Smartphone,
  Globe,
  Radio,
  Video,
  Monitor,
  Heart,
  HelpCircle,
  LucideIcon
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Youtube: SquarePlay,
  PlaySquare: SquarePlay,
  SquarePlay,
  PlayCircle,
  Tv,
  Bot,
  GraduationCap,
  Cpu,
  ShieldCheck,
  Zap,
  Key,
  CreditCard,
  Headphones,
  Music,
  Cloud,
  FileText,
  Lock,
  Package,
  Layers,
  Settings,
  Flame,
  BookOpen,
  Code,
  Shield,
  Smartphone,
  Globe,
  Radio,
  Video,
  Monitor,
  Heart,
  HelpCircle,
};

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  className = 'w-5 h-5',
  size = 20,
  strokeWidth = 1.5,
}) => {
  const normalized = name ? name.trim() : 'Sparkles';
  const IconComponent =
    ICON_MAP[normalized] ||
    ICON_MAP[normalized.charAt(0).toUpperCase() + normalized.slice(1)] ||
    Sparkles;

  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
};
