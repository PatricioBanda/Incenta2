"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { Territory } from "@/lib/types"
import { calculateIncentivesForTerritory } from "@/lib/incentive-calculator"
import { Switch } from "@/components/ui/switch"

interface QuadrantChartProps {
  data: any[]
  title?: string
  onTerritoryChange?: (showSerra: boolean) => void
}

// Array of colors for different scenarios
const COLORS = ["#2563eb", "#dc2626", "#16a34a", "#9333ea", "#ea580c", "#0891b2"]

export function QuadrantChart({ data, title, onTerritoryChange }: QuadrantChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [territoryValue, setTerritoryValue] = useState(100) // 0 = Outros only, 100 = Both territories

  // Derived state
  const showSerraTerritory = territoryValue > 0
  const showSimulation = true // Always show simulation now

  // Handle territory slider change
  const handleTerritoryChange = (value: number[]) => {
    setTerritoryValue(value[0])
    if (onTerritoryChange) {
      onTerritoryChange(value[0] > 0)
    }
  }

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with higher resolution for retina displays
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Calculate layout dimensions
    const padding = 40
    const chartWidth = rect.width - padding * 2
    const chartHeight = rect.height - padding * 2

    // If Serra territory is not shown, use full height for Outros
    const outrosHeight = showSerraTerritory ? chartHeight / 2 : chartHeight
    const serraHeight = showSerraTerritory ? chartHeight / 2 : 0

    // Draw territory divider if showing both territories
    if (showSerraTerritory) {
      const midY = padding + outrosHeight

      ctx.beginPath()
      ctx.moveTo(padding, midY)
      ctx.lineTo(rect.width - padding, midY)
      ctx.strokeStyle = "#e5e7eb" // Light gray
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Draw territory labels
    ctx.font = "bold 14px sans-serif"
    ctx.textAlign = "left"
    ctx.fillStyle = "#6b7280" // Gray

    // Outros territory label (left side, top)
    ctx.save()
    ctx.translate(padding - 25, padding + outrosHeight / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("Outros Territórios", 0, 0)
    ctx.restore()

    // Serra territory label (left side, bottom) if showing
    if (showSerraTerritory) {
      ctx.save()
      ctx.translate(padding - 25, padding + outrosHeight + serraHeight / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText("Baixa e Serra de Estrella", 0, 0)
      ctx.restore()
    }

    // Calculate max incentive for bubble sizing
    const allIncentives = data.flatMap((scenario) => {
      const outrosIncentive = calculateTerritoryIncentive(scenario, Territory.OTHER)
      const serraIncentive = showSerraTerritory ? calculateTerritoryIncentive(scenario, Territory.BAIXA_SERRA) : 0

      // If simulation is enabled, also include simulated incentives
      const simulatedOutros =
        showSimulation && showSerraTerritory
          ? calculateSimulatedIncentive(scenario, Territory.OTHER, Territory.BAIXA_SERRA)
          : 0
      const simulatedSerra = showSimulation
        ? calculateSimulatedIncentive(scenario, Territory.BAIXA_SERRA, Territory.OTHER)
        : 0

      return [outrosIncentive, serraIncentive, simulatedOutros, simulatedSerra].filter((v) => v > 0)
    })

    const maxIncentive = Math.max(...allIncentives, 1) // Avoid division by zero
    const minBubbleRadius = 20
    const maxBubbleRadius = 70

    // Draw bubbles for each scenario
    const scenarioWidth = chartWidth
    const scenarioSpacing = scenarioWidth / (data.length + 1)

    data.forEach((scenario, index) => {
      const color = COLORS[index % COLORS.length]
      const scenarioX = padding + scenarioSpacing * (index + 1)

      // Draw scenario label
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillStyle = "#000000"

      // Position scenario label based on whether Serra territory is shown
      const labelY = showSerraTerritory
        ? padding + outrosHeight + 20
        : // Middle if showing both
          rect.height - 20 // Bottom if only showing Outros

      ctx.fillText(scenario.name, scenarioX, labelY)

      // Calculate incentives for each territory
      const outrosIncentive = calculateTerritoryIncentive(scenario, Territory.OTHER)
      const serraIncentive = showSerraTerritory ? calculateTerritoryIncentive(scenario, Territory.BAIXA_SERRA) : 0

      // Draw bubble for Outros Territórios (top)
      if (outrosIncentive > 0) {
        const outrosRadius = minBubbleRadius + (maxBubbleRadius - minBubbleRadius) * (outrosIncentive / maxIncentive)
        const outrosY = padding + outrosHeight / 2
        drawBubble(ctx, scenarioX, outrosY, outrosRadius, color, 0.8)

        // Draw incentive value
        drawBubbleLabel(ctx, scenarioX, outrosY, formatCurrency(outrosIncentive))
      }

      // Draw bubble for Baixa e Serra (bottom) if showing
      if (showSerraTerritory && serraIncentive > 0) {
        const serraRadius = minBubbleRadius + (maxBubbleRadius - minBubbleRadius) * (serraIncentive / maxIncentive)
        const serraY = padding + outrosHeight + serraHeight / 2
        drawBubble(ctx, scenarioX, serraY, serraRadius, color, 0.8)

        // Draw incentive value
        drawBubbleLabel(ctx, scenarioX, serraY, formatCurrency(serraIncentive))
      }

      // Draw simulated bubbles if enabled
      if (showSimulation) {
        // Simulate Outros companies in Serra
        if (outrosIncentive > 0 && showSerraTerritory) {
          const simulatedSerra = calculateSimulatedIncentive(scenario, Territory.OTHER, Territory.BAIXA_SERRA)
          if (simulatedSerra > 0) {
            const simulatedRadius =
              minBubbleRadius + (maxBubbleRadius - minBubbleRadius) * (simulatedSerra / maxIncentive)
            const outrosY = padding + outrosHeight / 2
            const serraY = padding + outrosHeight + serraHeight / 2

            // Draw dashed line connecting original and simulated
            drawDashedLine(ctx, scenarioX, outrosY, scenarioX, serraY, color)

            // Draw simulated bubble (with lower opacity)
            drawBubble(ctx, scenarioX, serraY, simulatedRadius * 0.8, color, 0.4)

            // Draw incentive value
            drawBubbleLabel(ctx, scenarioX, serraY + simulatedRadius * 0.4, formatCurrency(simulatedSerra), true)
          }
        }

        // Simulate Serra companies in Outros
        if (serraIncentive > 0) {
          const simulatedOutros = calculateSimulatedIncentive(scenario, Territory.BAIXA_SERRA, Territory.OTHER)
          if (simulatedOutros > 0) {
            const simulatedRadius =
              minBubbleRadius + (maxBubbleRadius - minBubbleRadius) * (simulatedOutros / maxIncentive)
            const outrosY = padding + outrosHeight / 2
            const serraY = padding + outrosHeight + serraHeight / 2

            // Draw dashed line connecting original and simulated
            if (showSerraTerritory) {
              drawDashedLine(ctx, scenarioX, serraY, scenarioX, outrosY, color)
            }

            // Draw simulated bubble (with lower opacity)
            drawBubble(ctx, scenarioX, outrosY, simulatedRadius * 0.8, color, 0.4)

            // Draw incentive value
            drawBubbleLabel(ctx, scenarioX, outrosY + simulatedRadius * 0.4, formatCurrency(simulatedOutros), true)
          }
        }
      }
    })

    // Draw legend
    const legendX = rect.width - 150
    const legendY = 30
    ctx.font = "12px sans-serif"
    ctx.textAlign = "left"
    ctx.fillStyle = "#000000"

    data.forEach((scenario, index) => {
      const color = COLORS[index % COLORS.length]
      drawBubble(ctx, legendX, legendY + index * 25, 8, color, 0.8)
      ctx.fillStyle = "#000000"
      ctx.fillText(scenario.name, legendX + 20, legendY + index * 25 + 4)
    })

    // Draw simulation legend
    const simLegendY = legendY + (data.length + 1) * 25
    drawBubble(ctx, legendX, simLegendY, 8, "#6b7280", 0.4)
    ctx.fillStyle = "#000000"
    ctx.fillText("Simulated (what-if)", legendX + 20, simLegendY + 4)
  }, [data, showSerraTerritory, showSimulation])

  // Helper function to calculate total incentive for a scenario in a specific territory
  const calculateTerritoryIncentive = (scenario: any, territory: Territory): number => {
    // Filter companies by territory
    const territoryCompanies = scenario.companies.filter((company: any) => company.territory === territory)

    // If no companies in this territory, return 0
    if (territoryCompanies.length === 0) return 0

    // Sum incentives for this territory
    return territoryCompanies.reduce((sum: number, company: any) => sum + company.incentiveAmount, 0)
  }

  // Helper function to calculate simulated incentive if companies were in a different territory
  const calculateSimulatedIncentive = (scenario: any, fromTerritory: Territory, toTerritory: Territory): number => {
    // Filter companies by original territory
    const territoryCompanies = scenario.companies.filter((company: any) => company.territory === fromTerritory)

    // If no companies in this territory, return 0
    if (territoryCompanies.length === 0) return 0

    // Calculate what the incentive would be in the target territory
    const simulatedResults = calculateIncentivesForTerritory(territoryCompanies, toTerritory)
    return simulatedResults.totalIncentive
  }

  // Helper function to draw a bubble
  const drawBubble = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
    alpha = 1,
  ) => {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.globalAlpha = alpha
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Helper function to draw a dashed line
  const drawDashedLine = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
  ) => {
    ctx.beginPath()
    ctx.setLineDash([5, 5])
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = color
    ctx.globalAlpha = 0.5
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1
  }

  // Helper function to draw text in a bubble
  const drawBubbleLabel = (ctx: CanvasRenderingContext2D, x: number, y: number, text: string, isSimulated = false) => {
    ctx.font = isSimulated ? "italic 12px sans-serif" : "12px sans-serif"
    ctx.textAlign = "center"
    ctx.fillStyle = "#ffffff"

    // Add a semi-transparent background for better readability
    const textWidth = ctx.measureText(text).width
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(x - textWidth / 2 - 4, y - 8, textWidth + 8, 16)

    ctx.fillStyle = "#ffffff"
    ctx.fillText(text, x, y + 4)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title || "Scenario Comparison by Territory"}</CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              id="territory-toggle"
              checked={showSerraTerritory}
              onCheckedChange={(checked) => {
                setTerritoryValue(checked ? 100 : 0)
                if (onTerritoryChange) onTerritoryChange(checked)
              }}
            />
            <Label htmlFor="territory-toggle" className="text-sm">
              Show Baixa e Serra de Estrella
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full relative">
          <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
        </div>
        <div className="text-center text-sm text-muted-foreground mt-4">
          <p>Bubble size represents total incentive amount in each territory</p>
          <p>Lighter bubbles show simulated results if companies were in the other territory</p>
        </div>
      </CardContent>
    </Card>
  )
}

