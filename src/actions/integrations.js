import { state as S } from '../modules/store.js'
import { providers as P } from '../modules/catalog.js'
import { $ } from '../modules/selectors.js'
import { integrationSteps } from '../modules/integrationFlows.js'
import { render, toast } from '../ui/render.js'

export function wiz(p, i) { S.integrationWizard = { p, i: i || 0, busy: 0, err: "", ok: 0 }; render() }
export const disc = p => { fetch(`/api/integrations/${p}`, { method: 'DELETE' }).then(() => { S.integrations[p] = {}; toast(P[p][0] + " disconnected") }) }
const wrun = cb => { S.integrationWizard.busy = 1; render(); setTimeout(() => { if (!S.integrationWizard) return; S.integrationWizard.busy = 0; S.integrationWizard.ok = 0; cb(); render() }, 900) }

export function wnext() {
  const w = S.integrationWizard, k = integrationSteps[w.p][w.i]; w.err = ""
  if (k === "keys") { const v = ($("#key") || {}).value || ""; if (!/^(sk|rk)_(test|live)_\w{6,}/.test(v)) { w.err = "Enter a valid Stripe secret key, such as sk_test_… from your Stripe dashboard."; return render() } return wrun(() => w.i++) }
  if (["connect", "test", "sync"].includes(k)) return wrun(() => w.i++)
  if (k === "done") { const account = w.p === "stripe" ? "Stripe account" : w.p === "qb" ? "QuickBooks account" : w.p === "gmail" ? "Gmail account" : "Outlook account"; fetch(`/api/integrations/${w.p}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'connected', accountLabel: account, config: {} }) }).then(() => { S.integrations[w.p] = { on: 1, acct: account }; const n = P[w.p][0]; S.integrationWizard = null; toast(n + " is connected") }) }
  w.i++; render()
}
