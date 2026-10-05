import {
  Banknote, Blocks, BookOpen, Bot, Box, Brain, Bug, Calculator, Calendar, CalendarCheck, CircleCheck, ClipboardList, Cog, Crown,
  DraftingCompass, Flag, FlaskConical, Flame, Footprints, GraduationCap, Hand, IdCard, Landmark, Medal, NotebookPen, Percent, Puzzle,
  Receipt, Repeat, Rocket, School, ScanSearch, Shield, Signpost, Split, Sprout, Sun, Swords, Target, Telescope, ToggleRight, TrainFront,
  Trophy, Zap, type LucideIcon,
} from 'lucide-react';

/**
 * One drawn icon family for the whole product. Content and engine files refer
 * to icons by these keys, never by emoji.
 */
export const ICONS: Record<string, LucideIcon> = {
  // units
  rocket: Rocket,
  box: Box,
  calculator: Calculator,
  split: Split,
  repeat: Repeat,
  puzzle: Puzzle,
  train: TrainFront,
  blocks: Blocks,
  landmark: Landmark,
  // bosses
  signpost: Signpost,
  idcard: IdCard,
  receipt: Receipt,
  clipboard: ClipboardList,
  bot: Bot,
  banknote: Banknote,
  school: School,
  compass: DraftingCompass,
  // games
  flag: Flag,
  telescope: Telescope,
  brain: Brain,
  toggle: ToggleRight,
  // achievements and misc
  hand: Hand,
  footprints: Footprints,
  flame: Flame,
  target: Target,
  cog: Cog,
  bug: Bug,
  search: ScanSearch,
  flask: FlaskConical,
  trophy: Trophy,
  medal: Medal,
  calendar: Calendar,
  'calendar-check': CalendarCheck,
  check: CircleCheck,
  sun: Sun,
  book: BookOpen,
  notebook: NotebookPen,
  sprout: Sprout,
  cap: GraduationCap,
  crown: Crown,
  swords: Swords,
  percent: Percent,
  shield: Shield,
  zap: Zap,
};

export function Icon({ name, size = 20, className, strokeWidth }: { name: string; size?: number; className?: string; strokeWidth?: number }) {
  const C = ICONS[name] ?? Puzzle;
  return <C size={size} className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
