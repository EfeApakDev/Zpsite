"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export interface Department {
  id: string
  name: string
  templateUrl: string
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadDepartments()

    // Subscribe to real-time changes
    const channel = supabase
      .channel("app_settings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "app_settings",
          filter: "setting_key=eq.departments",
        },
        () => {
          loadDepartments()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadDepartments = async () => {
    const { data, error } = await supabase
      .from("app_settings")
      .select("setting_value")
      .eq("setting_key", "departments")
      .single()

    if (!error && data) {
      setDepartments(data.setting_value as Department[])
    }
    setLoading(false)
  }

  const saveDepartments = async (depts: Department[], password: string) => {
    if (password !== "efeapak") {
      throw new Error("Yanlış şifre!")
    }

    const { error } = await supabase
      .from("app_settings")
      .update({
        setting_value: depts,
        updated_at: new Date().toISOString(),
      })
      .eq("setting_key", "departments")

    if (error) throw error
    setDepartments(depts)
  }

  const addDepartment = async (name: string, templateUrl: string, password: string) => {
    const newDept: Department = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      templateUrl,
    }
    await saveDepartments([...departments, newDept], password)
  }

  const deleteDepartment = async (id: string, password: string) => {
    await saveDepartments(
      departments.filter((d) => d.id !== id),
      password,
    )
  }

  const updateDepartment = async (id: string, updates: Partial<Department>, password: string) => {
    await saveDepartments(
      departments.map((d) => (d.id === id ? { ...d, ...updates } : d)),
      password,
    )
  }

  const getDepartment = (id: string) => {
    return departments.find((d) => d.id === id)
  }

  return {
    departments,
    addDepartment,
    deleteDepartment,
    updateDepartment,
    getDepartment,
    loading,
  }
}
