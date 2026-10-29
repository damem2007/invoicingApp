import { state as S } from '../modules/store.js'
import { formatDate as D } from '../modules/date.js'
import { formatMoney, renderPill } from '../modules/format.js'
import { hdr } from '../ui/layout.js'

export function payments() {
  return hdr("Payments", "Every payment, matched to its invoice.", `<button class="btn" onclick="S.activeModal='pay';render()">Record payment</button>`) + `<div class="card tbw"><table><tr><th>Date</th><th>Invoice</th><th>Client</th><th>Source</th><th class="r">Amount</th></tr>${S.payments.map(p => `<tr><td>${D(p.d)}</td><td><b>${p.inv}</b></td><td>${S.clientNames[p.c].split(" (")[0]}</td><td>${renderPill(p.m, "Sent")}</td><td class="r">${formatMoney(p.a)}</td></tr>`).join("") || `<tr><td class="mut">No payments yet.</td></tr>`}</table></div>`
}
