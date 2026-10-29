import { state as S } from './store.js'
import { currencySigns as SYM } from './catalog.js'

export const formatMoney = n => (S.invoiceEditor ? SYM[S.invoiceEditor.cur] : SYM[S.defaultCurrency] || '$') + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const renderPill = (label, className) => `<span class="pill ${className || label}">${label}</span>`
export const renderDetails = (name, address, email, phone) => `<div style="margin-top:10px;line-height:1.6"><b>${name}</b><div class="mut">${(address || "").replace(/\n/g, "<br>")}</div><div class="mut">${[email, phone].filter(Boolean).join(" · ")}</div></div>`

