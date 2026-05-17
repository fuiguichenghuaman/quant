"use client";

/**
 * LoginPage - 登录 / 注册页
 *
 * 功能：
 * - Tab 切换登录 / 注册
 * - 登录表单：用户名、密码、记住我
 * - 注册表单：用户名、邮箱、密码、确认密码
 * - 前端表单校验
 * - localStorage 模拟登录状态
 * - 登录成功跳转 /profile
 * - 底部合规声明
 */

import { useState, FormEvent } from "react";
import Link from "next/link";

type Tab = "login" | "register";

interface LoginErrors {
  username?: string;
  password?: string;
  general?: string;
}

interface RegisterErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

/* ---- Validation helpers ---- */

function validateLogin(username: string, password: string): LoginErrors {
  const errors: LoginErrors = {};
  if (!username.trim()) {
    errors.username = "请输入用户名";
  } else if (username.trim().length < 2) {
    errors.username = "用户名至少 2 个字符";
  }
  if (!password) {
    errors.password = "请输入密码";
  } else if (password.length < 6) {
    errors.password = "密码至少 6 个字符";
  }
  return errors;
}

function validateRegister(
  username: string,
  email: string,
  password: string,
  confirmPassword: string
): RegisterErrors {
  const errors: RegisterErrors = {};
  if (!username.trim()) {
    errors.username = "请输入用户名";
  } else if (username.trim().length < 2) {
    errors.username = "用户名至少 2 个字符";
  } else if (username.trim().length > 20) {
    errors.username = "用户名不超过 20 个字符";
  }

  if (!email.trim()) {
    errors.email = "请输入邮箱";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "邮箱格式不正确";
  }

  if (!password) {
    errors.password = "请输入密码";
  } else if (password.length < 6) {
    errors.password = "密码至少 6 个字符";
  } else if (password.length > 64) {
    errors.password = "密码不超过 64 个字符";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "请确认密码";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "两次密码不一致";
  }

  return errors;
}

/* ---- Main Component ---- */

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");

  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});

  // Register form state
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regErrors, setRegErrors] = useState<RegisterErrors>({});

  const [regSuccess, setRegSuccess] = useState(false);

  /* ---- Login handler ---- */
  function handleLogin(e: FormEvent) {
    e.preventDefault();
    const errors = validateLogin(loginUsername, loginPassword);
    setLoginErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Check if user exists in localStorage (registered users)
    const users: Array<{ username: string; email: string; password: string }> =
      JSON.parse(localStorage.getItem("qlab_users") || "[]");

    const found = users.find(
      (u) => u.username === loginUsername.trim() && u.password === loginPassword
    );

    if (!found) {
      // For demo: if no registered users, allow any login with valid format
      // If registered users exist but no match, show error
      if (users.length > 0) {
        setLoginErrors({ general: "用户名或密码错误" });
        return;
      }
    }

    // Simulate login
    const loginDate = new Date().toISOString();
    localStorage.setItem(
      "qlab_user",
      JSON.stringify({
        username: loginUsername.trim(),
        loggedIn: true,
        joinDate: found ? loginDate.split("T")[0] : loginDate.split("T")[0],
      })
    );

    if (rememberMe) {
      localStorage.setItem("qlab_remember", "true");
    } else {
      localStorage.removeItem("qlab_remember");
    }

    window.location.href = "/profile";
  }

  /* ---- Register handler ---- */
  function handleRegister(e: FormEvent) {
    e.preventDefault();
    const errors = validateRegister(regUsername, regEmail, regPassword, regConfirm);
    setRegErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Store user
    const users: Array<{ username: string; email: string; password: string }> =
      JSON.parse(localStorage.getItem("qlab_users") || "[]");

    // Check duplicate username
    if (users.some((u) => u.username === regUsername.trim())) {
      setRegErrors({ username: "该用户名已被注册" });
      return;
    }

    // Check duplicate email
    if (users.some((u) => u.email === regEmail.trim())) {
      setRegErrors({ email: "该邮箱已被注册" });
      return;
    }

    users.push({
      username: regUsername.trim(),
      email: regEmail.trim(),
      password: regPassword,
    });
    localStorage.setItem("qlab_users", JSON.stringify(users));

    setRegSuccess(true);

    // Clear form
    setRegUsername("");
    setRegEmail("");
    setRegPassword("");
    setRegConfirm("");
    setRegErrors({});
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-20">
      {/* Page title */}
      <div className="mb-10 text-center">
        <h1
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-patrick-hand)" }}
        >
          {tab === "login" ? "登录" : "注册"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {tab === "login"
            ? "登录后可查看个人学习进度和收藏策略"
            : "创建账号，开始记录你的量化学习之旅"}
        </p>
      </div>

      {/* Card container */}
      <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
        {/* Tab switcher */}
        <div className="mb-6 flex rounded-lg border border-border bg-background p-1">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setLoginErrors({});
              setRegErrors({});
              setRegSuccess(false);
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === "login"
                ? "bg-card-bg text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setLoginErrors({});
              setRegErrors({});
              setRegSuccess(false);
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === "register"
                ? "bg-card-bg text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            注册
          </button>
        </div>

        {/* ---- Login Form ---- */}
        {tab === "login" && (
          <form onSubmit={handleLogin} noValidate>
            {/* General error */}
            {loginErrors.general && (
              <div className="mb-4 rounded-lg border border-accent-red/20 bg-accent-red/5 px-4 py-3 text-sm text-accent-red">
                {loginErrors.general}
              </div>
            )}

            {/* Username */}
            <div className="mb-4">
              <label htmlFor="login-username" className="mb-1.5 block text-sm font-medium text-foreground">
                用户名
              </label>
              <input
                id="login-username"
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="输入用户名"
                className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-accent-red focus:ring-1 focus:ring-accent-red/30 ${
                  loginErrors.username ? "border-accent-red" : "border-border"
                }`}
              />
              {loginErrors.username && (
                <p className="mt-1 text-xs text-accent-red">{loginErrors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-foreground">
                密码
              </label>
              <input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="输入密码"
                className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-accent-red focus:ring-1 focus:ring-accent-red/30 ${
                  loginErrors.password ? "border-accent-red" : "border-border"
                }`}
              />
              {loginErrors.password && (
                <p className="mt-1 text-xs text-accent-red">{loginErrors.password}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="mb-6 flex items-center gap-2">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-accent-red"
              />
              <label htmlFor="remember-me" className="text-sm text-muted">
                记住我
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-lg bg-accent-red py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              登录
            </button>

            {/* Switch to register */}
            <p className="mt-4 text-center text-sm text-muted">
              还没有账号？{" "}
              <button
                type="button"
                onClick={() => {
                  setTab("register");
                  setLoginErrors({});
                  setRegSuccess(false);
                }}
                className="text-accent-red hover:underline"
              >
                注册一个
              </button>
            </p>
          </form>
        )}

        {/* ---- Register Form ---- */}
        {tab === "register" && (
          <form onSubmit={handleRegister} noValidate>
            {/* Success message */}
            {regSuccess && (
              <div className="mb-4 rounded-lg border border-accent-green/30 bg-accent-green/10 px-4 py-3 text-sm text-foreground">
                注册成功！请
                <button
                  type="button"
                  onClick={() => {
                    setTab("login");
                    setRegSuccess(false);
                  }}
                  className="mx-1 font-medium text-accent-red hover:underline"
                >
                  切换到登录
                </button>
                页面进行登录。
              </div>
            )}

            {/* Username */}
            <div className="mb-4">
              <label htmlFor="reg-username" className="mb-1.5 block text-sm font-medium text-foreground">
                用户名
              </label>
              <input
                id="reg-username"
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="2-20 个字符"
                className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-accent-red focus:ring-1 focus:ring-accent-red/30 ${
                  regErrors.username ? "border-accent-red" : "border-border"
                }`}
              />
              {regErrors.username && (
                <p className="mt-1 text-xs text-accent-red">{regErrors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-foreground">
                邮箱
              </label>
              <input
                id="reg-email"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="your@email.com"
                className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-accent-red focus:ring-1 focus:ring-accent-red/30 ${
                  regErrors.email ? "border-accent-red" : "border-border"
                }`}
              />
              {regErrors.email && (
                <p className="mt-1 text-xs text-accent-red">{regErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-foreground">
                密码
              </label>
              <input
                id="reg-password"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="至少 6 个字符"
                className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-accent-red focus:ring-1 focus:ring-accent-red/30 ${
                  regErrors.password ? "border-accent-red" : "border-border"
                }`}
              />
              {regErrors.password && (
                <p className="mt-1 text-xs text-accent-red">{regErrors.password}</p>
              )}
            </div>

            {/* Confirm password */}
            <div className="mb-6">
              <label htmlFor="reg-confirm" className="mb-1.5 block text-sm font-medium text-foreground">
                确认密码
              </label>
              <input
                id="reg-confirm"
                type="password"
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                placeholder="再次输入密码"
                className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-accent-red focus:ring-1 focus:ring-accent-red/30 ${
                  regErrors.confirmPassword ? "border-accent-red" : "border-border"
                }`}
              />
              {regErrors.confirmPassword && (
                <p className="mt-1 text-xs text-accent-red">{regErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-lg bg-accent-red py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              注册
            </button>

            {/* Switch to login */}
            <p className="mt-4 text-center text-sm text-muted">
              已有账号？{" "}
              <button
                type="button"
                onClick={() => {
                  setTab("login");
                  setRegErrors({});
                  setRegSuccess(false);
                }}
                className="text-accent-red hover:underline"
              >
                去登录
              </button>
            </p>
          </form>
        )}
      </div>

      {/* Compliance notice */}
      <div className="mt-8 rounded-lg border border-accent-yellow/20 bg-accent-yellow/5 px-5 py-4">
        <div className="flex items-start gap-2">
          <svg
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-yellow"
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
            <p className="text-xs font-medium text-foreground/80">免责声明</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              本站仅为个人量化学习研究记录平台，不构成任何投资建议。不荐股、不承诺收益、不带单、不引导开户或入金。注册账号仅用于记录个人学习进度，不涉及任何真实交易或资金操作。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
