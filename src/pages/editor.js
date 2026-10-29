import { state as S } from '../modules/store.js'
import { currencySigns as SYM } from '../modules/catalog.js'
import { today as T, formatDate as D, addDays as addD, stepFrequency as stepF } from '../modules/date.js'
import { $ } from '../modules/selectors.js'
import { formatMoney, renderDetails } from '../modules/format.js'
import { isMail } from '../modules/selectors.js'

export const sample = () => ({ b: 0, n: "", c: "", items: [{ d: "", q: 1, p: 0 }], tax: 0, tn: "Tax", dv: 0, dt: "%", due: addD(T, 30), pre: 30, cur: S.defaultCurrency, rep: 0, f: "Monthly", end: "Never", auto: 0, err: [] })

export const calc = () => { const e = S.invoiceEditor, sub = e.items.reduce((a, i) => a + i.q * i.p, 0), d = e.dt === "%" ? sub * e.dv / 100 : +e.dv, tx = (sub - d) * e.tax / 100; return { sub, d, tx, tot: sub - d + tx } }

export function repSum() {
  const e = S.invoiceEditor
  return "Next 3 invoices: " + [1, 2, 3].map(k => D(stepF(T, e.f, k))).join(", ") + (e.end !== "Never" ? " · ends after " + e.end.split(" ")[1] : "") + (e.auto ? " · sent automatically" : " · created as drafts")
}

export function upd() {
  const c = calc(), e = S.invoiceEditor
  $("#sub").textContent = formatMoney(c.sub); $("#dsc").textContent = "−" + formatMoney(c.d); $("#tax").textContent = formatMoney(c.tx); $("#tot").textContent = formatMoney(c.tot)
  e.items.forEach((i, x) => $("#a" + x).textContent = formatMoney(i.q * i.p))
  $("#tl").textContent = e.tn + " " + e.tax + "%"
  if ($("#rs")) $("#rs").textContent = repSum()
}

export function editor() {
  const e = S.invoiceEditor, c = calc()
  return `<div class="ed"><div class="row b" style="margin-bottom:18px"><button class="btn s sm" onclick="go('invoices')">← Back</button><div class="row"><button class="btn s" onclick="S.currentRoute='preview';render();scrollTo(0,0)">Preview</button><button class="btn s" onclick="save('draft')">Save draft</button><details><summary class="btn" style="padding:10px 18px" onclick="">Save & send ▾</summary><div class="menu"><button onclick="save('send')">Save & send</button><button onclick="downloadPreviewPdf()">Save & download PDF</button><button onclick="save('draft')">Save draft</button></div></details></div></div>
${e.err.length ? `<div class="card" style="border-color:var(--bad);margin-bottom:14px"><b class="err">Fix before saving</b>${e.err.map(x => `<div class="err">• ${x}</div>`).join("")}</div>` : ""}
<div class="card"><h2 style="font:700 28px 'Playfair Display',serif;color:var(--pri)">Invoice <span class="mut" style="font-size:16px;font-family:'DM Sans'">INV-000${S.invoices.length + 1}</span></h2>
<div style="margin-top:8px"><label class="fl">From</label><select onchange="S.invoiceEditor.b=+this.value;render()">${S.businessProfiles.map((b, x) => `<option value="${x}" ${e.b === x ? "selected" : ""}>${b.n}</option>`).join("")}</select>${renderDetails(S.businessProfiles[e.b].n, S.businessProfiles[e.b].a, S.businessProfiles[e.b].e, S.businessProfiles[e.b].p)}<a style="color:var(--pri);cursor:pointer;font-size:13px" onclick="S.activeModal='biz';S.be=-1;render()">+ Add business</a></div>
<div class="grid" style="grid-template-columns:1fr 1fr;margin-top:6px"><div><h3>Bill To</h3><select style="margin-top:8px" onchange="S.invoiceEditor.c=this.value;render()"><option value="">Select client</option>${S.clientNames.map((n, x) => `<option value="${x}" ${e.c == x && e.c !== "" ? "selected" : ""}>${n}</option>`).join("")}</select>${e.c !== "" ? renderDetails(S.clientNames[e.c], S.clientDetails[e.c].a, S.clientDetails[e.c].e, S.clientDetails[e.c].p) : `<div class="mut" style="margin-top:8px;font-size:13px">Client name, address and contacts appear here.</div>`}<a style="color:var(--pri);cursor:pointer;font-size:13px" onclick="S.activeModal='client';render()">+ Add client</a></div>
<div><label class="fl">Due</label><input type="date" value="${e.due}" onchange="S.invoiceEditor.due=this.value;S.invoiceEditor.pre=0;render()"><div class="chips">${[[0, "On receipt"], [15, "Net 15"], [30, "Net 30"], [60, "Net 60"]].map(([n, l]) => `<button class="${e.pre === n && e.due === addD(T, n) ? "on" : ""}" onclick="S.invoiceEditor.due=addD(T,${n});S.invoiceEditor.pre=${n};render()">${l}</button>`).join("")}</div></div></div>
<table class="invoice-items" style="margin-top:20px"><tr><th>Description</th><th class="quantity-column">Qty</th><th style="width:110px">Price</th><th class="r" style="width:110px">Amount</th><th style="width:30px"></th></tr>${e.items.map((i, x) => `<tr><td><input placeholder="What did you deliver?" value="${i.d}" oninput="S.invoiceEditor.items[${x}].d=this.value"></td><td><input class="quantity-input" type="number" min="0" value="${i.q}" oninput="S.invoiceEditor.items[${x}].q=+this.value;upd()"></td><td><input type="number" min="0" value="${i.p}" oninput="S.invoiceEditor.items[${x}].p=+this.value;upd()"></td><td class="r" id="a${x}">${formatMoney(i.q * i.p)}</td><td><button class="ghost" style="padding:2px 8px" aria-label="Remove line" onclick="S.invoiceEditor.items.splice(${x},1);if(!S.invoiceEditor.items.length)S.invoiceEditor.items.push({d:'',q:1,p:0});render()">×</button></td></tr>`).join("")}</table>
<button class="btn s sm" style="margin-top:10px" onclick="S.invoiceEditor.items.push({d:'',q:1,p:0});render()">+ Add line item</button>
<div class="grid" style="grid-template-columns:1fr 1fr;margin-top:20px;align-items:start"><div><label class="fl">Currency</label><select onchange="S.invoiceEditor.cur=this.value;upd()">${Object.keys(SYM).map(k => `<option value="${k}" ${e.cur === k ? "selected" : ""}>${k} (${SYM[k]})</option>`).join("")}</select><label class="fl">Tax name and rate (%)</label><div class="row"><input value="${e.tn}" oninput="S.invoiceEditor.tn=this.value;upd()"><input type="number" min="0" value="${e.tax}" oninput="S.invoiceEditor.tax=+this.value;upd()"></div><label class="fl">Discount</label><div class="row"><input type="number" min="0" value="${e.dv}" oninput="S.invoiceEditor.dv=+this.value;upd()"><select style="width:80px" onchange="S.invoiceEditor.dt=this.value;upd()"><option ${e.dt === "%" ? "selected" : ""}>%</option><option ${e.dt !== "%" ? "selected" : ""} value="$">$</option></select></div></div>
<div class="card tot" style="background:var(--bg)"><div><span class="mut">Subtotal</span><span id="sub">${formatMoney(c.sub)}</span></div><div><span class="mut">Discount</span><span id="dsc">−${formatMoney(c.d)}</span></div><div><span class="mut" id="tl">${e.tn} ${e.tax}%</span><span id="tax">${formatMoney(c.tx)}</span></div><div class="big"><span>Total</span><span id="tot">${formatMoney(c.tot)}</span></div></div></div>
<label class="fl">Notes and payment instructions</label><textarea placeholder="Optional: bank details, e-transfer instructions or a payment link" oninput="S.invoiceEditor.n=this.value">${e.n}</textarea></div>
<div class="card" style="margin-top:16px"><div class="row b"><div><h2>Repeat this invoice</h2><span class="mut">Create it again on a schedule.</span></div><input type="checkbox" style="width:22px;height:22px" aria-label="Repeat" ${e.rep ? "checked" : ""} onchange="S.invoiceEditor.rep=this.checked?1:0;render()"></div>
${e.rep ? `<div class="grid" style="grid-template-columns:1fr 1fr"><div><label class="fl">Frequency</label><select onchange="S.invoiceEditor.f=this.value;upd()">${["Weekly", "Biweekly", "Monthly", "Quarterly", "Yearly"].map(f => `<option ${e.f === f ? "selected" : ""}>${f}</option>`).join("")}</select></div><div><label class="fl">Ends</label><select onchange="S.invoiceEditor.end=this.value;upd()">${["Never", "After 6", "After 12"].map(f => `<option ${e.end === f ? "selected" : ""}>${f}</option>`).join("")}</select></div></div>
<div class="tg"><input type="checkbox" id="au" ${e.auto ? "checked" : ""} onchange="S.invoiceEditor.auto=this.checked?1:0;upd()"><label for="au">Send automatically${isMail() ? "" : " (needs an email account)"}</label></div><p id="rs" class="ok" style="margin:10px 0 0">${repSum()}</p>` : ""}</div></div>`
}
