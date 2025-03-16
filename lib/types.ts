export enum CompanySize {
  SME = "SME",
  SMALL_MIDCAP = "SMALL_MIDCAP",
  LARGE = "LARGE",
}

export enum Territory {
  OTHER = "OTHER",
  BAIXA_SERRA = "BAIXA_SERRA",
}

export enum IncentiveType {
  IDI = "IDI",
  IDT = "IDT",
  IP = "IP",
  DC = "DC",
  I40 = "I40",
}

export interface Company {
  id: string
  name: string
  size: CompanySize
  investmentValue: number
  territory: Territory
  incentiveTypes: IncentiveType[]
}

export interface Scenario {
  id: string
  name: string
  createdAt: string
  companies: Company[]
}

export interface TimeSeriesPoint {
  population: number
  growth: number
  events: string
}

export interface SimulationResult {
  id: string
  scenarioId: string
  timestamp: string
  timeSeriesData: TimeSeriesPoint[]
}

