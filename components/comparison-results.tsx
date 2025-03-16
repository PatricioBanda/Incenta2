"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { BarChart } from "@/components/charts/bar-chart"
import { QuadrantChart } from "@/components/charts/quadrant-chart"
import { DataTable } from "@/components/data-table"
import { formatCurrency, formatPercentage } from "@/lib/utils"
// Add the import for the new function and Territory
import { calculateCompanyIncentiveForTerritory } from "@/lib/incentive-calculator"
import { Territory } from "@/lib/types"

interface ComparisonResultsProps {
  results: any[] | null
}

export function ComparisonResults({ results }: ComparisonResultsProps) {
  const [groupBy, setGroupBy] = useState<string>("none")
  const [showSerraTerritory, setShowSerraTerritory] = useState(true)
  const [territoryValue, setTerritoryValue] = useState(100) // 0 = Outros only, 100 = Both territories

  // Handle territory slider change
  const handleTerritoryChange = (value: number[]) => {
    setTerritoryValue(value[0])
    setShowSerraTerritory(value[0] > 0)
  }

  if (!results || results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparison Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No comparison results yet. Select and compare scenarios to see results here.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for charts
  const totalIncentiveData = results.map((result) => ({
    name: result.name,
    value: result.totalIncentive,
  }))

  const incentiveRateData = results.map((result) => ({
    name: result.name,
    value: (result.totalIncentive / result.totalInvestment) * 100,
  }))

  // Find maximum incentive for highlighting
  const maxIncentiveScenario = results.reduce(
    (max, current) => (current.totalIncentive > max.totalIncentive ? current : max),
    results[0],
  )

  // Prepare data for combined summary table with company details
  const combinedData = results.flatMap((result) => {
    // Add a row for the scenario summary
    const scenarioRow = {
      id: result.id,
      type: "scenario",
      scenarioName: result.name,
      companyName: `${result.companies.length} companies`,
      size: "",
      territory: "",
      investmentValue: result.totalInvestment,
      incentiveAmount: result.totalIncentive,
      incentiveRate: (result.totalIncentive / result.totalInvestment) * 100,
      isMaxIncentive: result.id === maxIncentiveScenario.id,
      otherTerritory: result.companies.filter((c: any) => c.territory === Territory.OTHER).length,
      baixaSerraTerritory: result.companies.filter((c: any) => c.territory === Territory.BAIXA_SERRA).length,
    }

    // Add rows for each company in the scenario
    const companyRows = result.companies
      .map((company: any) => {
        const isInCurrentTerritory = showSerraTerritory || company.territory === Territory.OTHER
        const isSimulated = !isInCurrentTerritory

        // If not showing Serra and company is in Serra, create a simulated entry for Outros
        const simulatedIncentive = isSimulated
          ? calculateCompanyIncentiveForTerritory(
              {
                ...company,
                territory: Territory.OTHER,
              },
              Territory.OTHER,
            )
          : 0

        return {
          id: company.id,
          type: "company",
          scenarioName: result.name,
          companyName: company.name + (isSimulated ? " (simulated in Outros)" : ""),
          size: company.size,
          territory: company.territory === "OTHER" ? "Outros Territórios" : "Baixa e Serra de Estrella",
          simulatedTerritory: isSimulated,
          investmentValue: company.investmentValue,
          incentiveAmount: isSimulated ? simulatedIncentive : company.incentiveAmount,
          incentiveRate: isSimulated
            ? (simulatedIncentive / company.investmentValue) * 100
            : (company.incentiveAmount / company.investmentValue) * 100,
          isMaxIncentive: result.id === maxIncentiveScenario.id,
          otherTerritory: 0,
          baixaSerraTerritory: 0,
        }
      })
      // Filter to show all companies in the current territory, plus simulated ones if not showing Serra
      .filter(
        (company: any) =>
          showSerraTerritory || company.territory === "Outros Territórios" || company.simulatedTerritory,
      )

    return [scenarioRow, ...companyRows]
  })

  // Group data based on selection
  const groupedData = [...combinedData]

  if (groupBy === "territory") {
    // Sort by territory distribution
    groupedData.sort((a, b) => {
      // First sort by type (scenario first)
      if (a.type === "scenario" && b.type !== "scenario") return -1
      if (a.type !== "scenario" && b.type === "scenario") return 1

      // Then by scenario name
      if (a.scenarioName !== b.scenarioName) return a.scenarioName.localeCompare(b.scenarioName)

      // For companies in same scenario, sort by territory
      if (a.type === "company" && b.type === "company") {
        return a.territory.localeCompare(b.territory)
      }

      return 0
    })
  } else if (groupBy === "size") {
    // Sort by company size
    groupedData.sort((a, b) => {
      // First sort by type (scenario first)
      if (a.type === "scenario" && b.type !== "scenario") return -1
      if (a.type !== "scenario" && b.type === "scenario") return 1

      // Then by scenario name
      if (a.scenarioName !== b.scenarioName) return a.scenarioName.localeCompare(b.scenarioName)

      // For companies in same scenario, sort by size
      if (a.type === "company" && b.type === "company") {
        return a.size.localeCompare(b.size)
      }

      return 0
    })
  } else if (groupBy === "incentive") {
    // Sort by incentive amount
    groupedData.sort((a, b) => {
      // First sort by type (scenario first)
      if (a.type === "scenario" && b.type !== "scenario") return -1
      if (a.type !== "scenario" && b.type === "scenario") return 1

      // Then by scenario name
      if (a.scenarioName !== b.scenarioName) return a.scenarioName.localeCompare(b.scenarioName)

      // For companies in same scenario, sort by incentive amount (descending)
      if (a.type === "company" && b.type === "company") {
        return b.incentiveAmount - a.incentiveAmount
      }

      return 0
    })
  } else {
    // Default sorting
    groupedData.sort((a, b) => {
      // First sort by type (scenario first)
      if (a.type === "scenario" && b.type !== "scenario") return -1
      if (a.type !== "scenario" && b.type === "scenario") return 1

      // Then by scenario name
      if (a.scenarioName !== b.scenarioName) return a.scenarioName.localeCompare(b.scenarioName)

      return 0
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Scenario Comparison</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Group by:</span>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Grouping" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No grouping</SelectItem>
                  <SelectItem value="territory">Territory</SelectItem>
                  <SelectItem value="size">Company Size</SelectItem>
                  <SelectItem value="incentive">Incentive Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quadrant">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quadrant">Quadrant View</TabsTrigger>
              <TabsTrigger value="bar">Bar Charts</TabsTrigger>
              <TabsTrigger value="summary">Summary & Details</TabsTrigger>
            </TabsList>

            <TabsContent value="quadrant" className="pt-4">
              <QuadrantChart
                data={results}
                title="Scenario Comparison by Territory"
                onTerritoryChange={setShowSerraTerritory}
              />
            </TabsContent>

            <TabsContent value="bar" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BarChart
                  data={totalIncentiveData}
                  xAxis="name"
                  yAxis="value"
                  title="Total Incentive by Scenario"
                  valueFormatter={formatCurrency}
                />

                <BarChart
                  data={incentiveRateData}
                  xAxis="name"
                  yAxis="value"
                  title="Incentive Rate by Scenario"
                  valueFormatter={formatPercentage}
                />
              </div>
            </TabsContent>

            <TabsContent value="summary" className="pt-4">
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="summary-territory-slider" className="text-sm">
                    Territory Filter: {showSerraTerritory ? "Both Territories" : "Outros Only"}
                  </Label>
                </div>
                <Slider
                  id="summary-territory-slider"
                  min={0}
                  max={100}
                  step={100}
                  value={[territoryValue]}
                  onValueChange={handleTerritoryChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Outros Territórios</span>
                  <span>Both Territories</span>
                </div>
              </div>

              <DataTable
                data={groupedData}
                columns={[
                  {
                    header: "Scenario / Company",
                    accessorKey: "scenarioName",
                    cell: (info) => {
                      const row = info.row.original as any
                      const value = info.getValue<string>()
                      const isMax = row.isMaxIncentive
                      const isScenario = row.type === "scenario"

                      if (isScenario) {
                        return (
                          <div className={`font-bold ${isMax ? "text-primary" : ""}`}>
                            {value}
                            {isMax && " (Max Incentive)"}
                            {row.otherTerritory > 0 && row.baixaSerraTerritory > 0 && (
                              <div className="text-xs font-normal text-muted-foreground">
                                Territories: {row.otherTerritory} in Outros, {row.baixaSerraTerritory} in Serra
                              </div>
                            )}
                          </div>
                        )
                      } else {
                        return <div className="ml-4">{row.companyName}</div>
                      }
                    },
                  },
                  {
                    header: "Size / Territory",
                    accessorKey: "size",
                    cell: (info) => {
                      const row = info.row.original as any

                      if (row.type === "scenario") {
                        return null
                      } else {
                        return (
                          <div>
                            <div>{row.size}</div>
                            <div className="flex items-center mt-1">
                              <div
                                className={`w-3 h-3 rounded-full mr-2 ${
                                  row.territory.includes("Serra") ? "bg-emerald-500" : "bg-blue-500"
                                }`}
                              ></div>
                              <span className="text-sm">{row.territory}</span>
                            </div>
                          </div>
                        )
                      }
                    },
                  },
                  {
                    header: "Investment",
                    accessorKey: "investmentValue",
                    cell: (info) => {
                      const value = info.getValue<number>()
                      const row = info.row.original as any
                      const isScenario = row.type === "scenario"

                      return <div className={isScenario ? "font-semibold" : ""}>{formatCurrency(value)}</div>
                    },
                  },
                  {
                    header: "Incentive",
                    accessorKey: "incentiveAmount",
                    cell: (info) => {
                      const value = info.getValue<number>()
                      const row = info.row.original as any
                      const isMax = row.isMaxIncentive
                      const isScenario = row.type === "scenario"

                      return (
                        <div
                          className={`${isScenario ? "font-semibold" : ""} ${isScenario && isMax ? "text-primary font-bold" : ""}`}
                        >
                          {formatCurrency(value)}
                          {isScenario && isMax && " (Max)"}
                        </div>
                      )
                    },
                  },
                  {
                    header: "Rate",
                    accessorKey: "incentiveRate",
                    cell: (info) => {
                      const value = info.getValue<number>()
                      const row = info.row.original as any
                      const isMax = row.isMaxIncentive
                      const isScenario = row.type === "scenario"

                      return (
                        <div
                          className={`${isScenario ? "font-semibold" : ""} ${isScenario && isMax ? "text-primary font-bold" : ""}`}
                        >
                          {formatPercentage(value)}
                        </div>
                      )
                    },
                  },
                ]}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

