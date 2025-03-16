"use client"

import { useState } from "react"
import { Pencil, Trash2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Scenario } from "@/lib/types"
import { formatDate, formatCurrency } from "@/lib/utils"

interface ScenarioListProps {
  scenarios: Scenario[]
  selectedScenarios: string[]
  onToggleSelect: (id: string) => void
  onUpdateScenario: (id: string, scenario: Scenario) => void
  onDeleteScenario: (id: string) => void
}

export function ScenarioList({
  scenarios,
  selectedScenarios,
  onToggleSelect,
  onUpdateScenario,
  onDeleteScenario,
}: ScenarioListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const handleEdit = (scenario: Scenario) => {
    setEditingId(scenario.id)
    setEditName(scenario.name)
  }

  const handleSave = (scenario: Scenario) => {
    onUpdateScenario(scenario.id, {
      ...scenario,
      name: editName,
    })
    setEditingId(null)
  }

  const handleCancel = () => {
    setEditingId(null)
  }

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No scenarios created yet. Create your first scenario to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenarios ({scenarios.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scenarios.map((scenario) => {
            const totalInvestment = scenario.companies.reduce((sum, company) => sum + company.investmentValue, 0)

            return (
              <div
                key={scenario.id}
                className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50"
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedScenarios.includes(scenario.id)}
                    onCheckedChange={() => onToggleSelect(scenario.id)}
                    id={`select-${scenario.id}`}
                  />
                  {editingId === scenario.id ? (
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-48" autoFocus />
                  ) : (
                    <div>
                      <Label htmlFor={`select-${scenario.id}`} className="font-medium cursor-pointer">
                        {scenario.name}
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        {scenario.companies.length} {scenario.companies.length === 1 ? "company" : "companies"} | Total
                        investment: {formatCurrency(totalInvestment)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">{formatDate(scenario.createdAt)}</span>

                  {editingId === scenario.id ? (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => handleSave(scenario)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(scenario)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteScenario(scenario.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

