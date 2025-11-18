import { useCalculatorStore } from '@/store/calculatorStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { LeverageCalculator } from '@/components/calculators/LeverageCalculator';
import { PositionSizeCalculator } from '@/components/calculators/PositionSizeCalculator';
import { RiskRewardCalculator } from '@/components/calculators/RiskRewardCalculator';

export default function CalculatorsPage() {
  const { activeTab, setActiveTab } = useCalculatorStore();

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Trading Calculators</h1>
          <p className="text-gray-400 mt-1">Essential tools for risk management</p>
        </div>

        <div>
          <Card>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
                  <TabsTrigger value="leverage">Leverage</TabsTrigger>
                  <TabsTrigger value="position">Position Size</TabsTrigger>
                  <TabsTrigger value="risk">Risk/Reward</TabsTrigger>
                </TabsList>

                <TabsContent value="leverage" className="space-y-4 mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Leverage Calculator</h3>
                    <p className="text-sm text-gray-400">Calculate P/L for leveraged positions</p>
                  </div>
                  <LeverageCalculator />
                </TabsContent>

                <TabsContent value="position" className="space-y-4 mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Position Size Calculator</h3>
                    <p className="text-sm text-gray-400">
                      Determine optimal position size based on risk tolerance
                    </p>
                  </div>
                  <PositionSizeCalculator />
                </TabsContent>

                <TabsContent value="risk" className="space-y-4 mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Risk/Reward Calculator</h3>
                    <p className="text-sm text-gray-400">Calculate risk-to-reward ratio for your trades</p>
                  </div>
                  <RiskRewardCalculator />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
    </div>
  )
}