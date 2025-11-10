"use client"

import { useState, useEffect } from "react"

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTheme()
  }, [])

  const loadTheme = () => {
    // Load theme from localStorage (personal preference)
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const preferredTheme = savedTheme || "dark"

    setTheme(preferredTheme)
    document.documentElement.classList.toggle("dark", preferredTheme === "dark")
    setLoading(false)
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"

    // Save to localStorage (personal preference, no password needed)
    localStorage.setItem("theme", newTheme)

    setTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return {
    theme,
    toggleTheme,
    loading,
  }
}
