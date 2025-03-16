"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Scenario, SimulationResult } from "@/lib/types"
import { LineChart } from "@/components/charts/line-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { DataTable } from "@/components/data-table"

interface ComparisonViewProps {
  results: SimulationResult[]
  scenarios: Scenario[]
}

export function ComparisonView({ results, scenarios }: ComparisonViewProps) {
  const [selectedResultIds, setSelectedResultIds] = useState<string[]>(results.slice(0, 3).map((r) => r.id))

  const toggleResultSelection = (id: string) => {
    if (selectedResultIds.includes(id)) {
      setSelectedResultIds(selectedResultIds.filter((r) => r !== id))
    } else {
      setSelectedResultIds([...selectedResultIds, id])
    }
  }

  const selectedResults = results.filter((r) => selectedResultIds.includes(r.id))

  // Prepare data for comparison charts
  const comparisonData = selectedResults.map((result) => {
    const scenario = scenarios.find((s) => s.id === result.scenarioId)
    return {
      id: result.id,
      name: scenario?.name || "Unknown",
      finalPopulation: result.timeSeriesData[result.timeSeriesData.length - 1].population,
      averageGrowth: result.timeSeriesData.reduce((sum, point) => sum + point.growth, 0) / result.timeSeriesData.length,
      timeSeriesData: result.timeSeriesData.map((point, index) => ({
        iteration: index,
        population: point.population,
        scenarioName: scenario?.name || "Unknown",
      })),
    }
  })

  // Prepare combined time series data for multi-line chart
  const combinedTimeSeriesData = comparisonData.flatMap((data) =>
    data.timeSeriesData.map((point) => ({
      ...point,
      scenarioId: data.id,
    })),
  )

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparison View</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No simulation results available for comparison. Run simulations to compare them here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((result) => {
                  const scenario = scenarios.find((s) => s.id === result.scenarioId)
                  return (
                    <div key={result.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`select-result-${result.id}`}
                        checked={selectedResultIds.includes(result.id)}
                        onCheckedChange={() => toggleResultSelection(result.id)}
                      />
                      <Label htmlFor={`select-result-${result.id}`}>{scenario?.name || "Unknown"}</Label>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          {selectedResults.length > 0 ? (
            <Tabs defaultValue="timeSeries">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="timeSeries">Time Series</TabsTrigger>
                <TabsTrigger value="finalValues">Final Values</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="timeSeries" className="pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <LineChart
                      data={combinedTimeSeriesData}
                      xAxis="iteration"
                      yAxis="population"
                      groupBy="scenarioName"
                      title="Population Over Time - Comparison"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="finalValues" className="pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <BarChart
                      data={comparisonData}
                      xAxis="name"
                      yAxis="finalPopulation"
                      title="Final Population by Scenario"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary" className="pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <DataTable
                      data={comparisonData}
                      columns={[
                        { header: "Scenario", accessorKey: "name" },
                        { header: "Final Population", accessorKey: "finalPopulation" },
                        {
                          header: "Avg. Growth Rate",
                          accessorKey: "averageGrowth",
                          cell: (info) => `${(info.getValue<number>() * 100).toFixed(2)}%`,
                        },
                      ]}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">Select at least one scenario to compare</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

