"use client"

import type React from "react"

import { useCallback } from "react"

export function useScrollTo() {
  const scrollToElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }, [])

  const scrollToHash = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
      // Only process if it's a hash link
      if (hash && hash.startsWith("#")) {
        e.preventDefault()
        const id = hash.substring(1)
        scrollToElement(id)

        // Update URL without scrolling
        window.history.pushState(null, "", hash)
      }
    },
    [scrollToElement],
  )

  return { scrollToElement, scrollToTop, scrollToHash }
}
