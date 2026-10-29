import { state as S } from './store.js'
import { today as T } from './date.js'

export const $ = selector => document.querySelector(selector)
export const st = i => i.s === "Sent" && i.due < T ? "Overdue" : i.s
export const sum = f => S.invoices.filter(f).reduce((a, i) => a + i.a, 0)
export const isMail = () => S.integrations.gmail.on || S.integrations.outlook.on
