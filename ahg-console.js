"use strict";
/* ---------- manager console ---------- */
const CONSOLE = [["console", "Overview"], ["console-holdings", "Holdings"], ["console-trades", "Trades"], ["console-orders", "Orders"], ["console-investors", "Investors"], ["console-applications", "Applications"], ["console-cash", "Cash"], ["console-valuations", "Valuations"], ["console-distributions", "Distributions"], ["console-market", "Market"], ["console-analytics", "Analytics"], ["console-notices", "Notices"], ["console-documents", "Documents"], ["console-messages", "Messages"], ["console-reports", "Reports"], ["console-audit", "Audit log"], ["console-settings", "Fund settings"]];
function conNums() {
  const c = S.con, mv = c.holdings.reduce((a, h) => a + N(h.qty) * N(h.last_price), 0), cash = N(c.state.cash), aum = mv + cash, units = N(c.state.units);
  const nav = units > 0 ? aum / units : N(S.settings.initial_nav);
  const dayPl = c.holdings.reduce((a, h) => a + (h.prev_close ? N(h.qty) * (N(h.last_price) - N(h.prev_close)) : 0), 0);
  const cost = c.holdings.reduce((a, h) => a + N(h.qty) * N(h.avg_cost), 0);
  return { mv, cash, aum, units, nav, dayPl, cost, unreal: mv - cost, realized: c.trades.reduce((a, t) => a + N(t.realized_pl), 0) };
}
const nameOf = (uid) => { const p = S.con.profiles.find((x) => x.id === uid); return p ? p.full_name || p.email : "Unknown"; };
const unitsOf = (uid) => S.con.ledger.filter((x) => x.user_id === uid).reduce((a, x) => a + N(x.units), 0);
const qtyFmt = (v) => num(v, N(v) % 1 ? 4 : 0);
const stamp = (v) => (v ? new Date(v).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "");
const CON_SUB = { console: "The fund at a glance.", "console-holdings": "Positions, prices and weights.", "console-trades": "Record buys and sells.", "console-rebalance": "Target weights and the trades that would reach them.", "console-cash": "Cash balance and every movement.", "console-fees": "Work out and post the management fee.", "console-valuations": "Strike and publish the NAV per unit.", "console-distributions": "Pay cash to investors per unit.", "console-orders": "Subscriptions and redemptions waiting for you.", "console-plans": "Investors' recurring contributions.", "console-investors": "The register of unit holders.", "console-applications": "Review people who have applied.", "console-messages": "Conversations with investors and applicants.", "console-flows": "Money in and out, and cash cover for redemptions.", "console-market": "Indexes, holdings and your watchlist.", "console-analytics": "Returns, risk and profit by position.", "console-reports": "Export the fund's records.", "console-audit": "Every change to the books.", "console-notices": "Announcements to investors and the public.", "console-documents": "Offering documents, reports and tax documents.", "console-settings": "Terms, contact details and what the site shows." };
function conNav() {
  const c = S.con, po = c.orders.filter((o) => o.status === "pending").length, pa = c.apps.filter((a) => a.status === "submitted").length, pm = c.msgs.filter((m) => !m.from_manager && !m.read_at).length, due = c.plans.filter((p) => p.active && p.next_date <= today()).length;
  return [
    { h: "Fund", items: [["console", "Overview", "home"], ["console-holdings", "Holdings", "pie"], ["console-trades", "Trades", "swap"], ["console-rebalance", "Rebalancing", "scale"], ["console-cash", "Cash", "cash"], ["console-fees", "Fees", "pct"], ["console-valuations", "Valuations", "cal"], ["console-distributions", "Distributions", "gift"]] },
    { h: "Investors", items: [["console-orders", "Orders", "inbox", po], ["console-plans", "Recurring plans", "repeat", due], ["console-investors", "Investors", "users"], ["console-applications", "Applications", "file", pa], ["console-messages", "Messages", "chat", pm], ["console-flows", "Flows and liquidity", "flow"]] },
    { h: "Insight", items: [["console-market", "Market", "globe"], ["console-analytics", "Analytics", "bars"], ["console-reports", "Reports", "down"], ["console-audit", "Audit log", "shield"]] },
    { h: "Publish", items: [["console-notices", "Notices", "horn"], ["console-documents", "Documents", "folder"], ["console-settings", "Fund settings", "gear"]] },
  ];
}
function conPage(slug, title, body) {
  page(slug, title, "console", () => {
    if (!isMgr()) return `<div class="page"><div class="wrap mid"><div class="card"><h3>Manager access only</h3><p class="mut">${S.session ? "This account is not the fund manager's." : "Sign in with the manager account to open the console."}</p>${S.session ? "" : `<div class="bar" style="margin-top:14px"><a class="btn pri" href="#signin">Sign in</a></div>`}</div></div></div>`;
    if (!S.con) return `<div class="loading">Loading the console…</div>`;
    const n = conNums();
    return appShell({ slug, label: "Manager console", title, sub: (CON_SUB[slug] || "") + ` Live NAV per unit <b class="num">${money(n.nav, 4)}</b>.`, nav: conNav(), switchTo: ["portal", "My investor account"], actions: `<button class="btn sm" data-a="reload">Reload</button><button class="btn sm pri" data-a="quotes">Refresh live prices</button>`, body: body(n) });
  });
}

conPage("console", "Overview", (n) => {
  const c = S.con, pendO = c.orders.filter((o) => o.status === "pending"), pendA = c.apps.filter((a) => a.status === "submitted"), unread = c.msgs.filter((m) => !m.from_manager && !m.read_at).length;
  const movers = c.holdings.filter((h) => N(h.qty) > 0 && h.prev_close).map((h) => ({ t: h.ticker, ch: N(h.last_price) / N(h.prev_close) - 1, pl: N(h.qty) * (N(h.last_price) - N(h.prev_close)) })).sort((a, b) => Math.abs(b.pl) - Math.abs(a.pl)).slice(0, 6);
  const last = S.nav[S.nav.length - 1], al = [];
  if (pendA.length) al.push(`<a class="tl" href="#console-applications">${pendA.length} application${pendA.length > 1 ? "s" : ""} to review</a>`);
  if (pendO.length) al.push(`<a class="tl" href="#console-orders">${pendO.length} investor request${pendO.length > 1 ? "s" : ""} to process</a>`);
  if (unread) al.push(`<a class="tl" href="#console-messages">${unread} unread message${unread > 1 ? "s" : ""}</a>`);
  if (!last || last.d !== today()) al.push(`<a class="tl" href="#console-valuations">No valuation struck today</a>${last ? " (last " + day(last.d) + ")" : ""}`);
  if (n.aum > 0 && n.cash / n.aum > 0.25) al.push(`Cash is ${(n.cash / n.aum * 100).toFixed(0)}% of the fund`);
  const big1 = c.holdings.map((h) => N(h.qty) * N(h.last_price) / (n.aum || 1)).sort((a, b) => b - a)[0];
  if (big1 > 0.3) al.push(`Largest position is ${(big1 * 100).toFixed(0)}% of the fund`);
  const sect = {}; c.holdings.forEach((h) => { const v = N(h.qty) * N(h.last_price); if (v > 0) sect[h.sector] = (sect[h.sector] || 0) + v; });
  const rows = Object.entries(sect).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: k, w: v / n.aum })); if (n.aum > 0 && n.cash > 0) rows.push({ label: "Cash", w: n.cash / n.aum });
  return `${al.length ? `<div class="note">${al.join(" &nbsp;·&nbsp; ")}</div>` : ""}
  <div class="grid g4">
    <div class="tile"><div class="k">Net assets</div><div class="v">${money(n.aum)}</div><div class="s">${num(n.units, 4)} units in issue</div></div>
    <div class="tile"><div class="k">NAV per unit, live</div><div class="v">${money(n.nav, 4)}</div><div class="s">${pct(n.units > 0 ? n.nav / N(S.settings.initial_nav) - 1 : null)} since inception</div></div>
    <div class="tile"><div class="k">Today</div><div class="v ${sign(n.dayPl)}">${n.dayPl >= 0 ? "+" : ""}${money(n.dayPl)}</div><div class="s">${n.aum - n.dayPl > 0 ? pct(n.dayPl / (n.aum - n.dayPl)) : "–"} on the fund</div></div>
    <div class="tile"><div class="k">Cash</div><div class="v">${money(n.cash)}</div><div class="s">${n.aum > 0 ? (n.cash / n.aum * 100).toFixed(1) + "% of the fund" : "No assets yet"}</div></div>
    <div class="tile"><div class="k">Unrealized gain</div><div class="v ${sign(n.unreal)}">${n.unreal >= 0 ? "+" : ""}${money(n.unreal)}</div><div class="s">${n.cost > 0 ? pct(n.unreal / n.cost) + " on cost" : "No positions"}</div></div>
    <div class="tile"><div class="k">Realized gain</div><div class="v ${sign(n.realized)}">${n.realized >= 0 ? "+" : ""}${money(n.realized)}</div><div class="s">From closed trades</div></div>
    <div class="tile"><div class="k">Investors</div><div class="v">${c.profiles.filter((p) => unitsOf(p.id) > 0).length}</div><div class="s">${c.profiles.filter((p) => p.role === "investor").length} accepted</div></div>
    <div class="tile"><div class="k">Positions</div><div class="v">${c.holdings.filter((h) => N(h.qty) > 0).length}</div><div class="s">${c.trades.length} trades recorded</div></div>
  </div>
  <div class="split"><div class="card"><h3>NAV per unit history</h3>${lineChart(navSeries(), (v) => money(v, 4), "Strike at least two valuations to draw the chart.")}</div>
  <div class="stack"><div class="card"><h3>Today's movers</h3>${movers.length ? `<table><tbody>${movers.map((m) => `<tr><td class="tick">${esc(m.t)}</td><td class="n ${sign(m.ch)}">${pct(m.ch)}</td><td class="n ${sign(m.pl)}">${m.pl >= 0 ? "+" : ""}${money(m.pl, 0)}</td></tr>`).join("")}</tbody></table>` : `<div class="empty">Refresh live prices to see today's moves.</div>`}</div>
  <div class="card"><h3>Sector mix</h3>${rows.length ? allocBars(rows) : `<div class="empty">No holdings yet.</div>`}</div></div></div>`;
});

conPage("console-holdings", "Holdings", (n) => {
  const c = S.con, rows = c.holdings.filter((h) => N(h.qty) > 0).sort((a, b) => N(b.qty) * N(b.last_price) - N(a.qty) * N(a.last_price)), closed = c.holdings.filter((h) => N(h.qty) === 0);
  const fxRows = rows.filter(isFx), fxMv = fxRows.reduce((a, h) => a + N(h.qty) * N(h.last_price), 0), rates = [...new Set(fxRows.map((h) => ccyOf(h) + "/" + cur() + " " + num(h.fx_rate, 4)))];
  const fxPaid = c.cash.filter((r) => r.kind === "fx_fee").reduce((a, r) => a - N(r.amount), 0);
  return `<div class="kpis">${kpi("Holdings value", money(n.mv), rows.length + " positions")}${kpi("Foreign currency", n.aum > 0 ? (fxMv / n.aum * 100).toFixed(1) + "%" : "–", fxRows.length ? fxRows.length + " holdings priced in another currency" : "None")}${kpi("Exchange rate used", rates.length ? rates.join(", ") : "–", "Market rate, no fee")}${kpi("Conversion fees paid", money(fxPaid), "Included in book cost")}</div>
  <div class="tablebox">${rows.length ? `<table><thead><tr><th>Holding</th><th>Currency</th><th class="n">Quantity</th><th class="n">Avg cost</th><th class="n">Price</th><th class="n">Today</th><th class="n">Value</th><th class="n">Book cost (${esc(cur())})</th><th class="n">Market value (${esc(cur())})</th><th class="n">Weight</th><th class="n">Unrealized</th></tr></thead><tbody>
  ${rows.map((h) => { const k = ccyOf(h), fx = isFx(h), mv = N(h.qty) * N(h.last_price), bk = N(h.qty) * N(h.avg_cost), u = mv - bk;
    const np = fx ? N(h.native_price) : N(h.last_price), npv = fx ? N(h.native_prev) : N(h.prev_close), d = npv ? np / npv - 1 : null, dv = npv ? N(h.qty) * (np - npv) : null;
    return `<tr><td><span class="tick">${esc(h.ticker)}</span><span class="sub">${esc(h.name)}${h.exchange ? ", " + esc(h.exchange) : ""}</span></td><td>${k}</td><td class="n">${qtyFmt(h.qty)}</td>
    <td class="n">${natMoney(fx ? h.native_avg_cost ?? 0 : h.avg_cost, k)}${fx ? `<span class="sub">${money(h.avg_cost)} with fees</span>` : ""}</td>
    <td class="n">${fx ? `${natMoney(np, k, 4)}<span class="sub">${money(h.last_price, 4)} at ${num(h.fx_rate, 4)}</span>` : `<input class="px" type="number" step="0.0001" min="0" value="${N(h.last_price)}" data-px="${esc(h.ticker)}" aria-label="Price of ${esc(h.ticker)}">`}<span class="sub">${h.price_at ? stamp(h.price_at) : "not priced"}</span></td>
    <td class="n ${sign(d)}">${d === null ? "–" : `${dv >= 0 ? "+" : ""}${num(dv, 2)} ${k}<span class="sub">${pct(d)}</span>`}</td>
    <td class="n">${natMoney(N(h.qty) * np, k)}</td><td class="n">${money(bk)}</td><td class="n"><b>${money(mv)}</b></td><td class="n">${n.aum > 0 ? (mv / n.aum * 100).toFixed(2) + "%" : "–"}</td><td class="n ${sign(u)}">${u >= 0 ? "+" : ""}${money(u)}<span class="sub">${bk > 0 ? pct(mv / bk - 1) : ""}</span></td></tr>`; }).join("")}
  </tbody><tfoot><tr><td colspan="7">Holdings</td><td class="n">${money(rows.reduce((a, h) => a + N(h.qty) * N(h.avg_cost), 0))}</td><td class="n">${money(n.mv)}</td><td class="n">${n.aum > 0 ? (n.mv / n.aum * 100).toFixed(2) + "%" : "–"}</td><td class="n ${sign(n.unreal)}">${n.unreal >= 0 ? "+" : ""}${money(n.unreal)}</td></tr><tr><td colspan="8">Cash</td><td class="n">${money(n.cash)}</td><td class="n">${n.aum > 0 ? (n.cash / n.aum * 100).toFixed(2) + "%" : "–"}</td><td></td></tr><tr><td colspan="8">Net assets</td><td class="n">${money(n.aum)}</td><td class="n">100%</td><td></td></tr></tfoot></table>` : `<div class="empty">The fund holds no positions. <a class="tl" href="#console-trades">Record a buy</a> once the fund has cash.</div>`}</div>
  <p class="hint">Holdings in another currency are valued at the market exchange rate, as your broker values them. Book cost includes conversion fees and commissions, so unrealized gain is after costs. Refresh live prices to update both the share price and the exchange rate${rows.some((h) => !isFx(h)) ? `, or type a ${esc(cur())} price and press Enter` : ""}.</p>
  ${closed.length ? `<p class="hint">Closed positions: ${closed.map((h) => `<span class="tick">${esc(h.ticker)}</span> <button class="btn sm ghost" data-a="delhold" data-t="${esc(h.ticker)}">Remove</button>`).join(" ")}</p>` : ""}`;
});

const ccyOf = (h) => (h.currency || cur()).toUpperCase();
const isFx = (h) => ccyOf(h) !== cur();
const natMoney = (v, c, dp = 2) => `${num(v, dp)} ${c}`;
function tradePreview(f) {
  if (!f || f.dataset.f !== "trade") return;
  const d = Object.fromEntries(new FormData(f)), fx = (d.currency || cur()) !== cur(), box = f.querySelector(".fxonly"), out = f.querySelector("#tr-est");
  if (box) box.hidden = !fx;
  const pl = f.querySelector("label[for=tr-p]"); if (pl) pl.textContent = `Price per share (${d.currency || cur()})`;
  if (!out) return;
  const t = tradeCalc(d), cash = conNums().cash;
  out.innerHTML = t.ok ? `<b>${d.side === "sell" ? "Net proceeds" : "Total cost"} ${money(t.total)}</b>` + (fx ? ` = shares ${money(t.gross)} at market rate ${num(t.mid, 6)} ${d.side === "sell" ? "−" : "+"} conversion fee ${money(t.fxfee)}` : "") + (N(d.fees) ? ` ${d.side === "sell" ? "−" : "+"} commission ${money(d.fees)}` : "") + `. Cash available ${money(cash)}.` : `Cash available: ${money(cash)}`;
}
document.addEventListener("input", (e) => tradePreview(e.target.closest("form")));
document.addEventListener("change", (e) => tradePreview(e.target.closest("form")));

conPage("console-trades", "Trades", (n) => {
  const c = S.con, ccys = [...new Set([cur(), "USD", "CAD"])];
  setTimeout(() => tradePreview(document.querySelector("form[data-f=trade]")), 0);
  const fxFees = c.trades.reduce((a, t) => a + N(t.fx_fee), 0), comm = c.trades.reduce((a, t) => a + N(t.fees), 0);
  return `<form class="card" data-f="trade" novalidate><h3>Record a trade</h3>
    <div class="row"><div class="field"><label for="tr-side">Side</label><select id="tr-side" name="side"><option value="buy">Buy</option><option value="sell">Sell</option></select></div>
      <div class="field"><label for="tr-t">Ticker</label><input id="tr-t" name="ticker" required placeholder="VOO" style="text-transform:uppercase" autocomplete="off"></div>
      <div class="field"><label>&nbsp;</label><button class="btn" type="button" data-a="lookup">Look up price</button></div>
      <div class="field"><label for="tr-d">Trade date</label><input id="tr-d" name="date" type="date" value="${today()}"></div></div>
    <div class="row"><div class="field"><label for="tr-q">Filled quantity</label><input id="tr-q" class="num" name="qty" type="number" min="0" step="any" required></div>
      <div class="field"><label for="tr-c">Trade currency</label><select id="tr-c" name="currency">${ccys.map((x) => `<option ${x === cur() ? "selected" : ""}>${x}</option>`).join("")}</select></div>
      <div class="field"><label for="tr-p">Price per share (${esc(cur())})</label><input id="tr-p" class="num" name="price" type="number" min="0" step="any" required></div>
      <div class="field"><label for="tr-f">Commission (${esc(cur())})</label><input id="tr-f" class="num" name="fees" type="number" min="0" step="0.01" value="0"></div></div>
    <div class="row fxonly" hidden><div class="field"><label for="tr-r">Exchange rate on your confirmation</label><input id="tr-r" class="num" name="fx_rate" type="number" min="0" step="any" placeholder="1.457798"><div class="hint">The all-in rate your broker used, fee included.</div></div>
      <div class="field"><label for="tr-fp">Conversion fee included (%)</label><input id="tr-fp" class="num" name="fx_fee_pct" type="number" min="0" max="19" step="0.01" value="1.5"><div class="hint">The fee is booked separately, not in the share price.</div></div></div>
    <div class="row"><div class="field"><label for="tr-n">Company name</label><input id="tr-n" name="name"></div>
      <div class="field"><label for="tr-s">Sector</label><select id="tr-s" name="sector"><option value="">Keep current</option>${SECTORS.map((s) => `<option>${s}</option>`).join("")}</select></div>
      <div class="field"><label for="tr-x">Exchange</label><input id="tr-x" name="exchange" placeholder="NYSE Arca"></div></div>
    <div class="field"><label for="tr-note">Note (optional)</label><input id="tr-note" name="note"></div>
    <div class="bar"><button class="btn pri" type="submit">Record trade</button><span class="hint" id="tr-est" style="margin:0">Cash available: ${money(n.cash)}</span></div></form>
  <div><div class="bar" style="margin-bottom:10px"><h3 class="sub" style="margin:0">Trade blotter</h3><span class="mut sp" style="font-size:13px">Conversion fees ${money(fxFees)} · Commissions ${money(comm)}</span></div><div class="tablebox">${c.trades.length ? `<table><thead><tr><th>Date</th><th>Side</th><th>Ticker</th><th class="n">Quantity</th><th class="n">Fill price</th><th class="n">Broker rate</th><th class="n">Market rate</th><th class="n">Shares (${esc(cur())})</th><th class="n">Conversion fee</th><th class="n">Commission</th><th class="n">Total</th><th class="n">Realized</th><th>Note</th></tr></thead><tbody>${c.trades.map((t) => { const fx = isFx(t) && t.fx_rate, g = N(t.qty) * N(t.price), tot = t.side === "buy" ? g + N(t.fees) + N(t.fx_fee) : g - N(t.fees) - N(t.fx_fee);
    return `<tr><td>${day(t.trade_date)}</td><td><span class="pill ${t.side === "buy" ? "ok" : "bad"}">${t.side === "buy" ? "Buy" : "Sell"}</span></td><td class="tick">${esc(t.ticker)}</td><td class="n">${qtyFmt(t.qty)}</td><td class="n">${natMoney(t.native_price ?? t.price, ccyOf(t), 4)}</td><td class="n">${fx ? num(t.fx_rate, 6) + `<span class="sub">incl. ${num(t.fx_fee_pct, 2)}%</span>` : "–"}</td><td class="n">${fx ? num(t.fx_mid, 6) : "–"}</td><td class="n">${money(g)}</td><td class="n">${N(t.fx_fee) ? money(t.fx_fee) : "–"}</td><td class="n">${N(t.fees) ? money(t.fees) : "–"}</td><td class="n"><b>${money(tot)}</b></td><td class="n ${sign(t.realized_pl)}">${t.side === "sell" ? (N(t.realized_pl) >= 0 ? "+" : "") + money(t.realized_pl) : "–"}</td><td class="mut">${esc(t.note)}</td></tr>`; }).join("")}</tbody></table>` : `<div class="empty">No trades recorded.</div>`}</div>
  <p class="hint">For a trade in another currency, enter the fill price in that currency and the exchange rate from your broker's confirmation. The shares are booked at the market rate and the conversion fee is recorded as a separate fund expense. Book cost includes the fee.</p></div>`;
});

conPage("console-orders", "Orders", (n) => {
  const c = S.con, pend = c.orders.filter((o) => o.status === "pending"), done = c.orders.filter((o) => o.status !== "pending").slice(0, 100);
  return `<div><h3 class="sub" style="margin-bottom:10px">Requests to process</h3>
  <div class="tablebox">${pend.length ? `<table><thead><tr><th>Reference</th><th>Investor</th><th>Request</th><th class="n">At live price ${money(n.nav, 4)}</th><th>Placed</th><th></th></tr></thead><tbody>${pend.map((o) => { const held = unitsOf(o.user_id), u = o.kind === "subscribe" ? N(o.amount) / n.nav : o.redeem_all ? held : N(o.units);
    return `<tr><td class="tick">${esc(o.reference)}</td><td>${esc(nameOf(o.user_id))}</td><td><span class="pill ${o.kind === "subscribe" ? "ok" : "wait"}">${o.kind === "subscribe" ? "Subscription" : "Redemption"}</span> ${o.kind === "subscribe" ? money(o.amount) : o.redeem_all ? "all units" : num(o.units, 4) + " units"}</td><td class="n">${o.kind === "subscribe" ? "issues " + num(u, 4) + " units" : "pays " + money(u * n.nav)}</td><td>${day(o.created_at)}</td><td class="n"><button class="btn sm pri" data-a="process" data-id="${o.id}">Process</button> <button class="btn sm danger" data-a="decline" data-id="${o.id}">Decline</button></td></tr>`; }).join("")}</tbody></table>` : `<div class="empty">Nothing waiting. New subscriptions and redemptions appear here.</div>`}</div>
  <p class="hint">Process a subscription only after the money has arrived in the fund's account. Processing issues or cancels units at the live NAV per unit, so refresh prices first.</p></div>
  <div><h3 class="sub" style="margin-bottom:10px">Order history</h3><div class="tablebox">${done.length ? `<table><thead><tr><th>Reference</th><th>Investor</th><th>Request</th><th>Status</th><th class="n">NAV per unit</th><th class="n">Units</th><th class="n">Amount</th><th>Closed</th></tr></thead><tbody>${done.map((o) => `<tr><td class="tick">${esc(o.reference)}</td><td>${esc(nameOf(o.user_id))}</td><td>${o.kind === "subscribe" ? "Subscription" : "Redemption"}</td><td><span class="pill ${ORDER_STATUS[o.status][0]}">${ORDER_STATUS[o.status][1]}</span></td><td class="n">${o.nav ? money(o.nav, 4) : "–"}</td><td class="n">${o.filled_units ? num(o.filled_units, 4) : "–"}</td><td class="n">${o.filled_amount ? money(o.filled_amount) : o.amount ? money(o.amount) : "–"}</td><td>${day(o.processed_at)}</td></tr>`).join("")}</tbody></table>` : `<div class="empty">No completed orders yet.</div>`}</div></div>`;
});

conPage("console-investors", "Investors", (n) => {
  const c = S.con, inv = c.profiles.map((p) => { const l = c.ledger.filter((x) => x.user_id === p.id); return { p, l, b: bookStats(l), units: l.reduce((a, x) => a + N(x.units), 0) }; }).filter((x) => x.p.role === "investor" || x.l.length).sort((a, b) => b.units - a.units);
  const sel = inv.find((x) => x.p.id === S.invSel);
  let detail = "";
  if (sel) { const app = c.apps.find((a) => a.user_id === sel.p.id), ords = c.orders.filter((o) => o.user_id === sel.p.id).slice(0, 20), v = sel.units * n.nav;
    detail = `<div class="card"><div class="bar"><h3 style="margin:0">${esc(sel.p.full_name || sel.p.email)}</h3><button class="btn sm sp" data-a="invsel" data-id="">Close</button></div>
    <div style="margin:14px 0">${dl([["Email", sel.p.email], ["Phone", sel.p.phone || app?.phone || null], ["Joined", day(sel.p.created_at)], ["Location", app ? [app.region, app.country].filter(Boolean).join(", ") : null], ["Qualifies as", app?.investor_type], ["Units", num(sel.units, 4)], ["Market value", money(v)], ["Book cost", money(sel.b.book)], ["Unrealized", money(v - sel.b.book)], ["Realized", money(sel.b.realized)]])}</div>
    <h3 style="margin-bottom:8px">Unit ledger</h3>${sel.l.length ? `<table><thead><tr><th>Date</th><th>Type</th><th class="n">Amount</th><th class="n">NAV per unit</th><th class="n">Units</th></tr></thead><tbody>${[...sel.l].reverse().map((r) => `<tr><td>${day(r.at)}</td><td>${r.kind}</td><td class="n">${money(r.amount)}</td><td class="n">${money(r.nav, 4)}</td><td class="n">${num(r.units, 4)}</td></tr>`).join("")}</tbody></table>` : `<p class="mut">No transactions.</p>`}
    ${ords.length ? `<h3 style="margin:18px 0 8px">Requests</h3><table><tbody>${ords.map((o) => `<tr><td class="tick">${esc(o.reference)}</td><td>${o.kind}</td><td><span class="pill ${ORDER_STATUS[o.status][0]}">${ORDER_STATUS[o.status][1]}</span></td><td class="n">${o.amount ? money(o.amount) : o.redeem_all ? "all units" : num(o.units, 4) + " units"}</td><td>${day(o.created_at)}</td></tr>`).join("")}</tbody></table>` : ""}
    <div class="cols2" style="margin-top:18px"><form data-f="mgrorder" novalidate><h3 style="margin-bottom:8px">Enter a request for this investor</h3><div class="row"><div class="field"><label for="mo-k">Type</label><select id="mo-k" name="kind"><option value="subscribe">Subscription (amount)</option><option value="redeem">Redemption (units)</option><option value="redeemall">Redeem everything</option></select></div><div class="field"><label for="mo-v">Amount or units</label><input id="mo-v" class="num" name="value" type="number" min="0" step="0.000001"></div></div><button class="btn sm" type="submit">Create request</button><div class="hint">It appears under Orders for you to process.</div></form>
    <form data-f="invnote" novalidate><h3 style="margin-bottom:8px">Private notes</h3><div class="field"><textarea name="body" required placeholder="Call notes, documents received, anything to remember. Only you can see these." style="min-height:64px"></textarea></div><button class="btn sm" type="submit">Add note</button></form></div>
    ${c.notes.filter((x) => x.user_id === sel.p.id).map((x) => `<div class="note" style="margin-top:10px"><b>${stamp(x.at)}</b> ${esc(x.body)}</div>`).join("")}
    ${(() => { const pl = c.plans.find((x) => x.user_id === sel.p.id), pr = sel.p.prefs || {}; return dl([["Recurring plan", pl ? money(pl.amount) + " " + pl.frequency + ", next " + day(pl.next_date) : null], ["Goal", pr.goal?.target ? money(pr.goal.target, 0) + (pr.goal.date ? " by " + day(pr.goal.date) : "") : null], ["Trusted contact", pr.trusted?.name ? [pr.trusted.name, pr.trusted.relationship, pr.trusted.email, pr.trusted.phone].filter(Boolean).join(", ") : null]]); })()}
    <div class="bar" style="margin-top:16px"><button class="btn sm" data-a="msgsel" data-id="${sel.p.id}">Message this investor</button></div></div>`; }
  return `${detail}<div class="tablebox">${inv.length ? `<table><thead><tr><th>Investor</th><th class="n">Units</th><th class="n">Market value</th><th class="n">Share of fund</th><th class="n">Book cost</th><th class="n">Unrealized</th><th></th></tr></thead><tbody>${inv.map((x) => { const v = x.units * n.nav; return `<tr><td>${esc(x.p.full_name || "No name")}<span class="sub">${esc(x.p.email)}</span></td><td class="n">${num(x.units, 4)}</td><td class="n">${money(v)}</td><td class="n">${n.units > 0 ? (x.units / n.units * 100).toFixed(2) + "%" : "–"}</td><td class="n">${money(x.b.book)}</td><td class="n ${sign(v - x.b.book)}">${x.l.length ? (v - x.b.book >= 0 ? "+" : "") + money(v - x.b.book) : "–"}</td><td class="n"><button class="btn sm" data-a="invsel" data-id="${x.p.id}">View</button></td></tr>`; }).join("")}</tbody><tfoot><tr><td>Total</td><td class="n">${num(inv.reduce((a, x) => a + x.units, 0), 4)}</td><td class="n">${money(inv.reduce((a, x) => a + x.units, 0) * n.nav)}</td><td></td><td class="n">${money(inv.reduce((a, x) => a + x.b.book, 0))}</td><td></td><td></td></tr></tfoot></table>` : `<div class="empty">No investors yet. <a class="tl" href="#console-applications">Accept an application</a> to add one.</div>`}</div>
  <p class="hint">Units in the register should equal units in issue: ${num(inv.reduce((a, x) => a + x.units, 0), 4)} against ${num(n.units, 4)}.</p>`;
});
ACT.invsel = (b) => { S.invSel = b.dataset.id || null; render(); };
FORMS.mgrorder = async (d) => { const all = d.kind === "redeemall", v = N(d.value); if (!all && !(v > 0)) throw new Error("Enter an amount or number of units."); await q(sb.rpc("manager_place_order", { p_user: S.invSel, p_kind: d.kind === "subscribe" ? "subscribe" : "redeem", p_amount: d.kind === "subscribe" ? v : null, p_units: d.kind === "redeem" ? v : null, p_all: all })); toast("Request created. Process it under Orders."); await refresh(); };
FORMS.invnote = async (d) => { await q(sb.from("investor_notes").insert({ user_id: S.invSel, body: d.body.trim() })); toast("Note added."); await refresh(); };

conPage("console-applications", "Applications", () => {
  const f = S.appFilter || "submitted", all = S.con.apps, apps = all.filter((a) => f === "all" || a.status === f);
  return `<div class="seg">${[["submitted", "To review"], ["approved", "Accepted"], ["waitlist", "Waitlist"], ["declined", "Declined"], ["all", "All"]].map(([k, t]) => `<button class="${f === k ? "on" : ""}" data-a="appfilter" data-k="${k}">${t} (${k === "all" ? all.length : all.filter((a) => a.status === k).length})</button>`).join("")}</div>
  ${apps.length ? apps.map((a) => { const [cl, t] = APP_STATUS[a.status];
    return `<div class="card"><div class="bar"><div><h3 style="margin:0">${esc(a.full_name)}</h3><span class="mut" style="font-size:14px">${esc(a.email)}${a.phone ? ", " + esc(a.phone) : ""}, ${esc(a.region)}${a.country ? ", " + esc(a.country) : ""}</span></div><span class="pill ${cl} sp">${t}</span></div>
    <div style="margin:14px 0">${dl([["Plans to invest", money(a.intended_amount, 0)], ["Qualifies as", a.investor_type], ["Experience", a.experience], ["Source of money", a.source_of_funds], ["Applied", day(a.submitted_at)], ["Decided", a.reviewed_at ? day(a.reviewed_at) : null], ...(() => { const d = a.details || {}; return [["Date of birth", d.dob ? day(d.dob) : null], ["Address", [d.street, d.city, a.region, d.postal, a.country].filter(Boolean).join(", ")], ["Tax residence", d.tax_country], ["Employment", [d.employment, d.occupation, d.employer].filter(Boolean).join(", ")], ["Annual income", d.income], ["Financial assets", d.net_assets], ["Knowledge", d.knowledge], ["Time horizon", d.horizon], ["After a 30% fall", d.reaction], ["Share of investable money", d.share], ["Politically exposed", d.pep], ["Public company insider", d.insider], ["Investing for someone else", d.third_party], ["Signed", a.acks?.signature]]; })()])}</div>
    ${a.notes ? `<div class="note" style="margin-bottom:14px"><b>From the applicant:</b> ${esc(a.notes)}</div>` : ""}
    <div class="field"><label for="an-${a.id}">Note to the applicant (they will see this)</label><input id="an-${a.id}" value="${esc(a.manager_note)}"></div>
    <div class="bar"><button class="btn sm pri" data-a="review" data-id="${a.id}" data-s="approved" ${a.status === "approved" ? "disabled" : ""}>Accept</button><button class="btn sm" data-a="review" data-id="${a.id}" data-s="waitlist" ${a.status === "waitlist" ? "disabled" : ""}>Waitlist</button><button class="btn sm danger" data-a="review" data-id="${a.id}" data-s="declined" ${a.status === "declined" ? "disabled" : ""}>Decline</button><button class="btn sm sp" data-a="msgsel" data-id="${a.user_id}">Message</button></div></div>`; }).join("") : `<div class="card"><div class="empty">No applications in this list.</div></div>`}`;
});
ACT.appfilter = (b) => { S.appFilter = b.dataset.k; render(); };

conPage("console-cash", "Cash", (n) => {
  const c = S.con, KIND = { subscription: "Subscription", redemption: "Redemption", trade: "Trade", fee: "Fee", fx_fee: "Currency conversion fee", dividend: "Dividend", interest: "Interest", adjustment: "Adjustment", distribution: "Distribution" };
  const sum = (k) => c.cash.filter((r) => r.kind === k).reduce((a, r) => a + N(r.amount), 0);
  return `<div class="grid g4"><div class="tile"><div class="k">Cash balance</div><div class="v">${money(n.cash)}</div><div class="s">${n.aum > 0 ? (n.cash / n.aum * 100).toFixed(1) + "% of net assets" : ""}</div></div>
  <div class="tile"><div class="k">Net subscriptions</div><div class="v">${money(sum("subscription") + sum("redemption"))}</div><div class="s">Subscriptions less redemptions</div></div>
  <div class="tile"><div class="k">Income received</div><div class="v">${money(sum("dividend") + sum("interest"))}</div><div class="s">Dividends and interest</div></div>
  <div class="tile"><div class="k">Fees and expenses</div><div class="v">${money(-sum("fee") - sum("fx_fee"))}</div><div class="s">Includes ${money(-sum("fx_fee"))} in currency conversion</div></div></div>
  <form class="card" data-f="cash" novalidate><h3>Add a cash entry</h3>
    <div class="row"><div class="field"><label for="ca-k">Entry</label><select id="ca-k" name="kind"><option value="dividend">Dividend received</option><option value="interest">Interest received</option><option value="fee">Fee or expense paid</option><option value="adjustment">Adjustment (+ or −)</option></select></div>
    <div class="field"><label for="ca-a">Amount (${esc(cur())})</label><input id="ca-a" class="num" name="amount" type="number" step="0.01" required></div>
    <div class="field"><label for="ca-m">Memo</label><input id="ca-m" name="memo" placeholder="Management fee, Q4"></div></div>
    <button class="btn pri" type="submit">Add cash entry</button><div class="hint">Subscriptions, redemptions, trades and distributions post here on their own.</div></form>
  <div class="tablebox">${c.cash.length ? `<table><thead><tr><th>Date</th><th>Entry</th><th>Memo</th><th class="n">Amount</th></tr></thead><tbody>${c.cash.map((r) => `<tr><td>${day(r.at)}</td><td>${KIND[r.kind] || r.kind}</td><td class="mut">${esc(r.memo)}</td><td class="n ${sign(r.amount)}">${N(r.amount) >= 0 ? "+" : ""}${money(r.amount)}</td></tr>`).join("")}</tbody></table>` : `<div class="empty">No cash movements yet.</div>`}</div>`;
});

conPage("console-valuations", "Valuations", (n) => {
  const hist = [...S.nav].reverse(), st = S.settings;
  return `<form class="card" data-f="strike"><h3>Strike a valuation</h3><p class="mut" style="margin-bottom:14px">Records the live NAV per unit of <b class="num" style="color:var(--ink)">${money(n.nav, 4)}</b> for a date and publishes it to investors. Refresh prices first.${st.benchmark_symbol ? ` The level of ${esc(st.benchmark_symbol)} is recorded alongside it.` : " Set a benchmark symbol in Fund settings to record the benchmark alongside it."}</p>
    <div class="row"><div class="field"><label for="sk-d">Valuation date</label><input id="sk-d" name="date" type="date" value="${today()}" max="${today()}"></div><div class="field"><label>&nbsp;</label><button class="btn pri" type="submit">Strike valuation</button></div></div></form>
  <div class="tablebox">${hist.length ? `<table><thead><tr><th>Date</th><th class="n">NAV per unit</th><th class="n">Change</th><th class="n">Net assets</th><th class="n">Units</th><th class="n">Benchmark</th><th></th></tr></thead><tbody>${hist.slice(0, 250).map((r, i) => { const prev = hist[i + 1], ch = prev ? N(r.nav) / N(prev.nav) - 1 : null; return `<tr><td>${day(r.d)}</td><td class="n">${money(r.nav, 4)}</td><td class="n ${sign(ch)}">${ch === null ? "–" : pct(ch)}</td><td class="n">${money(r.aum, 0)}</td><td class="n">${num(r.units, 2)}</td><td class="n">${r.bench ? num(r.bench, 2) : "–"}</td><td class="n"><button class="btn sm ghost" data-a="delnav" data-d="${r.d}" aria-label="Delete valuation for ${day(r.d)}">Delete</button></td></tr>`; }).join("")}</tbody></table>` : `<div class="empty">No valuations struck yet.</div>`}</div>`;
});
FORMS.strike = async (d) => {
  const sym = (S.settings.benchmark_symbol || "").toUpperCase(); let bench = null;
  if (sym && (d.date || today()) === today()) { try { const x = (await fetchQuotes([sym]))[0]; if (x && !x.error) bench = x.price; } catch (_) {} }
  const v = await q(sb.rpc("strike_nav", { p_date: d.date || today(), p_bench: bench }));
  toast(`Valuation struck at ${money(v, 4)} for ${day(d.date || today())}.`); await refresh();
};

conPage("console-distributions", "Distributions", (n) => {
  const d = S.dist || [];
  return `<form class="card" data-f="dist" novalidate><h3>Pay a distribution</h3><p class="mut" style="margin-bottom:14px">Pays the same amount on every unit in issue, out of fund cash. Fund cash is ${money(n.cash)} and ${num(n.units, 4)} units are in issue. Send each investor's payment yourself.</p>
    <div class="row"><div class="field"><label for="di-d">Record date</label><input id="di-d" name="date" type="date" value="${today()}"></div><div class="field"><label for="di-p">Amount per unit (${esc(cur())})</label><input id="di-p" class="num" name="per_unit" type="number" min="0" step="0.0001" required></div><div class="field"><label for="di-k">Type</label><select id="di-k" name="kind"><option>Income</option><option>Capital gains</option><option>Return of capital</option></select></div></div>
    <div class="field"><label for="di-n">Note</label><input id="di-n" name="note"></div><button class="btn pri" type="submit">Record distribution</button></form>
  <div class="tablebox">${d.length ? `<table><thead><tr><th>Record date</th><th>Type</th><th class="n">Per unit</th><th class="n">Units</th><th class="n">Total paid</th><th>Note</th></tr></thead><tbody>${d.map((x) => `<tr><td>${day(x.d)}</td><td>${esc(x.kind)}</td><td class="n">${money(x.per_unit, 4)}</td><td class="n">${num(x.units, 4)}</td><td class="n">${money(x.total)}</td><td class="mut">${esc(x.note)}</td></tr>`).join("")}</tbody></table>` : `<div class="empty">No distributions recorded.</div>`}</div>
  ${d.length ? `<div><h3 class="sub" style="margin-bottom:10px">Latest distribution by investor</h3><div class="tablebox"><table><thead><tr><th>Investor</th><th class="n">Units at record date</th><th class="n">Amount to pay</th></tr></thead><tbody>${S.con.profiles.map((p) => { const held = S.con.ledger.filter((r) => r.user_id === p.id && r.at.slice(0, 10) <= d[0].d).reduce((a, r) => a + N(r.units), 0); return held > 0 ? `<tr><td>${esc(p.full_name || p.email)}</td><td class="n">${num(held, 4)}</td><td class="n">${money(held * N(d[0].per_unit))}</td></tr>` : ""; }).join("")}</tbody></table></div></div>` : ""}`;
});
FORMS.dist = async (d) => {
  const n = conNums(), tot = N(d.per_unit) * n.units;
  if (!(await ask("Record this distribution?", `${money(d.per_unit, 4)} per unit on ${num(n.units, 4)} units.\nTotal paid from fund cash: ${money(tot)}.\nNAV per unit will fall by the same amount per unit.`, "Record distribution"))) return;
  await q(sb.rpc("record_distribution", { p_date: d.date || today(), p_per_unit: N(d.per_unit), p_kind: d.kind, p_note: d.note || "" })); toast("Distribution recorded."); await refresh();
};

conPage("console-market", "Market", () => {
  const c = S.con, Q = S.market.quotes;
  const line = (sym, label, extra = "") => { const x = Q[sym], ch = x && x.prev ? x.price / x.prev - 1 : null;
    return `<tr><td><span class="tick">${esc(sym)}</span><span class="sub">${esc(label || x?.name || "")}</span></td><td class="n">${x && !x.error ? num(x.price, 2) : "–"}</td><td class="n ${sign(ch)}">${ch === null ? "–" : pct(ch)}</td><td class="n">${x?.closes?.length > 1 ? pct(x.price / x.closes[0] - 1) : "–"}</td><td>${x ? spark(x.closes) : ""}</td><td class="n">${extra}</td></tr>`; };
  const head = `<thead><tr><th>Symbol</th><th class="n">Last</th><th class="n">Today</th><th class="n">1 month</th><th>1 month trend</th><th></th></tr></thead>`, held = c.holdings.filter((h) => N(h.qty) > 0);
  return `<p class="mut">${S.market.busy ? "Fetching quotes…" : S.market.at ? "Quotes as of " + new Date(S.market.at).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" }) + ". They refresh every minute while this page is open." : "Press Refresh live prices to load the market."}</p>
  <div><h3 class="sub" style="margin-bottom:10px">Indexes</h3><div class="tablebox"><table>${head}<tbody>${BENCH.map(([s, l]) => line(s, l)).join("")}</tbody></table></div></div>
  <div><h3 class="sub" style="margin-bottom:10px">Fund holdings</h3><div class="tablebox">${held.length ? `<table>${head}<tbody>${held.map((h) => line(h.ticker, h.name)).join("")}</tbody></table>` : `<div class="empty">No holdings yet.</div>`}</div></div>
  <div><h3 class="sub" style="margin-bottom:10px">Watchlist</h3><form class="bar" data-f="watch" style="margin-bottom:10px"><input name="ticker" placeholder="Add a ticker, e.g. SHOP.TO" style="max-width:260px;text-transform:uppercase" aria-label="Ticker to watch" required><button class="btn" type="submit">Add to watchlist</button></form>
  <div class="tablebox">${c.watch.length ? `<table>${head}<tbody>${c.watch.map((w) => line(w.ticker, w.name, `<button class="btn sm ghost" data-a="unwatch" data-t="${esc(w.ticker)}">Remove</button>`)).join("")}</tbody></table>` : `<div class="empty">Add tickers you are following but do not hold.</div>`}</div></div>`;
});
window.addEventListener("hashchange", () => { if (route() === "console-market" && isMgr() && !S.market.at) refreshQuotes(); });

conPage("console-analytics", "Analytics", (n) => {
  const c = S.con, rs = riskStats(), pts = navSeries(), b = benchSeries();
  let peak = 0; const dd = pts.map((p) => { peak = Math.max(peak, p.v); return { d: p.d, v: (p.v / peak - 1) * 100 }; });
  const byT = {}; c.trades.forEach((t) => { byT[t.ticker] = (byT[t.ticker] || 0) + N(t.realized_pl); });
  const pl = [...new Set([...c.holdings.map((h) => h.ticker), ...Object.keys(byT)])].map((t) => { const h = c.holdings.find((x) => x.ticker === t), un = h ? N(h.qty) * (N(h.last_price) - N(h.avg_cost)) : 0; return { t, un, re: byT[t] || 0, tot: un + (byT[t] || 0) }; }).sort((a, b2) => b2.tot - a.tot);
  const w = c.holdings.map((h) => N(h.qty) * N(h.last_price) / (n.aum || 1)).filter((x) => x > 0).sort((a, b2) => b2 - a), top = (k) => w.slice(0, k).reduce((a, x) => a + x, 0);
  const row = (label, f) => `<tr><td>${esc(label)}</td>${RANGES.map(([, r]) => { const v = f(r); return `<td class="n ${sign(v)}">${v === null ? "–" : pct(v)}</td>`; }).join("")}</tr>`;
  return `<div><h3 class="sub" style="margin-bottom:10px">Returns</h3><div class="tablebox"><table><thead><tr><th></th>${["1 month", "3 months", "6 months", "Year to date", "1 year", "Since inception"].map((h) => `<th class="n">${h}</th>`).join("")}</tr></thead><tbody>${row("Fund", (r) => periodReturn(r))}${b.length >= 2 ? row(S.settings.benchmark || "Benchmark", (r) => periodReturn(r, b, 0)) : ""}</tbody></table></div></div>
  <div class="g2 grid"><div><h3 class="sub" style="margin-bottom:10px">Risk</h3>${dl([["Largest fall from a peak", rs ? pct(rs.dd) : "Needs 3 valuations"], ["Annualized volatility", rs && rs.vol !== null ? (rs.vol * 100).toFixed(1) + "%" : "Needs 12 valuations"], ["Best month", rs && rs.best !== null ? pct(rs.best) : null], ["Worst month", rs && rs.worst !== null ? pct(rs.worst) : null], ["Months with a gain", rs && rs.pos !== null ? Math.round(rs.pos * 100) + "%" : null]])}</div>
  <div><h3 class="sub" style="margin-bottom:10px">Concentration</h3>${dl([["Positions", String(w.length)], ["Largest position", w.length ? (w[0] * 100).toFixed(1) + "%" : null], ["Top 3", w.length ? (top(3) * 100).toFixed(1) + "%" : null], ["Top 5", w.length ? (top(5) * 100).toFixed(1) + "%" : null], ["Cash", n.aum > 0 ? (n.cash / n.aum * 100).toFixed(1) + "%" : null]])}</div></div>
  <div class="card"><h3>Fall from peak (%)</h3>${lineChart(dd, (v) => v.toFixed(1) + "%", "Strike at least two valuations to draw the chart.")}</div>
  <div><h3 class="sub" style="margin-bottom:10px">Monthly returns (%)</h3>${monthGrid() || `<div class="tablebox"><div class="empty">No valuations yet.</div></div>`}</div>
  <div><h3 class="sub" style="margin-bottom:10px">Profit and loss by position</h3><div class="tablebox">${pl.length ? `<table><thead><tr><th>Ticker</th><th class="n">Unrealized</th><th class="n">Realized</th><th class="n">Total</th><th class="n">Share of net assets</th></tr></thead><tbody>${pl.map((x) => `<tr><td class="tick">${esc(x.t)}</td><td class="n ${sign(x.un)}">${money(x.un)}</td><td class="n ${sign(x.re)}">${money(x.re)}</td><td class="n ${sign(x.tot)}"><b>${money(x.tot)}</b></td><td class="n">${n.aum > 0 ? pct(x.tot / n.aum) : "–"}</td></tr>`).join("")}</tbody></table>` : `<div class="empty">No positions yet.</div>`}</div></div>`;
});

conPage("console-notices", "Notices", () => {
  const n = S.notices || [];
  return `<form class="card" data-f="notice" novalidate><h3>Publish a notice</h3>
    <div class="row"><div class="field"><label for="no-t">Title</label><input id="no-t" name="title" required></div><div class="field"><label for="no-a">Who can see it</label><select id="no-a" name="audience"><option value="investors">Investors only</option><option value="public">Everyone (public site)</option></select></div></div>
    <div class="field"><label for="no-b">Message</label><textarea id="no-b" name="body" required></textarea></div><button class="btn pri" type="submit">Publish notice</button></form>
  <div class="tablebox">${n.length ? `<table><thead><tr><th>Published</th><th>Notice</th><th>Audience</th><th></th></tr></thead><tbody>${n.map((x) => `<tr><td>${day(x.published_at)}</td><td><b>${esc(x.title)}</b><span class="sub">${esc(x.body.slice(0, 120))}</span></td><td>${x.audience === "public" ? "Public" : "Investors"}</td><td class="n"><button class="btn sm ghost" data-a="delrow" data-tb="notices" data-id="${x.id}">Delete</button></td></tr>`).join("")}</tbody></table>` : `<div class="empty">No notices published.</div>`}</div>`;
});
FORMS.notice = async (d) => { await q(sb.from("notices").insert({ title: d.title.trim(), body: d.body, audience: d.audience })); toast("Notice published."); await refresh(); };

conPage("console-documents", "Documents", () => {
  const n = S.docs || [];
  return `<form class="card" data-f="document" novalidate><h3>Publish a document</h3><p class="mut" style="margin-bottom:14px">Add a link to a document you have stored elsewhere, such as a PDF in cloud storage.</p>
    <div class="row"><div class="field"><label for="do-t">Title</label><input id="do-t" name="title" required></div><div class="field"><label for="do-c">Category</label><select id="do-c" name="category"><option>Offering documents</option><option>Fund reports</option><option>Financial statements</option><option>Tax documents</option><option>Notices</option></select></div></div>
    <div class="row"><div class="field"><label for="do-u">Link (https://…)</label><input id="do-u" name="url" type="url" required pattern="https://.*"></div><div class="field"><label for="do-d">Document date</label><input id="do-d" name="date" type="date" value="${today()}"></div><div class="field"><label for="do-a">Who can see it</label><select id="do-a" name="audience"><option value="investors">Investors only</option><option value="public">Everyone (public site)</option></select></div></div>
    <button class="btn pri" type="submit">Publish document</button></form>
  <div class="tablebox">${n.length ? `<table><thead><tr><th>Date</th><th>Document</th><th>Category</th><th>Audience</th><th></th></tr></thead><tbody>${n.map((x) => `<tr><td>${day(x.doc_date)}</td><td><a class="tl" href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)}</a></td><td>${esc(x.category)}</td><td>${x.audience === "public" ? "Public" : "Investors"}</td><td class="n"><button class="btn sm ghost" data-a="delrow" data-tb="documents" data-id="${x.id}">Delete</button></td></tr>`).join("")}</tbody></table>` : `<div class="empty">No documents published.</div>`}</div>`;
});
FORMS.document = async (d) => { await q(sb.from("documents").insert({ title: d.title.trim(), category: d.category, url: d.url.trim(), audience: d.audience, doc_date: d.date || today() })); toast("Document published."); await refresh(); };
ACT.delrow = async (b) => { if (await ask("Delete this item?", "It will be removed for everyone who could see it.", "Delete")) { await q(sb.from(b.dataset.tb).delete().eq("id", N(b.dataset.id))); await refresh(); } };

conPage("console-messages", "Messages", () => {
  const c = S.con, ids = [...new Set(c.msgs.map((m) => m.user_id))], sel = S.msgSel && c.profiles.find((p) => p.id === S.msgSel);
  const threads = ids.map((id) => { const ms = c.msgs.filter((m) => m.user_id === id); return { id, last: ms[ms.length - 1], unread: ms.filter((m) => !m.from_manager && !m.read_at).length }; }).sort((a, b) => (a.last.at < b.last.at ? 1 : -1));
  const ms = sel ? c.msgs.filter((m) => m.user_id === sel.id) : [];
  return `<div class="split"><div class="tablebox">${threads.length ? `<table><tbody>${threads.map((t) => `<tr><td><b>${esc(nameOf(t.id))}</b>${t.unread ? ` <span class="pill bad">${t.unread} new</span>` : ""}<span class="sub">${esc(t.last.body.slice(0, 70))}</span></td><td class="n mut">${stamp(t.last.at)}</td><td class="n"><button class="btn sm" data-a="msgsel" data-id="${t.id}">Open</button></td></tr>`).join("")}</tbody></table>` : `<div class="empty">No messages yet. Investors and applicants can write to you from their account.</div>`}</div>
  <div class="card">${sel ? `<h3>${esc(sel.full_name || sel.email)}</h3><div class="thread">${ms.length ? ms.map((m) => `<div class="msg ${m.from_manager ? "me" : ""}">${esc(m.body)}<small>${m.from_manager ? "You" : "Investor"}, ${stamp(m.at)}</small></div>`).join("") : `<div class="empty">No messages with this person yet.</div>`}</div>
    <form data-f="reply" style="margin-top:14px"><div class="field"><label for="rp-b">Reply</label><textarea id="rp-b" name="body" maxlength="4000" required></textarea></div><button class="btn pri" type="submit">Send reply</button></form>` : `<div class="empty">Open a conversation to read and reply.</div>`}</div></div>`;
});
ACT.msgsel = async (b) => { S.msgSel = b.dataset.id; if (route() !== "console-messages") location.hash = "#console-messages"; else render(); try { await q(sb.rpc("mark_messages_read", { p_user: S.msgSel })); S.con.msgs = S.con.msgs.map((m) => (m.user_id === S.msgSel && !m.from_manager ? { ...m, read_at: m.read_at || new Date().toISOString() } : m)); render(); } catch (e) { console.error(e); } };
FORMS.reply = async (d) => { await q(sb.rpc("send_message", { p_body: d.body, p_to: S.msgSel })); toast("Reply sent."); await refresh(); };

conPage("console-reports", "Reports", () => `<p class="mut">Download the fund's records as CSV files for your accountant, auditor or your own analysis.</p>
  <div class="tablebox"><table><tbody>${[["holdings", "Holdings", "Every position with quantity, cost, price and market value"], ["trades", "Trade blotter", "All recorded buys and sells"], ["cash", "Cash ledger", "Every cash movement"], ["nav", "Valuation history", "NAV per unit, net assets and units by date"], ["register", "Investor register", "Each investor's units, market value and book cost"], ["ledger", "Unit ledger", "Every issue and cancellation of units"], ["orders", "Orders", "All subscription and redemption requests"], ["applications", "Applications", "All investor applications and decisions"], ["audit", "Audit log", "The record of every change to the books"]].map(([k, t, d]) => `<tr><td><b>${t}</b><span class="sub">${d}</span></td><td class="n"><button class="btn sm" data-a="report" data-k="${k}">Download CSV</button></td></tr>`).join("")}</tbody></table></div>`);
ACT.report = (b) => {
  const c = S.con, n = conNums(), k = b.dataset.k, R = {
    holdings: () => [["Ticker", "Name", "Sector", "Exchange", "Quantity", "Average cost", "Price", "Market value", "Weight", "Unrealized"], ...c.holdings.map((h) => { const mv = N(h.qty) * N(h.last_price); return [h.ticker, h.name, h.sector, h.exchange, N(h.qty), N(h.avg_cost), N(h.last_price), mv, n.aum ? mv / n.aum : 0, mv - N(h.qty) * N(h.avg_cost)]; }), ["CASH", "", "", "", "", "", "", n.cash, n.aum ? n.cash / n.aum : 0, ""]],
    trades: () => [["Date", "Side", "Ticker", "Quantity", "Price", "Fees", "Realized", "Note"], ...c.trades.map((t) => [t.trade_date, t.side, t.ticker, N(t.qty), N(t.price), N(t.fees), N(t.realized_pl), t.note])],
    cash: () => [["Date", "Entry", "Amount", "Memo"], ...c.cash.map((r) => [r.at, r.kind, N(r.amount), r.memo])],
    nav: () => [["Date", "NAV per unit", "Net assets", "Units", "Benchmark"], ...S.nav.map((r) => [r.d, N(r.nav), N(r.aum), N(r.units), r.bench ?? ""])],
    register: () => [["Name", "Email", "Units", "Market value", "Book cost", "Realized"], ...c.profiles.map((p) => { const l = c.ledger.filter((x) => x.user_id === p.id), bs = bookStats(l); return l.length ? [p.full_name, p.email, bs.units, bs.units * n.nav, bs.book, bs.realized] : null; }).filter(Boolean)],
    ledger: () => [["Date", "Investor", "Type", "Units", "NAV per unit", "Amount"], ...c.ledger.map((r) => [r.at, nameOf(r.user_id), r.kind, N(r.units), N(r.nav), N(r.amount)])],
    orders: () => [["Reference", "Investor", "Type", "Status", "Amount", "Units", "NAV per unit", "Placed", "Closed"], ...c.orders.map((o) => [o.reference, nameOf(o.user_id), o.kind, o.status, o.filled_amount ?? o.amount ?? "", o.filled_units ?? o.units ?? "", o.nav ?? "", o.created_at, o.processed_at ?? ""])],
    applications: () => [["Name", "Email", "Region", "Country", "Qualifies as", "Planned amount", "Status", "Applied", "Decided"], ...c.apps.map((a) => [a.full_name, a.email, a.region, a.country, a.investor_type, N(a.intended_amount), a.status, a.submitted_at, a.reviewed_at ?? ""])],
    audit: () => [["Time", "Account", "Action", "Detail"], ...c.audit.map((a) => [a.at, a.actor ? nameOf(a.actor) : "system", a.action, a.detail])],
  };
  downloadCsv(`ahg-${k}-${today()}.csv`, R[k]());
};

conPage("console-audit", "Audit log", () => { const a = S.con.audit;
  return `<p class="mut">Every change to the fund's books, newest first. Entries are written by the database and cannot be edited here.</p>
  <div class="tablebox">${a.length ? `<table><thead><tr><th>Time</th><th>Account</th><th>Action</th><th>Detail</th></tr></thead><tbody>${a.map((x) => `<tr><td style="white-space:nowrap">${stamp(x.at)}</td><td>${esc(x.actor ? nameOf(x.actor) : "System")}</td><td>${esc(x.action)}</td><td class="mut">${esc(x.detail)}</td></tr>`).join("")}</tbody></table>` : `<div class="empty">Nothing logged yet.</div>`}</div>`; });

conPage("console-settings", "Fund settings", () => {
  const s = S.settings, f = (k, label, type = "text", extra = "") => `<div class="field"><label for="st-${k}">${label}</label><input id="st-${k}" name="${k}" type="${type}" value="${esc(s[k] ?? "")}" ${extra}></div>`;
  return `<form class="card" data-f="settings" novalidate><h3>Fund</h3><p class="mut" style="margin-bottom:16px">These show on the public site and in investor accounts. Blank items are left off the site.</p>
  <div class="row">${f("name", "Fund name")}${f("legal_name", "Legal name")}${f("ticker", "Short code")}</div>
  <div class="row">${f("currency", "Base currency (ISO code)", "text", 'maxlength="3" style="text-transform:uppercase"')}${f("inception_date", "Inception date", "date")}${f("initial_nav", "Initial NAV per unit", "number", 'step="0.01" min="0.01"')}</div>
  <div class="row">${f("benchmark", "Benchmark name")}${f("benchmark_symbol", "Benchmark symbol (e.g. ^IXIC)")}</div>
  <h3 style="margin-top:8px">Terms</h3>
  <div class="row">${f("min_initial", "Minimum first investment", "number", 'step="1" min="0"')}${f("min_additional", "Minimum additional investment", "number", 'step="1" min="0"')}${f("mgmt_fee_pct", "Management fee, % a year", "number", 'step="0.01" min="0"')}${f("perf_fee_pct", "Performance fee, %", "number", 'step="0.01" min="0"')}</div>
  ${f("dealing", "Dealing frequency (e.g. Weekly, each Friday)")}${f("redemption_terms", "Redemption terms (e.g. 30 days' notice, paid within 5 business days)")}${f("distribution_policy", "Distribution policy")}
  <div class="field"><label for="st-dep">How investors send money (shown after they place a subscription)</label><textarea id="st-dep" name="deposit_instructions">${esc(s.deposit_instructions)}</textarea></div>
  <h3 style="margin-top:8px">Manager and contact</h3>
  <div class="row">${f("manager_name", "Portfolio manager's name")}${f("manager_title", "Title")}</div>
  <div class="field"><label for="st-bio">Portfolio manager's biography</label><textarea id="st-bio" name="manager_bio">${esc(s.manager_bio)}</textarea></div>
  <div class="row">${f("registrant_name", "Registered firm managing the fund")}${f("registration_detail", "Registration (category and regulator)")}</div>
  <div class="row">${f("contact_email", "Investor contact email", "email")}${f("phone", "Phone")}${f("address", "Address")}</div>
  <label class="check"><input type="checkbox" name="accepting" ${s.accepting ? "checked" : ""}><span>Open to new subscriptions</span></label>
  <label class="check"><input type="checkbox" name="show_holdings_public" ${s.show_holdings_public ? "checked" : ""}><span>Show top holdings and sector mix on the public site (investors always see them)</span></label>
  <button class="btn pri" type="submit">Save settings</button></form>`;
});
FORMS.settings = async (d) => {
  const t = (k) => (d[k] || "").trim();
  const row = { name: t("name") || "ANAV High Growth", legal_name: t("legal_name"), ticker: (t("ticker") || "AHG").toUpperCase(), currency: (t("currency") || "USD").toUpperCase(), inception_date: d.inception_date || today(), initial_nav: N(d.initial_nav) || 10, benchmark: t("benchmark"), benchmark_symbol: t("benchmark_symbol").toUpperCase(), min_initial: N(d.min_initial), min_additional: N(d.min_additional), mgmt_fee_pct: N(d.mgmt_fee_pct), perf_fee_pct: N(d.perf_fee_pct), dealing: t("dealing"), redemption_terms: t("redemption_terms"), distribution_policy: t("distribution_policy"), deposit_instructions: d.deposit_instructions || "", manager_name: t("manager_name"), manager_title: t("manager_title"), manager_bio: d.manager_bio || "", registrant_name: t("registrant_name"), registration_detail: t("registration_detail"), contact_email: t("contact_email"), phone: t("phone"), address: t("address"), accepting: !!d.accepting, show_holdings_public: !!d.show_holdings_public };
  await q(sb.from("fund_settings").update(row).eq("id", 1)); toast("Settings saved."); await refresh();
};


/* ---------- suite additions ---------- */
conPage("console-rebalance", "Rebalancing", (n) => {
  const c = S.con, rows = c.holdings.filter((h) => N(h.qty) > 0 || N(h.target_weight) > 0).sort((a, b) => N(b.qty) * N(b.last_price) - N(a.qty) * N(a.last_price)), tsum = rows.reduce((a, h) => a + N(h.target_weight), 0);
  return `<form data-f="targets" novalidate><div class="tablebox">${rows.length ? `<table><thead><tr><th>Holding</th><th class="n">Market value</th><th class="n">Weight</th><th class="n">Target %</th><th class="n">Drift</th><th class="n">Trade to reach target</th></tr></thead><tbody>${rows.map((h) => { const mv = N(h.qty) * N(h.last_price), w = n.aum > 0 ? mv / n.aum : 0, t = h.target_weight === null || h.target_weight === undefined ? null : N(h.target_weight), diff = t === null ? null : t * n.aum - mv, sh = diff !== null && N(h.last_price) > 0 ? Math.round(diff / N(h.last_price)) : null;
    return `<tr><td><span class="tick">${esc(h.ticker)}</span><span class="sub">${esc(h.name)}</span></td><td class="n">${money(mv)}</td><td class="n">${(w * 100).toFixed(1)}%</td><td class="n"><input class="px" type="number" min="0" max="100" step="0.1" name="t_${esc(h.ticker)}" value="${t === null ? "" : (t * 100).toFixed(1)}" aria-label="Target weight for ${esc(h.ticker)}"></td><td class="n ${t === null ? "mut" : sign(w - t)}">${t === null ? "–" : pct(w - t, 1)}</td><td class="n">${sh === null || sh === 0 ? "–" : `<span class="pill ${sh > 0 ? "ok" : "bad"}">${sh > 0 ? "Buy" : "Sell"}</span> ${qtyFmt(Math.abs(sh))} (${money(Math.abs(diff), 0)})`}</td></tr>`; }).join("")}</tbody><tfoot><tr><td>Targets total</td><td></td><td></td><td class="n">${(tsum * 100).toFixed(1)}%</td><td colspan="2" class="mut">${tsum > 0 ? "Leaves " + ((1 - tsum) * 100).toFixed(1) + "% in cash" : "Enter target weights to see suggested trades"}</td></tr></tfoot></table>` : `<div class="empty">No holdings yet.</div>`}</div>
  ${rows.length ? `<div class="bar" style="margin-top:14px"><button class="btn pri" type="submit">Save targets</button><span class="hint" style="margin:0">Suggested trades are whole shares at the current price. Record them under Trades once executed.</span></div>` : ""}</form>`;
});
FORMS.targets = async (d) => {
  const tot = Object.entries(d).filter(([k]) => k.startsWith("t_")).reduce((a, [, v]) => a + N(v), 0); if (tot > 100.001) throw new Error("Targets add up to " + tot.toFixed(1) + "%. They cannot exceed 100%.");
  for (const [k, v] of Object.entries(d)) if (k.startsWith("t_")) await q(sb.from("holdings").update({ target_weight: v === "" ? null : N(v) / 100 }).eq("ticker", k.slice(2)));
  toast("Targets saved."); await refresh();
};

conPage("console-fees", "Fees", (n) => {
  const st = S.settings, paid = S.con.cash.filter((r) => r.kind === "fee"), last = paid[0], from = last ? last.at.slice(0, 10) : (st.inception_date || today()), days = Math.max(0, Math.round((new Date(today()) - new Date(from)) / 864e5)), due = n.aum * N(st.mgmt_fee_pct) / 100 * days / 365;
  return `<div class="kpis">${kpi("Management fee rate", N(st.mgmt_fee_pct) > 0 ? num(st.mgmt_fee_pct, 2) + "%" : "Not set", "Per year, set in Fund settings")}${kpi("Days since last fee", String(days), "From " + day(from))}${kpi("Fee accrued", money(due), "On net assets of " + money(n.aum, 0))}${kpi("Fees paid to date", money(-paid.reduce((a, r) => a + N(r.amount), 0)), paid.length + " entries")}</div>
  <form class="card" data-f="postfee" novalidate><h3>Post the management fee</h3><p class="mut" style="margin-bottom:14px">Net assets × annual rate × days ÷ 365. Posting takes the fee out of fund cash, which lowers the NAV per unit for every investor equally.</p>
    <div class="row"><div class="field"><label for="fe-a">Fee amount (${esc(cur())})</label><input id="fe-a" class="num" name="amount" type="number" min="0" step="0.01" value="${due.toFixed(2)}" required></div><div class="field"><label for="fe-m">Memo</label><input id="fe-m" name="memo" value="Management fee, ${day(from)} to ${day(today())}"></div></div>
    <button class="btn pri" type="submit" ${due <= 0 ? "disabled" : ""}>Post fee</button><div class="hint">The performance fee${N(st.perf_fee_pct) > 0 ? " of " + num(st.perf_fee_pct, 2) + "%" : ""} depends on the terms in your offering documents, so calculate it yourself and post it under Cash.</div></form>
  <div class="tablebox">${paid.length ? `<table><thead><tr><th>Date</th><th>Memo</th><th class="n">Amount</th></tr></thead><tbody>${paid.map((r) => `<tr><td>${day(r.at)}</td><td class="mut">${esc(r.memo)}</td><td class="n">${money(-N(r.amount))}</td></tr>`).join("")}</tbody></table>` : `<div class="empty">No fees posted yet.</div>`}</div>
  ${fxCostSection(n)}`;
});
function fxCostSection(n) {
  const tr = S.con.trades, fxt = tr.filter((t) => N(t.fx_fee) > 0), fx = fxt.reduce((a, t) => a + N(t.fx_fee), 0), comm = tr.reduce((a, t) => a + N(t.fees), 0);
  const conv = fxt.reduce((a, t) => a + N(t.qty) * N(t.price), 0), traded = tr.reduce((a, t) => a + N(t.qty) * N(t.price), 0);
  return `<div><h3 class="sub" style="margin:8px 0 10px">Trading and currency costs</h3>
  <div class="kpis">${kpi("Currency conversion fees", money(fx), fxt.length + " conversions")}${kpi("Effective conversion cost", conv > 0 ? num(fx / conv * 100, 2) + "%" : "–", "Of " + money(conv) + " converted")}${kpi("Commissions", money(comm), "On " + tr.length + " trades")}${kpi("Trading costs vs net assets", n.aum > 0 ? num((fx + comm) / n.aum * 100, 2) + "%" : "–", "Since inception, on " + money(traded) + " traded")}</div>
  <div class="tablebox" style="margin-top:14px">${fxt.length ? `<table><thead><tr><th>Date</th><th>Trade</th><th class="n">Amount converted</th><th class="n">Broker rate</th><th class="n">Market rate</th><th class="n">Fee %</th><th class="n">Fee (${esc(cur())})</th></tr></thead><tbody>${fxt.map((t) => `<tr><td>${day(t.trade_date)}</td><td>${t.side === "buy" ? "Buy" : "Sell"} ${qtyFmt(t.qty)} <span class="tick">${esc(t.ticker)}</span></td><td class="n">${natMoney(N(t.qty) * N(t.native_price), ccyOf(t))}</td><td class="n">${num(t.fx_rate, 6)}</td><td class="n">${num(t.fx_mid, 6)}</td><td class="n">${num(t.fx_fee_pct, 2)}%</td><td class="n">${money(t.fx_fee)}</td></tr>`).join("")}</tbody><tfoot><tr><td colspan="6">Total</td><td class="n">${money(fx)}</td></tr></tfoot></table>` : `<div class="empty">No currency conversions yet. Trades in another currency appear here with their fee.</div>`}</div>
  <p class="hint">These costs come out of the fund when trades settle, so they are already in the NAV per unit. Investors see the total on the fund's Fees page and in their Fund centre.</p></div>`;
}
FORMS.postfee = async (d) => { if (!(await ask("Post this fee?", `${money(d.amount)} will be taken from fund cash.`, "Post fee"))) return; await q(sb.rpc("cash_adjust", { p_kind: "fee", p_amount: N(d.amount), p_memo: d.memo || "Management fee" })); toast("Fee posted."); await refresh(); };

conPage("console-plans", "Recurring plans", () => {
  const c = S.con, due = c.plans.filter((p) => p.active && p.next_date <= today()), F = { weekly: "Weekly", biweekly: "Every two weeks", monthly: "Monthly" }, yr = c.plans.reduce((a, p) => a + N(p.amount) * { weekly: 52, biweekly: 26, monthly: 12 }[p.frequency], 0);
  return `<div class="kpis">${kpi("Active plans", String(c.plans.length), "")}${kpi("Due now", String(due.length), due.length ? money(due.reduce((a, p) => a + N(p.amount), 0)) + " in contributions" : "Nothing due")}${kpi("Expected per year", money(yr, 0), "If every plan continues")}</div>
  <div class="card"><div class="bar"><div><h3 style="margin:0 0 4px">Create due contributions</h3><p class="mut">Creates a pending subscription for each plan that has come due and moves it to its next date. Process each one under Orders when the money arrives.</p></div><button class="btn pri sp" data-a="runplans" ${due.length ? "" : "disabled"}>Create ${due.length || ""} request${due.length === 1 ? "" : "s"}</button></div></div>
  <div class="tablebox">${c.plans.length ? `<table><thead><tr><th>Investor</th><th class="n">Amount</th><th>Frequency</th><th>Next contribution</th><th></th></tr></thead><tbody>${c.plans.map((p) => `<tr><td>${esc(nameOf(p.user_id))}</td><td class="n">${money(p.amount)}</td><td>${F[p.frequency]}</td><td>${day(p.next_date)}</td><td>${p.next_date <= today() ? `<span class="pill wait">Due</span>` : ""}</td></tr>`).join("")}</tbody></table>` : `<div class="empty">No investor has set up a recurring plan.</div>`}</div>`;
});
ACT.runplans = async () => { const k = await q(sb.rpc("run_due_plans", {})); toast(`${k} request${k === 1 ? "" : "s"} created.`); await refresh(); };

conPage("console-flows", "Flows and liquidity", (n) => {
  const c = S.con, pr = c.orders.filter((o) => o.status === "pending" && o.kind === "redeem"), ps = c.orders.filter((o) => o.status === "pending" && o.kind === "subscribe");
  const owed = pr.reduce((a, o) => a + (o.redeem_all ? unitsOf(o.user_id) : N(o.units)) * n.nav, 0), incoming = ps.reduce((a, o) => a + N(o.amount), 0);
  const m = {}; c.ledger.forEach((r) => { const k = r.at.slice(0, 7), x = (m[k] = m[k] || { sub: 0, red: 0 }); if (N(r.amount) >= 0) x.sub += N(r.amount); else x.red += -N(r.amount); });
  const keys = Object.keys(m).sort().reverse(), inv = c.profiles.map((p) => unitsOf(p.id)).filter((u) => u > 0).sort((a, b) => b - a);
  return `<div class="kpis">${kpi("Cash", money(n.cash), n.aum > 0 ? (n.cash / n.aum * 100).toFixed(1) + "% of net assets" : "")}${kpi("Pending redemptions", money(owed), pr.length + " request" + (pr.length === 1 ? "" : "s"), owed > n.cash ? "down" : "")}${kpi("Cash cover", owed > 0 ? (n.cash / owed).toFixed(1) + "×" : "–", owed > n.cash ? "Sell " + money(owed - n.cash, 0) + " of holdings" : "Enough cash to pay them", owed > n.cash ? "down" : "up")}${kpi("Pending subscriptions", money(incoming), ps.length + " awaiting payment")}</div>
  ${owed > n.cash ? `<div class="note" style="border-left-color:var(--down)"><b>Cash does not cover pending redemptions.</b> Raise ${money(owed - n.cash, 0)} by selling holdings before processing them.</div>` : ""}
  <div class="cols2"><div><h3 class="sub" style="margin-bottom:10px">Monthly flows</h3><div class="tablebox">${keys.length ? `<table><thead><tr><th>Month</th><th class="n">Subscriptions</th><th class="n">Redemptions</th><th class="n">Net</th></tr></thead><tbody>${keys.map((k) => `<tr><td>${new Date(k + "-15").toLocaleDateString("en-CA", { month: "short", year: "numeric" })}</td><td class="n">${money(m[k].sub, 0)}</td><td class="n">${money(m[k].red, 0)}</td><td class="n ${sign(m[k].sub - m[k].red)}">${signed(m[k].sub - m[k].red, 0)}</td></tr>`).join("")}</tbody></table>` : `<div class="empty">No flows yet.</div>`}</div></div>
  <div><h3 class="sub" style="margin-bottom:10px">Investor concentration</h3>${dl([["Investors with units", String(inv.length)], ["Largest investor", n.units > 0 && inv.length ? (inv[0] / n.units * 100).toFixed(1) + "% of the fund" : null], ["Top 3 investors", n.units > 0 && inv.length ? (inv.slice(0, 3).reduce((a, b) => a + b, 0) / n.units * 100).toFixed(1) + "%" : null], ["Average holding", inv.length ? money(n.aum / inv.length, 0) : null]])}<p class="hint" style="margin-top:10px">A fund with one very large investor can be forced to sell if that investor redeems.</p></div></div>`;
});
