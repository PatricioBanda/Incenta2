"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScenarioCreator } from "@/components/scenario-creator"
import { ScenarioList } from "@/components/scenario-list"
import { ComparisonResults } from "@/components/comparison-results"
import type { Scenario } from "@/lib/types"
import { calculateIncentives } from "@/lib/incentive-calculator"

export function IncentiveSimulator() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [activeTab, setActiveTab] = useState("create")
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])
  const [comparisonResults, setComparisonResults] = useState<any>(null)

  const addScenario = (scenario: Scenario) => {
    setScenarios([...scenarios, scenario])
    setActiveTab("scenarios")
  }

  const updateScenario = (id: string, updatedScenario: Scenario) => {
    setScenarios(scenarios.map((s) => (s.id === id ? updatedScenario : s)))
  }

  const deleteScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id))
    setSelectedScenarios(selectedScenarios.filter((s) => s !== id))
  }

  const toggleScenarioSelection = (id: string) => {
    if (selectedScenarios.includes(id)) {
      setSelectedScenarios(selectedScenarios.filter((s) => s !== id))
    } else {
      setSelectedScenarios([...selectedScenarios, id])
    }
  }

  const compareScenarios = () => {
    if (selectedScenarios.length === 0) return

    const selectedScenarioData = scenarios.filter((s) => selectedScenarios.includes(s.id))
    const results = selectedScenarioData.map((scenario) => {
      const incentives = calculateIncentives(scenario)
      return {
        id: scenario.id,
        name: scenario.name,
        totalInvestment: scenario.companies.reduce((sum, company) => sum + company.investmentValue, 0),
        totalIncentive: incentives.totalIncentive,
        companies: scenario.companies.map((company, index) => ({
          name: company.name || `Company ${index + 1}`,
          size: company.size,
          investmentValue: company.investmentValue,
          territory: company.territory,
          incentiveTypes: company.incentiveTypes,
          incentiveAmount: incentives.companyIncentives[index],
        })),
      }
    })

    setComparisonResults(results)
    setActiveTab("results")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Investment Incentive Simulator</CardTitle>
        <CardDescription>
          Create scenarios with different company configurations and compare potential incentives
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Scenario</TabsTrigger>
            <TabsTrigger value="scenarios">Manage Scenarios</TabsTrigger>
            <TabsTrigger value="results">Comparison Results</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 pt-4">
            <ScenarioCreator onAddScenario={addScenario} />
          </TabsContent>

          <TabsContent value="scenarios" className="pt-4">
            <ScenarioList
              scenarios={scenarios}
              selectedScenarios={selectedScenarios}
              onToggleSelect={toggleScenarioSelection}
              onUpdateScenario={updateScenario}
              onDeleteScenario={deleteScenario}
            />
          </TabsContent>

          <TabsContent value="results" className="pt-4">
            <ComparisonResults results={comparisonResults} />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <span className="text-sm text-muted-foreground mr-2">{selectedScenarios.length} scenarios selected</span>
        </div>
        <Button onClick={compareScenarios} disabled={selectedScenarios.length === 0}>
          Compare Selected Scenarios
        </Button>
      </CardFooter>
    </Card>
  )
}

