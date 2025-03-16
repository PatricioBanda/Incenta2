import { type Scenario, type Company, CompanySize, Territory, IncentiveType } from "./types"

// Incentive rates based on company size, territory, and incentive type
const incentiveRates = {
  // IDI - Investigação e Desenvolvimento Industrial
  [IncentiveType.IDI]: {
    [CompanySize.LARGE]: {
      [Territory.OTHER]: { baseRate: 37.5, improvements: 15, total: 52.5 },
      [Territory.BAIXA_SERRA]: { baseRate: 37.5, improvements: 15, total: 52.5 },
    },
    [CompanySize.SMALL_MIDCAP]: {
      [Territory.OTHER]: { baseRate: 25, improvements: 15, total: 40 },
      [Territory.BAIXA_SERRA]: { baseRate: 25, improvements: 15, total: 40 },
    },
    [CompanySize.SME]: {
      [Territory.OTHER]: { baseRate: 15, improvements: 15, total: 30 },
      [Territory.BAIXA_SERRA]: { baseRate: 25, improvements: 15, total: 40 },
    },
  },

  // IDT - Investigação e Desenvolvimento Tecnológico
  [IncentiveType.IDT]: {
    [CompanySize.LARGE]: {
      [Territory.OTHER]: { baseRate: 37.5, improvements: 35, total: 72.5 },
      [Territory.BAIXA_SERRA]: { baseRate: 37.5, improvements: 35, total: 72.5 },
    },
    [CompanySize.SMALL_MIDCAP]: {
      [Territory.OTHER]: { baseRate: 37.5, improvements: 35, total: 72.5 },
      [Territory.BAIXA_SERRA]: { baseRate: 37.5, improvements: 35, total: 72.5 },
    },
    [CompanySize.SME]: {
      [Territory.OTHER]: { baseRate: 37.5, improvements: 35, total: 72.5 },
      [Territory.BAIXA_SERRA]: { baseRate: 37.5, improvements: 35, total: 72.5 },
    },
  },

  // IP - Inovação Produtiva
  [IncentiveType.IP]: {
    [CompanySize.LARGE]: {
      [Territory.OTHER]: { baseRate: 35, improvements: 15, total: 50 },
      [Territory.BAIXA_SERRA]: { baseRate: 45, improvements: 15, total: 60 },
    },
    [CompanySize.SMALL_MIDCAP]: {
      [Territory.OTHER]: { baseRate: 35, improvements: 15, total: 50 },
      [Territory.BAIXA_SERRA]: { baseRate: 45, improvements: 15, total: 60 },
    },
    [CompanySize.SME]: {
      [Territory.OTHER]: { baseRate: 35, improvements: 15, total: 50 },
      [Territory.BAIXA_SERRA]: { baseRate: 45, improvements: 15, total: 60 },
    },
  },

  // DC - Desenvolvimento de Competências
  [IncentiveType.DC]: {
    [CompanySize.LARGE]: {
      [Territory.OTHER]: { baseRate: 30, improvements: 10, total: 40 },
      [Territory.BAIXA_SERRA]: { baseRate: 35, improvements: 10, total: 45 },
    },
    [CompanySize.SMALL_MIDCAP]: {
      [Territory.OTHER]: { baseRate: 35, improvements: 10, total: 45 },
      [Territory.BAIXA_SERRA]: { baseRate: 40, improvements: 10, total: 50 },
    },
    [CompanySize.SME]: {
      [Territory.OTHER]: { baseRate: 40, improvements: 10, total: 50 },
      [Territory.BAIXA_SERRA]: { baseRate: 45, improvements: 10, total: 55 },
    },
  },

  // i4.0 - Indústria 4.0
  [IncentiveType.I40]: {
    [CompanySize.LARGE]: {
      [Territory.OTHER]: { baseRate: 25, improvements: 10, total: 35 },
      [Territory.BAIXA_SERRA]: { baseRate: 30, improvements: 10, total: 40 },
    },
    [CompanySize.SMALL_MIDCAP]: {
      [Territory.OTHER]: { baseRate: 30, improvements: 10, total: 40 },
      [Territory.BAIXA_SERRA]: { baseRate: 35, improvements: 10, total: 45 },
    },
    [CompanySize.SME]: {
      [Territory.OTHER]: { baseRate: 35, improvements: 10, total: 45 },
      [Territory.BAIXA_SERRA]: { baseRate: 40, improvements: 10, total: 50 },
    },
  },
}

// Calculate incentive for a single company
function calculateCompanyIncentive(company: Company): number {
  let totalIncentive = 0

  // For each incentive type selected
  company.incentiveTypes.forEach((incentiveType) => {
    if (
      incentiveRates[incentiveType] &&
      incentiveRates[incentiveType][company.size] &&
      incentiveRates[incentiveType][company.size][company.territory]
    ) {
      const rate = incentiveRates[incentiveType][company.size][company.territory].total

      // Calculate incentive amount based on rate
      const incentiveAmount = company.investmentValue * (rate / 100)
      totalIncentive += incentiveAmount
    }
  })

  return totalIncentive
}

// Calculate incentive for a company in a specific territory (for what-if analysis)
export function calculateCompanyIncentiveForTerritory(company: Company, territory: Territory): number {
  let totalIncentive = 0

  // For each incentive type selected
  company.incentiveTypes.forEach((incentiveType) => {
    if (
      incentiveRates[incentiveType] &&
      incentiveRates[incentiveType][company.size] &&
      incentiveRates[incentiveType][company.size][territory]
    ) {
      const rate = incentiveRates[incentiveType][company.size][territory].total

      // Calculate incentive amount based on rate
      const incentiveAmount = company.investmentValue * (rate / 100)
      totalIncentive += incentiveAmount
    }
  })

  return totalIncentive
}

// Calculate incentives for all companies in a scenario
export function calculateIncentives(scenario: Scenario) {
  const companyIncentives = scenario.companies.map((company) => calculateCompanyIncentive(company))

  const totalIncentive = companyIncentives.reduce((sum, incentive) => sum + incentive, 0)

  return {
    companyIncentives,
    totalIncentive,
  }
}

// Calculate incentives for a set of companies in a specific territory (for what-if analysis)
export function calculateIncentivesForTerritory(companies: Company[], territory: Territory) {
  const companyIncentives = companies.map((company) => calculateCompanyIncentiveForTerritory(company, territory))

  const totalIncentive = companyIncentives.reduce((sum, incentive) => sum + incentive, 0)

  return {
    companyIncentives,
    totalIncentive,
  }
}

