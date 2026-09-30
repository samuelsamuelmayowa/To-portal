export function calculateSMA(bars, period = 20) {
  if (!Number.isInteger(period) || period < 1) return [];
  const output = [];
  let sum = 0;
  for (let index = 0; index < bars.length; index += 1) {
    sum += bars[index].close;
    if (index >= period) sum -= bars[index - period].close;
    if (index >= period - 1) output.push({ time: bars[index].time, value: sum / period });
  }
  return output;
}

export function calculateEMA(bars, period = 9) {
  if (!Number.isInteger(period) || period < 1 || bars.length < period) return [];
  const multiplier = 2 / (period + 1);
  let ema = bars.slice(0, period).reduce((sum, bar) => sum + bar.close, 0) / period;
  const result = [{ time: bars[period - 1].time, value: ema }];
  for (let index = period; index < bars.length; index += 1) {
    ema = (bars[index].close - ema) * multiplier + ema;
    result.push({ time: bars[index].time, value: ema });
  }
  return result;
}

const newYorkDate = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" });
export function calculateVWAP(bars, sessionKey = (bar) => newYorkDate.format(new Date(bar.time))) {
  let key = null; let totalPriceVolume = 0; let totalVolume = 0;
  return bars.map((bar) => {
    const nextKey = sessionKey(bar);
    if (key !== nextKey) { key = nextKey; totalPriceVolume = 0; totalVolume = 0; }
    const volume = Math.max(0, Number(bar.volume) || 0);
    totalPriceVolume += ((bar.high + bar.low + bar.close) / 3) * volume;
    totalVolume += volume;
    return totalVolume ? { time: bar.time, value: totalPriceVolume / totalVolume } : null;
  }).filter(Boolean);
}

export function calculateRSI(bars, period = 14) {
  if (!Number.isInteger(period) || period < 1 || bars.length <= period) return [];
  let gains = 0; let losses = 0;
  for (let i = 1; i <= period; i += 1) {
    const delta = bars[i].close - bars[i - 1].close;
    gains += Math.max(delta, 0); losses += Math.max(-delta, 0);
  }
  let averageGain = gains / period; let averageLoss = losses / period;
  const value = () => averageLoss === 0 ? 100 : 100 - (100 / (1 + averageGain / averageLoss));
  const result = [{ time: bars[period].time, value: value() }];
  for (let i = period + 1; i < bars.length; i += 1) {
    const delta = bars[i].close - bars[i - 1].close;
    averageGain = (averageGain * (period - 1) + Math.max(delta, 0)) / period;
    averageLoss = (averageLoss * (period - 1) + Math.max(-delta, 0)) / period;
    result.push({ time: bars[i].time, value: value() });
  }
  return result;
}

export function calculateIndicators(bars, enabled) {
  const output = {};
  if (enabled.ema9) output.ema9 = calculateEMA(bars, 9);
  if (enabled.ema20) output.ema20 = calculateEMA(bars, 20);
  if (enabled.ema50) output.ema50 = calculateEMA(bars, 50);
  if (enabled.sma20) output.sma20 = calculateSMA(bars, 20);
  if (enabled.vwap) output.vwap = calculateVWAP(bars);
  if (enabled.rsi14) output.rsi14 = calculateRSI(bars, 14);
  return output;
}
