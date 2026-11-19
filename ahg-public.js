"use strict";
/* ---------- performance maths ---------- */
const RANGES = [["1M", 1], ["3M", 3], ["6M", 6], ["YTD", "ytd"], ["1Y", 12], ["All", null]];
function cutoff(r, from) {
  const d = new Date(from + "T12:00:00");
  if (r === "ytd") return d.getFullYear() + "-01-01";
  d.setMonth(d.getMonth() - r);
  return d.toISOString().slice(0, 10);
}
const benchSeries = () => S.nav.filter((r) => r.bench !== null && r.bench !== undefined).map((r) => ({ d: r.d, v: N(r.bench) }));
function periodReturn(r, pts, inception) {
  pts = pts || navSeries(); if (!pts.length) return null;
  const last = pts[pts.length - 1], base0 = inception === undefined ? N(S.settings.initial_nav) || 10 : inception;
  if (r === null) return base0 ? last.v / base0 - 1 : pts.length > 1 ? last.v / pts[0].v - 1 : null;
  const c = cutoff(r, last.d), base = [...pts].reverse().find((p) => p.d <= c);
  if (!base) return r === "ytd" && pts[0].d.slice(0, 4) === last.d.slice(0, 4) ? (base0 ? last.v / base0 - 1 : last.v / pts[0].v - 1) : null;
  return last.v / base.v - 1;
}
function growthSeries(src) {
  let pts = src || navSeries(); if (pts.length < 2) return [];
  const r = RANGES.find((x) => x[0] === (S.range || "All"))[1];
  if (r !== null) { const c = cutoff(r, pts[pts.length - 1].d); const cut = pts.filter((p) => p.d >= c); if (cut.length >= 2) pts = cut; }
  return pts.map((p) => ({ d: p.d, v: (10000 * p.v) / pts[0].v }));
}
function monthEnds() {
  const m = {}; navSeries().forEach((p) => { m[p.d.slice(0, 7)] = p.v; });
  const keys = Object.keys(m).sort(); let prev = N(S.settings.initial_nav) || 10;
  return keys.map((k) => { const r = m[k] / prev - 1; prev = m[k]; return { ym: k, v: m[k], r }; });
}
function riskStats() {
  const pts = navSeries(); if (pts.length < 3) return null;
  let peak = pts[0].v, dd = 0; const rets = [];
  pts.forEach((p, i) => { peak = Math.max(peak, p.v); dd = Math.min(dd, p.v / peak - 1); if (i) rets.push(p.v / pts[i - 1].v - 1); });
  const days = (new Date(pts[pts.length - 1].d) - new Date(pts[0].d)) / 864e5, perYear = days > 0 ? (rets.length / days) * 365 : 0;
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length, sd = Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, rets.length - 1));
  const me = monthEnds();
  return { dd, vol: rets.length >= 12 ? sd * Math.sqrt(perYear) : null, best: me.length ? Math.max(...me.map((x) => x.r)) : null, worst: me.length ? Math.min(...me.map((x) => x.r)) : null, pos: me.length ? me.filter((x) => x.r > 0).length / me.length : null, n: pts.length, months: me.length };
}
function monthGrid() {
  const me = monthEnds(); if (!me.length) return "";
  const years = [...new Set(me.map((x) => x.ym.slice(0, 4)))].reverse(), M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `<div class="tablebox"><table class="heat"><thead><tr><th>Year</th>${M.map((m) => `<th>${m}</th>`).join("")}<th>Year</th></tr></thead><tbody>${years.map((y) => { const rows = me.filter((x) => x.ym.startsWith(y)); const tot = rows.reduce((a, x) => a * (1 + x.r), 1) - 1;
    return `<tr><td>${y}</td>${M.map((_, i) => { const x = rows.find((z) => Number(z.ym.slice(5)) === i + 1); return `<td class="${x ? sign(x.r) : "mut"}">${x ? (x.r * 100).toFixed(1) : ""}</td>`; }).join("")}<td class="${sign(tot)}"><b>${(tot * 100).toFixed(1)}</b></td></tr>`; }).join("")}</tbody></table></div>`;
}
function downloadCsv(name, rows) {
  const u = URL.createObjectURL(new Blob([rows.map((r) => r.map((c) => { const v = String(c ?? ""); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(",")).join("\n")], { type: "text/csv" })), l = document.createElement("a");
  l.href = u; l.download = name; document.body.appendChild(l); l.click(); l.remove(); URL.revokeObjectURL(u);
}

/* ---------- shared pieces ---------- */
const ICON = {
  growth: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
  focus: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>',
  report: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 16v-3M12 16V8M16 16v-5"/></svg>',
  key: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
};
const applyBtn = (cls = "btn pri lg") => isInv() ? `<a class="${cls}" href="#portal">Go to my account</a>` : `<a class="${cls}" href="#apply">${S.application ? "View my application" : "Apply to invest"}</a>`;
const legalName = () => S.settings.legal_name || S.settings.name;
const dl = (rows) => `<div class="facts">${rows.filter((f) => f[1]).map((f) => `<div><span>${esc(f[0])}</span><b>${esc(f[1])}</b></div>`).join("")}</div>`;
function foot() {
  const st = S.settings, col = (k) => { const m = MENU.find((x) => x.k === k); return `<div><h4>${m.t}</h4>${m.items.slice(0, 6).map((i) => `<a href="#${i}">${TITLES[i]}</a>`).join("")}</div>`; };
  return `<footer><div class="wrap">
  <div class="cols">
    <div><div class="fb">${esc(st.name)}</div><p>A private North American equity fund for invited investors.</p>${st.contact_email ? `<p style="margin-top:10px">Investor enquiries: ${esc(st.contact_email)}</p>` : ""}<p style="margin-top:10px"><a href="#contact" style="color:#fff">Contact us</a> &nbsp; <a href="#sitemap" style="color:#fff">Site map</a></p></div>
    ${col("fund")}${col("about")}${col("invest")}
  </div>
  <div class="cols" style="grid-template-columns:1.4fr repeat(3,1fr)"><div></div>${col("insights")}<div><h4>Legal</h4>${["terms", "privacy", "risk-disclosure", "conflicts", "complaints", "accessibility"].map((i) => `<a href="#${i}">${TITLES[i]}</a>`).join("")}</div><div><h4>Investors</h4><a href="#${S.session ? "portal" : "signin"}">${S.session ? "My account" : "Investor login"}</a><a href="#apply">Apply to invest</a><a href="#security">Online security</a><a href="#cookies">Cookies</a></div></div>
  ${st.registrant_name ? `<p style="margin-bottom:10px">${esc(st.name)} is managed by ${esc(st.registrant_name)}${st.registration_detail ? ", " + esc(st.registration_detail) : ""}.</p>` : ""}
  <p style="margin-bottom:10px">This website is provided for information only. It does not constitute an offer to sell or a solicitation to buy units of the fund in any jurisdiction where such an offer or solicitation would be unlawful. Units are offered only to investors accepted by the manager and only under the fund's offering documents.</p>
  <p style="margin-bottom:10px">Investing in the fund involves risk, including the possible loss of capital. The value of units changes frequently and past performance may not be repeated. Nothing on this website is investment, legal or tax advice.</p>
  <p>© ${new Date().getFullYear()} ${esc(legalName())}. All rights reserved.</p>
</div></footer>`;
}

/* ---------- home ---------- */
page("home", "Home", "home", () => {
  const st = S.settings, si = sinceInception(), last = S.nav[S.nav.length - 1], g = growthSeries(), pub = (S.notices || []).slice(0, 3);
  return `
<section class="hero"><div class="wrap">
  <div>
    <h1>Invest in North America's fastest-growing companies</h1>
    <p class="lead">${esc(st.name)} is a private fund that holds a focused portfolio of high-growth companies listed in the United States and Canada, managed for long-term capital growth.</p>
    <div class="act">${applyBtn()}<a class="btn lg" href="#fund">View the fund</a></div>
  </div>
  <aside class="fcard" aria-label="Fund summary">
    <div class="nm">North American equity</div>
    <h2>${esc(st.name)}</h2>
    <div class="sm">NAV per unit</div>
    <div class="nav">${money(liveNav(), 4)}</div>
    <div class="sm">${last ? "As of " + day(last.d) : "Initial price"}</div>
    <dl>
      <div><dt>Since inception</dt><dd class="${sign(si)}">${si === null ? "–" : pct(si)}</dd></div>
      <div><dt>Net assets</dt><dd>${S.snap && N(S.snap.aum) > 0 ? big(S.snap.aum) : "–"}</dd></div>
      <div><dt>Risk rating</dt><dd>High</dd></div>
      <div><dt>Currency</dt><dd>${esc(st.currency)}</dd></div>
    </dl>
    <a class="tl" href="#fund">View full fund details</a>
  </aside>
</div></section>

<section class="band"><div class="wrap">
  <h2>Why investors choose the fund</h2>
  <p class="intro">A clear mandate, run by one manager, with full reporting to every investor.</p>
  <div class="feat">
    <div><div class="ic">${ICON.growth}</div><h3>Built for growth</h3><p>The fund invests in companies whose revenue and earnings are growing faster than the broad market.</p></div>
    <div><div class="ic">${ICON.focus}</div><h3>A focused portfolio</h3><p>Capital is concentrated in a small number of researched positions instead of spread across an index.</p></div>
    <div><div class="ic">${ICON.report}</div><h3>Clear reporting</h3><p>Your online account shows your units, market value, the fund's holdings and every transaction.</p></div>
    <div><div class="ic">${ICON.key}</div><h3>By invitation</h3><p>The fund is offered privately. Every investor applies and is reviewed before investing.</p></div>
  </div>
</div></section>

<section class="band grey"><div class="wrap two">
  <div>
    <h2>Fund performance</h2>
    <p class="intro" style="margin-bottom:20px">Growth of ${money(10000, 0)} invested in the fund, based on NAV per unit after fees and expenses charged to the fund.</p>
    <ul class="ticks">
      <li>Since inception: <b class="${sign(si)}">${si === null ? "not yet reported" : pct(si)}</b></li>
      <li>Net assets: <b>${S.snap && N(S.snap.aum) > 0 ? money(S.snap.aum, 0) : "not yet reported"}</b></li>
      <li>Holdings: <b>${S.snap && N(S.snap.positions) > 0 ? S.snap.positions : "not yet reported"}</b></li>
    </ul>
    <a class="btn" href="#fund-performance">See full performance</a>
    <p class="hint" style="margin-top:14px">Past performance does not indicate future results.</p>
  </div>
  <div class="panel">${lineChart(g, (v, axis) => money(v, axis ? 0 : 2), "The chart appears once the fund has two valuations on record.")}</div>
</div></section>

<section class="band"><div class="wrap">
  <h2>How investing works</h2>
  <p class="intro">Four steps, all handled through your online account.</p>
  <ol class="hsteps">
    <li><h3>Apply</h3><p>Create an account and complete the investor application.</p></li>
    <li><h3>Get reviewed</h3><p>The manager confirms your eligibility and replies in your account.</p></li>
    <li><h3>Subscribe</h3><p>Place a subscription and send payment. Units are issued at the NAV per unit.</p></li>
    <li><h3>Stay informed</h3><p>Track your investment online and request redemptions when you need to.</p></li>
  </ol>
  <div style="margin-top:30px"><a class="tl" href="#invest">Read more about how to invest</a></div>
</div></section>

<section class="band grey"><div class="wrap">
  <h2>Insights and tools</h2>
  <p class="intro">Plain-language guides to how the fund works, and calculators to plan with.</p>
  <div class="cards">
    ${ARTICLES.slice(0, 2).map((a) => `<a class="tile-link" href="#${a.slug}"><span class="tag">Guide</span><h3>${a.title}</h3><p>${a.lead}</p></a>`).join("")}
    <a class="tile-link" href="#tool-growth"><span class="tag">Calculator</span><h3>Investment growth calculator</h3><p>See how an investment could grow under a rate of return you choose.</p></a>
  </div>
  <div style="margin-top:24px"><a class="tl" href="#insights">All insights</a> &nbsp; <a class="tl" href="#tools">All calculators</a></div>
</div></section>
${pub.length ? `<section class="band"><div class="wrap"><h2>Fund notices</h2><p class="intro">The latest announcements from the manager.</p><div class="tablebox"><table><tbody>${pub.map((n) => `<tr><td style="width:140px" class="mut">${day(n.published_at)}</td><td><b>${esc(n.title)}</b></td></tr>`).join("")}</tbody></table></div><div style="margin-top:18px"><a class="tl" href="#notices">All notices</a></div></div></section>` : ""}
<section class="band grey"><div class="wrap">
  <div class="notice"><div><h3>This is a high-risk fund</h3><p>The fund is concentrated in volatile growth stocks. Its value can fall sharply and you could lose a substantial part of your investment. It is suitable only for long-term money. <a class="tl" href="#fund-risk">Read about the fund's risks</a></p></div></div>
</div></section>

<section class="band navy"><div class="wrap ctab">
  <div><h2>Ready to apply?</h2><p class="intro" style="margin:8px 0 0">Applications take about five minutes and are reviewed by the manager.</p></div>
  <div class="bar">${applyBtn()}${S.session ? "" : `<a class="btn ghost lg" href="#signin">Investor login</a>`}</div>
</div></section>
${foot()}`;
});

/* ---------- fund pages ---------- */
function fund(slug, title, body) {
  page(slug, title, "fund", () => {
    const st = S.settings, si = sinceInception(), n = S.nav.length, last = S.nav[n - 1], prev = S.nav[n - 2], chg = last && prev ? N(last.nav) / N(prev.nav) - 1 : null;
    const tabs = MENU[0].items;
    return `<div class="fundhead"><div class="wrap">
  <div class="crumb"><a href="#home">Home</a> / ${slug === "fund" ? "Our fund" : `<a href="#fund">Our fund</a> / ${title}`}</div>
  <div class="kind">North American equity</div>
  <h1>${esc(st.name)}</h1>
  <p class="desc">A concentrated portfolio of high-growth companies listed in the United States and Canada, managed for long-term capital growth. Offered privately, by invitation.</p>
  <div class="act">${applyBtn()}</div>
  <div class="figs">
    <div><span>NAV per unit</span><b>${money(liveNav(), 4)}</b><small>${last ? "As of " + day(last.d) : "Initial price"}</small></div>
    <div><span>Change since prior valuation</span><b class="${sign(chg)}">${chg === null ? "–" : pct(chg)}</b><small>${prev ? "From " + day(prev.d) : "No prior valuation"}</small></div>
    <div><span>Since inception</span><b class="${sign(si)}">${si === null ? "–" : pct(si)}</b><small>${st.inception_date ? "Inception " + day(st.inception_date) : ""}</small></div>
    <div><span>Net assets</span><b>${S.snap && N(S.snap.aum) > 0 ? big(S.snap.aum) : "–"}</b><small>${esc(st.currency)}</small></div>
  </div>
</div></div>
<nav class="subnav" aria-label="Fund sections"><div class="wrap">${tabs.map((k) => `<a href="#${k}" class="${k === slug ? "on" : ""}">${k === "fund" ? "Overview" : TITLES[k]}</a>`).join("")}</div></nav>
<section class="band" style="padding-top:40px"><div class="wrap">${body()}</div></section>${foot()}`;
  });
}
const sectorRows = () => [...(S.snap?.sectors || []).map((t) => ({ label: t.sector, w: N(t.weight) })), ...(N(S.snap?.cash_weight) > 0.0005 ? [{ label: "Cash", w: N(S.snap.cash_weight) }] : [])];

fund("fund", "Fund details", () => {
  const st = S.settings;
  return `<div class="two" style="align-items:start"><div class="prose">
    <h2>Investment objective</h2>
    <p>The fund seeks long-term capital growth by investing in companies listed in the United States and Canada whose revenue and earnings are growing faster than the broad market.</p>
    <h2>Investment strategy</h2>
    <p>The portfolio is concentrated in a small number of positions selected through fundamental research. The manager does not track an index or manage to a volatility target, and position sizes reflect conviction. Holdings change when the growth case for a company changes. The fund may hold cash while waiting for opportunities.</p>
    <h2>Who the fund is for</h2>
    <ul><li>Investors seeking growth over a period of five years or longer</li><li>Investors who can accept large and sudden changes in the value of their investment</li><li>Investors for whom this is one part of a diversified portfolio</li></ul>
    <h2>Who it is not for</h2>
    <ul><li>Investors who need regular income or a stable value</li><li>Investors who may need the money back at short notice</li></ul>
  </div><div>
    <h3 style="margin-bottom:10px">Key facts</h3>
    ${dl([["Fund type", "Private pooled fund, unitized"], ["Asset class", "North American equity"], ["Availability", "By invitation, to accepted investors"], ["Base currency", st.currency], ["Inception date", st.inception_date ? day(st.inception_date) : null], ["Initial NAV per unit", money(st.initial_nav, 2)], ["Benchmark", st.benchmark || null], ["Valuation", st.dealing || null], ["Number of holdings", S.snap && N(S.snap.positions) > 0 ? String(S.snap.positions) : null], ["Net assets", S.snap && N(S.snap.aum) > 0 ? money(S.snap.aum, 0) : null], ["Portfolio manager", st.manager_name || null], ["Risk rating", "High"]])}
    <div class="cards" style="margin-top:24px;grid-template-columns:1fr 1fr"><a class="tile-link" href="#fund-performance"><h3>Performance</h3><p>Returns, growth chart and risk statistics.</p></a><a class="tile-link" href="#fund-portfolio"><h3>Portfolio</h3><p>Holdings and sector exposure.</p></a></div>
  </div></div>`;
});

fund("fund-performance", "Performance", () => {
  const st = S.settings, pts = navSeries(), last = S.nav[S.nav.length - 1];
  if (pts.length < 2) return `<p class="mut">Performance is published once the fund has at least two valuations on record. Units were first issued at ${money(st.initial_nav, 2)}.</p>`;
  const g = growthSeries(), b = benchSeries(), rs = riskStats();
  let cmp = null;
  if (b.length >= 2) { const map = Object.fromEntries(b.map((x) => [x.d, x.v])); const base = map[g[0].d]; if (base && g.every((p) => map[p.d] !== undefined)) cmp = g.map((p) => ({ d: p.d, v: (10000 * map[p.d]) / base })); }
  const row = (label, f) => `<tr><td>${esc(label)}</td>${RANGES.map(([, r]) => { const v = f(r); return `<td class="n ${sign(v)}">${v === null ? "–" : pct(v)}</td>`; }).join("")}</tr>`;
  return `<div class="bar" style="margin-bottom:10px"><h2 style="font-size:22px">Growth of ${money(10000, 0)}</h2><div class="seg sp">${RANGES.map(([k]) => `<button class="${(S.range || "All") === k ? "on" : ""}" data-a="range" data-r="${k}">${k}</button>`).join("")}</div></div>
  <div class="panel">${lineChart(g, (v, axis) => money(v, axis ? 0 : 2), "", cmp)}${cmp ? `<p class="hint">Solid line: ${esc(st.name)}. Dashed line: ${esc(st.benchmark || "benchmark")}.</p>` : ""}</div>
  <h2 style="font-size:22px;margin:36px 0 10px">Returns</h2>
  <div class="tablebox"><table><thead><tr><th></th>${["1 month", "3 months", "6 months", "Year to date", "1 year", "Since inception"].map((h) => `<th class="n">${h}</th>`).join("")}</tr></thead><tbody>${row(st.name, (r) => periodReturn(r))}${b.length >= 2 ? row(st.benchmark || "Benchmark", (r) => periodReturn(r, b, 0)) : ""}</tbody></table></div>
  <p class="hint">As of ${last ? day(last.d) : day(today())}. Returns are cumulative, not annualized, and are calculated from NAV per unit after fees and expenses charged to the fund. A dash means there is no valuation that far back.${b.length >= 2 ? " Benchmark returns start from the first valuation that recorded the benchmark." : ""}</p>
  <h2 style="font-size:22px;margin:36px 0 10px">Monthly returns (%)</h2>${monthGrid()}
  <h2 style="font-size:22px;margin:36px 0 10px">Risk statistics</h2>
  ${dl([["Largest fall from a peak", rs ? pct(rs.dd) : null], ["Annualized volatility", rs && rs.vol !== null ? (rs.vol * 100).toFixed(1) + "%" : "Needs 12 or more valuations"], ["Best month", rs && rs.best !== null ? pct(rs.best) : null], ["Worst month", rs && rs.worst !== null ? pct(rs.worst) : null], ["Months with a gain", rs && rs.pos !== null ? Math.round(rs.pos * 100) + "% of " + rs.months : null], ["Valuations on record", rs ? String(rs.n) : null]])}
  <p class="hint" style="margin-top:12px">Past performance does not indicate future results. Statistics over short periods are not reliable guides to the fund's long-term behaviour.</p>`;
});

fund("fund-portfolio", "Portfolio", () => {
  const top = S.snap?.top || [];
  if (!top.length) return `<p class="mut">Holdings are disclosed to investors in their account.${S.session ? "" : ` <a class="tl" href="#signin">Investor login</a>`}</p>`;
  const w = top.map((t) => N(t.weight)), sum = (n) => w.slice(0, n).reduce((a, b) => a + b, 0);
  return `<div class="two" style="align-items:start"><div>
    <h2 style="font-size:22px;margin-bottom:10px">Top holdings</h2>
    <div class="tablebox"><table><thead><tr><th>Name</th><th>Ticker</th><th>Sector</th><th class="n">Weight</th></tr></thead><tbody>${top.map((t) => `<tr><td>${esc(t.name || t.ticker)}</td><td class="tick">${esc(t.ticker)}</td><td>${esc(t.sector)}</td><td class="n">${(N(t.weight) * 100).toFixed(2)}%</td></tr>`).join("")}</tbody></table></div>
    <p class="hint">Weights are a share of net assets at the latest prices and change daily.</p>
  </div><div>
    <h2 style="font-size:22px;margin-bottom:10px">Sector exposure</h2>${allocBars(sectorRows())}
    <h2 style="font-size:22px;margin:32px 0 10px">Concentration</h2>
    ${dl([["Number of holdings", String(S.snap.positions)], ["Largest holding", (w[0] * 100).toFixed(1) + "%"], ["Top 5 holdings", (sum(5) * 100).toFixed(1) + "%"], ["Top 10 holdings", (sum(10) * 100).toFixed(1) + "%"], ["Cash", ((N(S.snap.cash_weight) || 0) * 100).toFixed(1) + "%"]])}
  </div></div>`;
});

fund("fund-fees", "Fees and terms", () => {
  const st = S.settings;
  return `<div class="two" style="align-items:start"><div><h2 style="font-size:22px;margin-bottom:10px">Fees</h2>
  ${dl([["Management fee", N(st.mgmt_fee_pct) > 0 ? num(st.mgmt_fee_pct, 2) + "% per year" : "Set out in the offering documents"], ["Performance fee", N(st.perf_fee_pct) > 0 ? num(st.perf_fee_pct, 2) + "%" : null], ["Sales charges", "None"], ["Redemption fee", "None charged by the fund"], ["Currency conversion", "Charged by the fund's broker when it buys or sells in another currency"], ["Conversion costs to date", fxCost()], ["Foreign currency holdings", fxShare()]])}
  <p class="hint" style="margin-top:12px">Fees and fund expenses are paid out of the fund's assets and are reflected in the NAV per unit. <a class="tl" href="#tool-fees">See how fees affect returns</a></p></div>
  <div><h2 style="font-size:22px;margin-bottom:10px">Terms</h2>
  ${dl([["Minimum initial investment", N(st.min_initial) > 0 ? money(st.min_initial, 0) : "Confirmed on acceptance"], ["Minimum additional investment", N(st.min_additional) > 0 ? money(st.min_additional, 0) : null], ["Purchases", st.accepting === false ? "Closed to new subscriptions" : "Open to accepted investors"], ["Dealing", st.dealing || null], ["Redemptions", st.redemption_terms || null], ["Base currency", st.currency]])}
  <p class="hint" style="margin-top:12px">Full terms are set out in the fund's offering documents, which are provided to accepted investors before they subscribe.</p></div></div>`;
});

fund("fund-distributions", "Distributions", () => {
  const d = S.dist || [];
  return `<div class="prose"><h2>Distribution policy</h2><p>${esc(S.settings.distribution_policy || "The fund is managed for capital growth and does not target regular distributions. Any distribution is paid in cash per unit to investors holding units on the record date, and reduces the NAV per unit by the same amount.")}</p></div>
  <h2 style="font-size:22px;margin:28px 0 10px">Distribution history</h2>
  <div class="tablebox">${d.length ? `<table><thead><tr><th>Record date</th><th>Type</th><th class="n">Per unit</th><th>Note</th></tr></thead><tbody>${d.map((x) => `<tr><td>${day(x.d)}</td><td>${esc(x.kind)}</td><td class="n">${money(x.per_unit, 4)}</td><td class="mut">${esc(x.note)}</td></tr>`).join("")}</tbody></table>` : `<div class="empty">The fund has not paid a distribution.</div>`}</div>`;
});

const docList = (docs, emptyMsg) => {
  if (!docs.length) return `<div class="empty">${emptyMsg}</div>`;
  const cats = [...new Set(docs.map((d) => d.category))];
  return cats.map((c) => `<h3 style="margin:22px 0 8px">${esc(c)}</h3><div class="tablebox"><table><tbody>${docs.filter((d) => d.category === c).map((d) => `<tr><td><a class="tl" href="${esc(/^https?:\/\//.test(d.url) ? d.url : "#")}" target="_blank" rel="noopener">${esc(d.title)}</a></td><td class="n mut" style="width:150px">${day(d.doc_date)}</td></tr>`).join("")}</tbody></table></div>`).join("");
};
fund("fund-documents", "Documents", () => `<div class="prose"><h2>Fund documents</h2><p>Offering documents, reports and notices published by the manager. Investors see additional documents after signing in.</p></div>${docList(S.docs || [], "No documents have been published yet. Offering documents are provided directly to accepted investors.")}`);

fund("fund-risk", "Risk", () => `<div class="prose">
  <h2>Risk rating</h2>
  <div class="scale" role="img" aria-label="Risk rating: high"><span>Low</span><span>Low to medium</span><span>Medium</span><span>Medium to high</span><span class="on">High</span></div>
  <p>The manager rates this fund as high risk. Its value can fall sharply and stay down for long periods, and investors can lose a substantial part of the amount invested.</p>
  <h2>Principal risks</h2>
  <ul>
    <li><b>Equity and growth-style risk.</b> Growth companies are valued on future earnings and can fall further than the market when expectations change.</li>
    <li><b>Concentration risk.</b> A small number of holdings accounts for most of the portfolio, so one position can materially affect the fund.</li>
    <li><b>Liquidity risk.</b> Units are not listed or traded. Redemptions are processed by the manager on dealing days and paid from fund cash.</li>
    <li><b>Currency risk.</b> Holdings may be priced in a currency other than the fund's base currency or the investor's own.</li>
    <li><b>Key person risk.</b> Investment decisions are made by one manager.</li>
    <li><b>Small fund risk.</b> A fund with few investors can be affected by a single large subscription or redemption.</li>
  </ul>
  <p>The fund has no guarantee. An investor may not get back the amount invested. <a href="#risk-disclosure">Read the full risk disclosure</a>.</p></div>`);

fund("fund-prices", "Price history", () => {
  const h = [...S.nav].reverse();
  return `<div class="bar" style="margin-bottom:10px"><h2 style="font-size:22px">NAV per unit history</h2>${h.length ? `<button class="btn sm sp" data-a="navcsv">Download CSV</button>` : ""}</div>
  <div class="tablebox">${h.length ? `<table><thead><tr><th>Valuation date</th><th class="n">NAV per unit</th><th class="n">Change</th><th class="n">Net assets</th></tr></thead><tbody>${h.slice(0, 250).map((r, i) => { const p = h[i + 1], c = p ? N(r.nav) / N(p.nav) - 1 : null; return `<tr><td>${day(r.d)}</td><td class="n">${money(r.nav, 4)}</td><td class="n ${sign(c)}">${c === null ? "–" : pct(c)}</td><td class="n">${money(r.aum, 0)}</td></tr>`; }).join("")}</tbody></table>` : `<div class="empty">No valuations have been published yet.</div>`}</div>`;
});
ACT.navcsv = () => downloadCsv("nav-history.csv", [["Date", "NAV per unit", "Net assets", "Units"], ...S.nav.map((r) => [r.d, N(r.nav), N(r.aum), N(r.units)])]);
ACT.range = (b) => { S.range = b.dataset.r; render(); };

/* ---------- calculators ---------- */
const CALC = {
  growth(f) {
    const p = N(f.initial.value), m = N(f.monthly.value), y = Math.min(50, Math.max(1, N(f.years.value))), r = N(f.rate.value) / 100, mr = Math.pow(1 + r, 1 / 12) - 1;
    let v = p, paid = p; const pts = [{ d: "0", v }];
    for (let i = 1; i <= y * 12; i++) { v = v * (1 + mr) + m; paid += m; if (i % 12 === 0) pts.push({ d: String(i / 12), v }); }
    return `<div class="sm mut">Projected value after ${y} year${y > 1 ? "s" : ""}</div><div class="big">${money(v, 0)}</div><p style="margin:10px 0 0">You would have paid in <b>${money(paid, 0)}</b>. Growth would be <b>${money(v - paid, 0)}</b>.</p>
    <table style="margin-top:14px"><thead><tr><th>Year</th><th class="n">Value</th></tr></thead><tbody>${pts.filter((_, i) => i && (y <= 10 || i % Math.ceil(y / 10) === 0 || i === y)).map((x) => `<tr><td>${x.d}</td><td class="n">${money(x.v, 0)}</td></tr>`).join("")}</tbody></table>`;
  },
  fees(f) {
    const p = N(f.initial.value), y = Math.min(50, Math.max(1, N(f.years.value))), r = N(f.rate.value) / 100, fee = N(f.fee.value) / 100;
    const gross = p * Math.pow(1 + r, y), net = p * Math.pow((1 + r) * (1 - fee), y);
    return `<div class="sm mut">Value after ${y} years, after fees</div><div class="big">${money(net, 0)}</div><p style="margin:10px 0 0">Without fees it would be <b>${money(gross, 0)}</b>. Fees would cost <b>${money(gross - net, 0)}</b>, or ${gross > 0 ? ((1 - net / gross) * 100).toFixed(1) : 0}% of the final value.</p>`;
  },
  units(f) {
    const a = N(f.amount.value), nav = liveNav();
    return `<div class="sm mut">Units at ${money(nav, 4)} per unit</div><div class="big">${num(a / nav, 4)}</div><p style="margin:10px 0 0">The units you receive depend on the NAV per unit on the day your payment arrives, which may be higher or lower.</p>`;
  },
};
function calcPage(slug, title, kind, lead, fields, note) {
  doc(slug, title, "insights", lead, () => `<div class="calc"><form data-calc="${kind}" class="panel" onsubmit="return false">${fields.map(([n, l, v, step]) => `<div class="field"><label for="c-${n}">${l}</label><input id="c-${n}" class="num" name="${n}" type="number" min="0" step="${step || 1}" value="${typeof v === "function" ? v() : v}"></div>`).join("")}</form><div class="result" id="calc-out" aria-live="polite"></div></div><p class="hint" style="margin-top:16px;max-width:80ch">${note}</p><p style="margin-top:18px"><a href="#tools">All calculators</a></p>`);
}
calcPage("tool-growth", "Investment growth calculator", "growth", "See how an investment could grow under a rate of return you choose.", [["initial", "Starting amount", 25000, 100], ["monthly", "Added each month", 500, 50], ["years", "Years invested", 10], ["rate", "Assumed annual return (%)", 6, 0.1]], "This is a hypothetical illustration using the rate you enter. It is not a forecast of the fund's returns, which will vary and can be negative. It ignores taxes.");
calcPage("tool-fees", "Fee impact calculator", "fees", "See how an annual fee changes the value of an investment over time.", [["initial", "Amount invested", 25000, 100], ["years", "Years invested", 10], ["rate", "Assumed annual return before fees (%)", 6, 0.1], ["fee", "Annual fee (%)", () => N(S.settings.mgmt_fee_pct) || 1, 0.05]], "A hypothetical illustration using the figures you enter. It assumes a constant return and a fee charged on the full value each year.");
calcPage("tool-units", "Unit calculator", "units", "Work out how many units an amount would buy at the current NAV per unit.", [["amount", "Amount to invest", 25000, 100]], "An estimate at the current NAV per unit. Units are issued at the NAV per unit on the day your payment is received.");
function runCalc() { const f = document.querySelector("form[data-calc]"), o = document.getElementById("calc-out"); if (f && o) o.innerHTML = CALC[f.dataset.calc](f); }
document.addEventListener("input", (e) => { if (e.target.closest("form[data-calc]")) runCalc(); });
new MutationObserver(runCalc).observe(document.getElementById("app"), { childList: true });

doc("tools", "Calculators", "insights", "Simple tools for planning an investment.", () => `<div class="cards">
  <a class="tile-link" href="#tool-growth"><span class="tag">Calculator</span><h3>Investment growth</h3><p>Project a starting amount and monthly additions at a return you choose.</p></a>
  <a class="tile-link" href="#tool-fees"><span class="tag">Calculator</span><h3>Fee impact</h3><p>Compare an investment's value before and after annual fees.</p></a>
  <a class="tile-link" href="#tool-units"><span class="tag">Calculator</span><h3>Units</h3><p>Convert an amount into units at the current NAV per unit.</p></a></div>`);

/* ---------- notices, contact, site map ---------- */
doc("notices", "Fund notices", "insights", "Announcements from the manager.", () => { const n = S.notices || [];
  return n.length ? n.map((x) => `<div style="padding:18px 0;border-bottom:1px solid var(--line)"><div class="mut" style="font-size:13px">${day(x.published_at)}${x.audience === "investors" ? " · Investors only" : ""}</div><h2 style="margin:4px 0 6px;font-size:19px">${esc(x.title)}</h2><p style="white-space:pre-line">${esc(x.body)}</p></div>`).join("") : `<p class="mut">There are no notices at this time.</p>`; });

page("contact", "Contact", "contact", () => { const st = S.settings;
  return `<div class="phead"><div class="wrap"><div class="crumb"><a href="#home">Home</a> / Contact</div><h1>Contact us</h1><p>How to reach the fund.</p></div></div>
<section class="band"><div class="wrap two" style="align-items:start"><div>
  <h2>Investor enquiries</h2>
  ${dl([["Email", st.contact_email || null], ["Phone", st.phone || null], ["Address", st.address || null], ["Legal name", legalName()]])}
  ${!st.contact_email && !st.phone ? `<p class="mut" style="margin-top:12px">Contact details are provided to applicants and investors in their account.</p>` : ""}
  <p class="hint" style="margin-top:14px">Do not send account passwords or payment details by email. The fund will never ask for your password.</p>
</div><div class="panel"><h3 style="margin-bottom:8px">Existing investors</h3><p class="mut" style="margin-bottom:14px">The fastest way to reach the manager is the secure message centre in your account.</p><a class="btn pri" href="#${S.session ? "portal-messages" : "signin"}">${S.session ? "Open message centre" : "Investor login"}</a>
<h3 style="margin:24px 0 8px">Thinking of investing?</h3><p class="mut" style="margin-bottom:14px">Read how the process works, then apply online.</p><a class="btn" href="#invest">How to invest</a></div></div></section>${foot()}`; });

doc("sitemap", "Site map", "legal", "Every page on this site.", () => `<div class="cards">${MENU.map((m) => `<div><h3 style="margin-bottom:8px">${m.t}</h3>${m.items.map((k) => `<div><a href="#${k}">${TITLES[k]}</a></div>`).join("")}${m.k === "insights" ? ARTICLES.map((a) => `<div><a href="#${a.slug}">${a.title}</a></div>`).join("") + ["tool-growth", "tool-fees", "tool-units"].map((k) => `<div><a href="#${k}">${TITLES[k]}</a></div>`).join("") : ""}</div>`).join("")}<div><h3 style="margin-bottom:8px">Investors</h3><div><a href="#apply">Apply to invest</a></div><div><a href="#signin">Investor login</a></div><div><a href="#portal">My account</a></div><div><a href="#contact">Contact</a></div></div></div>`);
