import { state as S } from '../modules/store.js'
import { providers as P } from '../modules/catalog.js'
import { renderPill } from '../modules/format.js'
import { hdr, ib } from '../ui/layout.js'

export function intRow(p, big) {
  const i = S.integrations[p], on = i.on
  return `<div class="int">${ib(p)}<div><b>${P[p][0]}</b><div class="mut" style="font-size:13px">${on ? i.acct : big ? P[p][1] + " · not connected" : "Not connected"}</div></div>${renderPill(on ? "Connected" : "Off", "")}${on && big ? `<button class="btn s sm" onclick="wiz('${p}',1)">Configure</button><button class="btn s sm" onclick="disc('${p}')">Disconnect</button>` : `<button class="btn ${on ? "s" : ""} sm" onclick="wiz('${p}')">${on ? "Manage" : "Connect"}</button>`}</div>`
}

export function integrations() {
  const g = (t, ps) => `<div class="card"><h2>${t}</h2>${ps.map(p => intRow(p, 1)).join("")}</div>`
  return hdr("Integrations", "Connect once. Ledgerly uses them for sending, getting paid and syncing.") + `<div class="grid">${g("Email delivery", ["gmail", "outlook"])}${g("Payments", ["stripe"])}${g("Accounting", ["qb"])}</div>`
}
