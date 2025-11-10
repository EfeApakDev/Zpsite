"use server"

import { createClient } from "@/lib/supabase/server"

export async function getSettings(key: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("app_settings").select("setting_value").eq("setting_key", key).single()

  if (error) {
    console.error(`Error fetching ${key}:`, error)
    return null
  }

  return data?.setting_value
}

export async function updateSettings(key: string, value: any, password: string) {
  // Password protection
  if (password !== "efeapak") {
    throw new Error("Yanlış şifre!")
  }

  const supabase = await createClient()

  const { error } = await supabase.from("app_settings").upsert({
    setting_key: key,
    setting_value: value,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error(`Error updating ${key}:`, error)
    throw error
  }

  return true
}

export async function getAllSettings() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("app_settings").select("*")

  if (error) {
    console.error("Error fetching all settings:", error)
    return null
  }

  return data
}
