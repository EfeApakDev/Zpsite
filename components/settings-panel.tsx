"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus, Trash2, Upload, Lock } from "lucide-react"
import { useDepartments } from "@/hooks/use-departments"
import { useCustomFonts } from "@/hooks/use-custom-fonts"
import { useToast } from "@/hooks/use-toast"

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { departments, addDepartment, deleteDepartment } = useDepartments()
  const { fonts, addFont, deleteFont, addDefaultFont } = useCustomFonts()
  const { toast } = useToast()
  const [newDeptName, setNewDeptName] = useState("")
  const [newDeptTemplate, setNewDeptTemplate] = useState("")
  const [newDefaultFont, setNewDefaultFont] = useState("")
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const fontInputRef = useRef<HTMLInputElement>(null)

  const handlePasswordSubmit = () => {
    if (password === "efeapak") {
      setIsAuthenticated(true)
      toast({
        title: "Giriş Başarılı",
        description: "Ayarları düzenleyebilirsiniz.",
      })
    } else {
      toast({
        title: "Hata",
        description: "Yanlış şifre!",
        variant: "destructive",
      })
    }
  }

  const handleAddDepartment = async () => {
    if (newDeptName && newDeptTemplate) {
      try {
        await addDepartment(newDeptName, newDeptTemplate, password)
        setNewDeptName("")
        setNewDeptTemplate("")
        toast({
          title: "Başarılı",
          description: "Birim eklendi ve tüm cihazlarda görünür.",
        })
      } catch (error) {
        toast({
          title: "Hata",
          description: (error as Error).message,
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteDepartment = async (id: string) => {
    try {
      await deleteDepartment(id, password)
      toast({
        title: "Başarılı",
        description: "Birim silindi.",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith(".ttf")) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const fontData = event.target?.result as string
        const fontName = file.name.replace(".ttf", "")
        try {
          await addFont(fontName, fontData, password)
          toast({
            title: "Başarılı",
            description: "Font eklendi ve tüm cihazlarda kullanılabilir.",
          })
        } catch (error) {
          toast({
            title: "Hata",
            description: (error as Error).message,
            variant: "destructive",
          })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeleteFont = async (name: string) => {
    try {
      await deleteFont(name, password)
      toast({
        title: "Başarılı",
        description: "Font silindi.",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const handleAddDefaultFont = async () => {
    if (newDefaultFont.trim()) {
      try {
        await addDefaultFont(newDefaultFont.trim(), password)
        setNewDefaultFont("")
        toast({
          title: "Başarılı",
          description: "Varsayılan font eklendi.",
        })
      } catch (error) {
        toast({
          title: "Hata",
          description: (error as Error).message,
          variant: "destructive",
        })
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Ayarlar</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <Lock className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-center text-muted-foreground">Ayarlara erişmek için şifre girin</p>
            <div>
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                placeholder="Şifre girin"
                className="mt-1"
              />
            </div>
            <Button onClick={handlePasswordSubmit} className="w-full">
              Giriş Yap
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Ayarlar</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground text-center bg-card p-3 rounded-lg border border-border">
          ✓ Tüm değişiklikler otomatik olarak kaydedilir ve tüm cihazlarda anında görünür
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-foreground">Birimler</h3>
          <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
            {departments.map((dept) => (
              <div key={dept.id} className="flex items-center gap-2 p-3 border border-border rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm sm:text-base">{dept.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{dept.templateUrl}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteDepartment(dept.id)}
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <div>
              <Label htmlFor="deptName" className="text-xs sm:text-sm">
                Yeni Birim Adı
              </Label>
              <Input
                id="deptName"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="Örn: Gençlik Kolları"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="deptTemplate" className="text-xs sm:text-sm">
                Şablon URL
              </Label>
              <Input
                id="deptTemplate"
                value={newDeptTemplate}
                onChange={(e) => setNewDeptTemplate(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <Button onClick={handleAddDepartment} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Birim Ekle
            </Button>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-foreground">Fontlar</h3>
          <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
            {fonts.map((font) => (
              <div key={font.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <span className="text-xs sm:text-sm font-medium truncate flex-1" style={{ fontFamily: font.name }}>
                  {font.name} {font.isDefault && "(Varsayılan)"}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteFont(font.name)}
                  className="h-6 w-6 sm:h-8 sm:w-8"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-3">
            <div>
              <Label htmlFor="defaultFont" className="text-xs sm:text-sm">
                Varsayılan Font Ekle
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="defaultFont"
                  value={newDefaultFont}
                  onChange={(e) => setNewDefaultFont(e.target.value)}
                  placeholder="Örn: Roboto, Open Sans"
                  className="flex-1"
                />
                <Button onClick={handleAddDefaultFont} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Sistem fontlarını ekleyin (Arial, Helvetica, vb.)</p>
            </div>
          </div>

          <Button onClick={() => fontInputRef.current?.click()} className="w-full" variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Özel Font Yükle (.ttf)
          </Button>
          <input ref={fontInputRef} type="file" accept=".ttf" onChange={handleFontUpload} className="hidden" />
        </Card>
      </div>
    </div>
  )
}
