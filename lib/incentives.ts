import type { Company, Territory } from "./types"
import { calculateCompanyIncentiveForTerritory } from "./incentive-calculator"

// Calculate incentives for a set of companies in a specific territory (for what-if analysis)
export function calculateIncentivesForTerritory(companies: Company[], territory: Territory) {
  const companyIncentives = companies.map((company) => calculateCompanyIncentiveForTerritory(company, territory))

  const totalIncentive = companyIncentives.reduce((sum, incentive) => sum + incentive, 0)

  return {
    companyIncentives,
    totalIncentive,
  }
}

