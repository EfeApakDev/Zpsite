"use client"

import { Card } from "@/components/ui/card"
import { useDepartments } from "@/hooks/use-departments"
import { ChevronRight } from "lucide-react"

interface DepartmentSelectorProps {
  onSelect: (department: string) => void
}

export function DepartmentSelector({ onSelect }: DepartmentSelectorProps) {
  const { departments } = useDepartments()

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Birim Seçin</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <Card
            key={dept.id}
            className="p-6 cursor-pointer hover:bg-accent transition-colors group"
            onClick={() => onSelect(dept.id)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{dept.name}</h3>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
