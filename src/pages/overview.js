import { state as S } from '../modules/store.js'
import { providers as P } from '../modules/catalog.js'
import { formatDate as D } from '../modules/date.js'
import { formatMoney, renderPill } from '../modules/format.js'
import { st, sum } from '../modules/selectors.js'
import { hdr } from '../ui/layout.js'
import { intRow } from './integrations.js'

export function overview() {
  const out = sum(i => ["Sent", "Overdue"].includes(st(i))), k = (l, v, t) => `<button class="card kpi" onclick="go('invoices','${t}')"><small>${l}</small><b>${v}</b></button>`
  const bad = S.invoices.filter(i => st(i) === "Overdue")
  return hdr("Overview", "Good morning. Here is where your invoices stand.") + `<div class="grid k4">${k("Outstanding", formatMoney(out), "Sent")}${k("Paid", formatMoney(sum(i => i.s === "Paid")), "Paid")}${k("Overdue", formatMoney(sum(i => st(i) === "Overdue")), "Overdue")}${k("Total invoices", S.invoices.length, "All")}</div>
<div class="grid two" style="margin-top:16px"><div class="grid">${bad.length ? `<div class="card" style="border-color:var(--bad)"><h2>Needs attention</h2>${bad.map(i => `<div class="row b" style="margin-top:12px"><span><b>${i.id}</b> · ${S.clientNames[i.c].split(" (")[0]} is overdue since ${D(i.due)}</span><button class="btn sm" onclick="send('${i.id}')">Send reminder</button></div>`).join("")}</div>` : ""}
<div class="card"><div class="row b"><h2>Recent invoices</h2><a class="mut" style="cursor:pointer" onclick="go('invoices')">View all</a></div><div class="tbw"><table>${S.invoices.slice(-5).reverse().map(i => `<tr><td><b>${i.id}</b> ${i.rec ? renderPill("Recurring") : ""}<br><span class="mut">${S.clientNames[i.c].split(" (")[0]}</span></td><td>${renderPill(st(i))}</td><td class="r">${formatMoney(i.a)}</td></tr>`).join("")}</table></div></div></div>
<div class="grid"><div class="card"><h2>Upcoming recurring</h2>${S.recurringServices.filter(r => r.st === "Active").map(r => `<div class="row b" style="margin-top:12px"><span>${S.clientNames[r.c].split(" (")[0]}<br><span class="mut">${r.f} · ${D(r.next)}</span></span><b>${formatMoney(r.a)}</b></div>`).join("") || `<p class="mut">Nothing scheduled. Turn on Repeat when you create an invoice.</p>`}</div>
<div class="card"><div class="row b"><h2>Integrations</h2><a class="mut" style="cursor:pointer" onclick="go('integrations')">Manage</a></div>${Object.keys(P).map(p => intRow(p)).join("")}</div></div></div>`
}
