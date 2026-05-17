"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Papa from "papaparse";

/* ============================================
   Types
   ============================================ */

interface ColumnStats {
  name: string;
  count: number;
  mean: number;
  max: number;
  min: number;
  std: number;
}

interface DataInfo {
  fileName: string;
  rowCount: number;
  colCount: number;
}

/* ============================================
   Helpers
   ============================================ */

function computeStats(values: number[]): Omit<ColumnStats, "name"> {
  const n = values.length;
  if (n === 0) return { count: 0, mean: 0, max: 0, min: 0, std: 0 };

  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);

  return { count: n, mean, max, min, std };
}

function isNumericColumn(data: string[][], colIndex: number): boolean {
  // Consider a column numeric if >70% of non-empty values parse as numbers
  let numeric = 0;
  let total = 0;
  for (const row of data) {
    const val = row[colIndex]?.trim();
    if (val === "" || val === undefined) continue;
    total++;
    if (!isNaN(Number(val))) numeric++;
  }
  return total > 0 && numeric / total > 0.7;
}

function formatNumber(n: number): string {
  if (Number.isInteger(n) && Math.abs(n) < 1e12) return n.toLocaleString("zh-CN");
  return n.toLocaleString("zh-CN", { maximumFractionDigits: 4 });
}

/* ============================================
   Page Component
   ============================================ */

export default function DataPage() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [dataInfo, setDataInfo] = useState<DataInfo | null>(null);
  const [stats, setStats] = useState<ColumnStats[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processData = useCallback((data: string[][], fileName: string) => {
    if (data.length === 0) {
      setError("CSV 文件为空");
      return;
    }

    // First row as headers
    const hdrs = data[0].map((h) => h.trim());
    const bodyRows = data.slice(1).filter((row) => row.some((cell) => cell.trim() !== ""));

    setHeaders(hdrs);
    setRows(bodyRows);
    setDataInfo({
      fileName,
      rowCount: bodyRows.length,
      colCount: hdrs.length,
    });
    setError(null);

    // Compute stats for numeric columns
    const numericCols: ColumnStats[] = [];
    for (let i = 0; i < hdrs.length; i++) {
      if (isNumericColumn(bodyRows, i)) {
        const values = bodyRows
          .map((row) => Number(row[i]))
          .filter((v) => !isNaN(v));
        const s = computeStats(values);
        numericCols.push({ name: hdrs[i], ...s });
      }
    }
    setStats(numericCols);
  }, []);

  // Load demo data on mount
  useEffect(() => {
    async function loadDemo() {
      try {
        const res = await fetch("/data/demo.csv");
        if (!res.ok) throw new Error("无法加载演示数据");
        const text = await res.text();
        const parsed = Papa.parse<string[]>(text, { header: false });
        if (parsed.data.length > 0) {
          processData(parsed.data, "demo.csv（演示数据）");
        }
      } catch (e) {
        setError("演示数据加载失败，请上传 CSV 文件。");
      } finally {
        setIsLoading(false);
      }
    }
    loadDemo();
  }, [processData]);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv")) {
        setError("请上传 .csv 格式的文件");
        return;
      }
      setIsLoading(true);
      Papa.parse<string[]>(file, {
        header: false,
        complete(results) {
          processData(results.data, file.name);
          setIsLoading(false);
        },
        error() {
          setError("文件解析失败，请检查 CSV 格式。");
          setIsLoading(false);
        },
      });
    },
    [processData]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const previewRows = rows.slice(0, 20);

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      {/* Title */}
      <h1
        className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ fontFamily: "var(--font-patrick-hand)" }}
      >
        数据管理
      </h1>
      <p className="mb-10 max-w-2xl text-lg leading-relaxed text-muted">
        上传 CSV 文件，快速预览数据内容，自动计算数值列的基本统计指标。
      </p>

      {/* Upload Area */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-8 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 transition-colors ${
          isDragging
            ? "border-accent-red bg-accent-red/5"
            : "border-border hover:border-accent-red/50 hover:bg-accent-red/[0.02]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onFileSelect}
        />
        <svg
          className="h-10 w-10 text-muted/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-base font-medium text-foreground/70">
          拖拽 CSV 文件到此处，或点击选择文件
        </p>
        <p className="text-sm text-muted">支持 .csv 格式</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-8 rounded-xl border border-accent-red/30 bg-accent-red/5 px-5 py-4 text-sm text-accent-red">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-border bg-card-bg px-5 py-4 text-sm text-muted">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-red border-t-transparent" />
          正在加载数据...
        </div>
      )}

      {/* Data Info */}
      {dataInfo && (
        <div className="mb-8 rounded-xl border border-border bg-card-bg p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="font-medium text-foreground">
              文件：{dataInfo.fileName}
            </span>
            <span className="text-muted">
              行数：<span className="font-medium text-foreground">{dataInfo.rowCount}</span>
            </span>
            <span className="text-muted">
              列数：<span className="font-medium text-foreground">{dataInfo.colCount}</span>
            </span>
          </div>
          <p
            className="mt-3 text-xs text-muted"
            style={{ fontFamily: "var(--font-kalam)" }}
          >
            数据仅在浏览器本地处理，不会上传到服务器。
          </p>
        </div>
      )}

      {/* Statistics */}
      {stats.length > 0 && (
        <div className="mb-8">
          <h2
            className="mb-4 text-xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-patrick-hand)" }}
          >
            数值列统计
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((col) => (
              <div
                key={col.name}
                className="rounded-xl border border-border bg-card-bg p-5 shadow-sm"
              >
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  {col.name}
                </h3>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">样本数</dt>
                    <dd className="font-medium text-foreground">{formatNumber(col.count)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">均值</dt>
                    <dd className="font-medium text-foreground">{formatNumber(col.mean)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">最大值</dt>
                    <dd className="font-medium text-accent-red">{formatNumber(col.max)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">最小值</dt>
                    <dd className="font-medium text-accent-green">{formatNumber(col.min)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">标准差</dt>
                    <dd className="font-medium text-foreground">{formatNumber(col.std)}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Preview Table */}
      {headers.length > 0 && previewRows.length > 0 && (
        <div className="mb-8">
          <h2
            className="mb-4 text-xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-patrick-hand)" }}
          >
            数据预览
            {rows.length > 20 && (
              <span className="ml-2 text-sm font-normal text-muted">
                （前 20 行，共 {rows.length} 行）
              </span>
            )}
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-card-bg shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-foreground/[0.03]">
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                    #
                  </th>
                  {headers.map((h, i) => (
                    <th
                      key={i}
                      className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-b border-border/50 last:border-0 hover:bg-accent-yellow/[0.04] transition-colors"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted">
                      {ri + 1}
                    </td>
                    {headers.map((_, ci) => (
                      <td
                        key={ci}
                        className="whitespace-nowrap px-4 py-2.5 text-foreground"
                      >
                        {row[ci] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No data state (after loading completes with no data) */}
      {!isLoading && !dataInfo && !error && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card-bg py-16 text-center shadow-sm">
          <svg
            className="h-12 w-12 text-muted/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
          <p className="text-sm text-muted">上传 CSV 文件以查看数据</p>
        </div>
      )}

      {/* Compliance */}
      <div
        className="mt-12 rounded-xl border border-border bg-card-bg px-6 py-5 text-center text-sm text-muted shadow-sm"
        style={{ fontFamily: "var(--font-kalam)" }}
      >
        本页面数据仅供学习研究使用，不构成投资建议。不荐股、不承诺收益、不带单。
      </div>
    </div>
  );
}
