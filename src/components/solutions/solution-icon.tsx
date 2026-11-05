import {
  Scale, Search, ClipboardList, CalendarClock, LineChart,
  ListChecks, ShieldCheck, Newspaper, MessageSquare, Users, type LucideIcon,
} from 'lucide-react'
import type { SolutionIcon as IconName } from '@/lib/data/solutions-data'

const ICONS: Record<IconName, LucideIcon> = {
  scale: Scale,
  search: Search,
  clipboard: ClipboardList,
  calendar: CalendarClock,
  chart: LineChart,
  list: ListChecks,
  shield: ShieldCheck,
  newspaper: Newspaper,
  message: MessageSquare,
  users: Users,
}

export function SolutionIcon({ name, className }: { name: IconName; className?: string }) {
  const Icon = ICONS[name]
  return <Icon className={className} aria-hidden />
}
