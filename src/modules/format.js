import { currencySigns } from './catalog.js'

export const money = (state, amount) => `${currencySigns[state.ed?.cur || state.dcur] || '$'}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const invoiceStatus = (invoice, today) => invoice.s === 'Sent' && invoice.due && invoice.due < today ? 'Overdue' : invoice.s
export const pill = (label, className) => `<span class="pill ${className || label}">${label}</span>`
export const total = (invoices, predicate) => invoices.filter(predicate).reduce((sum, invoice) => sum + Number(invoice.a || 0), 0)
