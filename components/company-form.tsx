"use client"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { type Company, CompanySize, Territory, IncentiveType } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface CompanyFormProps {
  company: Company
  onUpdate: (company: Company) => void
  onRemove: () => void
  canRemove: boolean
  index: number
}

const companySizeOptions = [
  { value: CompanySize.SME, label: "PME (Small/Medium Enterprise)" },
  { value: CompanySize.SMALL_MIDCAP, label: "Small MidCap" },
  { value: CompanySize.LARGE, label: "Grande Empresa (Large Company)" },
]

const territoryOptions = [
  { value: Territory.OTHER, label: "Outros Territórios" },
  { value: Territory.BAIXA_SERRA, label: "Baixa e Serra de Estrella" },
]

const incentiveTypeOptions = [
  { value: IncentiveType.IDI, label: "IDI - Investigação e Desenvolvimento Industrial" },
  { value: IncentiveType.IDT, label: "IDT - Investigação e Desenvolvimento Tecnológico" },
  { value: IncentiveType.IP, label: "IP - Inovação Produtiva" },
  { value: IncentiveType.DC, label: "DC - Desenvolvimento de Competências" },
  { value: IncentiveType.I40, label: "i4.0 - Indústria 4.0" },
]

// Predefined company templates
const companyTemplates = [
  {
    name: "Transfor Indústria",
    size: CompanySize.LARGE,
    investmentValue: 7500000,
    incentiveTypes: [IncentiveType.IDI],
  },
  {
    name: "Modular",
    size: CompanySize.SME,
    investmentValue: 3700000,
    incentiveTypes: [IncentiveType.IDT, IncentiveType.IP],
  },
  {
    name: "Carpintaria",
    size: CompanySize.SME,
    investmentValue: 1900000,
    incentiveTypes: [IncentiveType.IDT, IncentiveType.IP],
  },
  {
    name: "Seralharia",
    size: CompanySize.SME,
    investmentValue: 1900000,
    incentiveTypes: [IncentiveType.IDT, IncentiveType.IP],
  },
]

export function CompanyForm({ company, onUpdate, onRemove, canRemove, index }: CompanyFormProps) {
  const handleChange = (field: keyof Company, value: any) => {
    onUpdate({
      ...company,
      [field]: value,
    })
  }

  const toggleIncentiveType = (type: IncentiveType) => {
    const currentTypes = [...company.incentiveTypes]

    if (currentTypes.includes(type)) {
      handleChange(
        "incentiveTypes",
        currentTypes.filter((t) => t !== type),
      )
    } else {
      handleChange("incentiveTypes", [...currentTypes, type])
    }
  }

  const applyTemplate = (templateIndex: number) => {
    const template = companyTemplates[templateIndex]
    onUpdate({
      ...company,
      name: template.name,
      size: template.size,
      investmentValue: template.investmentValue,
      incentiveTypes: [...template.incentiveTypes],
    })
  }

  // Set default company name based on index if not provided
  const displayName = company.name || `Company ${index + 1}`

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">{displayName}</h4>
          {canRemove && (
            <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label>Quick Templates</Label>
          <div className="flex flex-wrap gap-2">
            {companyTemplates.map((template, idx) => (
              <Button key={idx} variant="outline" size="sm" onClick={() => applyTemplate(idx)}>
                {template.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`company-name-${company.id}`}>Company Name</Label>
          <Input
            id={`company-name-${company.id}`}
            value={company.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder={`Company ${index + 1}`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`company-size-${company.id}`}>Company Size</Label>
          <Select value={company.size} onValueChange={(value) => handleChange("size", value)}>
            <SelectTrigger id={`company-size-${company.id}`}>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              {companySizeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`company-territory-${company.id}`}>Territory</Label>
          <Select value={company.territory} onValueChange={(value) => handleChange("territory", value as Territory)}>
            <SelectTrigger id={`company-territory-${company.id}`}>
              <SelectValue placeholder="Select territory" />
            </SelectTrigger>
            <SelectContent>
              {territoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`company-investment-${company.id}`}>Investment Value (€)</Label>
          <Input
            id={`company-investment-${company.id}`}
            type="number"
            min="0"
            step="100000"
            value={company.investmentValue}
            onChange={(e) => handleChange("investmentValue", Number(e.target.value))}
          />
          <p className="text-sm text-muted-foreground">{formatCurrency(company.investmentValue)}</p>
        </div>

        <div className="space-y-2">
          <Label>Incentive Types</Label>
          <div className="space-y-2">
            {incentiveTypeOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`incentive-${option.value}-${company.id}`}
                  checked={company.incentiveTypes.includes(option.value)}
                  onCheckedChange={() => toggleIncentiveType(option.value)}
                />
                <Label htmlFor={`incentive-${option.value}-${company.id}`} className="font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

