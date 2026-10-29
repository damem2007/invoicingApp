import { state as S } from '../modules/store.js'
import { today as T } from '../modules/date.js'
import { $ } from '../modules/selectors.js'
import { isMail } from '../modules/selectors.js'
import { saveBlob } from '../modules/download.js'
import { render, toast } from '../ui/render.js'
import { sample, calc } from '../pages/editor.js'
import { wiz } from './integrations.js'

export function newInv() { S.invoiceEditor = sample(); S.currentRoute = "new"; render(); scrollTo(0, 0) }

export const markPaid = async id => {
  const i = S.invoices.find(x => x.id === id); if (!i) return
  try {
    const response = await fetch(`/api/invoices/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Paid' }) })
    const updated = await response.json(); if (!response.ok) throw new Error(updated.error || 'Unable to mark invoice paid')
    i.s = 'Paid'; S.payments.push({ d: T, inv: id, c: i.c, m: 'Manual', a: i.a }); S.openMenuIndex = 0; toast(id + ' marked paid')
  } catch (error) { toast(error.message) }
}
export const send = id => { if (!isMail()) { toast("Connect an email account first."); return wiz("gmail") } const i = S.invoices.find(x => x.id === id); if (i.s === "Draft") i.s = "Sent"; toast(id + " sent") }
export const dup = id => { const i = S.invoices.find(x => x.id === id); S.invoices.push({ ...i, id: "INV-000" + (S.invoices.length + 1), s: "Draft", rec: 0 }); toast("Duplicated as draft") }
export const del = async id => {
  try {
    const response = await fetch(`/api/invoices/${id}`, { method: 'DELETE' }); const result = response.status === 204 ? {} : await response.json(); if (!response.ok) throw new Error(result.error || 'Unable to delete invoice')
    const index = S.invoices.findIndex(invoice => invoice.id === id); if (index >= 0) S.invoices.splice(index, 1); toast(id + ' deleted')
  } catch (error) { toast(error.message) }
}

export const downloadInvoice = async id => {
  const response = await fetch(`/api/invoices/${id}/pdf`)
  if (!response.ok) return toast('Unable to download invoice')
  saveBlob(await response.blob(), `${id}.pdf`)
  toast(id + ' downloaded')
}

export const downloadPreviewPdf = async () => {
  const e = S.invoiceEditor, c = calc(), client = e.c !== '' ? S.clientDetails[e.c] : {}
  const response = await fetch('/api/invoices/preview/pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: `INV-000${S.invoices.length + 1}`, clientName: e.c !== '' ? S.clientNames[e.c] : 'Client', clientEmail: client.e || '', description: e.items.filter(item => item.d || item.p > 0).map(item => item.d || 'Line item').join(', '), amount: c.tot, currency: e.cur, dueDate: e.due, paymentInstructions: e.n }) })
  if (!response.ok) return toast('Unable to generate PDF')
  saveBlob(await response.blob(), `INV-000${S.invoices.length + 1}.pdf`)
  toast('PDF downloaded')
}

export async function save(mode) {
  const e = S.invoiceEditor, errors = []
  if (e.c === '') errors.push('Choose a client to bill.')
  if (!e.items.some(item => Number(item.p) > 0)) errors.push('Add at least one line item with a price.')
  if (!e.due) errors.push('Pick a due date.')
  e.err = errors
  if (errors.length) return render()
  const total = calc().tot
  const response = await fetch('/api/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: S.clientIds?.[Number(e.c)], description: e.items.filter(item => item.d || item.p > 0).map(item => item.d || 'Line item').join(', '), amount: total, dueDate: e.due, currency: e.cur, paymentInstructions: e.n }) })
  const invoice = await response.json()
  if (!response.ok) { e.err = [invoice.error || 'Unable to save invoice.']; return render() }
  if (mode === 'pdf') {
    const pdf = await fetch(`/api/invoices/${invoice.number}/pdf`)
    saveBlob(await pdf.blob(), `${invoice.number}.pdf`)
  }
  S.invoiceEditor = null; S.currentRoute = 'invoices'; S.activeInvoiceTab = 'All'; toast(mode === 'pdf' ? `${invoice.number} saved. PDF downloaded` : `${invoice.number} saved as draft`)
}

export const savePast = () => {
  const g = k => $("#" + k).value, id = g("qn").trim(), a = +g("qa"), c = +g("qc"), rc = $("#qr").checked, e = m => ($("#qe").textContent = m)
  if (!id) return e("Enter the invoice number.")
  if (S.invoices.some(i => i.id === id)) return e(id + " already exists.")
  if (!(a > 0)) return e("Enter the amount that was paid.")
  if (!g("qi") || !g("qd") || !g("qp")) return e("Enter the issue, due and paid dates.")
  if (g("qp") < g("qi")) return e("The paid date cannot be before the issue date.")
  if (g("qp") > T) return e("The paid date cannot be in the future.")
  S.invoices.unshift({ id, c, a, iss: g("qi"), due: g("qd"), s: "Paid", old: 1, d: g("qx") })
  S.payments.push({ d: g("qp"), inv: id, c, m: "Manual", a })
  S.pc = undefined
  if (rc) { S.mr = id; S.activeModal = "mkrec"; return render() }
  S.activeModal = null; toast(id + " added as a paid invoice")
}
