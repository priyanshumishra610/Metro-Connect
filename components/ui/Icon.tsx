import {
  Activity,
  ArrowRight,
  ArrowUp,
  Award,
  BookOpen,
  Briefcase,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Compass,
  Cpu,
  Database,
  DollarSign,
  Ellipsis,
  Film,
  Flag,
  Gift,
  Hash,
  Heart,
  House,
  Image,
  Link2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Monitor,
  Music,
  PenLine,
  PenTool,
  Send,
  Settings,
  Shield,
  SquarePen,
  Target,
  TrendingUp,
  Trash2,
  TriangleAlert,
  User,
  UserPlus,
  UserX,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

/**
 * One icon library, one place to swap it. Names are kept as the same
 * kebab-case strings the app used with Feather (@expo/vector-icons) before
 * this migration, so every call site changed by exactly one import line —
 * see git history if you ever need the Feather-name mapping for reference.
 * Lucide ships no brand/logo marks (Instagram etc. use a generic stand-in
 * below, same as the app already did before this migration — it never
 * rendered real brand logos either).
 */
const ICONS = {
  'alert-triangle': TriangleAlert,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  activity: Activity,
  award: Award,
  'book-open': BookOpen,
  briefcase: Briefcase,
  camera: Camera,
  check: Check,
  'check-circle': CheckCircle2,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  coffee: Coffee,
  compass: Compass,
  cpu: Cpu,
  database: Database,
  'dollar-sign': DollarSign,
  'edit-2': PenLine,
  'edit-3': SquarePen,
  film: Film,
  flag: Flag,
  gift: Gift,
  hash: Hash,
  heart: Heart,
  home: House,
  image: Image,
  instagram: Camera,
  link: Link2,
  lock: Lock,
  'log-out': LogOut,
  mail: Mail,
  'map-pin': MapPin,
  'message-circle': MessageCircle,
  monitor: Monitor,
  'more-horizontal': Ellipsis,
  music: Music,
  'pen-tool': PenTool,
  send: Send,
  settings: Settings,
  shield: Shield,
  target: Target,
  'trash-2': Trash2,
  'trending-up': TrendingUp,
  user: User,
  'user-plus': UserPlus,
  'user-x': UserX,
  users: Users,
  x: X,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

/** The one icon component screens should use — see ICONS above for the full name set. */
export function Icon({ name, size = 20, color = '#17161A', strokeWidth = 1.75, style }: IconProps) {
  const Component = ICONS[name];
  return <Component size={size} color={color} strokeWidth={strokeWidth} style={style} />;
}
