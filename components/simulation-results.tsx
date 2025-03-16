"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Scenario, SimulationResult } from "@/lib/types"
import { LineChart } from "@/components/charts/line-chart"
import { DataTable } from "@/components/data-table"

interface SimulationResultsProps {
  results: SimulationResult[]
  scenarios: Scenario[]
}

export function SimulationResults({ results, scenarios }: SimulationResultsProps) {
  const [selectedResultId, setSelectedResultId] = useState<string | null>(results.length > 0 ? results[0].id : null)

  const selectedResult = results.find((r) => r.id === selectedResultId)
  const selectedScenario = selectedResult ? scenarios.find((s) => s.id === selectedResult.scenarioId) : null

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Simulation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No simulation results yet. Run a simulation to see results here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Simulation Results</h3>
        <Select value={selectedResultId || ""} onValueChange={setSelectedResultId}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select a result to view" />
          </SelectTrigger>
          <SelectContent>
            {results.map((result) => {
              const scenario = scenarios.find((s) => s.id === result.scenarioId)
              return (
                <SelectItem key={result.id} value={result.id}>
                  {scenario?.name || "Unknown"} ({new Date(result.timestamp).toLocaleString()})
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {selectedResult && selectedScenario && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedScenario.name} Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
              </TabsList>

              <TabsContent value="chart" className="pt-4">
                <LineChart
                  data={selectedResult.timeSeriesData.map((point, index) => ({
                    iteration: index,
                    population: point.population,
                  }))}
                  xAxis="iteration"
                  yAxis="population"
                  title={`Population Over Time - ${selectedScenario.name}`}
                />
              </TabsContent>

              <TabsContent value="data" className="pt-4">
                <DataTable
                  data={selectedResult.timeSeriesData.map((point, index) => ({
                    iteration: index,
                    ...point,
                  }))}
                  columns={[
                    { header: "Iteration", accessorKey: "iteration" },
                    { header: "Population", accessorKey: "population" },
                    { header: "Growth", accessorKey: "growth" },
                    { header: "Events", accessorKey: "events" },
                  ]}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

