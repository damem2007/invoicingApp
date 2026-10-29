import { state as S } from '../modules/store.js'
import { currencySigns as SYM, currencyNames as CN } from '../modules/catalog.js'
import { renderDetails, renderPill } from '../modules/format.js'
import { hdr } from '../ui/layout.js'

export const curCard = () => `<div class="card"><div class="row b" style="flex-wrap:wrap"><div><h2>Currencies</h2><span class="mut">Choose from these on any invoice. The default is pre-selected on new invoices.</span></div><button class="btn s sm" onclick="S.activeModal='cur';render()">+ Add currency</button></div><div class="tbw"><table><tr><th>ISO code</th><th>Name</th><th>Sign</th><th>Example</th><th></th></tr>${Object.keys(SYM).map(k => `<tr><td><b>${k}</b></td><td>${CN[k] || "—"}</td><td>${SYM[k]}</td><td class="mut">${SYM[k]}1,250.00 ${k}</td><td class="r">${k === S.defaultCurrency ? renderPill("Default", "Active") : `<button class="btn s sm" onclick="S.defaultCurrency='${k}';render()">Make default</button> <button class="btn s sm" onclick="delCur('${k}')">Remove</button>`}</td></tr>`).join("")}</table></div></div>`

export function settings() {
  return hdr("Settings", "Your business details. Pick any of them when you create an invoice.", `<button class="btn" onclick="S.activeModal='biz';S.be=-1;render()">+ Add business</button>`) + `<div class="grid">${S.businessProfiles.map((b, x) => `<div class="card row b" style="align-items:flex-start"><div><h2>${b.n} ${x === 0 ? renderPill("Default", "Active") : ""}</h2>${renderDetails("", b.a, b.e, b.p)}</div><div class="row">${x ? `<button class="btn s sm" onclick="S.businessProfiles.unshift(S.businessProfiles.splice(${x},1)[0]);render()">Make default</button>` : ""}<button class="btn s sm" onclick="S.activeModal='biz';S.be=${x};render()">Edit</button></div></div>`).join("")}${curCard()}</div>`
}
