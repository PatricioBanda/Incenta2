"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScenarioCreator } from "@/components/scenario-creator"
import { ScenarioList } from "@/components/scenario-list"
import { SimulationResults } from "@/components/simulation-results"
import { ComparisonView } from "@/components/comparison-view"
import type { Scenario, SimulationResult } from "@/lib/types"
import { runSimulation } from "@/lib/simulation-engine"

export function SimulationDashboard() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [results, setResults] = useState<SimulationResult[]>([])
  const [activeTab, setActiveTab] = useState("scenarios")
  const [isSimulating, setIsSimulating] = useState(false)
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])

  const addScenario = (scenario: Scenario) => {
    setScenarios([...scenarios, scenario])
  }

  const updateScenario = (id: string, updatedScenario: Scenario) => {
    setScenarios(scenarios.map((s) => (s.id === id ? updatedScenario : s)))
  }

  const deleteScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id))
    setResults(results.filter((r) => r.scenarioId !== id))
    setSelectedScenarios(selectedScenarios.filter((s) => s !== id))
  }

  const toggleScenarioSelection = (id: string) => {
    if (selectedScenarios.includes(id)) {
      setSelectedScenarios(selectedScenarios.filter((s) => s !== id))
    } else {
      setSelectedScenarios([...selectedScenarios, id])
    }
  }

  const runSelectedSimulations = async () => {
    if (selectedScenarios.length === 0) return

    setIsSimulating(true)

    // Remove previous results for selected scenarios
    const filteredResults = results.filter((r) => !selectedScenarios.includes(r.scenarioId))

    // Run simulations for each selected scenario
    const newResults = await Promise.all(
      scenarios
        .filter((s) => selectedScenarios.includes(s.id))
        .map(async (scenario) => {
          const result = await runSimulation(scenario)
          return result
        }),
    )

    setResults([...filteredResults, ...newResults])
    setIsSimulating(false)
    setActiveTab("results")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Simulation Control Center</CardTitle>
        <CardDescription>Create scenarios, run simulations, and analyze results</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <ScenarioCreator onAddScenario={addScenario} />
              </div>
              <div className="md:col-span-2">
                <ScenarioList
                  scenarios={scenarios}
                  selectedScenarios={selectedScenarios}
                  onToggleSelect={toggleScenarioSelection}
                  onUpdateScenario={updateScenario}
                  onDeleteScenario={deleteScenario}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results">
            <SimulationResults results={results} scenarios={scenarios} />
          </TabsContent>

          <TabsContent value="comparison">
            <ComparisonView results={results} scenarios={scenarios} />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <span className="text-sm text-muted-foreground mr-2">{selectedScenarios.length} scenarios selected</span>
        </div>
        <Button onClick={runSelectedSimulations} disabled={selectedScenarios.length === 0 || isSimulating}>
          {isSimulating ? "Simulating..." : "Run Selected Simulations"}
        </Button>
      </CardFooter>
    </Card>
  )
}

