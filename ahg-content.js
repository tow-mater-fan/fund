"use strict";
/* Informational pages. Copy describes how this fund and this platform actually work. */
const nm = () => esc(S.settings.name);

/* ---------- about ---------- */
doc("about", "About the fund", "about", "Who we are and what the fund is for.", () => `
<h2>A single fund with a single purpose</h2>
<p>${nm()} is a private pooled fund. It brings together money from a limited number of accepted investors and invests it in one portfolio of high-growth companies listed in the United States and Canada.</p>
<p>The fund exists to pursue long-term capital growth. It does not offer a range of products, and it is not designed to provide income or to protect against market falls.</p>
<h2>How the fund is organized</h2>
<ul><li><b>Unitized.</b> Each investor owns units. Every unit has the same value, the NAV per unit, so all investors share gains, losses and costs in proportion to the units they hold.</li>
<li><b>Private.</b> Units are offered only to investors the manager has accepted. They are not listed on an exchange and cannot be bought through a broker.</li>
<li><b>Actively managed.</b> One portfolio manager makes the investment decisions. See <a href="#manager">Portfolio manager</a>.</li></ul>
<h2>What investors can expect</h2>
<ul><li>An online account showing units, market value, the fund's holdings and every transaction</li><li>Published valuations and a full NAV per unit history</li><li>Notices from the manager when something material changes</li><li>A direct line to the manager through the secure message centre</li></ul>
${dl([["Legal name", legalName()], ["Fund type", "Private pooled fund"], ["Base currency", S.settings.currency], ["Inception date", S.settings.inception_date ? day(S.settings.inception_date) : null]])}`);

doc("approach", "Investment philosophy", "about", "The beliefs behind every investment decision.", `
<h2>Growth drives long-term returns</h2>
<p>Over long periods, share prices follow the growth of the underlying business. The fund looks for companies that can grow revenue and earnings much faster than the market for years, and holds them while that remains true.</p>
<h2>Concentration is deliberate</h2>
<p>Good ideas are scarce. The fund puts meaningful capital behind a short list of companies the manager understands well, instead of spreading it thinly across many. This means a few holdings drive most of the result, in both directions.</p>
<h2>Volatility is the price of admission</h2>
<p>High-growth companies are volatile. The fund accepts large swings in value as the cost of pursuing higher long-term returns and does not try to smooth them with hedges or by tracking an index.</p>
<h2>Time horizon matters</h2>
<p>The approach needs time to work. The fund is suitable only for money an investor can leave invested for five years or longer.</p>
<p><a href="#process">See the investment process</a></p>`);

doc("process", "Investment process", "about", "The same four stages apply to every position.", `
<ol class="hsteps" style="margin-bottom:28px">
<li><h3>Research</h3><p>Companies listed in the United States and Canada are screened for growth, then studied through their filings, results and industry.</p></li>
<li><h3>Select</h3><p>Only companies with a clear, durable growth case enter the portfolio.</p></li>
<li><h3>Size</h3><p>Position sizes reflect conviction and the fund's overall exposure to each sector.</p></li>
<li><h3>Review</h3><p>Holdings are reviewed against their growth case and sold when it no longer holds.</p></li></ol>
<h2>What the manager looks for</h2>
<ul><li>Revenue growing well above the market, with evidence it can continue</li><li>A product or position competitors find hard to copy</li><li>A path to strong profitability, even if profits are low today</li><li>Shares that trade often enough to buy and sell without moving the price</li></ul>
<h2>When a holding is sold</h2>
<ul><li>The growth case has weakened or been disproved</li><li>The position has grown too large for the portfolio</li><li>A better use of the capital is available</li><li>Cash is needed to meet redemptions</li></ul>
<h2>Cash</h2>
<p>The fund may hold cash between investments and to pay redemptions. Cash is shown as a share of net assets on the <a href="#fund-portfolio">Portfolio</a> page.</p>`);

doc("manager", "Portfolio manager", "about", "Who makes the investment decisions.", () => { const st = S.settings; return `
<h2>${esc(st.manager_name || "The portfolio manager")}</h2>
<p class="mut">${esc(st.manager_title || "Portfolio Manager")}, ${nm()}</p>
${st.manager_bio ? `<p style="white-space:pre-line">${esc(st.manager_bio)}</p>` : ""}
<h2>Responsibilities</h2>
<ul><li>Researching companies and deciding what the fund buys and sells</li><li>Valuing the fund and publishing the NAV per unit</li><li>Reviewing applications and accepting investors</li><li>Processing subscriptions and redemptions</li><li>Reporting to investors and answering their questions</li></ul>
<h2>Alignment</h2>
<p>Investment decisions are made by one person. Investors should read <a href="#fund-risk">key person risk</a> and the <a href="#conflicts">conflicts of interest</a> page to understand what that means for them.</p>`; });

doc("governance", "Governance and controls", "about", "How the fund's records are kept and checked.", `
<h2>Records</h2>
<p>The fund's books are kept on this platform. Every trade, cash movement, valuation, subscription and redemption is recorded with the date and the unit price used.</p>
<h2>Audit trail</h2>
<p>Every change to the fund's books is written to a log with the time and the account that made it. Entries in the log cannot be edited through the platform.</p>
<h2>Investor protection in the platform</h2>
<ul><li>Investors can see only their own account, never another investor's</li><li>Units can be issued or cancelled only by the manager processing a recorded request</li><li>A purchase cannot be recorded for more cash than the fund holds, and a redemption cannot be paid without the cash to cover it</li><li>Applicants cannot invest until their application has been accepted</li></ul>
<h2>Equal treatment</h2>
<p>All units carry the same NAV per unit. Subscriptions and redemptions processed on the same day use the same price.</p>
<p>See also the <a href="#valuation">valuation policy</a> and <a href="#conflicts">conflicts of interest</a>.</p>`);

doc("valuation", "Valuation policy", "about", "How the NAV per unit is calculated.", () => `
<h2>The calculation</h2>
<p>NAV per unit = (market value of holdings + cash) ÷ units in issue.</p>
<ul><li><b>Holdings</b> are valued at the latest available market price of each security.</li><li><b>Cash</b> includes money received from subscriptions, sale proceeds, dividends and interest, less purchases, redemptions paid, fees and expenses.</li><li><b>Units in issue</b> is the total number of units held by all investors.</li></ul>
<h2>When the fund is valued</h2>
<p>${esc(S.settings.dealing ? "Dealing: " + S.settings.dealing + ". " : "")}The manager strikes a valuation by recording the NAV per unit for a date. Each valuation is published on the <a href="#fund-prices">Price history</a> page.</p>
<h2>Subscriptions and redemptions</h2>
<p>Units are issued and redeemed at the NAV per unit at the time the manager processes the request. Units are calculated to six decimal places.</p>
<h2>Fees and expenses</h2>
<p>Fees and expenses charged to the fund are deducted from cash, which lowers the NAV per unit for all investors equally.</p>
<h2>Distributions</h2>
<p>A cash distribution reduces fund cash, and so the NAV per unit, by the amount paid per unit.</p>
<h2>Initial price</h2>
<p>Units were first issued at ${money(S.settings.initial_nav, 2)}.</p>`);

/* ---------- investing ---------- */
doc("invest", "How to invest", "invest", "What to expect from application to your first statement.", () => `
<ol class="hsteps" style="margin-bottom:28px">
<li><h3>Apply online</h3><p>Create an account and tell us who you are, how you qualify and how much you plan to invest.</p></li>
<li><h3>Manager review</h3><p>The manager reviews each application and may ask for documents. Not every application is accepted.</p></li>
<li><h3>Subscribe</h3><p>Once accepted, place a subscription and send payment with your reference. Units are issued at the NAV per unit when it arrives.</p></li>
<li><h3>Manage your account</h3><p>See units, market value, holdings and transactions online, add money, or request a redemption.</p></li></ol>
<div class="bar" style="margin-bottom:28px">${applyBtn("btn pri")}${S.session ? "" : `<a class="btn" href="#signin">Investor login</a>`}</div>
<h2>Before you apply</h2>
<ul><li>Read the <a href="#fund">fund details</a> and <a href="#fund-risk">risks</a></li><li>Check that you are <a href="#eligibility">eligible</a></li><li>Decide how much you can leave invested for five years or longer</li></ul>
<h2>More detail</h2>
<p><a href="#funding">Funding your account</a> · <a href="#redemptions">Redemptions</a> · <a href="#faq">Questions and answers</a></p>`);

doc("eligibility", "Who can invest", "invest", "The fund is offered privately, to investors the manager accepts.", () => `
<h2>Eligibility</h2>
<p>Units are not offered to the general public. An investor must qualify under the securities rules that apply where they live, for example as an accredited investor, and must be accepted by the manager.</p>
<h2>What the application asks</h2>
<ul><li>Your legal name, contact details and where you live</li><li>How you qualify to invest in a private fund</li><li>How much you plan to invest and where the money comes from</li><li>Your investing experience</li><li>Confirmation that you understand the fund's risks</li></ul>
<h2>Verification</h2>
<p>The manager may ask for documents to confirm your identity, your eligibility and the source of your money before accepting your application or processing a subscription.</p>
<h2>Decisions</h2>
<p>You will see one of three outcomes in your account: accepted, on the waitlist, or not accepted. The manager may add a note explaining the decision.</p>
${N(S.settings.min_initial) > 0 ? `<h2>Minimum investment</h2><p>The minimum first investment is ${money(S.settings.min_initial, 0)}${N(S.settings.min_additional) > 0 ? ", and additional investments start at " + money(S.settings.min_additional, 0) : ""}.</p>` : ""}`);

doc("funding", "Funding your account", "invest", "How subscriptions and payments work.", () => `
<h2>Placing a subscription</h2>
<ol><li>Sign in and open <b>Invest</b> in your account.</li><li>Enter the amount and place the subscription.</li><li>You will receive a reference, for example ${esc(S.settings.ticker)}-000123.</li><li>Send your payment using the instructions shown, quoting the reference.</li></ol>
<h2>When units are issued</h2>
<p>The manager processes your subscription once your payment has been received. Units are issued at the NAV per unit at that time, which may be higher or lower than when you placed the request.</p>
<h2>Tracking a subscription</h2>
<p>A subscription shows as pending in your account until it is processed. You can cancel it while it is pending. Once processed it appears in your transactions with the price and units.</p>
<h2>Payment instructions</h2>
<p>${esc(S.settings.deposit_instructions || "Payment instructions are shown in your account after you place a subscription.")}</p>
<p class="hint">Only send payment from an account in your own name. The fund does not accept cash.</p>`);

doc("redemptions", "Redemptions", "invest", "How to withdraw from the fund.", () => `
<h2>Requesting a redemption</h2>
<ol><li>Sign in and open <b>Redeem</b> in your account.</li><li>Enter the number of units, or choose to redeem everything.</li><li>Confirm the request.</li></ol>
<h2>Price and payment</h2>
<p>Redemptions are paid at the NAV per unit at the time the manager processes the request, not the price on the day you ask. ${esc(S.settings.redemption_terms || "")}</p>
<h2>Timing</h2>
<p>The fund pays redemptions from cash. If the fund needs to sell holdings to raise the cash, payment can take longer. You can cancel a redemption while it is pending.</p>
<h2>Partial redemptions</h2>
<p>You can redeem part of your holding. Units you keep stay invested.</p>
<h2>Tax</h2>
<p>A redemption may have tax consequences. The fund does not give tax advice; speak to a tax adviser about your own situation.</p>`);

doc("faq", "Questions and answers", "invest", "The points investors ask about most.", () => { const st = S.settings; const qa = [
  ["Who can invest?", "The fund is offered privately to investors the manager has accepted. You apply through this site, the manager reviews your application and confirms that you are eligible, and the decision appears in your account."],
  ["What is the minimum investment?", N(st.min_initial) > 0 ? `The minimum first investment is ${money(st.min_initial, 0)}${N(st.min_additional) > 0 ? ", and additional investments start at " + money(st.min_additional, 0) : ""}.` : "The minimum is confirmed by the manager when your application is accepted."],
  ["Is this an ETF or a mutual fund?", "Neither. It is a private pooled fund. Like a mutual fund, you buy and redeem units directly with the fund at the NAV per unit. Unlike an ETF, units are not listed on an exchange, and unlike a public mutual fund, it is offered only to accepted investors."],
  ["How do I add money?", "Sign in to your account, place a subscription and send payment using the instructions and reference shown. Units are issued at the NAV per unit once payment is received."],
  ["How do I withdraw?", "Request a redemption in your account. " + (st.redemption_terms || "Redemptions are processed by the manager at the NAV per unit and paid from fund cash.")],
  ["How is the NAV per unit calculated?", "The fund's holdings are valued at market prices, cash is added, and the total is divided by the number of units in issue."],
  ["How often is the fund valued?", st.dealing || "The manager publishes each valuation on the Price history page."],
  ["What fees does the fund charge?", (N(st.mgmt_fee_pct) > 0 ? `The management fee is ${num(st.mgmt_fee_pct, 2)}% per year` + (N(st.perf_fee_pct) > 0 ? ` and the performance fee is ${num(st.perf_fee_pct, 2)}%. ` : ". ") : "") + "Full details are in the fund's offering documents."],
  ["Can I see what the fund holds?", "Yes. Investors see the fund's holdings and their share of each one in their account."],
  ["Does the fund pay distributions?", st.distribution_policy || "The fund is managed for capital growth and does not target regular distributions."],
  ["How do I contact the manager?", "Use the secure message centre in your account" + (st.contact_email ? ", or email " + st.contact_email : "") + "."],
  ["Is my investment guaranteed?", "No. The fund has no guarantee and is rated high risk. You may get back less than you invested."],
]; return `<div class="faq">${qa.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>`; });

/* ---------- insights ---------- */
const ARTICLES = [
  { slug: "art-nav", title: "What NAV per unit means", lead: "How a fund's price is worked out, and why it matters to you.", body: `<p>NAV stands for net asset value. It is what a fund is worth: everything it owns, at today's prices, less anything it owes.</p><h2>From NAV to a unit price</h2><p>Dividing the NAV by the number of units in issue gives the NAV per unit. If a fund is worth 1,000,000 and has 80,000 units, each unit is worth 12.50.</p><h2>Why units are used</h2><p>Units keep things fair. When you invest, new units are created for you at the current price, so existing investors are not diluted. When you leave, your units are cancelled at the current price.</p><h2>What moves it</h2><ul><li>Changes in the prices of the fund's holdings</li><li>Dividends and interest received</li><li>Fees and expenses paid</li><li>Distributions paid to investors</li></ul><p>Money coming in or going out through subscriptions and redemptions does not change the NAV per unit, because units are created or cancelled at the same price.</p>` },
  { slug: "art-growth", title: "Growth investing explained", lead: "What it means to invest for growth, and what it costs.", body: `<p>Growth investing means buying companies expected to increase their sales and profits faster than average, and paying for that expectation today.</p><h2>The appeal</h2><p>A company that compounds its earnings quickly for many years can be worth far more in future than it is now. A small number of such companies can account for a large share of a portfolio's return.</p><h2>The cost</h2><p>Growth shares are priced on what a company might earn years from now. When expectations fall, or interest rates rise, their prices can fall much further than the wider market.</p><h2>What it requires of an investor</h2><ul><li>A long time horizon</li><li>The ability to sit through large falls without selling</li><li>Money that is not needed for other purposes</li></ul>` },
  { slug: "art-volatility", title: "Understanding volatility and drawdowns", lead: "Why the value of a growth fund moves so much.", body: `<p>Volatility describes how much an investment's value moves up and down. A drawdown is the fall from a previous high to a later low.</p><h2>Reading the numbers</h2><p>An annualized volatility of 30% means that swings of that size in a year, in either direction, are ordinary for the investment. The largest fall from a peak shows the worst loss an investor would have seen so far.</p><h2>Recovery takes more than the fall</h2><p>A fund that falls 50% must rise 100% to get back to where it started. This is why deep drawdowns can take years to recover.</p><h2>What to do with this</h2><p>Before investing, decide whether you could see your investment fall by half and still hold it. If not, a concentrated growth fund may not be suitable for you.</p>` },
  { slug: "art-concentration", title: "Concentrated versus diversified portfolios", lead: "The trade-off behind holding fewer companies.", body: `<p>A diversified fund may hold hundreds of companies. A concentrated fund holds far fewer and gives each one a larger share.</p><h2>What concentration gives</h2><p>Each holding matters. A successful investment makes a visible difference to the result, and the manager can know each company in depth.</p><h2>What it costs</h2><p>Mistakes matter just as much. One poor holding can hurt the whole portfolio, and returns can differ widely from the market in any given year.</p><h2>How investors use concentrated funds</h2><p>Many investors hold a concentrated fund alongside broader, diversified investments, so that no single fund decides their overall outcome.</p>` },
  { slug: "art-structures", title: "Pooled funds, mutual funds and ETFs", lead: "Three ways to invest in a portfolio, and how they differ.", body: `<p>All three pool money from many investors into one portfolio. They differ in who can invest and how units change hands.</p><h2>Exchange-traded funds</h2><p>ETF units are listed on a stock exchange. Anyone can buy or sell them through a broker during the trading day at a market price.</p><h2>Mutual funds</h2><p>Investors buy and redeem units directly with the fund at the NAV per unit, usually once a day. Public mutual funds are sold to the general public under a prospectus.</p><h2>Private pooled funds</h2><p>These work like a mutual fund, with units bought and redeemed at the NAV per unit, but they are offered only to investors who qualify and have been accepted. Units are not listed and may be redeemable less often.</p><p>${"ANAV High Growth"} is a private pooled fund.</p>` },
  { slug: "art-fees", title: "How fees affect returns", lead: "Small percentages add up over long periods.", body: `<p>Fund fees are usually charged as a percentage of the fund's value each year. They are taken from the fund, so investors see them as a lower NAV per unit instead of a bill.</p><h2>Management fees</h2><p>An annual charge for running the fund, paid whether the fund rises or falls.</p><h2>Performance fees</h2><p>A share of gains paid to the manager when the fund does well, usually above a set level.</p><h2>The long-run effect</h2><p>A fee of 1.5% a year reduces the final value of a 20-year investment by roughly a quarter compared with no fee, assuming the same return before fees.</p><p><a href="#tool-fees">Try the fee impact calculator</a></p>` },
  { slug: "art-horizon", title: "Why time horizon matters", lead: "Matching your money to how long it can stay invested.", body: `<p>Time horizon is how long you can leave money invested before you need it.</p><h2>Short horizons and volatile funds do not mix</h2><p>If you need the money in a year or two, a fall just before you need it may leave no time to recover. Volatile investments suit money that can wait.</p><h2>Long horizons absorb falls</h2><p>Over five years or longer, there is more time for a fall to be followed by a recovery, although this is never guaranteed.</p><h2>A practical test</h2><p>Only invest in a high-risk fund with money you are confident you will not need for at least five years, after setting aside an emergency reserve.</p>` },
  { slug: "art-reading", title: "How to read a fund page", lead: "What each figure on a fund page tells you.", body: `<ul><li><b>NAV per unit.</b> The current value of one unit.</li><li><b>Net assets.</b> The total value of the fund.</li><li><b>Since inception.</b> The change in NAV per unit since the fund started.</li><li><b>Period returns.</b> The change over one month, three months and so on. These are cumulative unless stated as annualized.</li><li><b>Growth of 10,000.</b> What a 10,000 investment would have become over the period shown.</li><li><b>Top holdings and sector exposure.</b> Where the money is invested, as a share of net assets.</li><li><b>Risk rating.</b> The manager's assessment of how much the fund's value can vary.</li><li><b>Fees.</b> What the fund charges each year.</li></ul><p>No single figure tells the whole story. Read performance alongside risk, and both alongside your own time horizon.</p><p><a href="#fund">View the fund page</a></p>` },
];
ARTICLES.forEach((a) => doc(a.slug, a.title, "insights", a.lead, () => a.body + `<p style="margin-top:24px" class="hint">This guide is general information, not investment advice.</p><p><a href="#insights">All insights</a></p>`));
doc("insights", "Insights", "insights", "Plain-language guides to investing in the fund.", () => `<div class="cards">${ARTICLES.map((a) => `<a class="tile-link" href="#${a.slug}"><span class="tag">Guide</span><h3>${a.title}</h3><p>${a.lead}</p></a>`).join("")}</div>`);

doc("glossary", "Glossary", "insights", "Terms used on this site.", () => `<dl class="gl">${[
  ["Accredited investor", "An investor who meets income, asset or other tests set by securities rules and may buy investments that are not offered to the public."],
  ["Benchmark", "A market index used to compare a fund's performance."],
  ["Book cost", "The total amount paid for an investment, adjusted for any units sold. Used to work out gains and losses."],
  ["Concentration", "The extent to which a portfolio is invested in a small number of holdings."],
  ["Dealing day", "A day on which the fund processes subscriptions and redemptions."],
  ["Distribution", "A cash payment from the fund to its investors, per unit held."],
  ["Drawdown", "The fall in value from a peak to a later low."],
  ["Management fee", "An annual fee paid from the fund for managing it."],
  ["NAV (net asset value)", "The value of everything a fund owns less anything it owes."],
  ["NAV per unit", "The NAV divided by the number of units in issue: the price of one unit."],
  ["Net assets", "Another term for the fund's NAV."],
  ["Performance fee", "A fee paid to the manager based on the fund's gains."],
  ["Pooled fund", "A fund that combines money from several investors into one portfolio, offered privately."],
  ["Redemption", "Selling units back to the fund for cash."],
  ["Realized gain", "A gain made on an investment that has been sold."],
  ["Subscription", "Buying units in the fund."],
  ["Unit", "A share of the fund. All units have the same value."],
  ["Unrealized gain", "A gain on an investment that is still held."],
  ["Valuation", "The calculation of the fund's NAV per unit for a date."],
  ["Volatility", "A measure of how much an investment's value moves up and down."],
].map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join("")}</dl>`);

/* ---------- legal ---------- */
doc("legal", "Legal information", "legal", "The terms and disclosures that apply to this site and the fund.", () => `<div class="cards">${MENU.find((m) => m.k === "legal").items.slice(1).map((k) => `<a class="tile-link" href="#${k}"><h3>${TITLES[k]}</h3></a>`).join("")}</div>`);

doc("terms", "Terms of use", "legal", "The terms on which you may use this website.", () => `
<p>This website is operated for ${esc(legalName())} (the "fund"). By using it you agree to these terms.</p>
<h2>Information only</h2><p>The content of this website is provided for information. It is not an offer to sell or a solicitation to buy units in any jurisdiction where that would be unlawful, and it is not investment, legal or tax advice.</p>
<h2>Who may use the investor account</h2><p>The investor account is for applicants and accepted investors. You are responsible for keeping your sign-in details confidential and for activity on your account. Tell the manager at once if you believe someone else has accessed it.</p>
<h2>Accuracy</h2><p>Reasonable care is taken to keep information accurate and current, but it may contain errors or be out of date. Valuations and account figures are subject to correction. The fund's offering documents prevail over anything on this website.</p>
<h2>Requests made online</h2><p>A subscription or redemption request placed in your account is a request to the manager. It takes effect only when the manager processes it.</p>
<h2>Acceptable use</h2><p>You must not misuse the website, attempt to access another person's account, or interfere with its operation.</p>
<h2>Availability</h2><p>The website may be unavailable from time to time for maintenance or reasons outside our control.</p>
<h2>Changes</h2><p>These terms may be updated. The current version is always published on this page.</p>`);

doc("privacy", "Privacy", "legal", "What personal information is collected and how it is used.", () => `
<h2>What we collect</h2><ul><li><b>Account details:</b> your name, email address and password. Passwords are stored in encrypted form and cannot be read by the manager.</li><li><b>Application details:</b> contact details, where you live, how you qualify to invest, intended investment, experience and source of funds.</li><li><b>Investment records:</b> your subscriptions, redemptions, units and messages to the manager.</li></ul>
<h2>Why we collect it</h2><ul><li>To assess your application and eligibility</li><li>To keep the fund's register of investors and process your requests</li><li>To report to you on your investment</li><li>To meet legal and regulatory obligations</li></ul>
<h2>Who can see it</h2><p>Your information is visible to you and to the manager. Other investors cannot see your account. It is stored with the hosting and database providers that run this website, and may be disclosed where the law requires.</p>
<h2>How long it is kept</h2><p>Investor records are kept for as long as you hold units and afterwards for the period the law requires.</p>
<h2>Your choices</h2><p>You can update your name and phone number in your account, and ask the manager to correct or provide a copy of your information${S.settings.contact_email ? " at " + esc(S.settings.contact_email) : ""}.</p>
<h2>Advertising and tracking</h2><p>This website does not use advertising or analytics trackers. See <a href="#cookies">Cookies</a>.</p>`);

doc("risk-disclosure", "Risk disclosure", "legal", "Read this before investing in the fund.", `
<p>An investment in the fund is speculative and involves a high degree of risk. You should invest only if you can bear the loss of a substantial part of your investment.</p>
<h2>No guarantee</h2><p>The fund is not guaranteed or insured. Its value changes frequently and you may receive less than you invested.</p>
<h2>Market risk</h2><p>The value of equities can fall because of company results, economic conditions, interest rates, political events or changes in investor sentiment.</p>
<h2>Growth-style risk</h2><p>The fund invests in growth companies, whose share prices depend on expectations of future earnings and can fall sharply when those expectations change.</p>
<h2>Concentration risk</h2><p>The fund holds a small number of positions and may be heavily exposed to a few sectors. Poor performance of one holding or sector can have a large effect.</p>
<h2>Liquidity risk</h2><p>Units are not listed or traded. You can redeem only through the fund, on the fund's terms, and payment depends on the fund having or raising cash.</p>
<h2>Currency risk</h2><p>Holdings may be denominated in currencies other than the fund's base currency or your own. Exchange rate changes can reduce returns.</p>
<h2>Key person risk</h2><p>The fund depends on one portfolio manager. Their absence could affect the fund.</p>
<h2>Operational risk</h2><p>Errors or failures in systems, pricing sources or record keeping could affect valuations or the processing of requests.</p>
<h2>Regulatory and tax risk</h2><p>Changes in law or tax treatment may affect the fund or its investors.</p>
<h2>Past performance</h2><p>Past performance does not indicate future results.</p>`);

doc("conflicts", "Conflicts of interest", "legal", "Situations where the manager's interests could differ from investors'.", `
<h2>Fees</h2><p>The manager is paid fees from the fund. Fees based on the fund's value or performance could encourage higher risk-taking. Fees are disclosed on the <a href="#fund-fees">Fees and terms</a> page.</p>
<h2>Valuation</h2><p>The manager values the fund and is paid fees based on that value. Holdings are valued at market prices, and every valuation is published and logged. See the <a href="#valuation">valuation policy</a>.</p>
<h2>Personal investing</h2><p>The manager may invest in the fund on the same terms as other investors and may hold the same securities personally.</p>
<h2>Processing requests</h2><p>The manager decides when to process subscriptions and redemptions. Requests processed on the same day receive the same NAV per unit.</p>
<h2>Raising a concern</h2><p>If you believe a conflict has affected you, follow the <a href="#complaints">complaints</a> process.</p>`);

doc("complaints", "Complaints", "legal", "What to do if something has gone wrong.", () => `
<h2>Tell us</h2><p>Send your complaint through the secure message centre in your account${S.settings.contact_email ? " or by email to " + esc(S.settings.contact_email) : ""}. Include what happened, when, and what you would like done.</p>
<h2>What happens next</h2><ol><li>Your complaint is acknowledged in writing.</li><li>The manager reviews the records and may ask you for more information.</li><li>You receive a written response with the outcome and reasons.</li></ol>
<h2>If you are not satisfied</h2><p>You may have the right to refer your complaint to a regulator or dispute resolution service where you live. Seeking independent legal advice is always open to you.</p>`);

doc("accessibility", "Accessibility", "legal", "Making this website usable for everyone.", () => `
<p>This website is built so that it can be used with a keyboard, with screen readers, at high zoom and on small screens.</p>
<h2>What that means in practice</h2><ul><li>Every control can be reached and used with a keyboard, with a visible focus indicator</li><li>Text meets contrast guidelines against its background</li><li>Tables and forms are labelled for assistive technology</li><li>Pages reflow on phones without horizontal scrolling</li><li>Motion is reduced when your device asks for it</li></ul>
<h2>Tell us about a problem</h2><p>If you cannot use part of this website, contact the manager${S.settings.contact_email ? " at " + esc(S.settings.contact_email) : ""} and the information will be provided another way.</p>`);

doc("security", "Online security", "legal", "How to protect your account and spot fraud.", `
<h2>How your account is protected</h2><ul><li>Connections to this website are encrypted</li><li>Passwords are stored in encrypted form</li><li>Each investor can see only their own account</li><li>New email addresses must be confirmed before an account can be used</li></ul>
<h2>What you should do</h2><ul><li>Use a long password that you do not use anywhere else</li><li>Sign out on shared devices</li><li>Check that the address in your browser is this website before signing in</li></ul>
<h2>Spotting fraud</h2><ul><li>The fund will never ask for your password by email, phone or message</li><li>Be wary of payment instructions that arrive unexpectedly or differ from those in your account</li><li>Confirm any change to payment details through the message centre before sending money</li></ul>
<h2>If you think your account is compromised</h2><p>Reset your password from the sign-in page and tell the manager straight away.</p>`);

doc("cookies", "Cookies", "legal", "What this website stores in your browser.", `
<p>This website does not use advertising or analytics cookies.</p>
<h2>What is stored</h2><p>When you sign in, your browser stores a session token so that you stay signed in as you move between pages. It is removed when you sign out.</p>
<h2>Fonts</h2><p>Typefaces are loaded from Google Fonts, which receives your browser's request for the font files.</p>
<h2>Managing storage</h2><p>You can clear stored data in your browser's settings. Doing so will sign you out.</p>`);
