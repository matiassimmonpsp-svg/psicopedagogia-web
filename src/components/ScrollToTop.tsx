'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/** Scroll to top on every route change */
export function ScrollToTop() {
  const pathname = usePathname()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
