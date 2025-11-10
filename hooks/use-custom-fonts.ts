"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export interface CustomFont {
  name: string
  data?: string
  isDefault?: boolean
}

export function useCustomFonts() {
  const [fonts, setFonts] = useState<CustomFont[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadFonts()

    // Subscribe to real-time changes
    const channel = supabase
      .channel("fonts_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "app_settings",
          filter: "setting_key=eq.fonts",
        },
        () => {
          loadFonts()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadFonts = async () => {
    const { data, error } = await supabase
      .from("app_settings")
      .select("setting_value")
      .eq("setting_key", "fonts")
      .single()

    if (!error && data) {
      const loadedFonts = data.setting_value as CustomFont[]
      setFonts(loadedFonts)

      // Load custom fonts into document
      loadedFonts.forEach((font: CustomFont) => {
        if (font.data) {
          const fontFace = new FontFace(font.name, `url(${font.data})`)
          fontFace.load().then((loadedFont) => {
            document.fonts.add(loadedFont)
          })
        }
      })
    }
    setLoading(false)
  }

  const saveFonts = async (updatedFonts: CustomFont[], password: string) => {
    if (password !== "efeapak") {
      throw new Error("Yanlış şifre!")
    }

    const { error } = await supabase
      .from("app_settings")
      .update({
        setting_value: updatedFonts,
        updated_at: new Date().toISOString(),
      })
      .eq("setting_key", "fonts")

    if (error) throw error
    setFonts(updatedFonts)
  }

  const addFont = async (name: string, data: string, password: string) => {
    const newFont: CustomFont = { name, data }
    const fontFace = new FontFace(name, `url(${data})`)
    await fontFace.load().then((loadedFont) => {
      document.fonts.add(loadedFont)
    })
    await saveFonts([...fonts, newFont], password)
  }

  const deleteFont = async (name: string, password: string) => {
    const updatedFonts = fonts.filter((f) => f.name !== name)
    await saveFonts(updatedFonts, password)
  }

  const addDefaultFont = async (name: string, password: string) => {
    const newFont: CustomFont = { name, isDefault: true }
    await saveFonts([...fonts, newFont], password)
  }

  return {
    fonts,
    addFont,
    deleteFont,
    addDefaultFont,
    loading,
  }
}
