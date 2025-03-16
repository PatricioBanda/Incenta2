import { v4 as uuidv4 } from "uuid"
import type { Scenario, SimulationResult, TimeSeriesPoint } from "./types"

// Simulates population growth based on scenario parameters
export async function runSimulation(scenario: Scenario): Promise<SimulationResult> {
  // Extract parameters
  const initialPopulation = scenario.parameters.population.value as number
  const growthRate = scenario.parameters.growthRate.value as number
  const volatility = scenario.parameters.volatility.value as number
  const enableRandomEvents = scenario.parameters.enableRandomEvents.value as boolean
  const iterations = scenario.parameters.iterations.value as number

  // Initialize time series data
  const timeSeriesData: TimeSeriesPoint[] = []

  // Start with initial population
  let currentPopulation = initialPopulation

  // Simulate for each iteration
  for (let i = 0; i < iterations; i++) {
    // Calculate base growth
    const baseGrowth = currentPopulation * growthRate

    // Add volatility (random variation)
    const randomFactor = 1 + (Math.random() * 2 - 1) * volatility
    const actualGrowth = baseGrowth * randomFactor

    // Handle random events if enabled
    let events = ""
    if (enableRandomEvents && Math.random() < 0.1) {
      // 10% chance of random event
      const eventType = Math.random()

      if (eventType < 0.3) {
        // Positive event (30% of events)
        const bonus = currentPopulation * 0.1 * Math.random()
        currentPopulation += bonus
        events = "Positive event: +10% boost"
      } else if (eventType < 0.7) {
        // Negative event (40% of events)
        const penalty = currentPopulation * 0.1 * Math.random()
        currentPopulation -= penalty
        events = "Negative event: -10% decline"
      } else {
        // Neutral event (30% of events)
        events = "Neutral event: no effect"
      }
    }

    // Update population
    currentPopulation += actualGrowth

    // Ensure population doesn't go negative
    currentPopulation = Math.max(0, currentPopulation)

    // Round to whole numbers for display
    currentPopulation = Math.round(currentPopulation)

    // Add data point
    timeSeriesData.push({
      population: currentPopulation,
      growth: actualGrowth / currentPopulation, // Growth rate for this iteration
      events,
    })

    // Add a small delay to simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 10))
  }

  // Return simulation result
  return {
    id: uuidv4(),
    scenarioId: scenario.id,
    timestamp: new Date().toISOString(),
    timeSeriesData,
  }
}

