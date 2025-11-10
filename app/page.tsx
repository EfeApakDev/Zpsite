"use client"

import { useState } from "react"
import { DepartmentSelector } from "@/components/department-selector"
import { ImageEditor } from "@/components/image-editor"
import { SettingsPanel } from "@/components/settings-panel"
import { Settings, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/use-theme"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { toast } = useToast()

  const handleThemeToggle = () => {
    toggleTheme()
    toast({
      title: "Başarılı",
      description: `${theme === "dark" ? "Açık" : "Koyu"} tema aktif edildi.`,
    })
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-center mb-2">
            <a
              href="https://instagram.com/zpgenclikdenizli"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-primary hover:underline"
            >
              instagram.com/zpgenclikdenizli
            </a>
          </div>
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-base sm:text-xl md:text-2xl font-bold text-foreground">
              Zafer Partisi Sosyal Medya Editörü
            </h1>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={handleThemeToggle}
                className="shrink-0 bg-transparent"
                title={theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
              <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)} className="shrink-0">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {showSettings ? (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        ) : !selectedDepartment ? (
          <DepartmentSelector onSelect={setSelectedDepartment} />
        ) : (
          <ImageEditor department={selectedDepartment} onBack={() => setSelectedDepartment(null)} />
        )}
      </div>
    </main>
  )
}
