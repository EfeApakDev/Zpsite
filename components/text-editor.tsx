"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCustomFonts } from "@/hooks/use-custom-fonts"
import { Button } from "@/components/ui/button"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface TextElement {
  text: string
  fontSize: number
  color: string
  fontFamily: string
  bold: boolean
  italic: boolean
  underline: boolean
  opacity: number
  rotation: number
  textAlign: "left" | "center" | "right"
  strokeColor: string
  strokeWidth: number
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  letterSpacing: number
  lineHeight: number
  x: number
  y: number
}

interface TextEditorProps {
  text: TextElement
  onUpdate: (updates: Partial<TextElement>) => void
  onDeselect?: () => void
}

export function TextEditor({ text, onUpdate, onDeselect }: TextEditorProps) {
  const { fonts } = useCustomFonts()

  const handleCenterText = () => {
    onUpdate({ x: 540, y: 675 }) // Center of 1080x1350 canvas
  }

  return (
    <div className="space-y-3 mt-3 pt-3 border-t border-border">
      {onDeselect && (
        <Button onClick={onDeselect} variant="default" className="w-full" size="sm">
          Düzenlemeyi Bitir
        </Button>
      )}

      <div>
        <Label htmlFor="text" className="text-xs">
          Metin
        </Label>
        <Textarea
          id="text"
          value={text.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="mt-1 min-h-[80px] resize-y"
          placeholder="Metin girin (Enter ile alt satıra geçin)"
        />
      </div>

      <div>
        <Label className="text-xs mb-2 block">Biçimlendirme</Label>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={text.bold ? "default" : "outline"}
            onClick={() => onUpdate({ bold: !text.bold })}
            className="flex-1"
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant={text.italic ? "default" : "outline"}
            onClick={() => onUpdate({ italic: !text.italic })}
            className="flex-1"
          >
            <Italic className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant={text.underline ? "default" : "outline"}
            onClick={() => onUpdate({ underline: !text.underline })}
            className="flex-1"
          >
            <Underline className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-xs mb-2 block">Hizalama</Label>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={text.textAlign === "left" ? "default" : "outline"}
            onClick={() => onUpdate({ textAlign: "left" })}
            className="flex-1"
          >
            <AlignLeft className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant={text.textAlign === "center" ? "default" : "outline"}
            onClick={() => onUpdate({ textAlign: "center" })}
            className="flex-1"
          >
            <AlignCenter className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant={text.textAlign === "right" ? "default" : "outline"}
            onClick={() => onUpdate({ textAlign: "right" })}
            className="flex-1"
          >
            <AlignRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="fontSize" className="text-xs">
          Boyut: {text.fontSize}px
        </Label>
        <Slider
          id="fontSize"
          min={12}
          max={200}
          step={1}
          value={[text.fontSize]}
          onValueChange={([value]) => onUpdate({ fontSize: value })}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="color" className="text-xs">
          Renk
        </Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="color"
            type="color"
            value={text.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-16 h-9 p-1"
          />
          <Input value={text.color} onChange={(e) => onUpdate({ color: e.target.value })} className="flex-1" />
        </div>
      </div>

      <div>
        <Label htmlFor="opacity" className="text-xs">
          Opaklık: {Math.round(text.opacity * 100)}%
        </Label>
        <Slider
          id="opacity"
          min={0}
          max={1}
          step={0.01}
          value={[text.opacity]}
          onValueChange={([value]) => onUpdate({ opacity: value })}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="rotation" className="text-xs">
          Döndürme: {text.rotation}°
        </Label>
        <Slider
          id="rotation"
          min={-180}
          max={180}
          step={1}
          value={[text.rotation]}
          onValueChange={([value]) => onUpdate({ rotation: value })}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="font" className="text-xs">
          Font
        </Label>
        <Select value={text.fontFamily} onValueChange={(value) => onUpdate({ fontFamily: value })}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fonts.map((font) => (
              <SelectItem key={font.name} value={font.name}>
                {font.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="letterSpacing" className="text-xs">
          Harf Aralığı: {text.letterSpacing}px
        </Label>
        <Slider
          id="letterSpacing"
          min={-10}
          max={50}
          step={1}
          value={[text.letterSpacing]}
          onValueChange={([value]) => onUpdate({ letterSpacing: value })}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-xs mb-2 block">Kontur</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="color"
              value={text.strokeColor}
              onChange={(e) => onUpdate({ strokeColor: e.target.value })}
              className="w-16 h-9 p-1"
            />
            <Input
              value={text.strokeColor}
              onChange={(e) => onUpdate({ strokeColor: e.target.value })}
              className="flex-1"
            />
          </div>
          <div>
            <Label htmlFor="strokeWidth" className="text-xs">
              Kalınlık: {text.strokeWidth}px
            </Label>
            <Slider
              id="strokeWidth"
              min={0}
              max={20}
              step={1}
              value={[text.strokeWidth]}
              onValueChange={([value]) => onUpdate({ strokeWidth: value })}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-xs mb-2 block">Gölge</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="color"
              value={text.shadowColor}
              onChange={(e) => onUpdate({ shadowColor: e.target.value })}
              className="w-16 h-9 p-1"
            />
            <Input
              value={text.shadowColor}
              onChange={(e) => onUpdate({ shadowColor: e.target.value })}
              className="flex-1"
            />
          </div>
          <div>
            <Label htmlFor="shadowBlur" className="text-xs">
              Bulanıklık: {text.shadowBlur}px
            </Label>
            <Slider
              id="shadowBlur"
              min={0}
              max={50}
              step={1}
              value={[text.shadowBlur]}
              onValueChange={([value]) => onUpdate({ shadowBlur: value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="shadowOffsetX" className="text-xs">
              Yatay Konum: {text.shadowOffsetX}px
            </Label>
            <Slider
              id="shadowOffsetX"
              min={-50}
              max={50}
              step={1}
              value={[text.shadowOffsetX]}
              onValueChange={([value]) => onUpdate({ shadowOffsetX: value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="shadowOffsetY" className="text-xs">
              Dikey Konum: {text.shadowOffsetY}px
            </Label>
            <Slider
              id="shadowOffsetY"
              min={-50}
              max={50}
              step={1}
              value={[text.shadowOffsetY]}
              onValueChange={([value]) => onUpdate({ shadowOffsetY: value })}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-xs mb-2 block">Konum</Label>
        <div className="space-y-2">
          <div>
            <Label htmlFor="posX" className="text-xs">
              X: {Math.round(text.x)}px
            </Label>
            <Slider
              id="posX"
              min={0}
              max={1080}
              step={1}
              value={[text.x]}
              onValueChange={([value]) => onUpdate({ x: value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="posY" className="text-xs">
              Y: {Math.round(text.y)}px
            </Label>
            <Slider
              id="posY"
              min={0}
              max={1350}
              step={1}
              value={[text.y]}
              onValueChange={([value]) => onUpdate({ y: value })}
              className="mt-1"
            />
          </div>
          <Button onClick={handleCenterText} variant="outline" className="w-full bg-transparent" size="sm">
            <AlignJustify className="mr-2 h-3 w-3" />
            Ortala
          </Button>
        </div>
      </div>
    </div>
  )
}
