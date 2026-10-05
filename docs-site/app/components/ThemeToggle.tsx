'use client'

import { useEffect, useState } from 'react'
import { THEME_STORAGE_KEY } from '@/app/lib/themeBoot'

type Preference = 'auto' | 'light' | 'dark'

const NEXT: Record<Preference, Preference> = { auto: 'light', light: 'dark', dark: 'auto' }
const LABEL: Record<Preference, string> = {
  auto: 'Theme: match system',
  light: 'Theme: light',
  dark: 'Theme: dark',
}

function Icon({ preference }: { preference: Preference }) {
  const common = {
    width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true,
  }
  if (preference === 'light') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    )
  }
  if (preference === 'dark') {
    return (
      <svg {...common}>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18" />
      <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
    </svg>
  )
}

export default function ThemeToggle() {
  // null until mounted: the server can't know the stored preference.
  const [preference, setPreference] = useState<Preference | null>(null)

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY)
    } catch {
      // Storage blocked: the toggle still works for this page view.
    }
    setPreference(stored === 'light' || stored === 'dark' ? stored : 'auto')
  }, [])

  function cycle() {
    const next = NEXT[preference ?? 'auto']
    try {
      if (next === 'auto') localStorage.removeItem(THEME_STORAGE_KEY)
      else localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Not remembered across pages; applied below regardless.
    }
    setPreference(next)
    // Set directly rather than via the boot script's reader, which would see
    // "auto" if storage is blocked.
    document.documentElement.dataset.theme =
      next === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : next
  }

  const current = preference ?? 'auto'
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={cycle}
      aria-label={`${LABEL[current]}. Switch to ${LABEL[NEXT[current]].replace('Theme: ', '')}.`}
      title={LABEL[current]}
    >
      <Icon preference={current} />
    </button>
  )
}
