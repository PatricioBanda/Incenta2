"use client"

import type React from "react"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CompanyForm } from "@/components/company-form"
import {
  type Scenario,
  type Company,
  CompanySize,
  Territory,
  IncentiveType,
} from "@/lib/types"
import { DEFAULT_PARAMETERS } from "@/lib/simulation-engine"

interface ScenarioCreatorProps {
  onAddScenario: (scenario: Scenario) => void
}

// Predefined scenario templates
const scenarioTemplates = [
  {
    name: "Single Large Company",
    companies: [
      {
        id: uuidv4(),
        name: "Transfor Indústria",
        size: CompanySize.LARGE,
        investmentValue: 7500000,
        territory: Territory.OTHER,
        incentiveTypes: [IncentiveType.IDI],
      },
    ],
    parameters: DEFAULT_PARAMETERS,
  },
  {
    name: "Multiple SMEs",
    companies: [
      {
        id: uuidv4(),
        name: "Modular",
        size: CompanySize.SME,
        investmentValue: 3700000,
        territory: Territory.OTHER,
        incentiveTypes: [IncentiveType.IDT, IncentiveType.IP],
      },
      {
        id: uuidv4(),
        name: "Carpintaria",
        size: CompanySize.SME,
        investmentValue: 1900000,
        territory: Territory.OTHER,
        incentiveTypes: [IncentiveType.IDT, IncentiveType.IP],
      },
      {
        id: uuidv4(),
        name: "Seralharia",
        size: CompanySize.SME,
        investmentValue: 1900000,
        territory: Territory.OTHER,
        incentiveTypes: [IncentiveType.IDT, IncentiveType.IP],
      },
    ],
    parameters: DEFAULT_PARAMETERS,
  },
]

export function ScenarioCreator({ onAddScenario }: ScenarioCreatorProps) {
  const [name, setName] = useState("")
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: uuidv4(),
      name: "",
      size: CompanySize.LARGE,
      investmentValue: 7500000,
      territory: Territory.OTHER,
      incentiveTypes: [IncentiveType.IDI],
    },
  ])

  const handleAddCompany = () => {
    setCompanies([
      ...companies,
      {
        id: uuidv4(),
        name: "",
        size: CompanySize.SME,
        investmentValue: 1900000,
        territory: Territory.OTHER,
        incentiveTypes: [IncentiveType.IDT, IncentiveType.IP],
      },
    ])
  }

  const handleRemoveCompany = (id: string) => {
    if (companies.length <= 1) return
    setCompanies(companies.filter((company) => company.id !== id))
  }

  const handleUpdateCompany = (id: string, updatedCompany: Company) => {
    setCompanies(companies.map((company) => (company.id === id ? updatedCompany : company)))
  }

  const applyTemplate = (templateIndex: number) => {
    const template = scenarioTemplates[templateIndex]
    setName(template.name)
    setCompanies(
      template.companies.map((company) => ({
        ...company,
        id: uuidv4(), // Generate new IDs to avoid conflicts
      })),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    const newScenario: Scenario = {
      id: uuidv4(),
      name,
      createdAt: new Date().toISOString(),
      companies,
      parameters: DEFAULT_PARAMETERS,
    }

    onAddScenario(newScenario)

    // Reset form
    setName("")
    setCompanies([
      {
        id: uuidv4(),
        name: "",
        size: CompanySize.LARGE,
        investmentValue: 7500000,
        territory: Territory.OTHER,
        incentiveTypes: [IncentiveType.IDI],
      },
    ])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Scenario</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="flex flex-wrap gap-2">
              {scenarioTemplates.map((template, idx) => (
                <Button key={idx} variant="outline" onClick={() => applyTemplate(idx)} type="button">
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Scenario Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter scenario name"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Companies</h3>
              <Button type="button" variant="outline" onClick={handleAddCompany}>
                Add Company
              </Button>
            </div>

            {companies.map((company, index) => (
              <CompanyForm
                key={company.id}
                company={company}
                onUpdate={(updatedCompany) => handleUpdateCompany(company.id, updatedCompany)}
                onRemove={() => handleRemoveCompany(company.id)}
                canRemove={companies.length > 1}
                index={index}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Create Scenario
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

