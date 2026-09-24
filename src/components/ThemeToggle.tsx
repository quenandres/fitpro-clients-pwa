import { Moon, Sun } from 'lucide-react'
import { ThemeToggler } from '@/components/animate-ui/primitives/effects/theme-toggler'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/providers/theme-provider'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <ThemeToggler
      theme={theme}
      resolvedTheme={resolvedTheme}
      setTheme={setTheme}
      direction="ltr"
      classMode="dark-class"
    >
      {({ toggleTheme, resolved }) => {
        const isDark = resolved === 'dark'
        return (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0 bg-background/95 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80"
            aria-label={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}
            onClick={() => toggleTheme(isDark ? 'light' : 'dark')}
          >
            {isDark ? (
              <Sun className="size-5" aria-hidden />
            ) : (
              <Moon className="size-5" aria-hidden />
            )}
          </Button>
        )
      }}
    </ThemeToggler>
  )
}
