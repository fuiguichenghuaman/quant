"use client";

import { useState } from "react";
import Link from "next/link";

/* ---- Tab definitions ---- */

type TabId = "python" | "vscode" | "pip" | "jq";

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: "python", label: "安装 Python", icon: "🐍" },
  { id: "vscode", label: "安装 VS Code", icon: "📝" },
  { id: "pip", label: "安装 Python 库", icon: "📦" },
  { id: "jq", label: "注册聚宽（可选）", icon: "☁️" },
];

/* ---- Step component ---- */

function Step({
  num,
  children,
}: {
  num: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-red/10 text-sm font-bold text-accent-red">
        {num}
      </div>
      <div className="flex-1 pt-0.5">{children}</div>
    </div>
  );
}

function Command({ children }: { children: string }) {
  return (
    <code className="my-2 block rounded-lg bg-foreground/5 px-4 py-3 text-sm font-mono text-foreground overflow-x-auto">
      {children}
    </code>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg border border-accent-yellow/30 bg-accent-yellow/5 px-4 py-3 text-sm">
      <span className="mr-1.5 font-medium text-accent-yellow">💡 提示：</span>
      <span className="text-muted">{children}</span>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg border border-accent-red/30 bg-accent-red/5 px-4 py-3 text-sm">
      <span className="mr-1.5 font-medium text-accent-red">⚠️ 注意：</span>
      <span className="text-muted">{children}</span>
    </div>
  );
}

/* ---- Tab content: Python ---- */

function PythonTab() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Python 是我们写量化代码的基础。下面教你在 Windows 上安装 Python 3.10 或更高版本。
      </p>

      <Step num={1}>
        <h4 className="font-medium text-foreground">打开 Python 官网下载页面</h4>
        <p className="mt-1 text-sm text-muted">
          访问{" "}
          <a
            href="https://www.python.org/downloads/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-red hover:underline"
          >
            python.org/downloads
          </a>
          ，点击页面上最大的黄色按钮 <strong>"Download Python 3.x.x"</strong>。
        </p>
      </Step>

      <Step num={2}>
        <h4 className="font-medium text-foreground">运行安装程序</h4>
        <p className="mt-1 text-sm text-muted">
          双击下载好的 <code className="bg-foreground/5 px-1 rounded">python-3.x.x-amd64.exe</code> 文件。
        </p>
      </Step>

      <Warning>
        安装界面底部有一个 <strong>"Add python.exe to PATH"</strong> 的勾选框，<strong>一定要勾上！</strong>
        不勾的话，后面在命令行里输入 <code>python</code> 会找不到。
      </Warning>

      <Step num={3}>
        <h4 className="font-medium text-foreground">勾选 Add to PATH，然后点 Install Now</h4>
        <p className="mt-1 text-sm text-muted">
          勾选 "Add python.exe to PATH" → 点 "Install Now" → 等待安装完成 → 点 "Close"。
        </p>
      </Step>

      <Step num={4}>
        <h4 className="font-medium text-foreground">验证安装成功</h4>
        <p className="mt-1 text-sm text-muted">
          按 <kbd className="rounded border border-border bg-foreground/5 px-1.5 py-0.5 text-xs font-mono">Win + R</kbd>，
          输入 <code className="bg-foreground/5 px-1 rounded">cmd</code>，回车，打开命令提示符。输入：
        </p>
        <Command>python --version</Command>
        <p className="text-sm text-muted">
          如果显示 <code>Python 3.x.x</code>，说明安装成功了！
        </p>
      </Step>

      <Tip>
        如果提示 "python 不是内部或外部命令"，说明安装时没有勾选 Add to PATH。解决方法：重新运行安装程序，勾选 "Add python.exe to PATH"，选 "Modify" 修复。
      </Tip>
    </div>
  );
}

/* ---- Tab content: VS Code ---- */

function VSCodeTab() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        VS Code 是一个免费的代码编辑器，写 Python 代码用的。它就像一个高级版的记事本，能帮你高亮代码、自动补全、运行脚本。
      </p>

      <Step num={1}>
        <h4 className="font-medium text-foreground">下载 VS Code</h4>
        <p className="mt-1 text-sm text-muted">
          访问{" "}
          <a
            href="https://code.visualstudio.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-red hover:underline"
          >
            code.visualstudio.com
          </a>
          ，点蓝色的 "Download for Windows" 按钮。
        </p>
      </Step>

      <Step num={2}>
        <h4 className="font-medium text-foreground">安装 VS Code</h4>
        <p className="mt-1 text-sm text-muted">
          双击安装文件，一路点 "下一步" 就行。安装过程中建议勾选：
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          <li className="flex items-start gap-2">
            <span className="text-accent-green">✓</span>
            <span>"将 '通过 Code 打开' 操作添加到文件上下文菜单"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-green">✓</span>
            <span>"将 '通过 Code 打开' 操作添加到目录上下文菜单"</span>
          </li>
        </ul>
        <p className="mt-2 text-sm text-muted">
          这样你以后可以右键文件夹直接用 VS Code 打开。
        </p>
      </Step>

      <Step num={3}>
        <h4 className="font-medium text-foreground">安装 Python 扩展</h4>
        <p className="mt-1 text-sm text-muted">
          打开 VS Code，点左边栏的扩展图标（四个方块的图标），搜索 <strong>"Python"</strong>，
          找到 <strong>Microsoft</strong> 出品的那个，点 <strong>"Install"</strong> 安装。
        </p>
        <p className="mt-2 text-sm text-muted">
          这个扩展让你能在 VS Code 里直接运行 Python 代码、自动补全、显示错误提示。
        </p>
      </Step>

      <Step num={4}>
        <h4 className="font-medium text-foreground">创建你的第一个 Python 文件</h4>
        <p className="mt-1 text-sm text-muted">试一下能不能跑通：</p>
        <ol className="mt-2 space-y-2 text-sm text-muted list-decimal list-inside">
          <li>在桌面新建一个文件夹，比如叫 <code className="bg-foreground/5 px-1 rounded">quant-test</code></li>
          <li>用 VS Code 打开这个文件夹（文件 → 打开文件夹）</li>
          <li>点左边的 "新建文件" 图标，创建一个 <code className="bg-foreground/5 px-1 rounded">hello.py</code></li>
          <li>输入以下代码：</li>
        </ol>
        <Command>{`print("Hello, 量化学习！")
a = 100 + 200
print(f"100 + 200 = {a}")`}</Command>
        <p className="text-sm text-muted">
          点右上角的 <strong>▶ 运行按钮</strong>，或者按 <kbd className="rounded border border-border bg-foreground/5 px-1.5 py-0.5 text-xs font-mono">F5</kbd>，
          下方终端应该会显示：
        </p>
        <Command>{`Hello, 量化学习！
100 + 200 = 300`}</Command>
      </Step>

      <Tip>
        如果运行时 VS Code 提示 "未选择解释器"，按 <kbd className="rounded border border-border bg-foreground/5 px-1.5 py-0.5 text-xs font-mono">Ctrl + Shift + P</kbd>，
        输入 "Python: Select Interpreter"，选择你刚安装的 Python 3.x。
      </Tip>
    </div>
  );
}

/* ---- Tab content: pip ---- */

function PipTab() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        pip 是 Python 的包管理器，用来安装第三方库。我们需要安装几个做量化分析用的库。
      </p>

      <Step num={1}>
        <h4 className="font-medium text-foreground">打开命令提示符</h4>
        <p className="mt-1 text-sm text-muted">
          按 <kbd className="rounded border border-border bg-foreground/5 px-1.5 py-0.5 text-xs font-mono">Win + R</kbd>，
          输入 <code className="bg-foreground/5 px-1 rounded">cmd</code>，回车。
        </p>
      </Step>

      <Step num={2}>
        <h4 className="font-medium text-foreground">一次性安装所有需要的库</h4>
        <p className="mt-1 text-sm text-muted">复制下面的命令，粘贴到命令提示符里，回车运行：</p>
        <Command>pip install numpy pandas matplotlib mplfinance</Command>
        <p className="mt-2 text-sm text-muted">等待安装完成。每个库的作用：</p>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          <li><strong>numpy</strong> — 数学计算，算均值、方差等</li>
          <li><strong>pandas</strong> — 数据处理，读 CSV、做表格</li>
          <li><strong>matplotlib</strong> — 画图，折线图、柱状图</li>
          <li><strong>mplfinance</strong> — 专业 K 线图</li>
        </ul>
      </Step>

      <Step num={3}>
        <h4 className="font-medium text-foreground">验证安装成功</h4>
        <p className="mt-1 text-sm text-muted">在命令提示符里输入：</p>
        <Command>pip list</Command>
        <p className="text-sm text-muted">
          如果能看到 numpy、pandas、matplotlib、mplfinance 在列表里，就安装成功了。
        </p>
      </Step>

      <Tip>
        如果 <code>pip</code> 命令找不到，试试用 <code>python -m pip install numpy pandas matplotlib mplfinance</code> 代替。
      </Tip>

      <Warning>
        如果你网络不好，pip 下载很慢，可以用国内镜像源：
        <Command>pip install numpy pandas matplotlib mplfinance -i https://pypi.tuna.tsinghua.edu.cn/simple</Command>
        这会从清华大学的镜像下载，速度快很多。
      </Warning>
    </div>
  );
}

/* ---- Tab content: 聚宽 ---- */

function JQTab() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        聚宽（JoinQuant）是一个在线量化平台，可以直接在网页上写策略、跑回测，不用自己配数据。
        我们后面写交易策略的时候会用到它。这个不是必须的，但推荐注册一个。
      </p>

      <Step num={1}>
        <h4 className="font-medium text-foreground">注册聚宽账号</h4>
        <p className="mt-1 text-sm text-muted">
          访问{" "}
          <a
            href="https://www.joinquant.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-red hover:underline"
          >
            joinquant.com
          </a>
          ，点右上角 "注册"，用手机号注册即可。免费版就够用了。
        </p>
      </Step>

      <Step num={2}>
        <h4 className="font-medium text-foreground">进入研究环境</h4>
        <p className="mt-1 text-sm text-muted">
          登录后，点导航栏的 "我的策略" → "新建策略"，就能进入代码编辑器。
          聚宽的代码编辑器类似 Jupyter Notebook，可以直接运行 Python 代码。
        </p>
      </Step>

      <Step num={3}>
        <h4 className="font-medium text-foreground">了解聚宽的特殊之处</h4>
        <p className="mt-1 text-sm text-muted">聚宽和本地 VS Code 有几个重要区别：</p>
        <ul className="mt-2 space-y-2 text-sm text-muted">
          <li className="flex items-start gap-2">
            <span className="font-medium text-foreground shrink-0">数据：</span>
            <span>聚宽自带 A 股历史数据，不需要自己下载 CSV</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium text-foreground shrink-0">API：</span>
            <span>聚宽有自己的函数，比如 <code className="bg-foreground/5 px-1 rounded">get_price()</code>、<code className="bg-foreground/5 px-1 rounded">order()</code>，和本地写的代码不通用</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium text-foreground shrink-0">回测：</span>
            <span>聚宽内置回测引擎，可以模拟真实交易</span>
          </li>
        </ul>
      </Step>

      <Tip>
        我们的学习模块中标记了 "☁️ 聚宽平台" 的代码，需要在聚宽上运行，不能直接在本地 VS Code 跑。
        标记了 "💻 本地运行" 的代码，下载后在 VS Code 里就能跑。
      </Tip>
    </div>
  );
}

/* ---- Main page ---- */

const tabContent: Record<TabId, React.ReactNode> = {
  python: <PythonTab />,
  vscode: <VSCodeTab />,
  pip: <PipTab />,
  jq: <JQTab />,
};

export default function SetupPage() {
  const [activeTab, setActiveTab] = useState<TabId>("python");

  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      {/* Header */}
      <Link
        href="/learn"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent-red transition-colors"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        返回学习路线
      </Link>

      <h1
        className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ fontFamily: "var(--font-patrick-hand)" }}
      >
        环境准备
      </h1>
      <p className="mb-2 text-lg leading-relaxed text-muted">
        零基础必看！先把工具装好
      </p>
      <p className="mb-10 text-sm text-muted/70">
        按照下面 4 步走完，你就能在自己的电脑上运行量化学习代码了。整个过程大概需要 20-30 分钟。
      </p>

      {/* Progress indicator */}
      <div className="mb-8 flex items-center gap-2 rounded-lg border border-accent-green/30 bg-accent-green/5 px-4 py-3 text-sm">
        <span className="text-accent-green">✓</span>
        <span className="text-muted">
          完成这 4 步后，你就可以运行{" "}
          <Link href="/learn/01-numpy-basics" className="text-accent-red hover:underline font-medium">
            第一个学习模块：NumPy 股票数据基础
          </Link>
        </span>
      </div>

      {/* Tab bar */}
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-accent-red text-white shadow-sm"
                : "border border-border bg-card-bg text-foreground hover:border-foreground/20 hover:shadow-sm"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
        {tabContent[activeTab]}
      </div>

      {/* Bottom navigation */}
      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={() => {
            const idx = tabs.findIndex((t) => t.id === activeTab);
            if (idx > 0) setActiveTab(tabs[idx - 1].id);
          }}
          disabled={activeTab === tabs[0].id}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card-bg px-4 py-2 text-sm text-foreground transition-all hover:border-foreground/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          上一步
        </button>

        <span className="text-xs text-muted">
          {tabs.findIndex((t) => t.id === activeTab) + 1} / {tabs.length}
        </span>

        {activeTab !== tabs[tabs.length - 1].id ? (
          <button
            onClick={() => {
              const idx = tabs.findIndex((t) => t.id === activeTab);
              if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-red px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
          >
            下一步
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        ) : (
          <Link
            href="/learn/01-numpy-basics"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-green px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
          >
            开始学习！
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
              />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
