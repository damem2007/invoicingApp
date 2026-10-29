import { state as S } from '../modules/store.js'
import { today as T, formatDate as D, addDays as addD, addMonths as addM, stepFrequency as stepF } from '../modules/date.js'
import { $ } from '../modules/selectors.js'
import { formatMoney } from '../modules/format.js'
import { isMail } from '../modules/selectors.js'
import { hdates, svFrom } from '../modules/recurrence.js'
import { render, toast } from '../ui/render.js'

export const runRec = x => {
  const r = S.recurringServices[x]
  if (r.chg && r.chg.from <= r.next) { r.prev = r.a; r.a = r.chg.a; r.chg = null }
  const id = "INV-000" + (S.invoices.length + 1)
  S.invoices.push({ id, c: r.c, a: r.a, due: addD(T, 30), s: r.auto && isMail() ? "Sent" : "Draft", rec: 1 })
  r.next = stepF(r.next, r.f, 1)
  toast(id + " created from schedule")
}

export const mrs = () => { const f = $("#mf").value, n = $("#mrd").value; $("#mrp").textContent = n ? "Next 3 invoices: " + [0, 1, 2].map(k => D(stepF(n, f, k))).join(", ") : "" }

export const saveRec = () => {
  const i = S.invoices.find(x => x.id === S.mr), f = $("#mf").value, n = $("#mrd").value, e = m => ($("#mre").textContent = m)
  if (!n) return e("Pick the date of the first new invoice.")
  if (n <= T) return e("Choose a date after today.")
  S.recurringServices.push({ c: i.c, a: +$("#ma").value || i.a, prev: +$("#ma").value && +$("#ma").value !== i.a ? i.a : 0, f, next: n, st: "Active", auto: $("#mau").checked ? 1 : 0, src: i.id })
  i.rec = 1; S.activeModal = null
  toast("Recurring schedule created. Next invoice on " + D(n))
}

export const saveChg = () => {
  const r = S.recurringServices[S.cr], a = +$("#ca2").value, f = $("#cf").value, e = m => ($("#ce2").textContent = m)
  if (!(a > 0)) return e("Enter the new amount.")
  if (!f || f <= T) return e("Choose a date after today.")
  r.chg = { from: f, a }; S.activeModal = null
  toast("Price changes to " + formatMoney(a) + " from " + D(f))
}

export const svNew = c => { S.sv = { c: c === undefined ? "" : c, d: "", f: "Monthly", hist: 1, n: 3, a: 550, start: addM(T, -3), na: 660, from: "", auto: 0, note: 0, s: 0, err: "" }; S.currentRoute = "svc"; render(); scrollTo(0, 0) }

export const svNext = () => {
  const v = S.sv, l = hdates(v); v.err = ""
  if (v.s === 0 && (v.c === "" || !v.d.trim())) v.err = "Choose a client and describe the service."
  else if (v.s === 1 && v.hist) { if (!(v.n >= 1 && v.n <= 36) || !(v.a > 0) || !v.start) v.err = "Enter how many invoices, the amount each and the first invoice date."; else if (l[l.length - 1] > T) v.err = "Past invoices cannot be dated in the future." }
  else if (v.s === 2) { if (!(v.na > 0)) v.err = "Enter the price for new invoices."; else if (!v.from || v.from < T || (v.hist && v.from <= l[l.length - 1])) v.err = "The first new invoice must be today or later, and after your last past invoice." }
  if (v.err) return render()
  if (v.s === 3) return svSave()
  v.s++; if (v.s === 2) v.from = svFrom(v); render()
}

export const svSave = () => {
  const v = S.sv, c = +v.c; let last
  hdates(v).forEach(d => { const id = "INV-000" + (S.invoices.length + 1); S.invoices.unshift({ id, c, a: +v.a, iss: d, due: d, s: "Paid", old: 1, d: v.d }); S.payments.push({ d, inv: id, c, m: "Manual", a: +v.a }); last = id })
  S.recurringServices.push({ c, a: +v.na, f: v.f, next: v.from, st: "Active", auto: v.auto, src: last, prev: v.hist && +v.na !== +v.a ? +v.a : 0 })
  S.sv = null; S.currentRoute = "invoices"; S.activeInvoiceTab = "Recurring"
  toast("Recurring service created. Next invoice on " + D(v.from))
}
