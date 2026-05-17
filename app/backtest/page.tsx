"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ============================================
   Types
   ============================================ */

interface StockRow {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Trade {
  date: string;
  direction: "buy" | "sell";
  price: number;
  shares: number;
}

interface BacktestResult {
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  tradeCount: number;
  equityCurve: { date: string; netValue: number }[];
  trades: Trade[];
}

type StrategyType = "ma" | "macd";

/* ============================================
   CSV Parsing
   ============================================ */

function parseCSV(text: string): StockRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const dateIdx = header.indexOf("date");
  const openIdx = header.indexOf("open");
  const highIdx = header.indexOf("high");
  const lowIdx = header.indexOf("low");
  const closeIdx = header.indexOf("close");
  const volumeIdx = header.indexOf("volume");

  if (dateIdx === -1 || closeIdx === -1) return [];

  const rows: StockRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    if (cols.length < 5) continue;
    const row: StockRow = {
      date: cols[dateIdx],
      open: parseFloat(cols[openIdx]) || 0,
      high: parseFloat(cols[highIdx]) || 0,
      low: parseFloat(cols[lowIdx]) || 0,
      close: parseFloat(cols[closeIdx]) || 0,
      volume: parseInt(cols[volumeIdx]) || 0,
    };
    if (row.close > 0) rows.push(row);
  }

  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

/* ============================================
   Backtest Engine
   ============================================ */

function calcSMA(prices: number[], window: number, endIndex: number): number {
  if (endIndex < window - 1) return 0;
  let sum = 0;
  for (let i = endIndex - window + 1; i <= endIndex; i++) {
    sum += prices[i];
  }
  return sum / window;
}

function calcEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const k = 2 / (period + 1);
  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      ema.push(prices[0]);
    } else {
      ema.push(prices[i] * k + ema[i - 1] * (1 - k));
    }
  }
  return ema;
}

function runMACrossover(
  data: StockRow[],
  shortWindow: number,
  longWindow: number,
  initialCash: number
): { trades: Trade[]; equityCurve: { date: string; netValue: number }[] } {
  const trades: Trade[] = [];
  const equityCurve: { date: string; netValue: number }[] = [];
  let cash = initialCash;
  let shares = 0;
  const prices = data.map((d) => d.close);

  for (let i = 0; i < data.length; i++) {
    const shortMA = calcSMA(prices, shortWindow, i);
    const longMA = calcSMA(prices, longWindow, i);
    const price = data[i].close;

    if (i >= longWindow) {
      const prevShortMA = calcSMA(prices, shortWindow, i - 1);
      const prevLongMA = calcSMA(prices, longWindow, i - 1);

      // Buy signal: short MA crosses above long MA
      if (shortMA > longMA && prevShortMA <= prevLongMA && shares === 0) {
        const buyShares = Math.floor(cash / price);
        if (buyShares > 0) {
          cash -= buyShares * price;
          shares = buyShares;
          trades.push({
            date: data[i].date,
            direction: "buy",
            price,
            shares: buyShares,
          });
        }
      }
      // Sell signal: short MA crosses below long MA
      else if (shortMA < longMA && prevShortMA >= prevLongMA && shares > 0) {
        cash += shares * price;
        trades.push({
          date: data[i].date,
          direction: "sell",
          price,
          shares,
        });
        shares = 0;
      }
    }

    const netValue = cash + shares * price;
    equityCurve.push({ date: data[i].date, netValue });
  }

  return { trades, equityCurve };
}

function runMACDStrategy(
  data: StockRow[],
  fastPeriod: number,
  slowPeriod: number,
  signalPeriod: number,
  initialCash: number
): { trades: Trade[]; equityCurve: { date: string; netValue: number }[] } {
  const trades: Trade[] = [];
  const equityCurve: { date: string; netValue: number }[] = [];
  const prices = data.map((d) => d.close);

  // Calculate MACD
  const emaFast = calcEMA(prices, fastPeriod);
  const emaSlow = calcEMA(prices, slowPeriod);
  const dif: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    dif.push(emaFast[i] - emaSlow[i]);
  }
  const dea = calcEMA(dif, signalPeriod);

  let cash = initialCash;
  let shares = 0;

  for (let i = 0; i < data.length; i++) {
    const price = data[i].close;

    if (i >= slowPeriod + signalPeriod - 1) {
      const prevDif = dif[i - 1];
      const prevDea = dea[i - 1];

      // Buy: DIF crosses above DEA
      if (dif[i] > dea[i] && prevDif <= prevDea && shares === 0) {
        const buyShares = Math.floor(cash / price);
        if (buyShares > 0) {
          cash -= buyShares * price;
          shares = buyShares;
          trades.push({
            date: data[i].date,
            direction: "buy",
            price,
            shares: buyShares,
          });
        }
      }
      // Sell: DIF crosses below DEA
      else if (dif[i] < dea[i] && prevDif >= prevDea && shares > 0) {
        cash += shares * price;
        trades.push({
          date: data[i].date,
          direction: "sell",
          price,
          shares,
        });
        shares = 0;
      }
    }

    const netValue = cash + shares * price;
    equityCurve.push({ date: data[i].date, netValue });
  }

  return { trades, equityCurve };
}

function calcMetrics(
  equityCurve: { date: string; netValue: number }[],
  trades: Trade[],
  initialCash: number,
  riskFreeRate: number = 0.03
): Omit<BacktestResult, "equityCurve" | "trades"> {
  const finalValue = equityCurve[equityCurve.length - 1].netValue;
  const totalReturn = (finalValue - initialCash) / initialCash;

  // Annualized return
  const tradingDays = equityCurve.length;
  const years = tradingDays / 252;
  const annualizedReturn =
    years > 0 ? Math.pow(1 + totalReturn, 1 / years) - 1 : 0;

  // Max drawdown
  let peak = equityCurve[0].netValue;
  let maxDrawdown = 0;
  for (const point of equityCurve) {
    if (point.netValue > peak) peak = point.netValue;
    const drawdown = (peak - point.netValue) / peak;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  // Sharpe ratio (simplified)
  const returns: number[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    returns.push(
      (equityCurve[i].netValue - equityCurve[i - 1].netValue) /
        equityCurve[i - 1].netValue
    );
  }
  const avgReturn =
    returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const stdReturn =
    returns.length > 1
      ? Math.sqrt(
          returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
            (returns.length - 1)
        )
      : 0;
  const dailyRiskFree = riskFreeRate / 252;
  const sharpeRatio =
    stdReturn > 0
      ? ((avgReturn - dailyRiskFree) / stdReturn) * Math.sqrt(252)
      : 0;

  return {
    totalReturn,
    annualizedReturn,
    maxDrawdown,
    sharpeRatio,
    tradeCount: trades.length,
  };
}

/* ============================================
   Page Component
   ============================================ */

export default function BacktestPage() {
  const [strategy, setStrategy] = useState<StrategyType>("ma");
  const [maParams, setMaParams] = useState({ shortWindow: 5, longWindow: 20 });
  const [macdParams, setMacdParams] = useState({
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
  });
  const [initialCash, setInitialCash] = useState(100000);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<StockRow[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  // Load CSV data on mount
  useEffect(() => {
    fetch("/data/demo.csv")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load demo data");
        return res.text();
      })
      .then((text) => {
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setDataError("CSV 数据为空或格式不正确");
        } else {
          setStockData(parsed);
        }
      })
      .catch(() => {
        setDataError("无法加载 demo.csv，请确保 public/data/demo.csv 存在");
      });
  }, []);

  // Run backtest
  const handleRun = useCallback(() => {
    if (stockData.length === 0) return;
    setLoading(true);
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      let trades: Trade[];
      let equityCurve: { date: string; netValue: number }[];

      if (strategy === "ma") {
        const out = runMACrossover(
          stockData,
          maParams.shortWindow,
          maParams.longWindow,
          initialCash
        );
        trades = out.trades;
        equityCurve = out.equityCurve;
      } else {
        const out = runMACDStrategy(
          stockData,
          macdParams.fastPeriod,
          macdParams.slowPeriod,
          macdParams.signalPeriod,
          initialCash
        );
        trades = out.trades;
        equityCurve = out.equityCurve;
      }

      const metrics = calcMetrics(equityCurve, trades, initialCash);
      setResult({ ...metrics, equityCurve, trades });
      setLoading(false);
    }, 50);
  }, [stockData, strategy, maParams, macdParams, initialCash]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-accent-yellow/5 to-transparent">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1
            className="text-4xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-patrick-hand)" }}
          >
            在线策略回测
          </h1>
          <p className="mt-3 text-muted">
            选择策略、设置参数、运行回测，观察净值曲线与交易记录。
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Controls */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
              <h2
                className="mb-5 text-lg font-bold text-foreground"
                style={{ fontFamily: "var(--font-patrick-hand)" }}
              >
                策略设置
              </h2>

              {/* Strategy selection */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  策略模板
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStrategy("ma")}
                    className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      strategy === "ma"
                        ? "border-accent-red bg-accent-red/10 text-accent-red"
                        : "border-border bg-card-bg text-foreground hover:border-muted"
                    }`}
                  >
                    MA 均线交叉
                  </button>
                  <button
                    onClick={() => setStrategy("macd")}
                    className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      strategy === "macd"
                        ? "border-accent-red bg-accent-red/10 text-accent-red"
                        : "border-border bg-card-bg text-foreground hover:border-muted"
                    }`}
                  >
                    MACD
                  </button>
                </div>
              </div>

              {/* Parameters */}
              {strategy === "ma" ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm text-muted">
                      短期窗口
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={60}
                      value={maParams.shortWindow}
                      onChange={(e) =>
                        setMaParams((p) => ({
                          ...p,
                          shortWindow: parseInt(e.target.value) || 5,
                        }))
                      }
                      className="w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-foreground focus:border-accent-red focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-muted">
                      长期窗口
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={120}
                      value={maParams.longWindow}
                      onChange={(e) =>
                        setMaParams((p) => ({
                          ...p,
                          longWindow: parseInt(e.target.value) || 20,
                        }))
                      }
                      className="w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-foreground focus:border-accent-red focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm text-muted">
                      快线周期
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={60}
                      value={macdParams.fastPeriod}
                      onChange={(e) =>
                        setMacdParams((p) => ({
                          ...p,
                          fastPeriod: parseInt(e.target.value) || 12,
                        }))
                      }
                      className="w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-foreground focus:border-accent-red focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-muted">
                      慢线周期
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={120}
                      value={macdParams.slowPeriod}
                      onChange={(e) =>
                        setMacdParams((p) => ({
                          ...p,
                          slowPeriod: parseInt(e.target.value) || 26,
                        }))
                      }
                      className="w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-foreground focus:border-accent-red focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-muted">
                      信号线周期
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={60}
                      value={macdParams.signalPeriod}
                      onChange={(e) =>
                        setMacdParams((p) => ({
                          ...p,
                          signalPeriod: parseInt(e.target.value) || 9,
                        }))
                      }
                      className="w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-foreground focus:border-accent-red focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Initial cash */}
              <div className="mt-5">
                <label className="mb-1 block text-sm text-muted">
                  初始资金 (元)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={10000}
                  value={initialCash}
                  onChange={(e) =>
                    setInitialCash(parseInt(e.target.value) || 100000)
                  }
                  className="w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-foreground focus:border-accent-red focus:outline-none"
                />
              </div>

              {/* Run button */}
              <button
                onClick={handleRun}
                disabled={loading || stockData.length === 0}
                className="mt-6 w-full rounded-lg bg-accent-red py-3 text-sm font-bold text-white transition-colors hover:bg-accent-red/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-pulse-soft">回测运行中...</span>
                ) : (
                  "运行回测"
                )}
              </button>

              {dataError && (
                <p className="mt-3 text-xs text-accent-red">{dataError}</p>
              )}
              {stockData.length > 0 && !dataError && (
                <p className="mt-3 text-xs text-muted">
                  已加载 {stockData.length} 个交易日数据 (
                  {stockData[0].date} ~ {stockData[stockData.length - 1].date})
                </p>
              )}
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2">
            {!result ? (
              <div className="flex h-96 items-center justify-center rounded-xl border border-dashed border-border">
                <div className="text-center">
                  <svg
                    className="mx-auto mb-4 h-12 w-12 text-muted/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                  <p className="text-muted">
                    选择策略，点击「运行回测」查看结果
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Metrics cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <MetricCard
                    label="年化收益率"
                    value={`${(result.annualizedReturn * 100).toFixed(2)}%`}
                    color={
                      result.annualizedReturn >= 0
                        ? "text-accent-green"
                        : "text-accent-red"
                    }
                  />
                  <MetricCard
                    label="最大回撤"
                    value={`${(result.maxDrawdown * 100).toFixed(2)}%`}
                    color="text-accent-red"
                  />
                  <MetricCard
                    label="夏普比率"
                    value={result.sharpeRatio.toFixed(2)}
                    color={
                      result.sharpeRatio >= 1
                        ? "text-accent-green"
                        : "text-muted"
                    }
                  />
                  <MetricCard
                    label="交易次数"
                    value={String(result.tradeCount)}
                    color="text-foreground"
                  />
                </div>

                {/* Equity curve chart */}
                <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
                  <h3
                    className="mb-4 text-base font-bold text-foreground"
                    style={{ fontFamily: "var(--font-patrick-hand)" }}
                  >
                    净值曲线
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.equityCurve}>
                        <defs>
                          <linearGradient
                            id="equityGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#E84B3A"
                              stopOpacity={0.15}
                            />
                            <stop
                              offset="95%"
                              stopColor="#E84B3A"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#E5E2DC"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#6B6B6B" }}
                          tickFormatter={(v: string) => v.slice(5)}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#6B6B6B" }}
                          tickFormatter={(v: number) =>
                            v >= 10000
                              ? `${(v / 10000).toFixed(1)}万`
                              : String(v)
                          }
                          domain={["dataMin", "dataMax"]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E5E2DC",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          formatter={(value) => [
                            `¥${Number(value).toFixed(2)}`,
                            "净值",
                          ]}
                          labelFormatter={(label) => `日期: ${label}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="netValue"
                          stroke="#E84B3A"
                          strokeWidth={2}
                          fill="url(#equityGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Trade records */}
                {result.trades.length > 0 && (
                  <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
                    <h3
                      className="mb-4 text-base font-bold text-foreground"
                      style={{ fontFamily: "var(--font-patrick-hand)" }}
                    >
                      交易记录
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-left">
                            <th className="pb-2 font-medium text-muted">
                              日期
                            </th>
                            <th className="pb-2 font-medium text-muted">
                              方向
                            </th>
                            <th className="pb-2 text-right font-medium text-muted">
                              价格
                            </th>
                            <th className="pb-2 text-right font-medium text-muted">
                              数量
                            </th>
                            <th className="pb-2 text-right font-medium text-muted">
                              金额
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.trades.map((t, i) => (
                            <tr
                              key={i}
                              className="border-b border-border/50 last:border-0"
                            >
                              <td className="py-2 text-foreground">
                                {t.date}
                              </td>
                              <td className="py-2">
                                <span
                                  className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${
                                    t.direction === "buy"
                                      ? "bg-accent-red/10 text-accent-red"
                                      : "bg-accent-green/10 text-accent-green"
                                  }`}
                                >
                                  {t.direction === "buy" ? "买入" : "卖出"}
                                </span>
                              </td>
                              <td className="py-2 text-right text-foreground">
                                ¥{t.price.toFixed(2)}
                              </td>
                              <td className="py-2 text-right text-foreground">
                                {t.shares}
                              </td>
                              <td className="py-2 text-right text-foreground">
                                ¥{(t.price * t.shares).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compliance disclaimer */}
      <div className="border-t border-border bg-foreground/[0.02]">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex items-start gap-3 rounded-lg border border-accent-yellow/20 bg-accent-yellow/5 px-5 py-4">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-yellow"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-foreground/80">
                回测免责声明
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                本页面回测仅为学习演示，不构成投资建议。回测结果不代表真实交易，不荐股、不承诺收益、不带单。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   Metric Card Component
   ============================================ */

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card-bg p-4 shadow-sm">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${color}`}
        style={{ fontFamily: "var(--font-patrick-hand)" }}
      >
        {value}
      </p>
    </div>
  );
}
