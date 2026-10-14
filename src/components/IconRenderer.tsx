import React from 'react';
import {
  Sunrise,
  Brain,
  Coffee,
  FileVideo,
  Utensils,
  Camera,
  Heart,
  TrendingUp,
  Activity,
  BookOpen,
  MoonStar,
  CheckSquare,
  Moon,
  Clock,
  Sparkles,
  Flame,
  Award,
  Leaf,
  Calendar,
  Settings,
  Bell,
  Check,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Sunrise,
  Brain,
  Coffee,
  FileVideo,
  Utensils,
  Camera,
  Heart,
  TrendingUp,
  Activity,
  BookOpen,
  MoonStar,
  CheckSquare,
  Moon,
  Clock,
  Sparkles,
  Flame,
  Award,
  Leaf,
  Calendar,
  Settings,
  Bell,
  Check,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
};

interface Props extends LucideProps {
  name: string;
}

export const IconRenderer: React.FC<Props> = ({ name, ...props }) => {
  const Component = ICON_MAP[name] || Clock;
  return <Component {...props} />;
};
