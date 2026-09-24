import { Link } from '@tanstack/react-router'
import {
  Highlight,
  HighlightItem,
} from '@/components/animate-ui/primitives/effects/highlight'
import { TRANSICION_CONTROL } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
}

type NavHighlightBarProps = {
  items: readonly NavItem[]
  activeTo: string
  layout: 'bottom' | 'top'
}

function NavLinkItem({
  to,
  label,
  icon: Icon,
  active,
  layout,
}: NavItem & { active: boolean; layout: 'bottom' | 'top' }) {
  return (
    <HighlightItem asChild value={to}>
      <Link
        to={to}
        className={cn(
          'relative z-[1] flex min-h-12 min-w-12 items-center justify-center rounded-lg font-medium transition-colors',
          layout === 'bottom'
            ? 'flex-col gap-1 px-3 py-2 text-xs'
            : 'min-h-11 flex-row gap-2 px-4 text-sm',
          active
            ? 'text-primary'
            : 'text-muted-foreground hover:bg-accent/80 hover:text-foreground',
        )}
        aria-current={active ? 'page' : undefined}
      >
        <Icon className="size-5" aria-hidden />
        <span>{label}</span>
      </Link>
    </HighlightItem>
  )
}

export function NavHighlightBar({
  items,
  activeTo,
  layout,
}: NavHighlightBarProps) {
  return (
    <Highlight
      mode="parent"
      value={activeTo}
      click={false}
      hover={false}
      controlledItems
      className="rounded-lg bg-primary/10"
      transition={TRANSICION_CONTROL}
      containerClassName={cn(
        layout === 'bottom'
          ? 'mx-auto flex max-w-6xl items-stretch justify-around px-2 py-1'
          : 'relative mx-auto flex h-16 max-w-6xl items-center justify-center gap-2 px-4',
      )}
    >
      {items.map((item) => (
        <NavLinkItem
          key={item.to}
          {...item}
          active={activeTo === item.to}
          layout={layout}
        />
      ))}
    </Highlight>
  )
}
