"use strict";
/* ---------- guided account opening ---------- */
const OB_KEY = "ahg_onboarding";
const OB = { step: 0, data: {}, editing: false };
try { const s = JSON.parse(localStorage.getItem(OB_KEY) || "null"); if (s && s.data) { OB.data = s.data; OB.step = s.step || 0; } } catch (_) {}
const obSave = () => { try { const d = { ...OB.data }; delete d.password; localStorage.setItem(OB_KEY, JSON.stringify({ step: OB.step, data: d })); } catch (_) {} };
const obClear = () => { try { localStorage.removeItem(OB_KEY); } catch (_) {} OB.data = {}; OB.step = 0; OB.editing = false; OB.started = false; };

const COUNTRIES = ["Canada", "United States", "Other"];
const OB_STEPS = [
  { k: "account", group: "Account", title: "Create your account", sub: "Your application, and your investment if you are accepted, live in this account.", guest: true, fields: [
    { n: "full_name", l: "Full legal name", auto: "name" }, { n: "email", l: "Email", t: "email", auto: "email" }, { n: "password", l: "Password", t: "password", auto: "new-password", min: 8, hint: "At least 8 characters. Use one you do not use anywhere else.", secret: true }] },
  { k: "personal", group: "About you", title: "Tell us about yourself", sub: "Use your name exactly as it appears on government ID.", fields: [
    { n: "full_name", l: "Full legal name", auto: "name" }, { n: "dob", l: "Date of birth", t: "date", auto: "bday" }, { n: "phone", l: "Mobile phone", t: "tel", auto: "tel" }, { n: "tax_country", l: "Country of tax residence", t: "select", o: COUNTRIES }] },
  { k: "address", group: "About you", title: "Where do you live?", sub: "Your home address, not a P.O. box.", fields: [
    { n: "street", l: "Street address", auto: "street-address" }, { n: "city", l: "City", auto: "address-level2", half: true }, { n: "region", l: "Province or state", auto: "address-level1", half: true }, { n: "postal", l: "Postal or ZIP code", auto: "postal-code", half: true }, { n: "country", l: "Country", t: "select", o: COUNTRIES, half: true }] },
  { k: "employment", group: "About you", title: "What do you do for work?", sub: "This helps the manager understand your circumstances.", fields: [
    { n: "employment", l: "Employment status", t: "tiles", o: [["Employed", ""], ["Self-employed", ""], ["Retired", ""], ["Student", ""], ["Not working", ""]] }, { n: "occupation", l: "Occupation or former occupation", opt: true }, { n: "employer", l: "Employer or business name", opt: true }] },
  { k: "eligibility", group: "Eligibility", title: "How do you qualify to invest?", sub: "Private funds can only accept investors who meet certain tests. The manager will confirm this and may ask for documents.", fields: [
    { n: "investor_type", l: "Choose the one that fits you", t: "tiles", o: [["Accredited investor (individual)", "You meet the income or financial asset tests for an accredited investor where you live."], ["Accredited investor (company or trust)", "You are investing through an entity that qualifies."], ["Eligible under another exemption", "You qualify another way and can explain how."], ["Not sure", "The manager will help work out whether you are eligible."]] }] },
  { k: "finances", group: "Financial profile", title: "Your financial picture", sub: "Ranges are fine. This is used only to assess whether the fund is suitable for you.", fields: [
    { n: "income", l: "Annual income before tax", t: "select", o: ["Under 75,000", "75,000 to 200,000", "200,000 to 500,000", "Over 500,000"] }, { n: "net_assets", l: "Financial assets, excluding your home", t: "select", o: ["Under 250,000", "250,000 to 1 million", "1 million to 5 million", "Over 5 million"] }, { n: "source_of_funds", l: "Where the money you will invest comes from", t: "select", o: ["Employment income or savings", "Business income", "Sale of investments or property", "Inheritance or gift", "Other"] }] },
  { k: "experience", group: "Financial profile", title: "Your investing experience", sub: "There are no wrong answers.", fields: [
    { n: "experience", l: "How long have you been investing?", t: "tiles", o: [["Less than 2 years", ""], ["2 to 5 years", ""], ["5 to 10 years", ""], ["More than 10 years", ""]] }, { n: "knowledge", l: "How would you describe your investment knowledge?", t: "tiles", o: [["Limited", "I am new to this or rely on others."], ["Good", "I understand stocks, funds and their risks."], ["Advanced", "I follow markets closely and have invested in complex products."]] }] },
  { k: "goals", group: "Suitability", title: "Your goals and comfort with risk", sub: "This fund is high risk. These questions check that it fits you.", fields: [
    { n: "horizon", l: "When might you need this money back?", t: "tiles", o: [["Within 3 years", ""], ["3 to 5 years", ""], ["5 to 10 years", ""], ["More than 10 years", ""]] },
    { n: "reaction", l: "If your investment fell 30% in a month, what would you do?", t: "tiles", o: [["Sell everything", ""], ["Sell some", ""], ["Hold and wait", ""], ["Invest more", ""]] },
    { n: "share", l: "How much of your investable money would this be?", t: "tiles", o: [["Under 10%", ""], ["10% to 25%", ""], ["25% to 50%", ""], ["Over 50%", ""]] }] },
  { k: "amount", group: "Your investment", title: "How much do you plan to invest?", sub: "This is not a commitment. You place your subscription after you are accepted.", fields: [
    { n: "intended_amount", l: () => `Planned first investment (${cur()})`, t: "number", hint: () => (N(S.settings.min_initial) > 0 ? `The minimum first investment is ${money(S.settings.min_initial, 0)}.` : "") }, { n: "notes", l: "Anything else the manager should know (optional)", t: "area", opt: true }] },
  { k: "disclosures", group: "Declarations", title: "A few required questions", sub: "Most people answer no to all three.", fields: [
    { n: "pep", l: "Are you, or a close family member, a senior politician, government official or head of an international organization?", t: "yesno" }, { n: "insider", l: "Are you a director, officer or 10% shareholder of a publicly traded company?", t: "yesno" }, { n: "third_party", l: "Will you be investing on behalf of someone else?", t: "yesno" }] },
  { k: "agree", group: "Declarations", title: "Confirm and sign", sub: "Read each statement and tick it to confirm.", fields: [
    { n: "ack_risk", t: "check", l: "I understand this fund is volatile and concentrated, and that I could lose most or all of the money I invest." }, { n: "ack_horizon", t: "check", l: "I am investing money I will not need for several years." }, { n: "ack_docs", t: "check", l: () => `I have read the <a href="#risk-disclosure" target="_blank">risk disclosure</a>, <a href="#terms" target="_blank">terms of use</a> and <a href="#privacy" target="_blank">privacy</a> pages.` }, { n: "ack_true", t: "check", l: "The information I have given is true and complete, and I will provide documents to confirm it if asked." }, { n: "signature", l: "Type your full legal name to sign", hint: "This is your electronic signature." }] },
  { k: "review", group: "Review", title: "Review your application", sub: "Check your answers. You can go back to change anything.", fields: [] },
];
const obSteps = () => OB_STEPS.filter((s) => (s.guest ? !S.session : true));
const lbl = (f) => (typeof f.l === "function" ? f.l() : f.l);

function obField(f) {
  const v = OB.data[f.n] ?? "", id = "ob-" + f.n, req = f.opt ? "" : "required", hint = f.hint ? (typeof f.hint === "function" ? f.hint() : f.hint) : "";
  const h = hint ? `<div class="hint">${hint}</div>` : "";
  if (f.t === "tiles") return `<fieldset class="obf"><legend>${lbl(f)}</legend><div class="tiles ${f.o.every((o) => !o[1]) ? "short" : ""}">${f.o.map(([o, d], i) => `<label class="otile"><input type="radio" name="${f.n}" value="${esc(o)}" ${v === o ? "checked" : ""} ${req}><span><b>${esc(o)}</b>${d ? `<small>${esc(d)}</small>` : ""}</span></label>`).join("")}</div></fieldset>`;
  if (f.t === "yesno") return `<fieldset class="obf"><legend>${lbl(f)}</legend><div class="tiles short two">${["No", "Yes"].map((o) => `<label class="otile"><input type="radio" name="${f.n}" value="${o}" ${v === o ? "checked" : ""} required><span><b>${o}</b></span></label>`).join("")}</div></fieldset>`;
  if (f.t === "check") return `<label class="check big"><input type="checkbox" name="${f.n}" ${v ? "checked" : ""} required><span>${lbl(f)}</span></label>`;
  if (f.t === "select") return `<div class="obf ${f.half ? "half" : ""}"><label for="${id}">${lbl(f)}</label><select id="${id}" name="${f.n}" ${req}><option value="">Select</option>${f.o.map((o) => `<option ${v === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>${h}</div>`;
  if (f.t === "area") return `<div class="obf"><label for="${id}">${lbl(f)}</label><textarea id="${id}" name="${f.n}">${esc(v)}</textarea>${h}</div>`;
  return `<div class="obf ${f.half ? "half" : ""}"><label for="${id}">${lbl(f)}</label>${f.t === "password" ? '<div class="pw">' : ""}<input id="${id}" name="${f.n}" type="${f.t || "text"}" value="${f.secret ? "" : esc(v)}" ${req} ${f.auto ? `autocomplete="${f.auto}"` : ""} ${f.min ? `minlength="${f.min}"` : ""} ${f.t === "number" ? 'min="0" step="100" class="num"' : ""} ${f.t === "date" ? `max="${today()}"` : ""}>${f.t === "password" ? '<button type="button" class="pwt" data-a="pwtoggle" aria-label="Show password" aria-pressed="false">Show</button></div>' : ""}${h}</div>`;
}
function obReview() {
  const groups = [...new Set(obSteps().filter((s) => s.fields.length && !s.guest).map((s) => s.group))];
  return groups.map((g) => `<div class="rev"><h3>${g}</h3>${obSteps().filter((s) => s.group === g && !s.guest).map((s) => `<div class="facts" style="grid-template-columns:1fr;border-top:0">${s.fields.filter((f) => f.t !== "check" && OB.data[f.n] !== undefined && OB.data[f.n] !== "").map((f) => `<div><span>${esc(String(lbl(f)).replace(/\s*\(optional\)/, ""))}</span><b>${esc(f.n === "intended_amount" ? money(OB.data[f.n], 0) : f.t === "date" ? day(OB.data[f.n]) : OB.data[f.n])}</b></div>`).join("")}<div style="border:0;padding:6px 0 0"><button type="button" class="btn sm ghost" data-a="obgo" data-k="${s.k}">Change</button></div></div>`).join("")}</div>`).join("");
}
function obWarn() {
  const d = OB.data, w = [];
  if (d.horizon === "Within 3 years") w.push("You may need this money within 3 years. The fund is designed for five years or longer.");
  if (d.reaction === "Sell everything") w.push("You said you would sell after a 30% fall. Falls of that size are normal for this fund.");
  if (d.share === "Over 50%") w.push("This would be more than half of your investable money. The fund is meant to be one part of a diversified portfolio.");
  return w.length ? `<div class="note" style="border-left-color:#c98a00;margin-bottom:18px"><b>This fund may not suit you.</b><ul style="margin:6px 0 0;padding-left:18px">${w.map((x) => `<li>${x}</li>`).join("")}</ul>You can still apply, and the manager will discuss this with you.</div>` : "";
}

function obStatus(a) {
  const st = a.status, [cl, t] = APP_STATUS[st];
  const stages = [
    { t: "Application submitted", d: day(a.submitted_at), s: "done" },
    { t: "Manager review", d: st === "submitted" ? "In progress. The manager will reply here." : a.reviewed_at ? "Completed " + day(a.reviewed_at) : "", s: st === "submitted" ? "now" : "done" },
    { t: "Decision", d: st === "submitted" ? "You will see the outcome here." : st === "approved" ? "Accepted" : st === "waitlist" ? "On the waitlist. Your application stays on file." : "Not accepted", s: st === "submitted" ? "todo" : st === "approved" ? "done" : st === "waitlist" ? "now" : "stop" },
    { t: "Fund your account", d: st === "approved" ? (S.ledger.length ? "Your first subscription is complete." : "Place your first subscription to become an investor.") : "Available once you are accepted.", s: st === "approved" ? (S.ledger.length ? "done" : "now") : "todo" },
  ];
  const head = { submitted: ["We have your application", "The manager is reviewing it. You do not need to do anything right now."], approved: ["You have been accepted", "Welcome. You can now place your first subscription."], waitlist: ["You are on the waitlist", "The fund is not taking you on right now. You will see any change here."], declined: ["Your application was not accepted", "The manager has decided not to accept this application."] }[st];
  const d = a.details || {};
  return `<div class="ob"><div class="obwrap wide">
    <div class="obcard"><div class="bar"><span class="pill ${cl}">${t}</span><span class="mut sp" style="font-size:13px">Reference ${esc(S.settings.ticker)}-APP-${esc(String(a.id).slice(0, 8).toUpperCase())}</span></div>
      <h1>${head[0]}</h1><p class="obsub">${head[1]}</p>
      ${a.manager_note ? `<div class="note" style="margin-bottom:22px"><b>Note from the manager:</b> ${esc(a.manager_note)}</div>` : ""}
      <ol class="track">${stages.map((x) => `<li class="${x.s}"><b>${x.t}</b><span>${esc(x.d)}</span></li>`).join("")}</ol>
      <div class="bar" style="margin-top:26px">${st === "approved" ? `<a class="btn pri lg" href="#portal-invest">Make your first investment</a><a class="btn lg" href="#portal">Go to my account</a>` : `<a class="btn pri lg" href="#portal-messages">Message the manager</a>`}${st === "submitted" ? `<button class="btn lg" data-a="obedit">Edit my application</button>` : ""}</div>
    </div>
    <div class="obcard"><h3 style="margin-bottom:12px">What you told us</h3>${dl([["Name", a.full_name], ["Email", a.email], ["Phone", a.phone], ["Address", [d.street, d.city, a.region, d.postal, a.country].filter(Boolean).join(", ")], ["Qualifies as", a.investor_type], ["Planned investment", money(a.intended_amount, 0)], ["Experience", a.experience], ["Time horizon", d.horizon], ["Source of funds", a.source_of_funds], ["Submitted", day(a.submitted_at)]])}
      <p class="hint" style="margin-top:14px">While your application is under review you may be asked for documents confirming your identity and eligibility. The fund will never ask for your password.</p></div>
  </div></div>`;
}

page("apply", "Apply to invest", "auth", () => {
  const a = S.application;
  if (S.session && a && !OB.editing) return obStatus(a);
  if (OB.confirm && !S.session) return authShell(`<div class="authx-mail"><svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 7.5l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><h1>Check your email</h1><p class="authx-sub">We sent a confirmation link to <b>${esc(OB.data.email || "your email")}</b>. Open it on this device to continue your application where you left off.</p><p class="hint">It can take a minute to arrive. Check your junk folder if you do not see it.</p><a class="btn pri lg block" href="#signin" style="margin-top:22px">I have confirmed, sign in</a><p class="authx-alt"><button type="button" class="tl" data-a="obback0">Use a different email</button></p>`);
  const steps = obSteps(); if (OB.step >= steps.length) OB.step = steps.length - 1;
  if (S.session && !OB.data.full_name) OB.data.full_name = S.profile?.full_name || "";
  const s = steps[OB.step], groups = [...new Set(steps.map((x) => x.group))], gi = groups.indexOf(s.group), last = OB.step === steps.length - 1;
  if (S.session && OB.step === 0 && !OB.started && !Object.keys(OB.data).some((k) => k !== "full_name" && OB.data[k])) return `<div class="ob"><div class="obwrap"><div class="obcard">
    <h1>Open your investor account</h1><p class="obsub">It takes about five minutes. Your answers are saved as you go, so you can stop and come back.</p>
    <h3 style="margin-bottom:10px">What you will need</h3><ul class="ticks"><li>Your legal name, date of birth and home address</li><li>A rough idea of your income and financial assets</li><li>How much you plan to invest</li></ul>
    <h3 style="margin-bottom:10px">What happens after</h3><p class="mut" style="margin-bottom:24px">The manager reviews your application and confirms that you are eligible. You can follow its status in your account. No money is taken at this stage.</p>
    <div class="bar"><button class="btn pri lg" data-a="obstart">Get started</button>${S.session ? "" : `<a class="btn ghost lg" href="#signin">I already have an account</a>`}</div>
    <p class="hint" style="margin-top:18px">This is a high-risk fund offered privately to eligible investors. <a class="tl" href="#fund-risk">Read about the risks</a></p></div></div></div>`;
  if (s.guest) return authShell(`<h1 tabindex="-1" id="ob-h">Open your investor account</h1><p class="authx-sub">Create your login first. It takes about five minutes, and your answers are saved as you go.</p>
    <form data-f="obstep" novalidate><div class="obfields">${s.fields.map(obField).join("")}</div>
    <button class="btn pri lg block" type="submit" style="margin-top:22px">Create account and continue</button></form>
    <p class="authx-alt">Already have an account? <a class="tl" href="#signin">Sign in</a></p>`);
  return `<div class="ob"><div class="obprog" role="progressbar" aria-valuemin="0" aria-valuemax="${steps.length}" aria-valuenow="${OB.step + 1}" aria-label="Application progress"><i style="width:${((OB.step + 1) / steps.length * 100).toFixed(1)}%"></i></div>
  <div class="obwrap"><ol class="obrail">${groups.map((g, i) => `<li class="${i < gi ? "done" : i === gi ? "now" : ""}">${g}</li>`).join("")}</ol>
  <form class="obcard" data-f="obstep" novalidate>
    <div class="mut" style="font-size:13px;margin-bottom:8px">Step ${OB.step + 1} of ${steps.length}</div>
    <h1 tabindex="-1" id="ob-h">${s.title}</h1><p class="obsub">${s.sub}</p>
    ${s.k === "review" ? obWarn() + obReview() : `<div class="obfields">${s.fields.map(obField).join("")}</div>`}
    <div class="obnav">${OB.step > 0 ? `<button type="button" class="btn lg" data-a="obprev">Back</button>` : `<span></span>`}<button class="btn pri lg" type="submit">${last ? (a ? "Save changes" : "Submit application") : s.guest ? "Create account and continue" : "Continue"}</button></div>
    ${s.guest ? `<p class="hint" style="margin-top:14px">Already have an account? <a class="tl" href="#signin">Sign in</a></p>` : ""}
  </form></div></div>`;
});

const obShow = () => { obSave(); render(); window.scrollTo(0, 0); document.getElementById("ob-h")?.focus({ preventScroll: true }); };
ACT.obstart = () => { OB.started = true; obShow(); };
ACT.obprev = () => { OB.step = Math.max(0, OB.step - 1); obShow(); };
ACT.obgo = (b) => { const i = obSteps().findIndex((s) => s.k === b.dataset.k); if (i >= 0) { OB.step = i; obShow(); } };
ACT.obback0 = () => { OB.confirm = false; OB.step = 0; OB.started = true; obShow(); };
ACT.obedit = () => { const a = S.application, d = a.details || {}; OB.data = { ...d, full_name: a.full_name, phone: a.phone, region: a.region, country: a.country, investor_type: a.investor_type, intended_amount: N(a.intended_amount), experience: a.experience, source_of_funds: a.source_of_funds, notes: a.notes, ack_risk: true, ack_horizon: true, ack_docs: true, ack_true: true }; OB.editing = true; OB.started = true; OB.step = 0; obShow(); };

FORMS.obstep = async (d, f) => {
  const steps = obSteps(), s = steps[OB.step];
  s.fields.forEach((x) => { OB.data[x.n] = x.t === "check" ? !!d[x.n] : (d[x.n] ?? "").toString().trim(); });
  if (s.k === "personal") { const age = (Date.now() - new Date(OB.data.dob).getTime()) / (365.25 * 864e5); if (!(age >= 18)) throw new Error("You must be at least 18 to apply."); }
  if (s.k === "amount") { if (!(N(OB.data.intended_amount) > 0)) throw new Error("Enter the amount you plan to invest."); if (N(OB.data.intended_amount) < N(S.settings.min_initial)) throw new Error(`The minimum first investment is ${money(S.settings.min_initial, 0)}.`); }
  if (s.k === "agree" && OB.data.signature.toLowerCase() !== (OB.data.full_name || "").toLowerCase()) throw new Error("Your signature must match your full legal name: " + OB.data.full_name);
  if (s.k === "account") {
    const pw = d.password; OB.data.password = undefined;
    const r = await q(sb.auth.signUp({ email: OB.data.email, password: pw, options: { data: { full_name: OB.data.full_name }, emailRedirectTo: location.origin + location.pathname } }));
    OB.started = true;
    if (!r.session) { OB.confirm = true; OB.step = 0; obSave(); render(); return; }
    OB.step = 0; obSave(); return; // the sign-in event reloads the page state; steps now exclude this one
  }
  if (s.k !== "review") { OB.step++; obShow(); return; }
  const x = OB.data, details = { ...x }; delete details.password; ["ack_risk", "ack_horizon", "ack_docs", "ack_true"].forEach((k) => delete details[k]);
  const row = { user_id: S.session.user.id, full_name: x.full_name, email: S.session.user.email, phone: x.phone || "", region: x.region || "", country: x.country || "", investor_type: x.investor_type || "", intended_amount: N(x.intended_amount), experience: x.experience || "", source_of_funds: x.source_of_funds || "", notes: x.notes || "", acks: { risk: true, horizon: true, documents: true, truthful: true, signature: x.signature, at: new Date().toISOString() }, details };
  if (S.application) await q(sb.from("applications").update(row).eq("id", S.application.id)); else await q(sb.from("applications").insert(row));
  try { await q(sb.rpc("update_profile", { p_name: x.full_name, p_phone: x.phone || "" })); } catch (_) {}
  obClear(); toast("Application submitted."); await refresh(); window.scrollTo(0, 0);
};
// Selecting a tile is the whole answer on single-question steps, so keep the choice visible immediately.
document.addEventListener("change", (e) => { const t = e.target.closest(".otile input"); if (t) t.closest(".tiles").querySelectorAll(".otile").forEach((o) => o.classList.toggle("on", o.querySelector("input").checked)); });
