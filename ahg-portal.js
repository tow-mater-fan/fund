"use strict";
/* ---------- app shell shared by the investor account and the manager console ---------- */
const ic = (d) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  home: ic('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>'), pie: ic('<path d="M12 3v9h9"/><circle cx="12" cy="12" r="9"/>'), chart: ic('<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'),
  list: ic('<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>'), plus: ic('<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'), minus: ic('<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>'),
  repeat: ic('<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>'), target: ic('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),
  bank: ic('<path d="M3 10l9-6 9 6"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18"/>'), file: ic('<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>'), receipt: ic('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>'),
  bell: ic('<path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 20a2 2 0 0 0 4 0"/>'), chat: ic('<path d="M21 12a8 8 0 0 1-12 7l-5 1 1-5a8 8 0 1 1 16-3z"/>'), user: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  lock: ic('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'), help: ic('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/>'), brief: ic('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 13h18"/>'),
  swap: ic('<path d="M7 4L3 8l4 4"/><path d="M3 8h14"/><path d="M17 20l4-4-4-4"/><path d="M21 16H7"/>'), scale: ic('<path d="M12 3v18M5 21h14M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>'), cash: ic('<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>'),
  pct: ic('<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>'), cal: ic('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'), gift: ic('<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M12 9v12M3 13h18M12 9s-4-6-7-3 7 3 7 3 4-6 7-3-7 3-7 3"/>'),
  globe: ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'), bars: ic('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'), horn: ic('<path d="M3 10v4l11 5V5z"/><path d="M14 9a3 3 0 0 1 0 6M6 15v4h3"/>'),
  folder: ic('<path d="M3 6h6l2 2h10v11H3z"/>'), down: ic('<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>'), shield: ic('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.500-1-8-4-8-9V6z"/>'), gear: ic('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'),
  users: ic('<circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 5a3.500 3.500 0 0 1 0 7M18 14a6 6 0 0 1 4 7"/>'), inbox: ic('<path d="M3 13l3-9h12l3 9v7H3z"/><path d="M3 13h5l1 3h6l1-3h5"/>'), flow: ic('<path d="M4 7h11a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h11"/><path d="M7 4L4 7l3 3M17 18l3 3-3 3"/>'), back: ic('<path d="M15 6l-6 6 6 6"/>'),
};
function appShell(o) {
  const nav = o.nav.map((g) => `<div class="agroup"><div class="agh">${g.h}</div>${g.items.map(([k, t, icon, badge]) => `<a href="#${k}" class="${k === o.slug ? "on" : ""}">${I[icon] || ""}<span>${t}</span>${badge ? `<em>${badge}</em>` : ""}</a>`).join("")}</div>`).join("");
  return `<div class="app"><aside class="aside"><a class="abrand" href="#home"><svg width="28" height="28" viewBox="0 0 30 30" aria-hidden="true"><rect width="30" height="30" rx="7" fill="#fff"/><path d="M7 21 L15 8 L23 21" fill="none" stroke="#0b2a4a" stroke-width="2.600" stroke-linejoin="round" stroke-linecap="round"/><path d="M11 21 L15 14.500 L19 21" fill="none" stroke="#0f62d6" stroke-width="2.600" stroke-linejoin="round" stroke-linecap="round"/></svg><span>ANAV <i>High Growth</i></span></a>
    <div class="alabel">${o.label}</div><nav class="anav" aria-label="${o.label}">${nav}</nav>
    <div class="afoot"><div class="awho"><b>${esc(S.profile?.full_name || "Account")}</b><span>${esc(S.session.user.email)}</span></div>${o.switchTo ? `<a href="#${o.switchTo[0]}">${I.swap}<span>${o.switchTo[1]}</span></a>` : ""}<a href="#home">${I.back}<span>Back to website</span></a><button data-a="signout">${I.lock}<span>Sign out</span></button></div></aside>
  <div class="amain"><header class="ahead"><div><h1>${o.title}</h1>${o.sub ? `<p>${o.sub}</p>` : ""}</div>${o.actions ? `<div class="bar">${o.actions}</div>` : ""}</header><div class="stack">${o.body}</div></div></div>`;
}
const PAL = ["#0f62d6", "#0b2a4a", "#3aa0ff", "#7c5cff", "#00a389", "#f2a33a", "#e2557b", "#8a94a6", "#b6c2d2"];
function donut(rows, center) {
  if (!rows.length) return `<div class="empty">Nothing to show yet.</div>`;
  let a = 0; const R = 54, C = 2 * Math.PI * R;
  const segs = rows.map((r, i) => { const len = Math.max(0, r.w) * C, s = `<circle r="${R}" cx="70" cy="70" fill="none" stroke="${PAL[i % PAL.length]}" stroke-width="18" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-a).toFixed(2)}" transform="rotate(-90 70 70)"/>`; a += len; return s; }).join("");
  return `<div class="donut"><svg viewBox="0 0 140 140" width="150" height="150" role="img" aria-label="Allocation chart">${segs}<text x="70" y="66" text-anchor="middle" font-size="11" fill="var(--muted)">${center?.[0] || ""}</text><text x="70" y="84" text-anchor="middle" font-size="15" font-weight="600" fill="var(--ink)">${center?.[1] || ""}</text></svg>
  <ul>${rows.map((r, i) => `<li><i style="background:${PAL[i % PAL.length]}"></i><span>${esc(r.label)}</span><b>${(r.w * 100).toFixed(1)}%</b></li>`).join("")}</ul></div>`;
}
const kpi = (k, v, s, cls = "") => `<div class="kpi"><div class="k">${k}</div><div class="v ${cls}">${v}</div>${s ? `<div class="s">${s}</div>` : ""}</div>`;
const seg = (act, cur, opts) => `<div class="seg">${opts.map(([k, t]) => `<button class="${cur === k ? "on" : ""}" data-a="${act}" data-k="${k}">${t}</button>`).join("")}</div>`;
const signed = (v, d = 2) => (N(v) >= 0 ? "+" : "") + money(v, d);

/* ---------- investor maths ---------- */
const ORDER_STATUS = { pending: ["wait", "Pending"], processed: ["ok", "Completed"], declined: ["bad", "Declined"], cancelled: ["", "Cancelled"] };
function bookStats(ledger) {
  let units = 0, book = 0, realized = 0;
  [...ledger].sort((a, b) => (a.at < b.at ? -1 : 1)).forEach((r) => {
    const u = N(r.units), amt = N(r.amount);
    if (u >= 0) { units += u; book += amt; }
    else { const avg = units > 0 ? book / units : 0, cost = avg * -u; realized += -amt - cost; book -= cost; units += u; }
  });
  if (units < 1e-9) { units = 0; book = 0; }
  return { units, book, realized, avg: units > 0 ? book / units : 0 };
}
const navAt = (d) => { const r = [...S.nav].reverse().find((x) => x.d <= d); return r ? N(r.nav) : N(S.settings.initial_nav) || 10; };
const unitsAt = (d) => S.ledger.filter((r) => r.at.slice(0, 10) <= d).reduce((a, r) => a + N(r.units), 0);
function myDistributions() {
  return (S.dist || []).map((d) => { const held = unitsAt(d.d); return { ...d, held, paid: held * N(d.per_unit) }; }).filter((d) => d.held > 0);
}
function rangeSeries() {
  let pts = myValueSeries(); const r = RANGES.find((x) => x[0] === (S.prange || "All"))[1];
  if (r !== null && pts.length > 2) { const c = cutoff(r, pts[pts.length - 1].d), cut = pts.filter((p) => p.d >= c); if (cut.length >= 2) pts = cut; }
  return pts;
}
function investedSeries(pts) { return pts.map((p) => ({ d: p.d, v: S.ledger.filter((r) => r.at.slice(0, 10) <= p.d).reduce((a, r) => a + N(r.amount), 0) })); }
function feed() {
  const f = [];
  S.orders.forEach((o) => { if (o.status === "processed") f.push({ at: o.processed_at, t: o.kind === "subscribe" ? "Subscription completed" : "Redemption completed", d: `${money(o.filled_amount)} at ${money(o.nav, 4)} per unit (${o.reference})`, href: "portal-transactions" }); if (o.status === "declined") f.push({ at: o.processed_at, t: "Request declined", d: `${o.reference}${o.note ? ": " + o.note : ""}`, href: "portal-transactions" }); });
  (S.notices || []).forEach((n) => f.push({ at: n.published_at, t: "Fund notice", d: n.title, href: "portal-fund" }));
  S.msgs.filter((m) => m.from_manager).forEach((m) => f.push({ at: m.at, t: "Message from the manager", d: m.body.slice(0, 90), href: "portal-messages" }));
  myDistributions().forEach((d) => f.push({ at: d.d + "T12:00:00", t: "Distribution paid", d: `${money(d.paid)} (${money(d.per_unit, 4)} per unit)`, href: "portal-performance" }));
  if (S.application?.reviewed_at) f.push({ at: S.application.reviewed_at, t: "Application " + APP_STATUS[S.application.status][1].toLowerCase(), d: S.application.manager_note || "", href: "apply" });
  return f.filter((x) => x.at).sort((a, b) => (a.at < b.at ? 1 : -1));
}
const prefs = () => S.profile?.prefs || {};
const unseen = () => { const seen = prefs().seen_at || ""; return feed().filter((x) => x.at > seen).length; };
async function savePrefs(p) { await q(sb.rpc("update_prefs", { p })); S.profile = { ...S.profile, prefs: { ...prefs(), ...p } }; }

/* ---------- investor account ---------- */
function portalNav() {
  const unread = S.msgs.filter((m) => m.from_manager && !m.read_at).length, pend = S.orders.filter((o) => o.status === "pending").length, un = unseen();
  if (!isInv()) return [{ h: "Account", items: [["apply", "Application", "file"], ["portal-messages", "Messages", "chat", unread], ["portal-profile", "Profile", "user"], ["portal-security", "Security", "lock"], ["portal-help", "Help", "help"]] }];
  return [
    { h: "Overview", items: [["portal", "Home", "home"], ["portal-holdings", "Holdings", "pie"], ["portal-performance", "Performance", "chart"], ["portal-transactions", "Activity", "list", pend]] },
    { h: "Move money", items: [["portal-invest", "Invest", "plus"], ["portal-recurring", "Recurring", "repeat"], ["portal-redeem", "Redeem", "minus"]] },
    { h: "Plan", items: [["portal-goals", "Goals", "target"], ["portal-fund", "Fund centre", "bank"]] },
    { h: "Documents", items: [["portal-documents", "Statements", "file"], ["portal-tax", "Tax centre", "receipt"]] },
    { h: "Account", items: [["portal-notifications", "Notifications", "bell", un], ["portal-messages", "Messages", "chat", unread], ["portal-profile", "Profile", "user"], ["portal-security", "Security", "lock"], ["portal-help", "Help", "help"]] },
  ];
}
function portalPage(slug, title, body, o = {}) {
  page(slug, typeof title === "function" ? "My account" : title, "portal", () => {
    if (!S.session) return authShell(authForm());
    if (!isInv() && !o.all) return `<div class="page"><div class="wrap mid"><div class="card"><h3>Your account is not open for investing yet</h3><p class="mut" style="margin-bottom:16px">${S.application ? "Your application is still being reviewed. This page opens as soon as you are accepted." : "Apply first. This page opens once the manager accepts you."}</p><div class="bar"><a class="btn pri" href="#apply">${S.application ? "View my application" : "Apply to invest"}</a><a class="btn" href="#portal-messages">Message the manager</a></div></div></div></div>`;
    return appShell({ slug, label: "Investor account", title: typeof title === "function" ? title() : o.h || title, sub: o.sub ? o.sub() : "", nav: portalNav(), actions: o.actions ? o.actions() : "", switchTo: isMgr() ? ["console", "Manager console"] : null, body: body() });
  });
}
const pendingList = (kind) => { const p = S.orders.filter((o) => o.status === "pending" && (!kind || o.kind === kind)), st = S.settings; if (!p.length) return "";
  return `<div class="card"><h3>Waiting on the manager</h3>${p.map((o) => `<div class="bar" style="padding:12px 0;border-top:1px solid var(--line)"><div><b>${o.kind === "subscribe" ? "Subscription of " + money(o.amount) : o.redeem_all ? "Redemption of all units" : "Redemption of " + num(o.units, 4) + " units"}</b><span class="mut" style="display:block;font-size:13px">Reference <span class="tick">${esc(o.reference)}</span>, placed ${day(o.created_at)}${o.note ? ", " + esc(o.note.toLowerCase()) : ""}</span></div><button class="btn sm danger sp" data-a="cancel" data-id="${o.id}">Cancel</button></div>`).join("")}
  ${p.some((o) => o.kind === "subscribe") ? `<div class="note" style="margin-top:12px"><b>How to send your money.</b> ${st.deposit_instructions ? esc(st.deposit_instructions) : "The manager will send you payment instructions."} Quote your reference so the payment can be matched to you. Units are issued after the money arrives.</div>` : ""}</div>`; };
const hello = () => { const h = new Date().getHours(), n = (S.profile?.full_name || "").split(" ")[0]; return (h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening") + (n ? ", " + esc(n) : ""); };

portalPage("portal", hello, () => {
  const m = myStats(), b = bookStats(S.ledger), pts = rangeSeries(), share = N(S.snap?.units) > 0 ? m.units / N(S.snap.units) : 0;
  let gain = null, gp = null;
  if (pts.length >= 2) { const s0 = pts[0], flows = S.ledger.filter((r) => r.at.slice(0, 10) > s0.d).reduce((a, r) => a + N(r.amount), 0); gain = pts[pts.length - 1].v - s0.v - flows; gp = s0.v + Math.max(0, flows) > 0 ? gain / (s0.v + Math.max(0, flows)) : null; }
  const f = feed().slice(0, 5), g = prefs().goal, plan = S.plan;
  return `<section class="hero-card"><div class="hc-top"><div><div class="k">Total value</div><div class="big">${money(m.value)}</div><div class="${sign(gain)} chg">${gain === null ? "Your chart starts with your first subscription" : `${signed(gain)} ${gp !== null ? "(" + pct(gp) + ")" : ""} <span class="mut">${(S.prange || "All") === "All" ? "since you started" : "in this period"}</span>`}</div></div>${seg("prange", S.prange || "All", RANGES.map(([k]) => [k, k]))}</div>
    ${lineChart(pts, (v, axis) => (axis ? big(v) : money(v)), m.units > 0 ? "Your chart fills in as the fund records valuations." : "Make your first investment to see your chart.")}
    <div class="hc-actions"><a class="btn pri" href="#portal-invest">${I.plus} Invest</a><a class="btn" href="#portal-redeem">${I.minus} Redeem</a><a class="btn" href="#portal-recurring">${I.repeat} Recurring</a><a class="btn" href="#portal-documents">${I.file} Statement</a></div></section>
  <div class="kpis">${kpi("Units held", num(m.units, 4), "At " + money(liveNav(), 4) + " per unit")}${kpi("Book cost", money(b.book), b.units > 0 ? "Average " + money(b.avg, 4) : "")}${kpi("Unrealized gain", b.book > 0 ? signed(m.value - b.book) : "–", b.book > 0 ? pct((m.value - b.book) / b.book) : "", sign(m.value - b.book))}${kpi("Share of the fund", share > 0 ? (share * 100).toFixed(2) + "%" : "–", "Net assets " + (S.snap && N(S.snap.aum) > 0 ? big(S.snap.aum) : "–"))}</div>
  ${pendingList()}
  <div class="cols2"><div class="card"><div class="bar"><h3 style="margin:0">Where your money is invested</h3><a class="tl sp" href="#portal-holdings">Holdings</a></div><div style="margin-top:14px">${donut(sectorRows(), ["Positions", String(S.snap?.positions || 0)])}</div></div>
  <div class="card"><div class="bar"><h3 style="margin:0">Recent activity</h3><a class="tl sp" href="#portal-notifications">All</a></div>${f.length ? `<ul class="feed">${f.map((x) => `<li><a href="#${x.href}"><b>${esc(x.t)}</b><span>${esc(x.d)}</span><small>${day(x.at)}</small></a></li>`).join("")}</ul>` : `<div class="empty">Nothing yet. Activity on your account appears here.</div>`}</div></div>
  <div class="cols2"><div class="card"><div class="bar"><h3 style="margin:0">Your goal</h3><a class="tl sp" href="#portal-goals">${g ? "Edit" : "Set a goal"}</a></div>${g ? `<p style="margin:12px 0 8px"><b>${esc(g.name || "My goal")}</b> <span class="mut">${money(g.target, 0)}${g.date ? " by " + day(g.date) : ""}</span></p><div class="meter"><i style="width:${Math.min(100, (m.value / N(g.target)) * 100).toFixed(1)}%"></i></div><p class="hint">${Math.min(100, (m.value / N(g.target)) * 100).toFixed(0)}% of the way there</p>` : `<p class="mut" style="margin-top:12px">Set a target and see how your investment is tracking toward it.</p>`}</div>
  <div class="card"><div class="bar"><h3 style="margin:0">Recurring investment</h3><a class="tl sp" href="#portal-recurring">${plan ? "Manage" : "Set up"}</a></div>${plan ? `<p style="margin-top:12px"><b>${money(plan.amount)}</b> ${{ weekly: "every week", biweekly: "every two weeks", monthly: "every month" }[plan.frequency]}</p><p class="hint">Next contribution ${day(plan.next_date)}</p>` : `<p class="mut" style="margin-top:12px">Invest a fixed amount on a schedule so you do not have to remember.</p>`}</div></div>`;
}, { sub: () => `${esc(S.settings.name)}. NAV per unit ${money(liveNav(), 4)}${S.nav.length ? ", valued " + day(S.nav[S.nav.length - 1].d) : ""}.` });
ACT.prange = (b) => { S.prange = b.dataset.k; render(); };

portalPage("portal-holdings", "Holdings", () => {
  const m = myStats(), aum = N(S.snap?.aum), h = [...S.fundHoldings].sort((a, b) => N(b.qty) * N(b.last_price) - N(a.qty) * N(a.last_price)), share = N(S.snap?.units) > 0 ? m.units / N(S.snap.units) : 0, cashW = N(S.snap?.cash_weight);
  const view = S.hview || "holdings", sect = sectorRows();
  return `<div class="cols2"><div class="card"><h3>By sector</h3>${donut(sect, ["Your value", big(m.value)])}</div><div class="card"><h3>Largest positions</h3>${h.length ? allocBars(h.slice(0, 6).map((x) => ({ label: x.ticker, w: aum > 0 ? N(x.qty) * N(x.last_price) / aum : 0 }))) : `<div class="empty">The fund has no holdings yet.</div>`}</div></div>
  <div class="bar">${seg("hview", view, [["holdings", "By holding"], ["sectors", "By sector"]])}<span class="mut sp" style="font-size:13px">Your units give you a ${share > 0 ? (share * 100).toFixed(2) + "%" : "0%"} share of each position.</span></div>
  <div class="tablebox">${view === "sectors" ? (sect.length ? `<table><thead><tr><th>Sector</th><th class="n">Weight</th><th class="n">Your share</th></tr></thead><tbody>${sect.map((x) => `<tr><td>${esc(x.label)}</td><td class="n">${(x.w * 100).toFixed(2)}%</td><td class="n">${money(x.w * m.value)}</td></tr>`).join("")}</tbody></table>` : `<div class="empty">The fund has no holdings yet.</div>`)
    : h.length ? `<table><thead><tr><th>Holding</th><th>Sector</th><th class="n">Price</th><th class="n">Weight</th><th class="n">Your share</th></tr></thead><tbody>${h.map((x) => { const mv = N(x.qty) * N(x.last_price); return `<tr><td><span class="tick">${esc(x.ticker)}</span><span class="sub">${esc(x.name)}</span></td><td>${esc(x.sector)}</td><td class="n">${money(x.last_price)}</td><td class="n">${aum > 0 ? (mv / aum * 100).toFixed(2) + "%" : "–"}</td><td class="n">${money(mv * share)}</td></tr>`; }).join("")}${cashW > 0 ? `<tr><td>Cash</td><td></td><td></td><td class="n">${(cashW * 100).toFixed(2)}%</td><td class="n">${money(cashW * aum * share)}</td></tr>` : ""}</tbody><tfoot><tr><td colspan="3">Total</td><td class="n">100%</td><td class="n">${money(m.value)}</td></tr></tfoot></table>` : `<div class="empty">The fund has no holdings yet.</div>`}</div>`;
}, { sub: () => "What the fund owns, and the value of your share of each position." });
ACT.hview = (b) => { S.hview = b.dataset.k; render(); };

portalPage("portal-performance", "Performance", () => {
  const m = myStats(), b = bookStats(S.ledger), un = m.value - b.book, dist = myDistributions(), distTot = dist.reduce((a, d) => a + d.paid, 0), total = un + b.realized + distTot, pts = myValueSeries();
  const first = S.ledger[0], since = first ? liveNav() / N(first.nav) - 1 : null;
  return `<div class="kpis">${kpi("Total gain or loss", m.paid > 0 ? signed(total) : "–", m.paid > 0 ? pct(total / m.paid) + " on money invested" : "No money invested yet", sign(total))}${kpi("Unrealized", b.book > 0 ? signed(un) : "–", "On units you hold", sign(un))}${kpi("Realized", signed(b.realized), "On units you redeemed", sign(b.realized))}${kpi("Distributions", money(distTot), dist.length + " received")}</div>
  <div class="card"><h3>Value against money invested</h3>${lineChart(pts, (v, axis) => (axis ? big(v) : money(v)), "Your chart starts with your first subscription.", pts.length >= 2 ? investedSeries(pts) : null)}<p class="hint">Solid line: market value. Dashed line: net money you have put in.</p></div>
  <div class="cols2"><div class="card"><h3>Fund returns</h3><table><tbody>${RANGES.map(([k, r], i) => { const v = periodReturn(r); return `<tr><td>${["1 month", "3 months", "6 months", "Year to date", "1 year", "Since inception"][i]}</td><td class="n ${sign(v)}">${v === null ? "–" : pct(v)}</td></tr>`; }).join("")}${since !== null ? `<tr><td><b>Since your first investment</b></td><td class="n ${sign(since)}"><b>${pct(since)}</b></td></tr>` : ""}</tbody></table><p class="hint">The fund's return per unit. Your own result also depends on when you added and withdrew money.</p></div>
  <div class="card"><h3>NAV per unit</h3>${lineChart(navSeries(), (v) => money(v, 4), "The chart starts once the fund has two valuations on record.")}</div></div>
  <div><h3 class="sub" style="margin-bottom:10px">Each subscription</h3><div class="tablebox">${S.ledger.some((r) => N(r.units) > 0) ? `<table><thead><tr><th>Date</th><th class="n">Amount</th><th class="n">NAV per unit paid</th><th class="n">Units</th><th class="n">Fund return since</th></tr></thead><tbody>${S.ledger.filter((r) => N(r.units) > 0).reverse().map((r) => { const c = liveNav() / N(r.nav) - 1; return `<tr><td>${day(r.at)}</td><td class="n">${money(r.amount)}</td><td class="n">${money(r.nav, 4)}</td><td class="n">${num(r.units, 4)}</td><td class="n ${sign(c)}">${pct(c)}</td></tr>`; }).join("")}</tbody></table>` : `<div class="empty">No subscriptions yet.</div>`}</div></div>
  ${dist.length ? `<div><h3 class="sub" style="margin-bottom:10px">Distributions</h3><div class="tablebox"><table><thead><tr><th>Record date</th><th>Type</th><th class="n">Per unit</th><th class="n">Units held</th><th class="n">Paid to you</th></tr></thead><tbody>${dist.map((d) => `<tr><td>${day(d.d)}</td><td>${esc(d.kind)}</td><td class="n">${money(d.per_unit, 4)}</td><td class="n">${num(d.held, 4)}</td><td class="n">${money(d.paid)}</td></tr>`).join("")}</tbody></table></div></div>` : ""}
  <p class="hint">Gains use the average cost of your units. Past performance does not indicate future results.</p>`;
}, { sub: () => "How your investment has done, and why." });

portalPage("portal-transactions", "Activity", () => {
  const f = S.txFilter || "all", term = (S.txQ || "").toLowerCase();
  const rows = [...S.ledger].reverse().map((r) => ({ r, o: S.orders.find((x) => x.id === r.order_id) })).filter(({ r, o }) => (f === "all" || r.kind === f) && (!term || (o?.reference || "").toLowerCase().includes(term) || day(r.at).toLowerCase().includes(term) || String(Math.abs(N(r.amount))).includes(term)));
  const other = S.orders.filter((o) => o.status === "declined" || o.status === "cancelled");
  return `${pendingList()}<div class="bar">${seg("txfilter", f, [["all", "All"], ["subscription", "Subscriptions"], ["redemption", "Redemptions"]])}<input class="sp" style="max-width:220px" placeholder="Search reference or amount" value="${esc(S.txQ || "")}" data-q="tx" aria-label="Search activity"><button class="btn sm" data-a="txcsv">${I.down} CSV</button></div>
  <div class="tablebox">${rows.length ? `<table><thead><tr><th>Date</th><th>Type</th><th>Reference</th><th class="n">Amount</th><th class="n">NAV per unit</th><th class="n">Units</th><th></th></tr></thead><tbody>${rows.map(({ r, o }) => `<tr><td>${day(r.at)}</td><td><span class="pill ${r.kind === "subscription" ? "ok" : "wait"}">${r.kind === "subscription" ? "Subscription" : "Redemption"}</span></td><td class="tick">${esc(o?.reference || "")}</td><td class="n">${money(Math.abs(N(r.amount)))}</td><td class="n">${money(r.nav, 4)}</td><td class="n ${sign(r.units)}">${N(r.units) > 0 ? "+" : ""}${num(r.units, 4)}</td><td class="n"><button class="btn sm ghost" data-a="confirmation" data-id="${r.id}">Confirmation</button></td></tr>`).join("")}</tbody></table>` : `<div class="empty">No transactions to show.</div>`}</div>
  ${other.length ? `<div><h3 class="sub" style="margin-bottom:10px">Requests that did not go through</h3><div class="tablebox"><table><thead><tr><th>Placed</th><th>Reference</th><th>Request</th><th>Status</th><th>Note</th></tr></thead><tbody>${other.map((o) => `<tr><td>${day(o.created_at)}</td><td class="tick">${esc(o.reference)}</td><td>${o.kind === "subscribe" ? "Subscription " + money(o.amount) : "Redemption"}</td><td><span class="pill ${ORDER_STATUS[o.status][0]}">${ORDER_STATUS[o.status][1]}</span></td><td class="mut">${esc(o.note)}</td></tr>`).join("")}</tbody></table></div></div>` : ""}`;
}, { sub: () => "Every subscription, redemption and request on your account." });
ACT.txfilter = (b) => { S.txFilter = b.dataset.k; render(); };
ACT.txcsv = () => downloadCsv("transactions.csv", [["Date", "Type", "Amount", "NAV per unit", "Units"], ...S.ledger.map((r) => [r.at.slice(0, 10), r.kind, N(r.amount), N(r.nav), N(r.units)])]);
ACT.confirmation = (b) => { S.confId = N(b.dataset.id); location.hash = "#portal-confirmation"; };
document.addEventListener("change", (e) => { const i = e.target.closest("[data-q=tx]"); if (i) { S.txQ = i.value; render(); } });

portalPage("portal-confirmation", "Transaction confirmation", () => {
  const r = S.ledger.find((x) => x.id === S.confId), st = S.settings; if (!r) return `<div class="card"><div class="empty">Choose a transaction from <a class="tl" href="#portal-transactions">Activity</a> to see its confirmation.</div></div>`;
  const o = S.orders.find((x) => x.id === r.order_id);
  return `<div class="bar noprint"><a class="btn sm" href="#portal-transactions">${I.back} Activity</a><button class="btn sm sp" data-a="print">Print or save as PDF</button></div>
  <div class="stmt"><div class="bar"><div><b style="font-size:18px">${esc(st.name)}</b><div class="mut">${esc(legalName())}</div></div><div class="sp" style="text-align:right"><b>Transaction confirmation</b><div class="mut">${esc(o?.reference || "")}</div></div></div>
  <p style="margin:18px 0 12px"><b>${esc(S.profile.full_name || "")}</b><br><span class="mut">${esc(S.session.user.email)}</span></p>
  ${dl([["Transaction", r.kind === "subscription" ? "Subscription (purchase of units)" : "Redemption (sale of units)"], ["Trade date", day(r.at)], ["Fund", st.name], ["NAV per unit", money(r.nav, 4)], ["Units", num(Math.abs(N(r.units)), 6)], [r.kind === "subscription" ? "Amount invested" : "Proceeds", money(Math.abs(N(r.amount)))], ["Units held after", num(unitsAt(r.at.slice(0, 10)), 4)], ["Requested", o ? day(o.created_at) : null]])}
  <p class="hint" style="margin-top:16px">Keep this confirmation for your records. Contact the manager through the message centre if anything looks wrong.</p></div>`;
});
ACT.print = () => window.print();

portalPage("portal-invest", "Invest", () => {
  const m = myStats(), st = S.settings, first = m.units === 0 && !S.orders.some((o) => o.status === "pending" && o.kind === "subscribe"), min = first ? N(st.min_initial) : N(st.min_additional);
  return `<div class="cols2"><form class="card" data-f="subscribe" novalidate><h3>One-time investment</h3>
    <div class="field"><label for="po-amt">Amount (${esc(st.currency)})</label><input id="po-amt" class="num xl" name="amount" type="number" min="${min || 0}" step="0.01" required placeholder="0.00" data-est="sub"><div class="chips">${[1000, 5000, 10000, 25000].filter((x) => x >= min).map((x) => `<button type="button" class="chip" data-a="amt" data-v="${x}">${money(x, 0)}</button>`).join("")}</div>
    <div class="hint" id="est-sub">${min > 0 ? "Minimum " + money(min, 0) + ". " : ""}Current NAV per unit is ${money(liveNav(), 4)}.</div></div>
    <button class="btn pri lg" type="submit" ${st.accepting === false ? "disabled" : ""}>Place subscription</button>${st.accepting === false ? `<div class="hint">The fund is closed to new subscriptions right now.</div>` : ""}</form>
  <div class="card"><h3>How it works</h3><ol class="steps" style="padding-left:18px"><li>Place the subscription here.</li><li>Send payment quoting your reference.</li><li>The manager issues your units when payment arrives, at that day's NAV per unit.</li></ol><p style="margin-top:12px"><a class="tl" href="#portal-recurring">Set up a recurring investment</a></p></div></div>
  ${pendingList("subscribe")}`;
}, { sub: () => "Add money to your investment." });
ACT.amt = (b) => { const i = b.closest("form").amount; i.value = b.dataset.v; i.dispatchEvent(new Event("input", { bubbles: true })); };
document.addEventListener("input", (e) => {
  const i = e.target.closest("[data-est]"); if (!i) return; const v = N(i.value), nav = liveNav(), o = document.getElementById("est-" + i.dataset.est); if (!o) return;
  if (i.dataset.est === "sub") o.textContent = v > 0 ? `About ${num(v / nav, 4)} units at today's NAV per unit of ${money(nav, 4)}. The price on the day your payment arrives is the one that counts.` : `Current NAV per unit is ${money(nav, 4)}.`;
  if (i.dataset.est === "red") { const m = myStats(), mode = i.form.mode.value, u = mode === "amount" ? v / nav : v; o.textContent = v > 0 ? `About ${mode === "amount" ? num(u, 4) + " units" : money(u * nav)} at today's NAV per unit. You would keep about ${num(Math.max(0, m.units - u), 4)} units.` : ""; }
});

portalPage("portal-recurring", "Recurring investment", () => {
  const p = S.plan, st = S.settings, F = { weekly: "Every week", biweekly: "Every two weeks", monthly: "Every month" };
  return `<div class="cols2"><form class="card" data-f="plan" novalidate><h3>${p ? "Change your plan" : "Set up a plan"}</h3>
    <div class="field"><label for="pl-a">Amount each time (${esc(st.currency)})</label><input id="pl-a" class="num xl" name="amount" type="number" min="${N(st.min_additional) || 0}" step="0.01" required value="${p ? N(p.amount) : ""}" placeholder="0.00">${N(st.min_additional) > 0 ? `<div class="hint">Minimum ${money(st.min_additional, 0)}.</div>` : ""}</div>
    <fieldset class="obf" style="margin-bottom:14px"><legend>How often</legend><div class="tiles short">${Object.entries(F).map(([k, t]) => `<label class="otile"><input type="radio" name="frequency" value="${k}" ${(p?.frequency || "monthly") === k ? "checked" : ""} required><span><b>${t}</b></span></label>`).join("")}</div></fieldset>
    <div class="field"><label for="pl-d">${p ? "Next contribution" : "First contribution"}</label><input id="pl-d" name="start" type="date" min="${today()}" value="${p && p.next_date >= today() ? p.next_date : today()}" required></div>
    <div class="bar"><button class="btn pri" type="submit">${p ? "Save plan" : "Start plan"}</button>${p ? `<button class="btn danger" type="button" data-a="stopplan">Stop plan</button>` : ""}</div></form>
  <div class="card"><h3>${p ? "Your plan" : "How recurring investing works"}</h3>${p ? dl([["Amount", money(p.amount)], ["Frequency", F[p.frequency]], ["Next contribution", day(p.next_date)], ["Per year, about", money(N(p.amount) * { weekly: 52, biweekly: 26, monthly: 12 }[p.frequency], 0)]]) : ""}
    <ul class="ticks" style="margin:${p ? "16px" : "0"} 0 0"><li>On each date, a subscription request is created for you.</li><li>You send payment with its reference, as with any subscription.</li><li>Units are issued at the NAV per unit when payment arrives.</li><li>Change or stop the plan at any time.</li></ul>
    <p class="hint">Investing regularly spreads your purchases over time. It does not guarantee a profit or protect against loss.</p></div></div>`;
}, { sub: () => "Invest a fixed amount on a schedule." });
FORMS.plan = async (d) => { await q(sb.rpc("set_plan", { p_amount: N(d.amount), p_frequency: d.frequency, p_start: d.start })); toast("Recurring plan saved."); await refresh(); };
ACT.stopplan = async () => { if (await ask("Stop your recurring plan?", "No further contributions will be created. Requests already created stay as they are.", "Stop plan")) { await q(sb.rpc("stop_plan", {})); toast("Plan stopped."); await refresh(); } };

portalPage("portal-redeem", "Redeem", () => {
  const m = myStats(), st = S.settings, reserved = S.orders.filter((o) => o.status === "pending" && o.kind === "redeem").reduce((a, o) => a + (o.redeem_all ? m.units : N(o.units)), 0), avail = m.units - reserved, b = bookStats(S.ledger);
  return `<div class="cols2"><form class="card" data-f="redeem2" novalidate><h3>Request a redemption</h3>
    <fieldset class="obf" style="margin-bottom:14px"><legend>Redeem by</legend><div class="tiles short">${[["amount", "Amount"], ["units", "Units"], ["all", "Everything"]].map(([k, t], i) => `<label class="otile"><input type="radio" name="mode" value="${k}" ${i === 0 ? "checked" : ""}><span><b>${t}</b></span></label>`).join("")}</div></fieldset>
    <div class="field"><label for="po-rv">Amount or units</label><input id="po-rv" class="num xl" name="value" type="number" min="0" step="0.000001" placeholder="0.00" data-est="red"><div class="hint">Available: ${num(avail, 4)} units, about ${money(avail * liveNav())}.</div><div class="hint" id="est-red"></div></div>
    <button class="btn pri lg" type="submit" ${avail <= 0 ? "disabled" : ""}>Request redemption</button></form>
  <div class="card"><h3>Before you redeem</h3>${dl([["Units available", num(avail, 4)], ["Average cost per unit", b.units > 0 ? money(b.avg, 4) : null], ["Current NAV per unit", money(liveNav(), 4)], ["Gain per unit", b.units > 0 ? signed(liveNav() - b.avg, 4) : null]])}
    <p class="mut" style="margin-top:12px">${esc(st.redemption_terms || "Redemptions are paid at the NAV per unit on the day the manager processes them.")}</p><p class="mut" style="margin-top:8px">The amount you receive depends on the price that day. A redemption may have tax consequences; see your <a class="tl" href="#portal-tax">tax centre</a>.</p></div></div>
  ${pendingList("redeem")}`;
}, { sub: () => "Withdraw some or all of your investment." });
FORMS.redeem2 = async (d) => {
  const nav = liveNav(), all = d.mode === "all", v = N(d.value);
  if (!all && !(v > 0)) throw new Error("Enter an amount or number of units, or choose Everything.");
  const u = d.mode === "amount" ? v / nav : v;
  if (!(await ask("Request this redemption?", all ? "All your units will be redeemed at the NAV per unit on the day the manager processes it." : `${num(u, 4)} units, worth about ${money(u * nav)} today. The amount paid uses the NAV per unit on the day the manager processes it.`, "Request redemption"))) return;
  await q(sb.rpc("place_order", { p_kind: "redeem", p_units: all ? null : Math.round(u * 1e6) / 1e6, p_all: all })); toast("Redemption requested."); await refresh();
};

portalPage("portal-goals", "Goals", () => {
  const g = prefs().goal || {}, m = myStats(), plan = S.plan, monthly = N(g.monthly) || (plan ? N(plan.amount) * { weekly: 52, biweekly: 26, monthly: 12 }[plan.frequency] / 12 : 0), rate = N(g.rate ?? 6);
  let proj = "";
  if (N(g.target) > 0 && g.date && g.date > today()) {
    const months = Math.max(1, Math.round((new Date(g.date) - new Date()) / (30.4375 * 864e5))), mr = Math.pow(1 + rate / 100, 1 / 12) - 1; let v = m.value; const pts = [{ d: today(), v }];
    for (let i = 1; i <= months; i++) { v = v * (1 + mr) + monthly; if (i % Math.max(1, Math.round(months / 24)) === 0 || i === months) { const dt = new Date(); dt.setMonth(dt.getMonth() + i); pts.push({ d: dt.toISOString().slice(0, 10), v }); } }
    const need = mr > 0 ? Math.max(0, (N(g.target) - m.value * Math.pow(1 + mr, months)) * mr / (Math.pow(1 + mr, months) - 1)) : Math.max(0, (N(g.target) - m.value) / months);
    proj = `<div class="card"><h3>Projection</h3><div class="kpis" style="margin-bottom:14px">${kpi("Projected value", money(v, 0), "By " + day(g.date), v >= N(g.target) ? "up" : "")}${kpi("Target", money(g.target, 0), v >= N(g.target) ? "On track at this rate" : "Short by " + money(N(g.target) - v, 0))}${kpi("Monthly amount needed", money(need, 0), "To reach the target at " + rate + "% a year")}</div>
    ${lineChart(pts, (x, axis) => (axis ? big(x) : money(x, 0)), "")}<p class="hint">A hypothetical illustration at the ${rate}% annual return you entered, adding ${money(monthly, 0)} a month. It is not a forecast. The fund's returns will vary and can be negative.</p></div>`;
  }
  return `<div class="cols2"><form class="card" data-f="goal" novalidate><h3>Your goal</h3>
    <div class="field"><label for="go-n">What are you investing for?</label><input id="go-n" name="name" value="${esc(g.name || "")}" placeholder="Long-term growth"></div>
    <div class="row"><div class="field"><label for="go-t">Target amount (${esc(cur())})</label><input id="go-t" class="num" name="target" type="number" min="1" step="100" required value="${g.target || ""}"></div><div class="field"><label for="go-d">Target date</label><input id="go-d" name="date" type="date" min="${today()}" value="${esc(g.date || "")}" required></div></div>
    <div class="row"><div class="field"><label for="go-m">Monthly contribution</label><input id="go-m" class="num" name="monthly" type="number" min="0" step="50" value="${g.monthly ?? (monthly ? Math.round(monthly) : "")}"></div><div class="field"><label for="go-r">Assumed annual return (%)</label><input id="go-r" class="num" name="rate" type="number" min="-20" max="30" step="0.5" value="${rate}"></div></div>
    <div class="bar"><button class="btn pri" type="submit">Save goal</button>${g.target ? `<button class="btn ghost" type="button" data-a="cleargoal">Remove goal</button>` : ""}</div></form>
  <div class="card"><h3>Progress</h3>${N(g.target) > 0 ? `<div class="big2">${Math.min(100, m.value / N(g.target) * 100).toFixed(0)}%</div><div class="meter"><i style="width:${Math.min(100, m.value / N(g.target) * 100).toFixed(1)}%"></i></div><p class="mut" style="margin-top:10px">${money(m.value, 0)} of ${money(g.target, 0)}${g.date ? ", target date " + day(g.date) : ""}</p>` : `<p class="mut">Set a target amount and date to track your progress and see a projection.</p>`}</div></div>${proj}`;
}, { sub: () => "Set a target and see whether you are on track." });
FORMS.goal = async (d) => { await savePrefs({ goal: { name: (d.name || "").trim(), target: N(d.target), date: d.date, monthly: N(d.monthly), rate: N(d.rate) } }); toast("Goal saved."); render(); };
ACT.cleargoal = async () => { await savePrefs({ goal: null }); render(); };

portalPage("portal-fund", "Fund centre", () => {
  const st = S.settings, n = S.nav.length, last = S.nav[n - 1], rs = riskStats(), notices = (S.notices || []).slice(0, 6);
  return `<div class="kpis">${kpi("NAV per unit", money(liveNav(), 4), last ? "Valued " + day(last.d) : "Initial price")}${kpi("Since inception", sinceInception() === null ? "–" : pct(sinceInception()), st.inception_date ? "From " + day(st.inception_date) : "", sign(sinceInception()))}${kpi("Net assets", S.snap && N(S.snap.aum) > 0 ? big(S.snap.aum) : "–", (S.snap?.positions || 0) + " positions")}${kpi("Largest fall from a peak", rs ? pct(rs.dd) : "–", "Risk rating: High")}</div>
  <div class="card"><div class="bar"><h3 style="margin:0">Growth of ${money(10000, 0)}</h3><div class="sp">${seg("range2", S.range || "All", RANGES.map(([k]) => [k, k]))}</div></div><div style="margin-top:12px">${lineChart(growthSeries(), (v, axis) => money(v, axis ? 0 : 2), "The chart starts once the fund has two valuations on record.")}</div></div>
  <div class="cols2"><div class="card"><h3>Fund facts</h3>${dl([["Management fee", N(st.mgmt_fee_pct) > 0 ? num(st.mgmt_fee_pct, 2) + "% per year" : null], ["Performance fee", N(st.perf_fee_pct) > 0 ? num(st.perf_fee_pct, 2) + "%" : null], ["Dealing", st.dealing || null], ["Redemptions", st.redemption_terms || null], ["Benchmark", st.benchmark || null], ["Portfolio manager", st.manager_name || null], ["Base currency", st.currency], ["Foreign currency holdings", fxShare()], ["Currency conversion costs to date", fxCost()]])}<p style="margin-top:12px"><a class="tl" href="#fund">Full fund page</a> &nbsp; <a class="tl" href="#fund-prices">Price history</a></p></div>
  <div class="card"><h3>Notices from the manager</h3>${notices.length ? `<ul class="feed">${notices.map((x) => `<li><a href="#notices"><b>${esc(x.title)}</b><span>${esc(x.body.slice(0, 110))}</span><small>${day(x.published_at)}</small></a></li>`).join("")}</ul>` : `<div class="empty">No notices.</div>`}</div></div>
  <div><h3 class="sub" style="margin-bottom:10px">Monthly returns (%)</h3>${monthGrid() || `<div class="tablebox"><div class="empty">No valuations yet.</div></div>`}</div>`;
}, { sub: () => "Everything about the fund you are invested in." });
ACT.range2 = (b) => { S.range = b.dataset.k; render(); };

function stmtPeriods() {
  const first = S.ledger[0]?.at.slice(0, 7) || today().slice(0, 7), out = [["all", "Since opening"], ["ytd", today().slice(0, 4) + " year to date"]];
  let y = Number(today().slice(0, 4)), mo = Number(today().slice(5, 7));
  for (let i = 0; i < 36; i++) { const k = y + "-" + String(mo).padStart(2, "0"); if (k < first) break; out.push([k, new Date(y, mo - 1, 1).toLocaleDateString("en-CA", { month: "long", year: "numeric" })]); mo--; if (mo < 1) { mo = 12; y--; } }
  return out;
}
portalPage("portal-documents", "Statements", () => {
  const st = S.settings, P = stmtPeriods(), k = P.some((x) => x[0] === S.stmtP) ? S.stmtP : "all";
  let from = "0000-00-00", to = today(), label = P.find((x) => x[0] === k)[1];
  if (k === "ytd") from = today().slice(0, 4) + "-01-01"; else if (k !== "all") { from = k + "-01"; const [y, mo] = k.split("-").map(Number); const e = new Date(y, mo, 0); to = [e.getFullYear(), String(e.getMonth() + 1).padStart(2, "0"), String(e.getDate()).padStart(2, "0")].join("-"); if (to > today()) to = today(); }
  const before = (() => { const d = new Date(from + "T12:00:00"); d.setDate(d.getDate() - 1); return k === "all" ? null : d.toISOString().slice(0, 10); })();
  const openU = before ? unitsAt(before) : 0, openV = before ? openU * navAt(before) : 0, closeU = unitsAt(to), closeNav = to === today() ? liveNav() : navAt(to), closeV = closeU * closeNav;
  const tx = S.ledger.filter((r) => r.at.slice(0, 10) >= from && r.at.slice(0, 10) <= to), flows = tx.reduce((a, r) => a + N(r.amount), 0), b = bookStats(S.ledger.filter((r) => r.at.slice(0, 10) <= to));
  let bal = openU;
  return `<div class="bar noprint"><label for="st-p" style="margin:0">Period</label><select id="st-p" style="max-width:240px" data-q="stmt">${P.map(([v, t]) => `<option value="${v}" ${v === k ? "selected" : ""}>${t}</option>`).join("")}</select><button class="btn sm sp" data-a="print">Print or save as PDF</button><button class="btn sm" data-a="txcsv">${I.down} Transactions</button></div>
  <div class="stmt"><div class="bar"><div><b style="font-size:18px">${esc(st.name)}</b><div class="mut">${esc(legalName())}</div></div><div class="sp" style="text-align:right"><b>Account statement</b><div class="mut">${esc(label)}</div></div></div>
    <p style="margin:18px 0 12px"><b>${esc(S.profile.full_name || "")}</b><br><span class="mut">${esc(S.session.user.email)}</span></p>
    ${dl([["Opening value", money(openV)], ["Opening units", num(openU, 4)], ["Net money in or out", signed(flows)], ["Change in value", signed(closeV - openV - flows)], ["Closing units", num(closeU, 4)], ["Closing NAV per unit", money(closeNav, 4)], ["Closing value", money(closeV)], ["Book cost at close", money(b.book)]])}
    <h3 style="margin:22px 0 8px">Transactions in this period</h3>
    ${tx.length ? `<div style="overflow-x:auto"><table><thead><tr><th>Date</th><th>Type</th><th class="n">Amount</th><th class="n">NAV per unit</th><th class="n">Units</th><th class="n">Balance</th></tr></thead><tbody>${tx.map((r) => { bal += N(r.units); return `<tr><td>${day(r.at)}</td><td>${r.kind === "subscription" ? "Subscription" : "Redemption"}</td><td class="n">${money(Math.abs(N(r.amount)))}</td><td class="n">${money(r.nav, 4)}</td><td class="n">${num(r.units, 4)}</td><td class="n">${num(bal, 4)}</td></tr>`; }).join("")}</tbody></table></div>` : `<p class="mut">No transactions in this period.</p>`}
    <p class="hint" style="margin-top:16px">Values use the fund's NAV per unit at each date. This statement is for your records and is not a tax document.</p></div>
  <div class="noprint"><h3 class="sub" style="margin-bottom:6px">Fund documents</h3>${docList(S.docs || [], "No documents have been published yet.")}</div>`;
}, { sub: () => "Statements for any period, and documents from the fund." });
document.addEventListener("change", (e) => { const s = e.target.closest("[data-q=stmt]"); if (s) { S.stmtP = s.value; render(); } });

portalPage("portal-tax", "Tax centre", () => {
  const years = {}, dist = myDistributions(); let units = 0, book = 0;
  [...S.ledger].sort((a, b) => (a.at < b.at ? -1 : 1)).forEach((r) => { const y = r.at.slice(0, 4), Y = (years[y] = years[y] || { sub: 0, red: 0, cost: 0, gain: 0, dist: 0 }), u = N(r.units), amt = N(r.amount);
    if (u >= 0) { units += u; book += amt; Y.sub += amt; } else { const avg = units > 0 ? book / units : 0, cost = avg * -u; Y.red += -amt; Y.cost += cost; Y.gain += -amt - cost; book -= cost; units += u; } });
  dist.forEach((d) => { const Y = (years[d.d.slice(0, 4)] = years[d.d.slice(0, 4)] || { sub: 0, red: 0, cost: 0, gain: 0, dist: 0 }); Y.dist += d.paid; });
  const ys = Object.keys(years).sort().reverse();
  S._tax = [["Year", "Subscriptions", "Redemption proceeds", "Cost of units redeemed", "Realized gain or loss", "Distributions"], ...ys.map((y) => [y, years[y].sub, years[y].red, years[y].cost, years[y].gain, years[y].dist].map((v, i) => (i ? Math.round(v * 100) / 100 : v)))];
  return `<div class="kpis">${kpi("Book cost", money(book), "Average cost basis")}${kpi("Units held", num(units, 4), "")}${kpi("Average cost per unit", units > 0 ? money(book / units, 4) : "–", "")}</div>
  <div class="bar"><h3 class="sub" style="margin:0">Summary by year</h3><button class="btn sm sp" data-a="taxcsv">${I.down} CSV</button></div>
  <div class="tablebox">${ys.length ? `<table><thead><tr><th>Year</th><th class="n">Subscriptions</th><th class="n">Redemption proceeds</th><th class="n">Cost of units redeemed</th><th class="n">Realized gain or loss</th><th class="n">Distributions</th></tr></thead><tbody>${ys.map((y) => { const Y = years[y]; return `<tr><td><b>${y}</b></td><td class="n">${money(Y.sub)}</td><td class="n">${money(Y.red)}</td><td class="n">${money(Y.cost)}</td><td class="n ${sign(Y.gain)}">${signed(Y.gain)}</td><td class="n">${money(Y.dist)}</td></tr>`; }).join("")}</tbody></table>` : `<div class="empty">No taxable activity yet.</div>`}</div>
  <div class="note"><b>This is a summary, not a tax slip.</b> Figures use the average cost of your units in ${esc(cur())}. How gains and distributions are taxed depends on where you live and your circumstances. Speak to a tax adviser, and use any official tax documents the fund publishes under Statements.</div>`;
}, { sub: () => "Figures you or your accountant may need at tax time." });
ACT.taxcsv = () => downloadCsv("tax-summary.csv", S._tax || []);

portalPage("portal-notifications", "Notifications", () => { const f = feed(), seen = prefs().seen_at || "";
  return `<div class="card">${f.length ? `<ul class="feed">${f.map((x) => `<li class="${x.at > seen ? "new" : ""}"><a href="#${x.href}"><b>${esc(x.t)}</b><span>${esc(x.d)}</span><small>${day(x.at)}</small></a></li>`).join("")}</ul>` : `<div class="empty">You are all caught up.</div>`}</div>`;
}, { all: true, sub: () => "Everything that has happened on your account.", actions: () => (unseen() ? `<button class="btn sm" data-a="seen">Mark all as read</button>` : "") });
ACT.seen = async () => { await savePrefs({ seen_at: new Date().toISOString() }); render(); };

portalPage("portal-messages", "Messages", () => `<div class="card"><h3>Secure messages with the manager</h3>
  <div class="thread">${S.msgs.length ? S.msgs.map((m) => `<div class="msg ${m.from_manager ? "" : "me"}">${esc(m.body)}<small>${m.from_manager ? "Manager" : "You"}, ${new Date(m.at).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}</small></div>`).join("") : `<div class="empty">No messages yet. Ask the manager anything about your account or the fund.</div>`}</div>
  <form data-f="message" style="margin-top:16px"><div class="field"><label for="msg-b">New message</label><textarea id="msg-b" name="body" maxlength="4000" required></textarea></div><button class="btn pri" type="submit">Send message</button></form></div>`, { all: true, sub: () => "A private line to the manager. Do not send passwords or card details." });
FORMS.message = async (d) => { await q(sb.rpc("send_message", { p_body: d.body })); toast("Message sent."); await refresh(); };

portalPage("portal-profile", "Profile", () => {
  const p = S.profile || {}, a = S.application, tc = prefs().trusted || {};
  return `<div class="cols2"><form class="card" data-f="profile" novalidate><h3>Your details</h3>
    <div class="field"><label for="pf-n">Full legal name</label><input id="pf-n" name="name" required value="${esc(p.full_name)}"></div>
    <div class="field"><label for="pf-e">Email</label><input id="pf-e" value="${esc(S.session.user.email)}" disabled><div class="hint">To change your sign-in email, message the manager.</div></div>
    <div class="field"><label for="pf-p">Phone</label><input id="pf-p" name="phone" type="tel" value="${esc(p.phone)}"></div>
    <button class="btn pri" type="submit">Save details</button></form>
  <form class="card" data-f="trusted" novalidate><h3>Trusted contact</h3><p class="mut" style="margin-bottom:14px">Someone the manager may contact if they cannot reach you or are concerned about your account. They cannot see or act on your account.</p>
    <div class="row"><div class="field"><label for="tc-n">Name</label><input id="tc-n" name="name" value="${esc(tc.name || "")}"></div><div class="field"><label for="tc-r">Relationship</label><input id="tc-r" name="relationship" value="${esc(tc.relationship || "")}"></div></div>
    <div class="row"><div class="field"><label for="tc-e">Email</label><input id="tc-e" name="email" type="email" value="${esc(tc.email || "")}"></div><div class="field"><label for="tc-p">Phone</label><input id="tc-p" name="phone" type="tel" value="${esc(tc.phone || "")}"></div></div>
    <button class="btn pri" type="submit">Save trusted contact</button></form></div>
  ${a ? `<div class="card"><div class="bar"><h3 style="margin:0">Investor application</h3><span class="pill ${APP_STATUS[a.status][0]} sp">${APP_STATUS[a.status][1]}</span></div><div style="margin-top:14px">${dl([["Submitted", day(a.submitted_at)], ["Qualifies as", a.investor_type], ["Location", [a.region, a.country].filter(Boolean).join(", ")], ["Planned investment", money(a.intended_amount, 0)], ["Experience", a.experience], ["Time horizon", a.details?.horizon], ["Source of funds", a.source_of_funds]])}</div><p class="hint" style="margin-top:12px">If your circumstances change, tell the manager through the message centre.</p></div>` : ""}`;
}, { all: true, sub: () => "Your contact details and the information the fund holds about you." });
FORMS.profile = async (d) => { await q(sb.rpc("update_profile", { p_name: d.name, p_phone: d.phone || "" })); toast("Details saved."); await refresh(); };
FORMS.trusted = async (d) => { await savePrefs({ trusted: { name: (d.name || "").trim(), relationship: (d.relationship || "").trim(), email: (d.email || "").trim(), phone: (d.phone || "").trim() } }); toast("Trusted contact saved."); render(); };

portalPage("portal-security", "Security", () => {
  const u = S.session.user;
  return `<div class="cols2"><form class="card" data-f="password" novalidate><h3>Change password</h3>
    <div class="field"><label for="pw-1">New password</label><input id="pw-1" name="password" type="password" minlength="8" autocomplete="new-password" required><div class="hint">At least 8 characters. Use one you do not use anywhere else.</div></div>
    <div class="field"><label for="pw-2">Repeat new password</label><input id="pw-2" name="again" type="password" minlength="8" autocomplete="new-password" required></div>
    <button class="btn pri" type="submit">Change password</button></form>
  <div class="card"><h3>Sign-in activity</h3>${dl([["Signed in as", u.email], ["Last sign-in", u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" }) : null], ["Account created", u.created_at ? day(u.created_at) : null], ["Email confirmed", u.email_confirmed_at ? "Yes" : null]])}
    <div class="bar" style="margin-top:16px"><button class="btn" data-a="signoutall">Sign out on all devices</button></div><p style="margin-top:12px"><a class="tl" href="#security">Online security tips</a></p></div></div>
  <div class="cols2"><div class="card"><h3>Your data</h3><p class="mut" style="margin-bottom:14px">Download a copy of everything on your account: your profile, application, transactions, requests and messages.</p><button class="btn" data-a="mydata">${I.down} Download my data</button></div>
  ${isInv() ? `<div class="card"><h3>Close your account</h3><p class="mut" style="margin-bottom:14px">Closing your account redeems all your units and tells the manager you want to leave the fund. The redemption follows the fund's normal terms.</p><button class="btn danger" data-a="closeacct">Request account closure</button></div>` : ""}</div>`;
}, { all: true, sub: () => "Keep your account safe." });
FORMS.password = async (d, f) => { if (d.password !== d.again) throw new Error("The two passwords do not match."); await q(sb.auth.updateUser({ password: d.password })); f.reset(); toast("Password changed."); };
ACT.signoutall = async () => { if (await ask("Sign out everywhere?", "You will be signed out on this and every other device.", "Sign out everywhere")) { await sb.auth.signOut({ scope: "global" }); location.hash = "#home"; } };
ACT.mydata = () => { const u = URL.createObjectURL(new Blob([JSON.stringify({ exported_at: new Date().toISOString(), profile: S.profile, application: S.application, transactions: S.ledger, requests: S.orders, recurring_plan: S.plan || null, messages: S.msgs }, null, 2)], { type: "application/json" })), l = document.createElement("a"); l.href = u; l.download = "my-account-data.json"; document.body.appendChild(l); l.click(); l.remove(); URL.revokeObjectURL(u); };
ACT.closeacct = async () => {
  const m = myStats();
  if (!(await ask("Request account closure?", `${m.units > 0 ? "All " + num(m.units, 4) + " of your units will be redeemed at the NAV per unit on the day the manager processes it. " : ""}The manager will be told you want to close your account.`, "Request closure"))) return;
  if (m.units > 0 && !S.orders.some((o) => o.status === "pending" && o.kind === "redeem")) await q(sb.rpc("place_order", { p_kind: "redeem", p_all: true }));
  if (S.plan) await q(sb.rpc("stop_plan", {}));
  await q(sb.rpc("send_message", { p_body: "I would like to close my account. Please redeem all my units and confirm once it is done." })); toast("Closure requested. The manager will be in touch."); await refresh();
};

portalPage("portal-help", "Help", () => `<div class="cols2"><div class="card"><h3>Common questions</h3><div class="faq">${[["When are my units issued?", "When the manager processes your subscription after your payment arrives, at that day's NAV per unit."], ["How long does a redemption take?", S.settings.redemption_terms || "Redemptions are processed by the manager and paid from fund cash. Timing depends on the fund's terms."], ["Why did my value change today?", "Your value is your units multiplied by the NAV per unit, which moves with the prices of the fund's holdings."], ["Where are my statements?", "Under Statements you can produce a statement for any month, the year to date, or since you opened your account."], ["How do I change my email?", "Send the manager a message and they will update it after confirming it is you."]].map(([q2, a]) => `<details><summary>${esc(q2)}</summary><p>${esc(a)}</p></details>`).join("")}</div><p style="margin-top:14px"><a class="tl" href="#faq">All questions and answers</a></p></div>
  <div class="stack"><div class="card"><h3>Contact the manager</h3><p class="mut" style="margin-bottom:14px">The message centre is the fastest and safest way to reach the manager.</p><a class="btn pri" href="#portal-messages">Send a message</a>${S.settings.contact_email ? `<p class="hint" style="margin-top:12px">Or email ${esc(S.settings.contact_email)}</p>` : ""}</div>
  <div class="card"><h3>Guides</h3>${ARTICLES.slice(0, 4).map((a) => `<div style="padding:6px 0"><a class="tl" href="#${a.slug}">${a.title}</a></div>`).join("")}<div style="padding:6px 0"><a class="tl" href="#glossary">Glossary</a></div></div></div></div>`, { all: true, sub: () => "Answers, guides and a direct line to the manager." });

window.addEventListener("hashchange", async () => {
  if (!sb || !S.session) return;
  try {
    if (route() === "portal-messages" && S.msgs.some((m) => m.from_manager && !m.read_at)) { await q(sb.rpc("mark_messages_read", {})); S.msgs = S.msgs.map((m) => ({ ...m, read_at: m.read_at || new Date().toISOString() })); render(); }
  } catch (e) { console.error(e); }
});
