"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowLeft,
  Download,
  Upload,
  Type,
  Trash2,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  RefreshCw,
  Share2,
  Video,
} from "lucide-react"
import { useDepartments } from "@/hooks/use-departments"
import { TextEditor } from "@/components/text-editor"
import { useCustomFonts } from "@/hooks/use-custom-fonts"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

interface ImageEditorProps {
  department: string
  onBack: () => void
}

interface TextElement {
  id: string
  text: string
  x: number
  y: number
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
}

interface ImageAdjustments {
  scale: number
  rotation: number
  flipH: boolean
  flipV: boolean
  brightness: number
  contrast: number
  saturation: number
  blur: number
  offsetX: number
  offsetY: number
}

const TARGET_WIDTH = 1080
const TARGET_HEIGHT = 1350

export function ImageEditor({ department, onBack }: ImageEditorProps) {
  const { getDepartment } = useDepartments()
  const { fonts } = useCustomFonts()
  const { toast } = useToast()
  const dept = getDepartment(department)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [isVideo, setIsVideo] = useState(false)
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoTime, setVideoTime] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingProgress, setRecordingProgress] = useState(0)
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [imageAdjustments, setImageAdjustments] = useState<ImageAdjustments>({
    scale: 1,
    rotation: 0,
    flipH: false,
    flipV: false,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    offsetX: 0,
    offsetY: 0,
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("[v0] File selected:", file.name, file.type, file.size)

      const fileType = file.type
      const reader = new FileReader()

      reader.onerror = (error) => {
        console.error("[v0] FileReader error:", error)
        toast({
          title: "Hata",
          description: "Dosya yüklenirken bir hata oluştu. Lütfen farklı bir dosya deneyin.",
          variant: "destructive",
        })
      }

      reader.onload = (event) => {
        const isVideoFile =
          fileType.startsWith("video/") ||
          file.name.toLowerCase().endsWith(".mov") ||
          file.name.toLowerCase().endsWith(".mp4") ||
          file.name.toLowerCase().endsWith(".m4v")

        console.log("[v0] File loaded, isVideo:", isVideoFile)

        if (isVideoFile) {
          setVideoBlob(file)

          const video = document.createElement("video")
          video.playsInline = true
          video.muted = true
          video.preload = "metadata"
          video.src = event.target?.result as string
          video.crossOrigin = "anonymous"

          video.onerror = (error) => {
            console.error("[v0] Video loading error:", error)
            toast({
              title: "Hata",
              description: "Video yüklenirken bir hata oluştu. Lütfen farklı bir video deneyin.",
              variant: "destructive",
            })
          }

          video.onloadedmetadata = () => {
            console.log("[v0] Video metadata loaded:", video.duration, video.videoWidth, video.videoHeight)
            setIsVideo(true)
            setVideoElement(video)
            setVideoTime(0)
            setUploadedImage(null) // Clear image, we'll render video directly
            resetAdjustments()

            console.log("[v0] Video loaded successfully")
            toast({
              title: "Başarılı",
              description: "Video başarıyla yüklendi!",
            })
          }
        } else {
          const img = new Image()
          img.crossOrigin = "anonymous"

          img.onerror = (error) => {
            console.error("[v0] Image loading error:", error)
            toast({
              title: "Hata",
              description: "Resim yüklenirken bir hata oluştu. iOS cihazlarda HEIC formatını JPG'ye çevirin.",
              variant: "destructive",
            })
          }

          img.onload = () => {
            console.log("[v0] Image loaded:", img.width, img.height)
            try {
              const canvas = document.createElement("canvas")
              canvas.width = TARGET_WIDTH
              canvas.height = TARGET_HEIGHT
              const ctx = canvas.getContext("2d", { willReadFrequently: true })
              if (ctx) {
                const scale = Math.max(TARGET_WIDTH / img.width, TARGET_HEIGHT / img.height)
                const scaledWidth = img.width * scale
                const scaledHeight = img.height * scale
                const x = (TARGET_WIDTH - scaledWidth) / 2
                const y = (TARGET_HEIGHT - scaledHeight) / 2

                ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
                const dataUrl = canvas.toDataURL("image/jpeg", 0.95)
                setUploadedImage(dataUrl)
                setOriginalImage(dataUrl)
                setIsVideo(false)
                setVideoElement(null)
                setVideoBlob(null)
                resetAdjustments()

                toast({
                  title: "Başarılı",
                  description: "Resim başarıyla yüklendi!",
                })
              }
            } catch (err) {
              console.error("[v0] Canvas error:", err)
              toast({
                title: "Hata",
                description: "Resim işlenirken bir hata oluştu",
                variant: "destructive",
              })
            }
          }
          img.src = event.target?.result as string
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const updateVideoFrame = (time: number) => {
    if (!videoElement) return

    videoElement.currentTime = time
    videoElement.onseeked = () => {
      const canvas = document.createElement("canvas")
      canvas.width = TARGET_WIDTH
      canvas.height = TARGET_HEIGHT
      const ctx = canvas.getContext("2d")
      if (ctx) {
        const scale = Math.max(TARGET_WIDTH / videoElement.videoWidth, TARGET_HEIGHT / videoElement.videoHeight)
        const scaledWidth = videoElement.videoWidth * scale
        const scaledHeight = videoElement.videoHeight * scale
        const x = (TARGET_WIDTH - scaledWidth) / 2
        const y = (TARGET_HEIGHT - scaledHeight) / 2

        ctx.drawImage(videoElement, x, y, scaledWidth, scaledHeight)
        const dataUrl = canvas.toDataURL()
        setUploadedImage(dataUrl)
      }
    }
  }

  const resetAdjustments = () => {
    setImageAdjustments({
      scale: 1,
      rotation: 0,
      flipH: false,
      flipV: false,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      offsetX: 0,
      offsetY: 0,
    })
  }

  const resetImageAdjustments = () => {
    resetAdjustments()
  }

  const addTextElement = () => {
    const newText: TextElement = {
      id: Date.now().toString(),
      text: "Yeni Metin",
      x: TARGET_WIDTH / 2,
      y: TARGET_HEIGHT / 2,
      fontSize: 48,
      color: "#FFFFFF",
      fontFamily: fonts[0]?.name || "Arial",
      bold: false,
      italic: false,
      underline: false,
      opacity: 1,
      rotation: 0,
      textAlign: "center",
      strokeColor: "#000000",
      strokeWidth: 0,
      shadowColor: "#000000",
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      letterSpacing: 0,
      lineHeight: 1.2,
    }
    setTextElements([...textElements, newText])
    setSelectedText(newText.id)
  }

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(textElements.map((el) => (el.id === id ? { ...el, ...updates } : el)))
  }

  const deleteTextElement = (id: string) => {
    setTextElements(textElements.filter((el) => el.id !== id))
    if (selectedText === id) setSelectedText(null)
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = TARGET_WIDTH / rect.width
    const scaleY = TARGET_HEIGHT / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    let clickedOnText = false
    for (const text of [...textElements].reverse()) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.font = `${text.fontSize}px ${text.fontFamily}`
        const metrics = ctx.measureText(text.text)
        const textWidth = metrics.width
        const textHeight = text.fontSize

        if (
          x >= text.x - textWidth / 2 &&
          x <= text.x + textWidth / 2 &&
          y >= text.y - textHeight / 2 &&
          y <= text.y + textHeight / 2
        ) {
          setSelectedText(text.id)
          setIsDragging(true)
          setDragOffset({ x: x - text.x, y: y - text.y })
          clickedOnText = true
          return
        }
      }
    }

    if (!clickedOnText) {
      setSelectedText(null)
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedText) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = TARGET_WIDTH / rect.width
    const scaleY = TARGET_HEIGHT / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    updateTextElement(selectedText, {
      x: x - dragOffset.x,
      y: y - dragOffset.y,
    })
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  const drawFrame = (ctx: CanvasRenderingContext2D, videoEl: HTMLVideoElement, templateImg: HTMLImageElement) => {
    ctx.clearRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT)

    ctx.save()
    ctx.translate(TARGET_WIDTH / 2, TARGET_HEIGHT / 2)
    ctx.rotate((imageAdjustments.rotation * Math.PI) / 180)
    ctx.scale(
      imageAdjustments.scale * (imageAdjustments.flipH ? -1 : 1),
      imageAdjustments.scale * (imageAdjustments.flipV ? -1 : 1),
    )
    ctx.translate(-TARGET_WIDTH / 2 + imageAdjustments.offsetX, -TARGET_HEIGHT / 2 + imageAdjustments.offsetY)
    ctx.filter = `brightness(${imageAdjustments.brightness}%) contrast(${imageAdjustments.contrast}%) saturate(${imageAdjustments.saturation}%) blur(${imageAdjustments.blur}px)`

    const scale = Math.max(TARGET_WIDTH / videoEl.videoWidth, TARGET_HEIGHT / videoEl.videoHeight)
    const scaledWidth = videoEl.videoWidth * scale
    const scaledHeight = videoEl.videoHeight * scale
    const x = (TARGET_WIDTH - scaledWidth) / 2
    const y = (TARGET_HEIGHT - scaledHeight) / 2

    ctx.drawImage(videoEl, x, y, scaledWidth, scaledHeight)
    ctx.restore()

    ctx.drawImage(templateImg, 0, 0, TARGET_WIDTH, TARGET_HEIGHT)

    textElements.forEach((text) => {
      ctx.save()
      ctx.translate(text.x, text.y)
      ctx.rotate((text.rotation * Math.PI) / 180)
      ctx.globalAlpha = text.opacity

      let fontStyle = ""
      if (text.italic) fontStyle += "italic "
      if (text.bold) fontStyle += "bold "
      ctx.font = `${fontStyle}${text.fontSize}px ${text.fontFamily}`
      ctx.textAlign = text.textAlign
      ctx.textBaseline = "middle"

      if (text.shadowBlur > 0) {
        ctx.shadowColor = text.shadowColor
        ctx.shadowBlur = text.shadowBlur
        ctx.shadowOffsetX = text.shadowOffsetX
        ctx.shadowOffsetY = text.shadowOffsetY
      }

      const lines = text.text.split("\n")
      const lineHeight = text.fontSize * text.lineHeight
      const totalHeight = lines.length * lineHeight
      const startY = -(totalHeight / 2) + lineHeight / 2

      lines.forEach((line, index) => {
        const yOffset = startY + index * lineHeight

        if (text.strokeWidth > 0) {
          ctx.strokeStyle = text.strokeColor
          ctx.lineWidth = text.strokeWidth
          ctx.strokeText(line, 0, yOffset)
        }

        ctx.fillStyle = text.color
        ctx.fillText(line, 0, yOffset)

        if (text.underline) {
          const metrics = ctx.measureText(line)
          const textWidth = metrics.width
          let underlineX = 0
          if (text.textAlign === "center") underlineX = -textWidth / 2
          else if (text.textAlign === "right") underlineX = -textWidth

          ctx.beginPath()
          ctx.moveTo(underlineX, yOffset + text.fontSize / 3)
          ctx.lineTo(underlineX + textWidth, yOffset + text.fontSize / 3)
          ctx.strokeStyle = text.color
          ctx.lineWidth = Math.max(1, text.fontSize / 20)
          ctx.stroke()
        }
      })

      ctx.restore()
    })
  }

  const recordVideo = async (forDownload = false) => {
    if (!videoElement || !dept?.templateUrl || !canvasRef.current) {
      toast({
        title: "Hata",
        description: "Video kaydı için gerekli öğeler eksik",
        variant: "destructive",
      })
      return
    }

    setIsRecording(true)
    setRecordingProgress(0)

    try {
      const templateImg = new Image()
      templateImg.crossOrigin = "anonymous"
      await new Promise((resolve, reject) => {
        templateImg.onload = resolve
        templateImg.onerror = reject
        templateImg.src = dept.templateUrl
      })

      const recordCanvas = document.createElement("canvas")
      recordCanvas.width = TARGET_WIDTH
      recordCanvas.height = TARGET_HEIGHT
      const recordCtx = recordCanvas.getContext("2d")
      if (!recordCtx) throw new Error("Canvas context not available")

      const recordVideo = document.createElement("video")
      recordVideo.src = videoElement.src
      recordVideo.playsInline = true
      recordVideo.crossOrigin = "anonymous"

      await new Promise((resolve) => {
        recordVideo.onloadeddata = resolve
        recordVideo.load()
      })

      await recordVideo.play()

      const canvasStream = recordCanvas.captureStream(30)

      const audioContext = new AudioContext()
      const source = audioContext.createMediaElementSource(recordVideo)
      const destination = audioContext.createMediaStreamDestination()

      source.connect(destination)
      source.connect(audioContext.destination)

      destination.stream.getAudioTracks().forEach((track) => {
        canvasStream.addTrack(track)
      })

      let mimeType = "video/webm;codecs=vp9,opus"
      let fileExtension = "webm"

      const mp4Codecs = ["video/mp4;codecs=h264,aac", "video/mp4;codecs=avc1,mp4a", "video/mp4"]

      for (const codec of mp4Codecs) {
        if (MediaRecorder.isTypeSupported(codec)) {
          mimeType = codec
          fileExtension = "mp4"
          break
        }
      }

      if (fileExtension === "webm") {
        const webmCodecs = [
          "video/webm;codecs=vp9,opus",
          "video/webm;codecs=vp8,opus",
          "video/webm;codecs=vp9",
          "video/webm",
        ]

        for (const codec of webmCodecs) {
          if (MediaRecorder.isTypeSupported(codec)) {
            mimeType = codec
            break
          }
        }
      }

      console.log("[v0] Using codec:", mimeType)

      const mediaRecorder = new MediaRecorder(canvasStream, {
        mimeType: mimeType,
        videoBitsPerSecond: 5000000,
        audioBitsPerSecond: 128000,
      })

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const finalMimeType = fileExtension === "mp4" ? "video/mp4" : "video/webm"
        const blob = new Blob(chunks, { type: finalMimeType })
        const fileName = `${dept?.name || "post"}-${Date.now()}.${fileExtension}`

        audioContext.close()

        if (forDownload) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = fileName
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          toast({
            title: "Başarılı",
            description: "Video başarıyla indirildi!",
          })
        } else {
          if (navigator.share && navigator.canShare) {
            try {
              const file = new File([blob], fileName, { type: finalMimeType })
              const shareData = {
                files: [file],
              }

              if (navigator.canShare(shareData)) {
                await navigator.share(shareData)
                toast({
                  title: "Başarılı",
                  description: "Video başarıyla paylaşıldı!",
                })
              } else {
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = fileName
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }
            } catch (err: any) {
              if (err.name !== "AbortError") {
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = fileName
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }
            }
          } else {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = fileName
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
        }

        setIsRecording(false)
        setRecordingProgress(0)
      }

      mediaRecorder.start()

      const duration = recordVideo.duration
      let animationFrameId: number

      const renderFrame = () => {
        const currentTime = recordVideo.currentTime

        if (currentTime >= duration || recordVideo.ended) {
          mediaRecorder.stop()
          recordVideo.pause()
          return
        }

        drawFrame(recordCtx, recordVideo, templateImg)

        const progress = (currentTime / duration) * 100
        setRecordingProgress(progress)

        animationFrameId = requestAnimationFrame(renderFrame)
      }

      animationFrameId = requestAnimationFrame(renderFrame)
    } catch (error) {
      console.error("Recording error:", error)
      setIsRecording(false)
      setRecordingProgress(0)
      toast({
        title: "Hata",
        description: "Video kaydı sırasında bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT)

    if (isVideo && videoElement) {
      ctx.save()
      ctx.translate(TARGET_WIDTH / 2, TARGET_HEIGHT / 2)
      ctx.rotate((imageAdjustments.rotation * Math.PI) / 180)
      ctx.scale(
        imageAdjustments.scale * (imageAdjustments.flipH ? -1 : 1),
        imageAdjustments.scale * (imageAdjustments.flipV ? -1 : 1),
      )
      ctx.translate(-TARGET_WIDTH / 2 + imageAdjustments.offsetX, -TARGET_HEIGHT / 2 + imageAdjustments.offsetY)
      ctx.filter = `brightness(${imageAdjustments.brightness}%) contrast(${imageAdjustments.contrast}%) saturate(${imageAdjustments.saturation}%) blur(${imageAdjustments.blur}px)`

      const scale = Math.max(TARGET_WIDTH / videoElement.videoWidth, TARGET_HEIGHT / videoElement.videoHeight)
      const scaledWidth = videoElement.videoWidth * scale
      const scaledHeight = videoElement.videoHeight * scale
      const x = (TARGET_WIDTH - scaledWidth) / 2
      const y = (TARGET_HEIGHT - scaledHeight) / 2

      ctx.drawImage(videoElement, x, y, scaledWidth, scaledHeight)
      ctx.restore()

      drawTemplateAndText()
    } else if (uploadedImage) {
      const img = new Image()
      img.onload = () => {
        ctx.save()
        ctx.translate(TARGET_WIDTH / 2, TARGET_HEIGHT / 2)
        ctx.rotate((imageAdjustments.rotation * Math.PI) / 180)
        ctx.scale(
          imageAdjustments.scale * (imageAdjustments.flipH ? -1 : 1),
          imageAdjustments.scale * (imageAdjustments.flipV ? -1 : 1),
        )
        ctx.translate(-TARGET_WIDTH / 2 + imageAdjustments.offsetX, -TARGET_HEIGHT / 2 + imageAdjustments.offsetY)
        ctx.filter = `brightness(${imageAdjustments.brightness}%) contrast(${imageAdjustments.contrast}%) saturate(${imageAdjustments.saturation}%) blur(${imageAdjustments.blur}px)`
        ctx.drawImage(img, 0, 0, TARGET_WIDTH, TARGET_HEIGHT)
        ctx.restore()

        drawTemplateAndText()
      }
      img.src = uploadedImage
    } else {
      ctx.fillStyle = "#1a1a1a"
      ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT)
      ctx.fillStyle = "#666"
      ctx.font = "32px Arial"
      ctx.textAlign = "center"
      ctx.fillText("Resim veya Video Yükleyin", TARGET_WIDTH / 2, TARGET_HEIGHT / 2)
      drawTemplateAndText()
    }

    function drawTemplateAndText() {
      if (!ctx || !dept?.templateUrl) return

      const template = new Image()
      template.crossOrigin = "anonymous"
      template.onload = () => {
        ctx.drawImage(template, 0, 0, TARGET_WIDTH, TARGET_HEIGHT)

        textElements.forEach((text) => {
          ctx.save()

          ctx.translate(text.x, text.y)
          ctx.rotate((text.rotation * Math.PI) / 180)
          ctx.globalAlpha = text.opacity

          let fontStyle = ""
          if (text.italic) fontStyle += "italic "
          if (text.bold) fontStyle += "bold "
          ctx.font = `${fontStyle}${text.fontSize}px ${text.fontFamily}`
          ctx.textAlign = text.textAlign
          ctx.textBaseline = "middle"

          if (text.shadowBlur > 0) {
            ctx.shadowColor = text.shadowColor
            ctx.shadowBlur = text.shadowBlur
            ctx.shadowOffsetX = text.shadowOffsetX
            ctx.shadowOffsetY = text.shadowOffsetY
          }

          const lines = text.text.split("\n")
          const lineHeight = text.fontSize * text.lineHeight
          const totalHeight = lines.length * lineHeight
          const startY = -(totalHeight / 2) + lineHeight / 2

          lines.forEach((line, index) => {
            const yOffset = startY + index * lineHeight

            if (text.strokeWidth > 0) {
              ctx.strokeStyle = text.strokeColor
              ctx.lineWidth = text.strokeWidth
              ctx.strokeText(line, 0, yOffset)
            }

            ctx.fillStyle = text.color
            ctx.fillText(line, 0, yOffset)

            if (text.underline) {
              const metrics = ctx.measureText(line)
              const textWidth = metrics.width
              let underlineX = 0
              if (text.textAlign === "center") underlineX = -textWidth / 2
              else if (text.textAlign === "right") underlineX = -textWidth

              ctx.beginPath()
              ctx.moveTo(underlineX, yOffset + text.fontSize / 3)
              ctx.lineTo(underlineX + textWidth, yOffset + text.fontSize / 3)
              ctx.strokeStyle = text.color
              ctx.lineWidth = Math.max(1, text.fontSize / 20)
              ctx.stroke()
            }
          })

          ctx.restore()

          if (text.id === selectedText) {
            ctx.save()
            ctx.translate(text.x, text.y)
            ctx.rotate((text.rotation * Math.PI) / 180)

            let maxWidth = 0
            lines.forEach((line) => {
              const metrics = ctx.measureText(line)
              maxWidth = Math.max(maxWidth, metrics.width)
            })

            const textHeight = totalHeight

            let offsetX = 0
            if (text.textAlign === "center") offsetX = -maxWidth / 2
            else if (text.textAlign === "right") offsetX = -maxWidth

            ctx.strokeStyle = "#3b82f6"
            ctx.lineWidth = 3
            ctx.strokeRect(offsetX - 5, -textHeight / 2 - 5, maxWidth + 10, textHeight + 10)
            ctx.restore()
          }
        })
      }
      template.src = dept.templateUrl
    }
  }, [uploadedImage, isVideo, videoElement, videoTime, dept, textElements, selectedText, imageAdjustments])

  const handleDownload = () => {
    if (isVideo && videoElement) {
      recordVideo(true)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `${dept?.name || "post"}-${Date.now()}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()

    toast({
      title: "Başarılı",
      description: "Görsel indirildi!",
    })
  }

  const handleShare = async () => {
    if (isVideo && videoElement) {
      toast({
        title: "Bilgi",
        description: "Video işleniyor ve paylaşılacak...",
      })
      await recordVideo(false)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    try {
      if (navigator.share) {
        canvas.toBlob(async (blob) => {
          if (!blob) return

          const fileName = `${dept?.name || "post"}-${Date.now()}.png`
          const file = new File([blob], fileName, {
            type: "image/png",
          })

          const shareData = {
            files: [file],
          }

          try {
            if (navigator.canShare && navigator.canShare(shareData)) {
              await navigator.share(shareData)
              toast({
                title: "Başarılı",
                description: "Görsel paylaşıldı!",
              })
            } else {
              handleDownload()
            }
          } catch (err: any) {
            if (err.name !== "AbortError") {
              console.error("Share error:", err)
              handleDownload()
            }
          }
        }, "image/png")
      } else {
        handleDownload()
      }
    } catch (error) {
      console.error("Share error:", error)
      toast({
        title: "Hata",
        description: "Paylaşım sırasında bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  if (!dept) return null

  const selectedTextElement = textElements.find((t) => t.id === selectedText)

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
        <Button variant="outline" onClick={onBack} size="sm" className="sm:size-default bg-transparent">
          <ArrowLeft className="mr-0 sm:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Geri</span>
        </Button>
        <h2 className="text-lg sm:text-2xl font-bold text-foreground text-center flex-1">{dept.name}</h2>
        <div className="w-16 sm:w-24" />
      </div>

      {isRecording && (
        <Card className="p-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Video kaydediliyor...</span>
              <span className="text-sm text-muted-foreground">{Math.round(recordingProgress)}%</span>
            </div>
            <Progress value={recordingProgress} className="w-full" />
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <Card className="p-3 sm:p-6">
            <div className="flex justify-center mb-4">
              <canvas
                ref={canvasRef}
                width={TARGET_WIDTH}
                height={TARGET_HEIGHT}
                className="max-w-full h-auto border border-border rounded-lg cursor-crosshair touch-none"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onTouchStart={(e) => {
                  const touch = e.touches[0]
                  const mouseEvent = new MouseEvent("mousedown", {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                  })
                  handleCanvasMouseDown(mouseEvent as any)
                }}
                onTouchMove={(e) => {
                  e.preventDefault()
                  const touch = e.touches[0]
                  const mouseEvent = new MouseEvent("mousemove", {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                  })
                  handleCanvasMouseMove(mouseEvent as any)
                }}
                onTouchEnd={() => handleCanvasMouseUp()}
              />
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button onClick={() => fileInputRef.current?.click()} size="sm" className="sm:size-default">
                <Upload className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Resim</span>
              </Button>
              <Button
                onClick={() => videoInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="sm:size-default bg-transparent"
              >
                <Video className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Video</span>
              </Button>
              <Button onClick={addTextElement} variant="outline" size="sm" className="sm:size-default bg-transparent">
                <Type className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Metin</span>
              </Button>
              <Button
                onClick={handleShare}
                variant="default"
                size="sm"
                className="sm:size-default"
                disabled={isRecording}
              >
                <Share2 className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Paylaş</span>
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="sm:size-default bg-transparent"
                disabled={isRecording}
              >
                <Download className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">{isVideo ? "Video İndir" : "İndir"}</span>
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif,image/heic,image/heif,image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*,video/mp4,video/quicktime,.mov,.mp4,.m4v"
              onChange={handleImageUpload}
              className="hidden"
            />
          </Card>

          {uploadedImage && (
            <Card className="p-3 sm:p-6 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">
                  {isVideo ? "Video" : "Resim"} Düzenleme
                </h3>
                <Button onClick={resetImageAdjustments} variant="outline" size="sm">
                  <RefreshCw className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="text-xs sm:text-sm">Sıfırla</span>
                </Button>
              </div>

              <div className="space-y-4">
                {isVideo && videoElement && (
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">
                      Video Önizleme: {videoTime.toFixed(1)}s / {videoElement.duration.toFixed(1)}s
                    </Label>
                    <Slider
                      value={[videoTime]}
                      onValueChange={([value]) => {
                        setVideoTime(value)
                        updateVideoFrame(value)
                      }}
                      min={0}
                      max={videoElement.duration || 10}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Önizleme için videodan bir kare seçin (tüm video kaydedilecek)
                    </p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => setImageAdjustments((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCw className="mr-1 h-4 w-4" />
                    <span className="text-xs">Döndür</span>
                  </Button>
                  <Button
                    onClick={() => setImageAdjustments((prev) => ({ ...prev, flipH: !prev.flipH }))}
                    variant="outline"
                    size="sm"
                  >
                    <FlipHorizontal className="mr-1 h-4 w-4" />
                    <span className="text-xs">Yatay Çevir</span>
                  </Button>
                  <Button
                    onClick={() => setImageAdjustments((prev) => ({ ...prev, flipV: !prev.flipV }))}
                    variant="outline"
                    size="sm"
                  >
                    <FlipVertical className="mr-1 h-4 w-4" />
                    <span className="text-xs">Dikey Çevir</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Yakınlaştırma: {imageAdjustments.scale.toFixed(2)}x</Label>
                  <Slider
                    value={[imageAdjustments.scale]}
                    onValueChange={([value]) => setImageAdjustments((prev) => ({ ...prev, scale: value }))}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Yatay Konum: {imageAdjustments.offsetX}px</Label>
                  <Slider
                    value={[imageAdjustments.offsetX]}
                    onValueChange={([value]) => setImageAdjustments((prev) => ({ ...prev, offsetX: value }))}
                    min={-500}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Dikey Konum: {imageAdjustments.offsetY}px</Label>
                  <Slider
                    value={[imageAdjustments.offsetY]}
                    onValueChange={([value]) => setImageAdjustments((prev) => ({ ...prev, offsetY: value }))}
                    min={-500}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Parlaklık: {imageAdjustments.brightness}%</Label>
                  <Slider
                    value={[imageAdjustments.brightness]}
                    onValueChange={([value]) => setImageAdjustments((prev) => ({ ...prev, brightness: value }))}
                    min={0}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Kontrast: {imageAdjustments.contrast}%</Label>
                  <Slider
                    value={[imageAdjustments.contrast]}
                    onValueChange={([value]) => setImageAdjustments((prev) => ({ ...prev, contrast: value }))}
                    min={0}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Doygunluk: {imageAdjustments.saturation}%</Label>
                  <Slider
                    value={[imageAdjustments.saturation]}
                    onValueChange={([value]) => setImageAdjustments((prev) => ({ ...prev, saturation: value }))}
                    min={0}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Bulanıklık: {imageAdjustments.blur}px</Label>
                  <Slider
                    value={[imageAdjustments.blur]}
                    onValueChange={([value]) => setImageAdjustments((prev) => ({ ...prev, blur: value }))}
                    min={0}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="p-3 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-foreground">Metin Öğeleri</h3>
            {textElements.length === 0 ? (
              <p className="text-xs sm:text-sm text-muted-foreground text-center py-8">Henüz metin eklenmedi</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {textElements.map((text) => (
                  <div
                    key={text.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedText === text.id ? "border-primary bg-accent" : "border-border hover:bg-accent"
                    }`}
                    onClick={() => setSelectedText(text.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium truncate flex-1">{text.text}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTextElement(text.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    {selectedText === text.id && selectedTextElement && (
                      <TextEditor
                        text={selectedTextElement}
                        onUpdate={(updates) => updateTextElement(text.id, updates)}
                        onDeselect={() => setSelectedText(null)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
