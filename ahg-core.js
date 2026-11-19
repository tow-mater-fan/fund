"use strict";
/* ---------- connection: filled in when the database is created ---------- */
const CFG = { url: "https://jgybjkalpbkptrljdboh.supabase.co", key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpneWJqa2FscGJrcHRybGpkYm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4NDkwNTksImV4cCI6MjExMDQyNTA1OX0.nmM5cWYmlNNXzfa8yNGcmbrm1dPp8neoi5APvTfbXxY" };
const configured = !CFG.url.startsWith("__");
const sb = configured && window.supabase ? window.supabase.createClient(CFG.url, CFG.key) : null;

/* ---------- state ---------- */
const S = {
  settings: { name: "ANAV High Growth", ticker: "AHG", currency: "USD", initial_nav: 10 },
  nav: [], snap: null, session: null, profile: null, application: null,
  orders: [], ledger: [], con: null, tab: "overview", ptab: "invest", authMode: "signin",
  market: { quotes: {}, at: null, busy: false }, recovering: false, ready: false,
};
const SECTORS = ["Technology","Communication Services","Consumer Discretionary","Consumer Staples","Health Care","Financials","Industrials","Energy","Materials","Real Estate","Utilities","Other"];
const BENCH = [["^GSPC","S&P 500"],["^IXIC","Nasdaq Composite"],["^RUT","Russell 2000"],["^GSPTSE","S&P/TSX Composite"],["^VIX","VIX"]];

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const N = (v) => (v === null || v === undefined || v === "" ? 0 : Number(v));
const cur = () => S.settings.currency || "USD";
const money = (v, d = 2) => { try { return new Intl.NumberFormat("en-CA", { style: "currency", currency: cur(), currencyDisplay: "narrowSymbol", minimumFractionDigits: d, maximumFractionDigits: d }).format(N(v)); } catch (e) { return "$" + N(v).toFixed(d); } };
const big = (v) => { const n = N(v), a = Math.abs(n); return a >= 1e9 ? money(n / 1e9, 2) + "B" : a >= 1e6 ? money(n / 1e6, 2) + "M" : money(n, 0); };
const num = (v, d = 2) => N(v).toLocaleString("en-CA", { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (v, d = 2) => (v === null || v === undefined || !isFinite(v) ? "—" : (v > 0 ? "+" : "") + (v * 100).toFixed(d) + "%");
const sign = (v) => (N(v) > 0 ? "up" : N(v) < 0 ? "down" : "mut");
const day = (v) => (v ? new Date(String(v).length === 10 ? v + "T12:00:00" : v).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" }) : "—");
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
async function q(p) { const { data, error } = await p; if (error) throw error; return data; }
const role = () => S.profile?.role || null;
const isMgr = () => role() === "manager";
const isInv = () => role() === "investor" || role() === "manager";

function toast(msg, err) {
  const o = $("#overlay"); const t = document.createElement("div");
  t.className = "toast" + (err ? " err" : ""); t.setAttribute("role", "status"); t.textContent = msg;
  o.querySelectorAll(".toast").forEach((x) => x.remove()); o.appendChild(t);
  setTimeout(() => t.remove(), err ? 7000 : 3500);
}
const fail = (e) => { console.error(e); toast(e?.message || "Something went wrong. Try again.", true); };
function ask(title, text, okLabel = "Confirm") {
  return new Promise((res) => {
    const m = document.createElement("div"); m.className = "modal";
    m.innerHTML = `<div class="box" role="dialog" aria-modal="true"><h3>${esc(title)}</h3><p>${esc(text)}</p><div class="bar"><button class="btn ghost" data-x="0">Cancel</button><button class="btn pri" data-x="1">${esc(okLabel)}</button></div></div>`;
    m.addEventListener("click", (e) => { const b = e.target.closest("[data-x]"); if (b || e.target === m) { m.remove(); res(b?.dataset.x === "1"); } });
    $("#overlay").appendChild(m); m.querySelector("[data-x='1']").focus();
  });
}

/* ---------- derived numbers ---------- */
const liveNav = () => N(S.snap?.nav ?? S.settings.initial_nav ?? 10);
const navSeries = () => {
  const pts = S.nav.map((r) => ({ d: r.d, v: N(r.nav) }));
  if (S.snap && pts.length && pts[pts.length - 1].d !== today() && N(S.snap.units) > 0) pts.push({ d: today(), v: liveNav() });
  return pts;
};
const sinceInception = () => { const i = N(S.settings.initial_nav) || 10; return N(S.snap?.units) > 0 || S.nav.length ? liveNav() / i - 1 : null; };
function myStats() {
  const units = S.ledger.reduce((a, r) => a + N(r.units), 0);
  const paid = S.ledger.filter((r) => r.kind === "subscription").reduce((a, r) => a + N(r.amount), 0);
  const got = S.ledger.filter((r) => r.kind === "redemption").reduce((a, r) => a - N(r.amount), 0);
  const value = units * liveNav();
  return { units, paid, got, value, gain: value + got - paid, gainPct: paid > 0 ? (value + got - paid) / paid : null };
}
function myValueSeries() {
  const led = [...S.ledger].sort((a, b) => (a.at < b.at ? -1 : 1));
  if (!led.length) return [];
  const first = led[0].at.slice(0, 10), out = [];
  const held = (d) => led.filter((r) => r.at.slice(0, 10) <= d).reduce((a, r) => a + N(r.units), 0);
  out.push({ d: first, v: N(led[0].amount) });
  for (const r of S.nav) if (r.d > first) out.push({ d: r.d, v: held(r.d) * N(r.nav) });
  const t = today(); if (!out.length || out[out.length - 1].d !== t) out.push({ d: t, v: held(t) * liveNav() }); else out[out.length - 1].v = held(t) * liveNav();
  return out;
}

/* ---------- charts ---------- */
const CH = {}; let chId = 0;
function lineChart(pts, fmt, emptyMsg, cmp) {
  if (pts.length < 2) return `<div class="empty">${esc(emptyMsg)}</div>`;
  const W = 800, H = 280, L = 62, R = 16, T = 16, B = 30, id = "c" + ++chId;
  const allv = pts.map((p) => p.v).concat(cmp ? cmp.map((p) => p.v) : []);
  let lo = Math.min(...allv), hi = Math.max(...allv);
  if (hi === lo) { hi += Math.abs(hi) * 0.02 || 1; lo -= Math.abs(lo) * 0.02 || 1; }
  const pad = (hi - lo) * 0.12; lo -= pad; hi += pad;
  const x = (i) => L + (i * (W - L - R)) / (pts.length - 1), y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const path = pts.map((p, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p.v).toFixed(1)).join(" ");
  const col = "var(--brand)";
  let g = "";
  for (let k = 0; k <= 4; k++) { const v = lo + ((hi - lo) * k) / 4, yy = y(v); g += `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" stroke="var(--line)" stroke-width="1"/><text x="${L - 8}" y="${yy + 4}" text-anchor="end" fill="var(--muted)" font-size="11.5" font-family="var(--body)">${esc(fmt(v, true))}</text>`; }
  const last = pts.length - 1;
  CH[id] = { pts, fmt, L, R, W, H, x, y };
  return `<div class="chart" data-chart="${id}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Line chart from ${esc(day(pts[0].d))} to ${esc(day(pts[last].d))}">
    <defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".10"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
    ${g}<path d="${path} L${x(last)} ${H - B} L${x(0)} ${H - B} Z" fill="url(#${id}g)"/>
    ${cmp ? `<path d="${cmp.map((p, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p.v).toFixed(1)).join(" ")}" fill="none" stroke="var(--faint)" stroke-width="1.4" stroke-dasharray="4 3"/>` : ""}
    <path d="${path}" fill="none" stroke="${col}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${x(last)}" cy="${y(pts[last].v)}" r="3.5" fill="${col}"/>
    <line class="hl" y1="${T}" y2="${H - B}" stroke="var(--line-2)" visibility="hidden"/><circle class="hd" r="4" fill="var(--brand)" visibility="hidden"/>
    <text x="${L}" y="${H - 8}" fill="var(--muted)" font-size="11.5" font-family="var(--body)">${esc(day(pts[0].d))}</text>
    <text x="${W - R}" y="${H - 8}" text-anchor="end" fill="var(--muted)" font-size="11.5" font-family="var(--body)">${esc(day(pts[last].d))}</text>
  </svg><div class="tip"></div></div>`;
}
document.addEventListener("pointermove", (e) => {
  const c = e.target.closest?.("[data-chart]"); if (!c) return;
  const m = CH[c.dataset.chart]; if (!m) return;
  const r = c.getBoundingClientRect(), px = ((e.clientX - r.left) / r.width) * m.W;
  const i = Math.max(0, Math.min(m.pts.length - 1, Math.round(((px - m.L) / (m.W - m.L - m.R)) * (m.pts.length - 1))));
  const p = m.pts[i], hl = $(".hl", c), hd = $(".hd", c), tip = $(".tip", c);
  hl.setAttribute("x1", m.x(i)); hl.setAttribute("x2", m.x(i)); hl.setAttribute("visibility", "visible");
  hd.setAttribute("cx", m.x(i)); hd.setAttribute("cy", m.y(p.v)); hd.setAttribute("visibility", "visible");
  tip.style.display = "block"; tip.style.left = (m.x(i) / m.W) * 100 + "%"; tip.textContent = day(p.d) + "  " + m.fmt(p.v);
});
document.addEventListener("pointerleave", (e) => { const c = e.target.closest?.("[data-chart]"); if (c) { $(".tip", c).style.display = "none"; $(".hl", c).setAttribute("visibility", "hidden"); $(".hd", c).setAttribute("visibility", "hidden"); } }, true);
function spark(v) {
  if (!v || v.length < 2) return "";
  const lo = Math.min(...v), hi = Math.max(...v), w = 96, h = 28, sp = hi - lo || 1;
  const d = v.map((p, i) => (i ? "L" : "M") + ((i * w) / (v.length - 1)).toFixed(1) + " " + (h - 3 - ((p - lo) / sp) * (h - 6)).toFixed(1)).join(" ");
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}" fill="none" stroke="${v[v.length - 1] >= v[0] ? "var(--up)" : "var(--down)"}" stroke-width="1.6"/></svg>`;
}
const allocBars = (rows) => `<div class="alloc">${rows.map((r) => `<div class="r"><span>${esc(r.label)}</span><div class="t"><i style="width:${Math.max(1, r.w * 100).toFixed(1)}%"></i></div><span>${(r.w * 100).toFixed(1)}%</span></div>`).join("")}</div>`;

/* ---------- data ---------- */
async function loadPublic() {
  if (!sb) return;
  const [st, nav, snap, notices, docs, dist] = await Promise.all([
    q(sb.from("fund_settings").select("*").eq("id", 1).maybeSingle()),
    q(sb.from("nav_history").select("*").order("d")),
    q(sb.rpc("fund_snapshot")),
    q(sb.from("notices").select("*").order("published_at", { ascending: false }).limit(100)),
    q(sb.from("documents").select("*").order("doc_date", { ascending: false }).limit(200)),
    q(sb.from("distributions").select("*").order("d", { ascending: false })),
  ]);
  if (st) S.settings = st; S.nav = nav || []; S.snap = snap; S.notices = notices || []; S.docs = docs || []; S.dist = dist || [];
}
async function loadMe() {
  S.profile = null; S.application = null; S.orders = []; S.ledger = []; S.msgs = []; S.fundHoldings = []; S.plan = null;
  if (!sb || !S.session) return;
  const uid = S.session.user.id;
  const [p, a] = await Promise.all([
    q(sb.from("profiles").select("*").eq("id", uid).maybeSingle()),
    q(sb.from("applications").select("*").eq("user_id", uid).maybeSingle()),
  ]);
  S.profile = p; S.application = a;
  S.msgs = (await q(sb.from("messages").select("*").eq("user_id", uid).order("id"))) || [];
  if (isInv()) {
    const [o, l, h] = await Promise.all([
      q(sb.from("orders").select("*").eq("user_id", uid).order("id", { ascending: false })),
      q(sb.from("unit_ledger").select("*").eq("user_id", uid).order("at")),
      q(sb.from("holdings").select("ticker,name,sector,exchange,qty,last_price").gt("qty", 0)),
    ]);
    S.orders = o || []; S.ledger = l || []; S.fundHoldings = h || [];
    S.plan = await q(sb.from("plans").select("*").eq("user_id", uid).maybeSingle());
  }
}
async function loadConsole() {
  const [state, holdings, trades, cash, orders, ledger, profiles, apps, watch, msgs, audit, plans, notes] = await Promise.all([
    q(sb.from("fund_state").select("*").eq("id", 1).maybeSingle()),
    q(sb.from("holdings").select("*").order("ticker")),
    q(sb.from("trades").select("*").order("id", { ascending: false }).limit(200)),
    q(sb.from("cash_ledger").select("*").order("id", { ascending: false }).limit(200)),
    q(sb.from("orders").select("*").order("id", { ascending: false }).limit(500)),
    q(sb.from("unit_ledger").select("*").order("id")),
    q(sb.from("profiles").select("*").order("created_at")),
    q(sb.from("applications").select("*").order("submitted_at", { ascending: false })),
    q(sb.from("watchlist").select("*").order("ticker")),
    q(sb.from("messages").select("*").order("id")),
    q(sb.from("audit_log").select("*").order("id", { ascending: false }).limit(300)),
    q(sb.from("plans").select("*").order("next_date")),
    q(sb.from("investor_notes").select("*").order("id", { ascending: false })),
  ]);
  S.con = { state: state || { cash: 0, units: 0 }, holdings: holdings || [], trades: trades || [], cash: cash || [], orders: orders || [], ledger: ledger || [], profiles: profiles || [], apps: apps || [], watch: watch || [], msgs: msgs || [], audit: audit || [], plans: plans || [], notes: notes || [] };
}
async function refresh(all) {
  try { await loadPublic(); if (all !== false) await loadMe(); if (isMgr()) await loadConsole(); } catch (e) { fail(e); }
  render();
}

/* ---------- routing & shell ---------- */
const VIEWS = {}, TITLES = {}, GROUP = {};
function page(slug, title, group, fn) { VIEWS[slug] = fn; TITLES[slug] = title; GROUP[slug] = group; }
const MENU = [
  { k: "fund", t: "Our fund", items: ["fund", "fund-performance", "fund-portfolio", "fund-fees", "fund-distributions", "fund-documents", "fund-risk", "fund-prices"] },
  { k: "about", t: "About", items: ["about", "approach", "process", "manager", "governance", "valuation"] },
  { k: "invest", t: "Investing", items: ["invest", "eligibility", "funding", "redemptions", "faq"] },
  { k: "insights", t: "Insights and tools", items: ["insights", "glossary", "tools", "notices"] },
  { k: "legal", t: "Legal", items: ["legal", "terms", "privacy", "risk-disclosure", "conflicts", "complaints", "accessibility", "security", "cookies", "sitemap"], hidden: true },
];
const route = () => { const h = location.hash.replace("#", ""); return VIEWS[h] ? h : "home"; };
function renderNav() {
  const r = route(), g = GROUP[r];
  let h = MENU.filter((m) => !m.hidden).map((m) => `<div class="dd"><a href="#${m.items[0]}" class="${g === m.k ? "on" : ""}" aria-haspopup="true">${m.t}</a><div class="menu">${m.items.map((k) => `<a href="#${k}">${TITLES[k]}</a>`).join("")}</div></div>`).join("");
  h += `<a href="#contact" class="${r === "contact" ? "on" : ""}">Contact</a>`;
  if (isInv()) h += `<a href="#portal" class="${g === "portal" ? "on" : ""}">My account</a>`;
  if (isMgr()) h += `<a href="#console" class="${g === "console" ? "on" : ""}">Manager console</a>`;
  $("#links").innerHTML = h;
  $("#cta").innerHTML = isInv() ? "" : `<a class="btn pri" href="#apply">${S.application ? "My application" : "Apply to invest"}</a>`;
  const unread = (S.msgs || []).filter((m) => m.from_manager && !m.read_at).length;
  $("#util").innerHTML = S.session ? `${unread ? `<a href="#portal-messages">${unread} new message${unread > 1 ? "s" : ""}</a>` : ""}<span title="${esc(S.session.user.email)}">${esc(S.session.user.email)}</span><button data-a="signout">Sign out</button>` : `<a href="#signin">Investor login</a>`;
}
function render() {
  renderNav();
  $("#setup").innerHTML = configured ? "" : `<div class="setup">Preview: the fund database is not connected yet, so accounts and live figures are off.</div>`;
  const r = S.recovering ? "reset" : route();
  const y = window.scrollY;
  document.body.dataset.route = r;
  $("#app").innerHTML = VIEWS[r]();
  document.title = (r === "home" ? "" : TITLES[r] + " | ") + (S.settings.name || "ANAV High Growth");
  if (S._lastRoute === r) window.scrollTo(0, y); else window.scrollTo(0, 0);
  S._lastRoute = r;
  if (document.activeElement && document.activeElement.closest?.(".menu")) document.activeElement.blur();
}
window.addEventListener("hashchange", render);
const crumb = (slug) => { const m = MENU.find((x) => x.k === GROUP[slug]); return `<div class="crumb"><a href="#home">Home</a>${m && m.items[0] !== slug ? ` / <a href="#${m.items[0]}">${m.t}</a>` : ""} / ${TITLES[slug]}</div>`; };
const sideNav = (slug) => { const m = MENU.find((x) => x.k === GROUP[slug]); return m ? `<nav class="side" aria-label="${m.t}">${m.items.map((k) => `<a href="#${k}" class="${k === slug ? "on" : ""}">${TITLES[k]}</a>`).join("")}</nav>` : ""; };
// Standard content page: navy title band, section menu on the left, article on the right.
function doc(slug, title, group, lead, body) {
  page(slug, title, group, () => `<div class="phead"><div class="wrap">${crumb(slug)}<h1>${title}</h1>${lead ? `<p>${lead}</p>` : ""}</div></div>
<section class="band"><div class="wrap docgrid">${sideNav(slug)}<article class="prose">${typeof body === "function" ? body() : body}</article></div></section>${foot()}`);
}
const FORMS = {}, ACT = {};

/* ---------- auth ---------- */
const AUTH_POINTS = [
  ["Invitation only", "Every application is read by the fund manager before anyone is accepted."],
  ["Priced from the portfolio", "Units are issued and redeemed at net asset value, calculated from the fund's actual holdings."],
  ["Your account, in one place", "Statements, confirmations, tax summaries and messages stay with your investment."]
];
function authShell(inner, back = true) {
  return `<div class="authx">
  <aside class="authx-brand"><div class="authx-in">
    <a class="authx-logo" href="#home"><svg width="34" height="34" viewBox="0 0 30 30" aria-hidden="true"><rect width="30" height="30" rx="6" fill="#fff"/><path d="M7 21 L15 8 L23 21" fill="none" stroke="#0b2a4a" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/><path d="M11 21 L15 14.5 L19 21" fill="none" stroke="#0f62d6" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/></svg><span>ANAV <i>High Growth</i></span></a>
    <h2>A private fund for long-term growth investors.</h2>
    <ul class="authx-pts">${AUTH_POINTS.map(([t, d]) => `<li><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="10" fill="rgba(255,255,255,.14)"/><path d="M5.8 10.4l2.7 2.7 5.4-5.6" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg><div><b>${t}</b><span>${d}</span></div></li>`).join("")}</ul>
    <p class="authx-fine">ANAV High Growth Private Fund is a high-risk fund offered privately to eligible investors. Values can fall as well as rise, and you can lose some or all of what you invest.</p>
  </div></aside>
  <section class="authx-main"><div class="authx-top">${back ? `<a href="#home" class="authx-back"><svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true"><path d="M12 4l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Back to site</a>` : ""}</div>
  <div class="authx-box">${inner}</div>
  <div class="authx-foot"><a href="#terms">Terms</a><a href="#privacy">Privacy</a><a href="#risk-disclosure">Risk disclosure</a><a href="#contact">Contact</a></div></section></div>`;
}
const pwField = (id, name, label, auto, hint = "", min = true) => `<div class="obf"><label for="${id}">${label}</label><div class="pw"><input id="${id}" name="${name}" type="password" ${min ? 'minlength="8"' : ""} autocomplete="${auto}" required><button type="button" class="pwt" data-a="pwtoggle" aria-label="Show password" aria-pressed="false">Show</button></div>${hint ? `<div class="hint">${hint}</div>` : ""}</div>`;
ACT.pwtoggle = (b) => { const i = b.parentElement.querySelector("input"), show = i.type === "password"; i.type = show ? "text" : "password"; b.textContent = show ? "Hide" : "Show"; b.setAttribute("aria-pressed", String(show)); b.setAttribute("aria-label", show ? "Hide password" : "Show password"); };
function authForm() {
  const up = S.authMode === "signup", fg = S.authMode === "forgot";
  const title = fg ? "Reset your password" : up ? "Create your account" : "Welcome back";
  const sub = fg ? "Enter your email and we will send you a link to choose a new password." : up ? "Your application, and your investment if you are accepted, live in this account." : "Sign in to your investor account.";
  return `<h1>${title}</h1><p class="authx-sub">${sub}</p>
  <form data-f="auth" novalidate>
    ${up ? `<div class="obf"><label for="au-name">Full legal name</label><input id="au-name" name="name" autocomplete="name" required></div>` : ""}
    <div class="obf"><label for="au-email">Email</label><input id="au-email" name="email" type="email" autocomplete="email" required></div>
    ${fg ? "" : pwField("au-pw", "password", `<span class="lrow">Password${!up ? `<button type="button" class="tl" data-a="authmode" data-m="forgot">Forgot password?</button>` : ""}</span>`, up ? "new-password" : "current-password", up ? "At least 8 characters." : "", up)}
    <button class="btn pri lg block" type="submit">${fg ? "Email me a reset link" : up ? "Create account" : "Sign in"}</button>
  </form>
  <p class="authx-alt">${fg ? `<button type="button" class="tl" data-a="authmode" data-m="signin">Back to sign in</button>` : up ? `Already have an account? <button type="button" class="tl" data-a="authmode" data-m="signin">Sign in</button>` : `New here? <a class="tl" href="#apply">Apply to invest</a>`}</p>`;
}
function vAuthPage() {
  if (S.session) return authShell(`<h1>You are signed in</h1><p class="authx-sub">${esc(S.session.user.email)}</p><a class="btn pri lg block" href="#${isMgr() ? "console" : isInv() ? "portal" : "apply"}">Continue</a>`);
  return authShell(authForm());
}
function vReset() {
  return authShell(`<h1>Choose a new password</h1><p class="authx-sub">Use at least 8 characters, and one you do not use anywhere else.</p><form data-f="newpw" novalidate>${pwField("np", "password", "New password", "new-password")}<button class="btn pri lg block" type="submit">Save password</button></form>`);
}

/* ---------- application ---------- */
const APP_STATUS = { submitted: ["wait", "Under review"], approved: ["ok", "Accepted"], declined: ["bad", "Not accepted"], waitlist: ["wait", "On the waitlist"] };
function vApply() {
  const head = `<div class="page-h"><div><h1>Investor application</h1><p>The fund accepts a limited number of investors. Every application is read by the manager.</p></div></div>`;
  if (!S.session) { S.authMode = "signup"; return authShell(authForm()); }
  const a = S.application, st = S.settings;
  if (a && a.status !== "submitted") {
    const [c, t] = APP_STATUS[a.status];
    return `<div class="page"><div class="wrap mid">${head}<div class="card"><div class="bar"><h3 style="margin:0">Your application</h3><span class="pill ${c} sp">${t}</span></div>
      <p class="mut" style="margin:14px 0">${a.status === "approved" ? "You have been accepted. You can now place your first subscription." : a.status === "waitlist" ? "The fund is not taking you on right now, and your application stays on file. You will see any change here." : "The manager has decided not to accept this application."}</p>
      ${a.manager_note ? `<div class="note"><b>Note from the manager:</b> ${esc(a.manager_note)}</div>` : ""}
      ${a.status === "approved" ? `<div class="bar" style="margin-top:16px"><a class="btn pri" href="#portal">Go to my investment</a></div>` : ""}</div></div></div>`;
  }
  const v = (k, d = "") => esc(a ? a[k] ?? d : d);
  const sel = (k, opts) => opts.map((o) => `<option ${a && a[k] === o ? "selected" : ""}>${esc(o)}</option>`).join("");
  return `<div class="page"><div class="wrap mid">${head}
  ${a ? `<div class="note" style="margin-bottom:16px"><b>Submitted ${day(a.submitted_at)}.</b> Your application is under review. You can still correct it below until the manager decides.</div>` : ""}
  <form class="card" data-f="apply" novalidate>
    <h3>About you</h3>
    <div class="row"><div class="field"><label for="ap-name">Full legal name</label><input id="ap-name" name="full_name" required value="${v("full_name", S.profile?.full_name || "")}"></div>
      <div class="field"><label for="ap-email">Email</label><input id="ap-email" name="email" type="email" required value="${v("email", S.session.user.email)}"></div></div>
    <div class="row"><div class="field"><label for="ap-phone">Phone</label><input id="ap-phone" name="phone" type="tel" value="${v("phone")}"></div>
      <div class="field"><label for="ap-region">Province or state</label><input id="ap-region" name="region" required value="${v("region")}"></div>
      <div class="field"><label for="ap-country">Country</label><select id="ap-country" name="country">${sel("country", ["Canada", "United States", "Other"])}</select></div></div>
    <h3 style="margin-top:10px">Your investment</h3>
    <div class="row"><div class="field"><label for="ap-type">How do you qualify to invest?</label><select id="ap-type" name="investor_type">${sel("investor_type", ["Accredited investor (individual)", "Accredited investor (company or trust)", "Eligible under another exemption", "Not sure"])}</select></div>
      <div class="field"><label for="ap-amt">Amount you plan to invest (${esc(st.currency)})</label><input id="ap-amt" class="num" name="intended_amount" type="number" min="0" step="100" required value="${a ? N(a.intended_amount) : ""}">${N(st.min_initial) > 0 ? `<div class="hint">Minimum first investment: ${money(st.min_initial, 0)}.</div>` : ""}</div></div>
    <div class="row"><div class="field"><label for="ap-exp">Investing experience</label><select id="ap-exp" name="experience">${sel("experience", ["Less than 2 years", "2 to 5 years", "5 to 10 years", "More than 10 years"])}</select></div>
      <div class="field"><label for="ap-src">Where the money comes from</label><select id="ap-src" name="source_of_funds">${sel("source_of_funds", ["Employment income or savings", "Business income", "Sale of investments or property", "Inheritance or gift", "Other"])}</select></div></div>
    <div class="field"><label for="ap-notes">Anything the manager should know (optional)</label><textarea id="ap-notes" name="notes">${v("notes")}</textarea></div>
    <h3 style="margin-top:10px">Please confirm</h3>
    <label class="check"><input type="checkbox" name="ack_risk" required ${a ? "checked" : ""}><span>I understand this fund is volatile and concentrated, and that I could lose most or all of the money I invest.</span></label>
    <label class="check"><input type="checkbox" name="ack_horizon" required ${a ? "checked" : ""}><span>I am investing money I will not need for several years.</span></label>
    <label class="check"><input type="checkbox" name="ack_true" required ${a ? "checked" : ""}><span>The information I have given is true and complete, and I will provide documents to confirm it if asked.</span></label>
    <div class="bar" style="margin-top:12px"><button class="btn pri" type="submit">${a ? "Save changes" : "Submit application"}</button></div>
  </form></div></div>`;
}

/* ---------- live quotes ---------- */
const fxShare = () => { const c = (S.snap?.currencies || []).filter((x) => x.currency !== cur()); return c.length ? c.map((x) => `${(N(x.weight) * 100).toFixed(1)}% ${x.currency}`).join(", ") : null; };
const fxCost = () => { const v = N(S.snap?.costs?.fx_fees); return v > 0 ? `${money(v)} (${S.snap.aum > 0 ? num(v / S.snap.aum * 100, 2) + "% of net assets" : ""}), paid by the fund` : null; };
const r2 = (x) => Math.round(x * 100) / 100;
function tradeCalc(d) {
  const q = N(d.qty), p = N(d.price), buy = d.side !== "sell", fx = (d.currency || cur()).toUpperCase() !== cur();
  const rate = N(d.fx_rate), pc = N(d.fx_fee_pct) / 100, mid = fx && rate > 0 ? (buy ? rate / (1 + pc) : rate / (1 - pc)) : 1;
  const gross = r2(q * p * mid), fxfee = fx && rate > 0 ? Math.abs(r2(q * p * rate) - gross) : 0, fees = N(d.fees);
  return { mid, gross, fxfee, total: buy ? gross + fees + fxfee : gross - fees - fxfee, ok: q > 0 && p > 0 && (!fx || rate > 0) };
}
async function fetchQuotes(symbols) {
  const { data, error } = await sb.functions.invoke("quotes", { body: { symbols, base: cur() } });
  if (error) throw new Error("Live prices could not be reached. Enter prices by hand, or try again in a minute.");
  return data.quotes || [];
}
async function refreshQuotes(silent) {
  if (!S.con || S.market.busy) return;
  S.market.busy = true; if (!silent) render();
  try {
    const held = S.con.holdings.filter((h) => N(h.qty) > 0).map((h) => h.ticker);
    const syms = [...new Set([...BENCH.map((b) => b[0]), ...held, ...S.con.watch.map((w) => w.ticker)])];
    const qs = await fetchQuotes(syms);
    qs.forEach((x) => { S.market.quotes[x.symbol] = x; });
    S.market.at = Date.now();
    const good = qs.filter((x) => !x.error && held.includes(x.symbol));
    const fx = good.filter((x) => x.currency && x.currency !== cur());
    const use = good.filter((x) => !x.currency || x.currency === cur());
    const all = qs.filter((x) => !x.error && (use.includes(x) || S.con.watch.some((w) => w.ticker === x.symbol)));
    if (all.length) await q(sb.rpc("set_prices", { p_prices: all.map((x) => ({ ticker: x.symbol, price: x.price, prev: x.prev, native: x.native ? x.native.price : x.price, native_prev: x.fx && x.prev != null ? x.prev / x.fx : x.prev, fx: x.fx || null, currency: x.native ? x.native.currency : x.currency || cur() })) }));
    await loadPublic(); await loadConsole();
    const miss = held.filter((t) => !good.some((x) => x.symbol === t));
    if (!silent) toast(`${use.length} of ${held.length} holdings repriced.` + (fx.length ? ` Skipped ${fx.map((x) => x.symbol).join(", ")}: quoted in another currency.` : "") + (miss.length ? ` No quote for ${miss.join(", ")}.` : ""), fx.length + miss.length > 0);
  } catch (e) { if (!silent) fail(e); }
  S.market.busy = false; render();
}
setInterval(() => { if (isMgr() && route() === "console-market" && !document.hidden && S.market.at) refreshQuotes(true); }, 60000);

/* ---------- actions ---------- */
const formData = (f) => Object.fromEntries(new FormData(f).entries());
function valid(f) { if (f.checkValidity()) return true; const bad = f.querySelector(":invalid"); bad?.focus(); toast(bad?.type === "checkbox" ? "Tick every confirmation to continue." : "Fill in the highlighted field: " + (bad?.labels?.[0]?.textContent || "required"), true); return false; }

document.addEventListener("submit", async (e) => {
  const f = e.target.closest("form[data-f]"); if (!f) return; e.preventDefault();
  if (!sb) return toast("The fund database is not connected yet.", true);
  if (!valid(f)) return;
  const d = formData(f), btn = f.querySelector("[type=submit]"); if (btn) btn.disabled = true;
  try {
    if (FORMS[f.dataset.f]) await FORMS[f.dataset.f](d, f);
    else switch (f.dataset.f) {
      case "auth": {
        if (S.authMode === "forgot") { await q(sb.auth.resetPasswordForEmail(d.email, { redirectTo: location.origin + location.pathname })); toast("If that email has an account, a reset link is on its way."); break; }
        if (S.authMode === "signup") {
          const r = await q(sb.auth.signUp({ email: d.email, password: d.password, options: { data: { full_name: d.name }, emailRedirectTo: location.origin + location.pathname } }));
          if (!r.session) { toast("Check your email and click the link to confirm your account."); S.authMode = "signin"; render(); }
        } else await q(sb.auth.signInWithPassword({ email: d.email, password: d.password }));
        break;
      }
      case "newpw": await q(sb.auth.updateUser({ password: d.password })); S.recovering = false; toast("Password saved."); location.hash = "#home"; render(); break;
      case "apply": {
        const row = { user_id: S.session.user.id, full_name: d.full_name.trim(), email: d.email.trim(), phone: d.phone, region: d.region, country: d.country, investor_type: d.investor_type, intended_amount: N(d.intended_amount), experience: d.experience, source_of_funds: d.source_of_funds, notes: d.notes, acks: { risk: true, horizon: true, truthful: true, at: new Date().toISOString() } };
        if (S.application) await q(sb.from("applications").update(row).eq("id", S.application.id)); else await q(sb.from("applications").insert(row));
        toast(S.application ? "Application updated." : "Application submitted. The manager will review it."); await refresh(); break;
      }
      case "subscribe": await q(sb.rpc("place_order", { p_kind: "subscribe", p_amount: N(d.amount) })); toast("Subscription placed. Send your money with the reference shown."); await refresh(); break;
      case "redeem": {
        if (!d.all && !(N(d.units) > 0)) throw new Error("Enter how many units to redeem, or tick Redeem everything.");
        if (!(await ask("Request this redemption?", d.all ? "All your units will be redeemed at the unit price on the day the manager processes it." : `${num(d.units, 4)} units, worth about ${money(N(d.units) * liveNav())} today. The amount paid uses the unit price on the day the manager processes it.`, "Request redemption"))) break;
        await q(sb.rpc("place_order", { p_kind: "redeem", p_units: d.all ? null : N(d.units), p_all: !!d.all })); toast("Redemption requested."); await refresh(); break;
      }
      case "trade": {
        const t = tradeCalc(d), ccy = (d.currency || cur()).toUpperCase(), fx = ccy !== cur();
        const lines = `${d.side === "buy" ? "Buy" : "Sell"} ${num(d.qty, N(d.qty) % 1 ? 4 : 0)} ${d.ticker.toUpperCase()} at ${num(d.price, 4)} ${ccy}` + (fx ? `\nBroker rate ${num(d.fx_rate, 6)} (includes ${num(d.fx_fee_pct, 2)}% fee), market rate ${num(t.mid, 6)}\nShares at market rate: ${money(t.gross)}\nCurrency conversion fee: ${money(t.fxfee)}` : "") + (N(d.fees) ? `\nCommission: ${money(d.fees)}` : "") + `\n${d.side === "buy" ? "Total cost" : "Net proceeds"}: ${money(t.total)}`;
        if (!(await ask(`Record this ${d.side}?`, lines, "Record trade"))) break;
        await q(sb.rpc("record_trade", { p_ticker: d.ticker, p_side: d.side, p_qty: N(d.qty), p_price: fx ? null : N(d.price), p_fees: N(d.fees), p_date: d.date || today(), p_name: d.name || null, p_sector: d.sector || null, p_exchange: d.exchange || null, p_note: d.note || "", p_currency: ccy, p_native_price: fx ? N(d.price) : null, p_fx_rate: fx ? N(d.fx_rate) : null, p_fx_fee_pct: fx ? N(d.fx_fee_pct) : 0 }));
        toast("Trade recorded."); await refresh(); break;
      }
      case "strike": { const v = await q(sb.rpc("strike_nav", { p_date: d.date || today() })); toast(`Valuation struck at ${money(v, 4)} for ${day(d.date || today())}.`); await refresh(); break; }
      case "cash": await q(sb.rpc("cash_adjust", { p_kind: d.kind, p_amount: N(d.amount), p_memo: d.memo || "" })); toast("Cash entry added."); await refresh(); break;
      case "watch": { const t = d.ticker.trim().toUpperCase(); let name = ""; try { const x = (await fetchQuotes([t]))[0]; if (x && !x.error) { name = x.name; S.market.quotes[t] = x; } } catch (_) {} await q(sb.from("watchlist").upsert({ ticker: t, name })); await refresh(); break; }
      case "settings": {
        const row = { name: d.name.trim() || "ANAV High Growth", ticker: (d.ticker || "AHG").trim().toUpperCase(), currency: (d.currency || "USD").trim().toUpperCase(), inception_date: d.inception_date || today(), initial_nav: N(d.initial_nav) || 10, benchmark: d.benchmark, min_initial: N(d.min_initial), min_additional: N(d.min_additional), mgmt_fee_pct: N(d.mgmt_fee_pct), perf_fee_pct: N(d.perf_fee_pct), dealing: d.dealing, redemption_terms: d.redemption_terms, registrant_name: d.registrant_name.trim(), registration_detail: d.registration_detail.trim(), contact_email: d.contact_email.trim(), deposit_instructions: d.deposit_instructions, accepting: !!d.accepting, show_holdings_public: !!d.show_holdings_public };
        await q(sb.from("fund_settings").update(row).eq("id", 1)); toast("Settings saved."); await refresh(); break;
      }
    }
  } catch (err) { fail(err); }
  if (btn && btn.isConnected) btn.disabled = false;
});

document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  const a = b.dataset.a;
  try {
    if (ACT[a]) return await ACT[a](b, e);
    if (a === "scroll") { e.preventDefault(); document.getElementById(b.dataset.to)?.scrollIntoView({ behavior: "smooth" }); return; }
    if (a === "authmode") { S.authMode = b.dataset.m; return render(); }
    if (a === "tab") { S.tab = b.dataset.t; render(); if (S.tab === "market" && !S.market.at) refreshQuotes(); return; }
    if (a === "range") { S.range = b.dataset.r; return render(); }
    if (a === "ptab") { S.ptab = b.dataset.t; return render(); }
    if (a === "statement") { await navigator.clipboard.writeText(statementText()); return toast("Statement copied."); }
    if (a === "csv") {
      const rows = [["Date", "Type", "Amount", "Unit price", "Units"], ...S.ledger.map((r) => [r.at.slice(0, 10), r.kind, N(r.amount), N(r.nav), N(r.units)])];
      const u = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" })), l = document.createElement("a");
      l.href = u; l.download = "ahg-transactions.csv"; document.body.appendChild(l); l.click(); l.remove(); URL.revokeObjectURL(u); return;
    }
    if (!sb) return toast("The fund database is not connected yet.", true);
    if (a === "signout") { await sb.auth.signOut(); location.hash = "#home"; return; }
    if (a === "reload") { await refresh(); return toast("Data reloaded."); }
    if (a === "quotes") return refreshQuotes();
    if (a === "cancel") { if (await ask("Cancel this request?", "The manager will no longer act on it.", "Cancel request")) { await q(sb.rpc("cancel_order", { p_id: N(b.dataset.id) })); toast("Request cancelled."); await refresh(); } return; }
    if (a === "lookup") {
      const f = b.closest("form"), t = f.ticker.value.trim().toUpperCase(); if (!t) return toast("Enter a ticker first.", true);
      b.disabled = true; const x = (await fetchQuotes([t]))[0]; b.disabled = false;
      if (!x || x.error) return toast(`No quote found for ${t}.`, true);
      const nat = x.native ? x.native.price : x.price, ccy = x.native ? x.native.currency : (x.currency || cur());
      f.price.value = +nat.toFixed(4); if (f.currency) { if (![...f.currency.options].some((o) => o.value === ccy)) f.currency.add(new Option(ccy, ccy)); f.currency.value = ccy; }
      if (x.fx && f.fx_rate) { const pc = N(f.fx_fee_pct.value) / 100; f.fx_rate.value = (f.side.value === "sell" ? x.fx * (1 - pc) : x.fx * (1 + pc)).toFixed(6); }
      if (!f.name.value) f.name.value = x.name || ""; if (!f.exchange.value) f.exchange.value = x.exchange || "";
      tradePreview(f);
      return toast(`${t}: ${num(nat, 2)} ${ccy}` + (x.fx ? `. Market rate ${num(x.fx, 4)}. The rate filled in adds your conversion fee; replace it with the rate on your broker's confirmation.` : ""));
    }
    if (a === "process") {
      const o = S.con.orders.find((x) => x.id === N(b.dataset.id)), n = conNums();
      const txt = o.kind === "subscribe" ? `${nameOf(o.user_id)} subscribes ${money(o.amount)} at ${money(n.nav, 4)} a unit.\n${num(N(o.amount) / n.nav, 4)} units will be issued.\n\nConfirm only if the money has arrived.` : `${nameOf(o.user_id)} redeems ${o.redeem_all ? "all units" : num(o.units, 4) + " units"} at ${money(n.nav, 4)} a unit.\nFund cash will fall by the amount paid. Send the payment yourself.`;
      if (await ask(`Process ${o.reference}?`, txt, "Process")) { await q(sb.rpc("process_order", { p_id: o.id })); toast(`${o.reference} processed.`); await refresh(); } return;
    }
    if (a === "decline") { if (await ask("Decline this request?", "The investor will see it as declined.", "Decline")) { await q(sb.rpc("decline_order", { p_id: N(b.dataset.id), p_note: "Declined by the manager" })); await refresh(); } return; }
    if (a === "review") { await q(sb.rpc("review_application", { p_id: b.dataset.id, p_status: b.dataset.s, p_note: document.getElementById("an-" + b.dataset.id)?.value || "" })); toast("Application updated."); await refresh(); return; }
    if (a === "delnav") { if (await ask("Delete this valuation?", `The ${day(b.dataset.d)} point will disappear from every chart.`, "Delete")) { await q(sb.from("nav_history").delete().eq("d", b.dataset.d)); await refresh(); } return; }
    if (a === "delhold") { await q(sb.from("holdings").delete().eq("ticker", b.dataset.t)); await refresh(); return; }
    if (a === "unwatch") { await q(sb.from("watchlist").delete().eq("ticker", b.dataset.t)); await refresh(); return; }
  } catch (err) { b.disabled = false; fail(err); }
});
document.addEventListener("change", async (e) => {
  const i = e.target.closest("[data-px]"); if (!i || !sb) return;
  const p = N(i.value); if (!(p >= 0)) return;
  try { await q(sb.rpc("set_prices", { p_prices: [{ ticker: i.dataset.px, price: p }] })); toast(`${i.dataset.px} marked at ${money(p, 4)}.`); await refresh(); } catch (err) { fail(err); }
});
document.addEventListener("input", (e) => {
  const f = e.target.closest("form[data-f=trade]"); if (!f || !S.con) return;
  const c = N(f.qty.value) * N(f.price.value), buy = f.side.value === "buy", n = conNums(), tot = buy ? c + N(f.fees.value) : c - N(f.fees.value);
  $("#tr-est").textContent = c > 0 ? `${buy ? "Cost" : "Proceeds"} ${money(tot)} · cash after ${money(n.cash + (buy ? -tot : tot))}` : `Cash available: ${money(n.cash)}`;
});

