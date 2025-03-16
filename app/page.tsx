import { IncentiveSimulator } from "@/components/incentive-simulator"

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Investment Incentive Simulator</h1>
      <p className="text-muted-foreground mb-6">Compare incentive scenarios for different company configurations</p>
      <IncentiveSimulator />
    </div>
  )
}

