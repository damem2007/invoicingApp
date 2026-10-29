import { state as S } from '../modules/store.js'
import { providers as P, icons as IC } from '../modules/catalog.js'
import { st } from '../modules/selectors.js'

export function shell(b) {
  const od = S.invoices.filter(i => st(i) === "Overdue").length
  const n = (k, l) => `<a class="${S.currentRoute === k ? "on" : ""}" onclick="go('${k}')" tabindex="0" onkeydown="if(event.key==='Enter')go('${k}')"><svg viewBox="0 0 24 24">${IC[k]}</svg>${l}${k === "invoices" && od ? `<span class="bd">${od}</span>` : ""}</a>`
  return `<div class="app"><aside><div class="logo"><i><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M6 3h9l4 4v14H6z"/></svg></i>ledgerly</div><nav>${n("overview", "Overview")}${n("invoices", "Invoices")}${n("clients", "Clients")}${n("payments", "Payments")}${n("integrations", "Integrations")}${n("settings", "Settings")}</nav><div class="sp"></div><button class="ghost" onclick="document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark'">Toggle dark mode</button></aside><main>${b}</main></div>`
}

export const hdr = (t, sub, act) => `<div class="hd"><div><h1>${t}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${act === undefined ? `<button class="btn" onclick="newInv()">+ New invoice</button>` : act}</div>`
export const ib = p => `<div class="ib" style="background:${P[p][3]}">${P[p][2]}</div>`
