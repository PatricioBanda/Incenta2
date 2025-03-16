"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { Territory } from "@/lib/types"
import { calculateIncentivesForTerritory } from "@/lib/incentive-calculator"

interface BubbleChartProps {
  data: any[]
  title?: string
}

// Array of colors for different scenarios
const COLORS = ["#2563eb", "#dc2626", "#16a34a", "#9333ea", "#ea580c", "#0891b2"]

export function BubbleChart({ data, title }: BubbleChartProps) {
  const [territory, setTerritory] = useState<Territory>(Territory.OTHER)
  const [showAlternative, setShowAlternative] = useState(true)

  // Transform data for the selected territory
  const transformedData = data
    .map((scenario, index) => {
      // Filter companies by territory
      const territoryCompanies = scenario.companies.filter((company: any) => company.territory === territory)

      // Calculate total investment and incentive for this territory
      const territoryInvestment = territoryCompanies.reduce(
        (sum: number, company: any) => sum + company.investmentValue,
        0,
      )

      const territoryIncentive = territoryCompanies.reduce(
        (sum: number, company: any) => sum + company.incentiveAmount,
        0,
      )

      // Calculate incentive rate
      const incentiveRate = territoryInvestment > 0 ? (territoryIncentive / territoryInvestment) * 100 : 0

      return {
        name: scenario.name,
        x: territoryInvestment,
        y: incentiveRate,
        z: territoryIncentive,
        color: COLORS[index % COLORS.length],
        companies: territoryCompanies.length,
        isOriginal: true,
      }
    })
    .filter((item) => item.companies > 0) // Only include scenarios that have companies in this territory

  // Generate "what if" data for the alternative territory
  const alternativeTerritory = territory === Territory.OTHER ? Territory.BAIXA_SERRA : Territory.OTHER
  const alternativeData = showAlternative
    ? data
        .map((scenario, index) => {
          // Get companies that are in the current territory
          const territoryCompanies = scenario.companies.filter((company: any) => company.territory === territory)

          // If no companies in this territory, don't show alternative
          if (territoryCompanies.length === 0) return null

          // Calculate what would happen if these companies were in the alternative territory
          const alternativeResults = calculateIncentivesForTerritory(territoryCompanies, alternativeTerritory)

          const alternativeInvestment = territoryCompanies.reduce(
            (sum: number, company: any) => sum + company.investmentValue,
            0,
          )

          const alternativeIncentive = alternativeResults.totalIncentive

          // Calculate incentive rate
          const incentiveRate = alternativeInvestment > 0 ? (alternativeIncentive / alternativeInvestment) * 100 : 0

          return {
            name: `${scenario.name} (in ${alternativeTerritory === Territory.OTHER ? "Outros" : "Serra"})`,
            x: alternativeInvestment,
            y: incentiveRate,
            z: alternativeIncentive,
            color: COLORS[index % COLORS.length],
            companies: territoryCompanies.length,
            isOriginal: false,
            originalName: scenario.name,
          }
        })
        .filter(Boolean)
    : [] // Remove null items and respect the toggle

  // Combine original and alternative data
  const combinedData = [...transformedData, ...alternativeData]

  // Custom tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">{data.name}</p>
          <p>Companies: {data.companies}</p>
          <p>Investment: {formatCurrency(data.x)}</p>
          <p>Incentive: {formatCurrency(data.z)}</p>
          <p>Rate: {formatPercentage(data.y)}</p>
          {!data.isOriginal && (
            <p className="text-muted-foreground text-xs mt-1">
              This is a simulation of what would happen if companies from "{data.originalName}" were in{" "}
              {alternativeTerritory === Territory.OTHER ? "Outros Territórios" : "Baixa e Serra de Estrella"}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const territoryLabel = territory === Territory.OTHER ? "Outros Territórios" : "Baixa e Serra de Estrella"

  const alternativeTerritoryLabel = territory === Territory.OTHER ? "Baixa e Serra de Estrella" : "Outros Territórios"

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "Scenario Comparison"}</CardTitle>
        <Tabs value={territory} onValueChange={(value) => setTerritory(value as Territory)} className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={Territory.OTHER}>Outros Territórios</TabsTrigger>
            <TabsTrigger value={Territory.BAIXA_SERRA}>Baixa e Serra de Estrella</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center space-x-2 mt-2">
          <Switch id="show-alternative" checked={showAlternative} onCheckedChange={setShowAlternative} />
          <Label htmlFor="show-alternative">
            Show simulated results in {alternativeTerritoryLabel} (what-if analysis)
          </Label>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="x"
                name="Investment"
                tickFormatter={formatCurrency}
                label={{ value: "Total Investment (€)", position: "bottom", offset: 0 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Incentive Rate"
                tickFormatter={(value) => `${value.toFixed(1)}%`}
                label={{ value: "Incentive Rate (%)", angle: -90, position: "left" }}
              />
              <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Incentive Amount" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {combinedData.map((entry, index) => (
                <Scatter
                  key={index}
                  name={entry.name}
                  data={[entry]}
                  fill={entry.color}
                  opacity={entry.isOriginal ? 1 : 0.6}
                  shape={entry.isOriginal ? "circle" : "diamond"}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center text-sm text-muted-foreground mt-4">
          <p>Bubble size represents total incentive amount</p>
          <p>Currently showing: {territoryLabel}</p>
          {showAlternative && <p>Diamonds represent simulated results in {alternativeTerritoryLabel}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

