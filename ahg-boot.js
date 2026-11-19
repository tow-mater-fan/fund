"use strict";
/* ---------- boot ---------- */
page("signin", "Investor login", "auth", vAuthPage);
page("reset", "Reset password", "auth", vReset);
(async function boot() {
  if (!sb) { render(); return; }
  sb.auth.onAuthStateChange((ev, session) => {
    const changed = (session?.user?.id || null) !== (S.session?.user?.id || null);
    S.session = session;
    if (ev === "PASSWORD_RECOVERY") S.recovering = true;
    if (!S.ready) return;
    if (changed || ev === "PASSWORD_RECOVERY") setTimeout(async () => {
      S.con = null; await refresh();
      if (ev === "SIGNED_IN" && route() === "signin") location.hash = isMgr() ? "#console" : isInv() ? "#portal" : "#apply";
    }, 0);
  });
  try { const { data } = await sb.auth.getSession(); S.session = data.session; } catch (e) { console.error(e); }
  S.ready = true;
  await refresh();
  // Returning from the confirmation email with an unfinished application: pick it up again.
  if (S.session && !S.application && !isInv() && Object.keys(OB.data).length > 1 && route() === "home") location.hash = "#apply";
})();
