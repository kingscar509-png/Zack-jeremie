import { useEffect, useState } from 'react'

type Theme = 'auto' | 'light' | 'dark'

const labels: Record<Theme, string> = {
  auto: 'Thème automatique',
  light: 'Thème clair',
  dark: 'Thème sombre',
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('auto')

  useEffect(() => {
    const saved = window.localStorage.getItem('zack-theme')
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      setTheme(saved)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'auto') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
    window.localStorage.setItem('zack-theme', theme)
  }, [theme])

  const cycleTheme = () => {
    setTheme((current) =>
      current === 'auto' ? 'light' : current === 'light' ? 'dark' : 'auto',
    )
  }

  return (
    <button
      className="theme-switcher"
      type="button"
      onClick={cycleTheme}
      aria-label={`Changer le thème. Thème actuel : ${labels[theme]}`}
      title={labels[theme]}
    >
      <span aria-hidden="true">{theme === 'dark' ? '☾' : theme === 'light' ? '☀' : '◐'}</span>
      <span className="theme-label">{theme === 'auto' ? 'Auto' : theme === 'light' ? 'Clair' : 'Sombre'}</span>
    </button>
  )
}
