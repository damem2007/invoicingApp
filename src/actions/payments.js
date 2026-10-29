import { state as S } from '../modules/store.js'
import { today as T } from '../modules/date.js'
import { $ } from '../modules/selectors.js'
import { render, toast } from '../ui/render.js'

export const recPay = async () => {
  const v = $("#pi").value
  if (!v) { S.activeModal = null; return render() }
  const i = S.invoices.find(x => x.id === v)
  try {
    const response = await fetch('/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invoiceId: v, method: $("#pm").value, date: T, amount: i.a }) })
    const payment = await response.json(); if (!response.ok) throw new Error(payment.error || 'Unable to record payment')
    i.s = 'Paid'; S.payments.push({ d: payment.date, inv: v, c: i.c, m: payment.method, a: payment.amount }); S.activeModal = null
    toast("Payment recorded. " + v + " is paid")
  } catch (error) { toast(error.message) }
}
