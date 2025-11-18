import React, { useState, useMemo } from 'react';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { NumberInput } from '@/components/ui/NumberInput';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';

const formatDisplay = (value: number | undefined, decimals = 2) => {
  if (value === undefined || isNaN(value) || !isFinite(value)) return '-'
  const priceDecimals = Math.abs(value) >= 1 ? 2 : 5
  const finalDecimals = decimals === -1 ? priceDecimals : decimals;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: finalDecimals,
    maximumFractionDigits: finalDecimals,
  }).format(value);
}

const TAKE_PROFIT_RATIOS = [
  { label: '1:1 R:R', value: 1 },
  { label: '1:2 R:R', value: 2 },
  { label: '1:3 R:R', value: 3 },
  { label: '1:5 R:R', value: 5 },
];

const LEVERAGE_PRESETS = ['10', '20', '30', '50', '100'];
const TP_PRESETS = ['20', '30', '50', '80'];

export function RiskRewardCalculator() {
  const [marginMode, setMarginMode] = useState<'isolated' | 'cross'>('isolated');

  // Shared
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [positionType, setPositionType] = useState<'long' | 'short'>('long');
  const [stopLossPrice, setStopLossPrice] = useState<string>('');
  const [leverage, setLeverage] = useState<string>('20');
  const [leverageSelection, setLeverageSelection] = useState<string>('20');
  const [tpPercentage, setTpPercentage] = useState<string>('');
  const [tpSelection, setTpSelection] = useState<string>('custom');
  
  // Isolated State
  const [iso_capital, setIsoCapital] = useState<string>('');
  const [iso_riskPercentage, setIsoRiskPercentage] = useState<string>('');
  const [iso_riskAmount, setIsoRiskAmount] = useState<string>('');

  // Cross State
  const [cross_accountCapital, setCrossAccountCapital] = useState<string>('');
  const [cross_tradeCapitalPercent, setCrossTradeCapitalPercent] = useState<string>('');

  const handleLeverageChange = (value: string) => {
    setLeverageSelection(value);
    setLeverage(value === 'custom' ? '' : value);
  };
  
  const handleTpChange = (value: string) => {
    setTpSelection(value);
    setTpPercentage(value === 'custom' ? '' : value);
  };

  // Isolated Handlers
  const handleIsoRiskPercentChange = (value: string) => {
    setIsoRiskPercentage(value);
    if (value && iso_capital) {
      const newRiskAmount = (parseFloat(value) / 100) * parseFloat(iso_capital);
      setIsoRiskAmount(newRiskAmount.toFixed(2));
    }
  }
  const handleIsoRiskAmountChange = (value: string) => {
    setIsoRiskAmount(value);
    if (value && iso_capital) {
      const newRiskPercent = (parseFloat(value) / parseFloat(iso_capital)) * 100;
      setIsoRiskPercentage(newRiskPercent.toFixed(2));
    }
  }
  const handleIsoCapitalChange = (value: string) => {
    setIsoCapital(value);
    if (value && iso_riskPercentage) {
      const newRiskAmount = (parseFloat(iso_riskPercentage) / 100) * parseFloat(value);
      setIsoRiskAmount(newRiskAmount.toFixed(2));
    }
  }

  const results = useMemo(() => {
    const numEntry = parseFloat(entryPrice || '0');
    const numLeverage = parseFloat(leverage || '0');
    const numStopLoss = parseFloat(stopLossPrice || '0');

    if (!numEntry || !numLeverage) {
      return { error: 'Please fill all required fields.' };
    }

    let margin = 0;
    let potentialLoss = 0;
    let liquidationPrice = 0;
    let fullAccountLiqPrice = 0;

    if (marginMode === 'isolated') {
      const numRiskAmount = parseFloat(iso_riskAmount || '0');
      if (!numRiskAmount) return { error: 'Please fill all required fields.' };
      margin = numRiskAmount;
      liquidationPrice = positionType === 'long' ? numEntry * (1 - 1 / numLeverage) : numEntry * (1 + 1 / numLeverage);
    } else { // Cross Margin
      const numAccountCapital = parseFloat(cross_accountCapital || '0');
      const numTradePercent = parseFloat(cross_tradeCapitalPercent || '0');
      if (!numAccountCapital || !numTradePercent) return { error: 'Please fill all required fields.' };
      margin = numAccountCapital * (numTradePercent / 100);
      const positionValue = margin * numLeverage;
      if (positionValue === 0) return { error: 'Cannot calculate with zero position value.' };
      const priceMovePercent = numAccountCapital / positionValue;
      fullAccountLiqPrice = positionType === 'long' ? numEntry * (1 - priceMovePercent) : numEntry * (1 + priceMovePercent);
      // In cross-margin, the isolated liq price is technically irrelevant, but we can show it for context
      liquidationPrice = positionType === 'long' ? numEntry * (1 - 1 / numLeverage) : numEntry * (1 + 1 / numLeverage);
    }

    const positionValue = margin * numLeverage;
    const positionSizeInCoins = positionValue / numEntry;
    const actualStopLoss = numStopLoss > 0 ? numStopLoss : (positionType === 'long' ? numEntry - (margin / positionSizeInCoins) : numEntry + (margin / positionSizeInCoins));
    const stopDistance = Math.abs(numEntry - actualStopLoss);
    potentialLoss = stopDistance * positionSizeInCoins;

    const effectiveLiqPrice = marginMode === 'cross' ? fullAccountLiqPrice : liquidationPrice;

    let safetyZone: 'Safe' | 'Caution' | 'Danger' = 'Safe';
    if ((positionType === 'long' && actualStopLoss <= effectiveLiqPrice) || (positionType === 'short' && actualStopLoss >= effectiveLiqPrice)) {
        safetyZone = 'Danger';
    } else {
        const liquidationBuffer = Math.abs(actualStopLoss - effectiveLiqPrice) / numEntry * 100;
        if (liquidationBuffer <= 1.5) safetyZone = 'Caution';
    }

    let recommendations: string[] = [];
    if (safetyZone === 'Danger' || safetyZone === 'Caution') {
        recommendations.push(`Reduce leverage (e.g., to ${numLeverage > 1 ? Math.floor(numLeverage/2) : numLeverage}x) to increase liquidation buffer.`);
        const bufferPercent = 1.0;
        if (positionType === 'long') {
            const minSafeStop = effectiveLiqPrice * (1 + bufferPercent / 100);
            recommendations.push(`Move stop-loss HIGHER to ~${formatDisplay(minSafeStop, -1)} for a safer buffer.`);
        } else {
            const minSafeStop = effectiveLiqPrice * (1 - bufferPercent / 100);
            recommendations.push(`Move stop-loss LOWER to ~${formatDisplay(minSafeStop, -1)} for a safer buffer.`);
        }
        recommendations.push('Reduce your margin size.');
    }

    const takeProfits = TAKE_PROFIT_RATIOS.map(tp => {
      const profitAmount = potentialLoss * tp.value;
      const rewardDistance = stopDistance * tp.value;
      const exitPrice = positionType === 'long' ? numEntry + rewardDistance : numEntry - rewardDistance;
      const roe = margin > 0 ? (profitAmount / margin) * 100 : 0;
      return { ...tp, exitPrice, profitAmount, roe };
    });

    let customTakeProfit = null;
    const numTpPercentage = parseFloat(tpPercentage || '0');
    if (numTpPercentage > 0 && margin > 0 && positionSizeInCoins > 0) {
        const profitAmount = margin * (numTpPercentage / 100);
        const profitPerCoin = profitAmount / positionSizeInCoins;
        const exitPrice = positionType === 'long' ? numEntry + profitPerCoin : numEntry - profitPerCoin;
        customTakeProfit = { exitPrice, profitAmount, roe: numTpPercentage };
    }

    return {
      margin,
      positionValue,
      stopLossPrice: actualStopLoss,
      potentialLoss,
      liquidationPrice, // Isolated liq price
      fullAccountLiqPrice,
      safetyZone,
      recommendations,
      takeProfits,
      customTakeProfit,
    };
  }, [entryPrice, leverage, stopLossPrice, positionType, marginMode, iso_capital, iso_riskPercentage, iso_riskAmount, cross_accountCapital, cross_tradeCapitalPercent, tpPercentage]);

  return (
    <div className="grid grid-cols-1 gap-6 xl:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Advanced Risk/Reward Calculator</CardTitle>
          <Tabs value={marginMode} onValueChange={(value) => setMarginMode(value as any)} className="w-full pt-2">
            <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="isolated">Isolated</TabsTrigger><TabsTrigger value="cross">Cross</TabsTrigger></TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {marginMode === 'isolated' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="iso_capital">Total Capital</Label>
                <NumberInput id="iso_capital" value={iso_capital} onValueChange={handleIsoCapitalChange} placeholder="e.g., 1000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iso_risk_percent">Risk %</Label>
                <NumberInput id="iso_risk_percent" value={iso_riskPercentage} onValueChange={handleIsoRiskPercentChange} placeholder="e.g., 2" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="iso_risk_amount">Risk Amount ($)</Label>
                <NumberInput id="iso_risk_amount" value={iso_riskAmount} onValueChange={handleIsoRiskAmountChange} placeholder="e.g., 20" />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="cross_acct_capital">Account Capital</Label>
                <NumberInput id="cross_acct_capital" value={cross_accountCapital} onValueChange={setCrossAccountCapital} placeholder="e.g., 1000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cross_trade_percent">Trade Capital %</Label>
                <NumberInput id="cross_trade_percent" value={cross_tradeCapitalPercent} onValueChange={setCrossTradeCapitalPercent} placeholder="e.g., 50" />
              </div>
            </>
          )}

          {/* Shared Fields */}
          <div className="space-y-2">
            <Label htmlFor="entry">Entry Price</Label>
            <NumberInput id="entry" value={entryPrice} onValueChange={setEntryPrice} placeholder="e.g., 50000.75" />
          </div>
          <div className="space-y-2">
              <Label>Stop-Loss Price (Optional)</Label>
              <NumberInput value={stopLossPrice} onValueChange={setStopLossPrice} placeholder="e.g., 49500" />
          </div>
           <div className="space-y-2">
            <Label>Leverage</Label>
            <Select value={leverageSelection} onValueChange={handleLeverageChange}>
                {LEVERAGE_PRESETS.map(p => <option key={p} value={p}>{p}x</option>)}
                <option value="custom">Custom</option>
            </Select>
            {leverageSelection === 'custom' && <NumberInput value={leverage} onValueChange={setLeverage} placeholder="e.g., 75" className="mt-2"/>}
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <Select value={positionType} onValueChange={(v: string) => setPositionType(v as 'long' | 'short')}>
                <option value="long">Long</option>
                <option value="short">Short</option>
            </Select>
          </div>
          <div className="space-y-2 col-span-1 sm:col-span-2">
            <Label>Custom Take Profit (ROE %)</Label>
             <Select value={tpSelection} onValueChange={handleTpChange}>
                {TP_PRESETS.map(p => <option key={p} value={p}>{p}%</option>)}
                <option value="custom">Custom</option>
            </Select>
            {tpSelection === 'custom' && <NumberInput value={tpPercentage} onValueChange={setTpPercentage} placeholder="e.g., 150%" className="mt-2"/>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Calculated Results</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {results.error || !entryPrice ? (
            <div className="text-center text-gray-400 p-4 h-full flex items-center justify-center">{results.error || 'Please enter trade details to see results.'}</div>
          ) : (
            <>
              <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700 space-y-2">
                 <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Margin Used</span>
                  <span className="font-mono text-amber-500">${formatDisplay(results.margin)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Position Size</span>
                    <span className="font-mono text-cyan-400">${formatDisplay(results.positionValue)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Stop-Loss Price</span>
                  <span className="font-mono text-red-500">{formatDisplay(results.stopLossPrice, -1)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Potential Loss at SL</span>
                  <span className="font-mono text-red-500">${formatDisplay(results.potentialLoss)}</span>
                </div>
                {marginMode === 'isolated' ? (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Isolated Liq. Price</span>
                    <span className="font-mono text-gray-500">~ {formatDisplay(results.liquidationPrice, -1)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Full Account Liq. Price</span>
                    <span className="font-mono text-red-700 font-bold">~ {formatDisplay(results.fullAccountLiqPrice, -1)}</span>
                  </div>
                )}
              </div>
              
              <div className={`p-4 rounded-lg bg-gray-900/50 border ${results.safetyZone === 'Danger' ? 'border-red-500/50' : results.safetyZone === 'Caution' ? 'border-yellow-500/50' : 'border-green-500/50'}`}>
                  <h4 className="text-sm font-semibold mb-2 flex items-center">
                      <span className={`mr-2 h-2 w-2 rounded-full ${results.safetyZone === 'Danger' ? 'bg-red-500' : results.safetyZone === 'Caution' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                      Safety Analysis: {results.safetyZone}
                  </h4>
                  {results.recommendations && results.recommendations.length > 0 && (
                      <ul className="text-xs text-gray-400 list-disc pl-4 space-y-1">
                          {results.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                      </ul>
                  )}
              </div>

              {results.customTakeProfit && (
                  <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700 space-y-2">
                      <h4 className="text-sm font-semibold text-gray-400">Custom Take Profit Target</h4>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Target ROE</span>
                          <span className="font-mono text-green-400">{formatDisplay(results.customTakeProfit.roe)}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Exit Price</span>
                          <span className="font-mono text-green-400">{formatDisplay(results.customTakeProfit.exitPrice, -1)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Profit</span>
                          <span className="font-mono text-green-400">${formatDisplay(results.customTakeProfit.profitAmount)}</span>
                      </div>
                  </div>
              )}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-400">Take Profit Targets (by R:R)</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-4 items-center font-bold px-2 py-1">
                    <span>R:R</span>
                    <span className="text-center">Price</span>
                    <span className="text-center">Profit</span>
                    <span className="text-right">ROE %</span>
                  </div>
                  {results.takeProfits && results.takeProfits?.map((tp) => (
                    <div key={tp.label} className="grid grid-cols-4 items-center p-2 rounded-md bg-gray-900/50">
                      <span className="font-mono text-sky-400">{tp.label}</span>
                      <span className="font-mono text-center text-green-400">{formatDisplay(tp.exitPrice, -1)}</span>
                      <span className="font-mono text-center text-green-400">${formatDisplay(tp.profitAmount)}</span>
                      <span className="font-mono text-right text-green-400">+{formatDisplay(tp.roe)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}